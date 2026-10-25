const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const Supplier = require('../models/Supplier');
const { auth } = require('../middleware/auth');

// Helper: Lấy shopId của user đang đăng nhập
async function getUserShopId(user) {
  if (user.shopId) return user.shopId;
  const ownedShop = await Shop.findOne({ ownerId: user.id });
  return ownedShop ? ownedShop._id : null;
}

// ==========================================
// 1. GET /api/stock-movements - Lấy lịch sử biến động kho
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isShop = req.user.role === 'shop' || !!req.user.shopId;

    if (!isAdmin && !isShop) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền xem lịch sử kho.' });
    }

    let filter = {};
    if (isAdmin) {
      if (req.query.shopId) {
        filter.$or = [{ shop_id: req.query.shopId }, { shopId: req.query.shopId }];
      }
    } else {
      const userShopId = await getUserShopId(req.user);
      if (!userShopId) {
        return res.status(403).json({ error: 'Từ chối: Bạn không sở hữu cửa hàng nào.' });
      }
      filter.$or = [{ shop_id: userShopId }, { shopId: userShopId }];
    }

    if (req.query.productId) {
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: [{ product_id: req.query.productId }, { productId: req.query.productId }] });
    }

    if (req.query.type) {
      filter.type = req.query.type;
    }

    if (req.query.supplierId) {
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: [{ supplier_id: req.query.supplierId }, { supplierId: req.query.supplierId }] });
    }

    const movements = await StockMovement.find(filter)
      .populate('product_id', 'title sku price stock imageUrl')
      .populate('shop_id', 'shopName')
      .populate('supplier_id', 'name phone contact_name')
      .sort({ created_at: -1 });

    return res.json(movements);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy lịch sử biến động tồn kho.', details: error.message });
  }
});

// ==========================================
// 2. POST /api/stock-movements - Tạo biến động tồn kho mới (Nhập kho, Xuất hủy, Điều chỉnh)
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isShop = req.user.role === 'shop' || !!req.user.shopId;

    if (!isAdmin && !isShop) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền thao tác kho.' });
    }

    const { productId, type, quantity, unitCost, supplierId, reference, note, actualStock } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Mã sản phẩm (productId) là bắt buộc.' });
    }

    const allowedTypes = ['import', 'export', 'adjustment', 'list'];
    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({ 
        error: `Loại biến động không hợp lệ. Chỉ chấp nhận thao tác: ${allowedTypes.join(', ')}` 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm cần biến động kho.' });
    }

    // Tương thích dữ liệu cũ: nếu sản phẩm chưa từng dùng phân bổ kho,
    // toàn bộ stock hiện tại coi như đã được đăng bán (không có hàng ẩn trong kho)
    if (product.warehouseStock === null || product.warehouseStock === undefined) {
      product.warehouseStock = 0;
    }
    if (product.stock > 0 && !product.listedQty) {
      product.listedQty = product.stock;
    }

    // Kiểm tra quyền sở hữu sản phẩm của shop
    const userShopId = await getUserShopId(req.user);
    if (!isAdmin && String(product.shopId || product.shop_id) !== String(userShopId)) {
      return res.status(403).json({ error: 'Từ chối: Bạn chỉ được quản lý tồn kho của các sản phẩm thuộc cửa hàng mình!' });
    }

    const targetShopId = product.shopId || userShopId;
    let qtyChange = Number(quantity || 0);

    // Chống ghi nhận trùng lặp do bấm đúp API (kiểm tra reference trong vòng 10 giây)
    if (reference && reference.trim()) {
      const recentDup = await StockMovement.findOne({
        product_id: product._id,
        reference: reference.trim(),
        created_at: { $gte: new Date(Date.now() - 10000) }
      });
      if (recentDup) {
        return res.status(400).json({ 
          error: `Yêu cầu với mã tham chiếu "${reference}" vừa được xử lý, tránh gửi lặp lại!` 
        });
      }
    }

    // Xử lý logic từng loại biến động
    if (type === 'import') {
      if (qtyChange <= 0) {
        return res.status(400).json({ error: 'Số lượng nhập kho phải lớn hơn 0.' });
      }

      // Kiểm tra nhà cung cấp nếu có
      if (supplierId) {
        const supExists = await Supplier.findById(supplierId);
        if (!supExists) {
          return res.status(404).json({ error: 'Nhà cung cấp đã chọn không tồn tại.' });
        }
      }

      // Cộng TỒN KHO VẬT LÝ (hàng mới về kho, chưa tự động đăng bán)
      product.warehouseStock += qtyChange;
      await product.save();

    } else if (type === 'list') {
      // C3: Chọn số lượng ĐĂNG BÁN từ lượng hàng đang có trong kho vật lý
      if (qtyChange <= 0) {
        return res.status(400).json({ error: 'Số lượng đăng bán phải lớn hơn 0.' });
      }

      if (product.warehouseStock < qtyChange) {
        return res.status(400).json({
          error: `Không thể đăng bán ${qtyChange} cái vì kho vật lý hiện chỉ còn ${product.warehouseStock} cái chưa phân bổ. Vui lòng nhập thêm hàng trước!`
        });
      }

      // Phân bổ hàng từ kho vật lý sang kho đăng bán (không bao giờ âm)
      product.warehouseStock -= qtyChange;
      product.stock += qtyChange;
      product.listedQty = (product.listedQty || 0) + qtyChange;

      // Sản phẩm hết hàng trước đó sẽ tự động active lại khi có hàng đăng bán
      if (product.status === 'out_of_stock' && product.stock > 0) {
        product.status = 'active';
      }
      await product.save();

    } else if (type === 'export') {
      if (qtyChange <= 0) {
        return res.status(400).json({ error: 'Số lượng xuất kho phải lớn hơn 0.' });
      }

      // Quy tắc bảo vệ: Không để tồn kho âm. Xuất kho ưu tiên lấy từ kho vật lý
      // chưa phân bổ; nếu không đủ thì lấy phần còn lại từ kho đăng bán.
      const totalAvailable = product.warehouseStock + product.stock;
      if (totalAvailable < qtyChange) {
        return res.status(400).json({ 
          error: `Không thể xuất ${qtyChange} cái vì tổng tồn kho hiện tại chỉ còn ${totalAvailable} cái. Hệ thống không cho phép tồn kho âm!` 
        });
      }

      const fromWarehouse = Math.min(product.warehouseStock, qtyChange);
      product.warehouseStock -= fromWarehouse;
      const fromListed = qtyChange - fromWarehouse;
      if (fromListed > 0) {
        product.stock -= fromListed;
        product.listedQty = Math.max(0, (product.listedQty || 0) - fromListed);
      }
      if (product.stock === 0 && product.status === 'active') {
        product.status = 'out_of_stock';
      }
      await product.save();

    } else if (type === 'adjustment') {
      if (actualStock === undefined || actualStock < 0) {
        return res.status(400).json({ error: 'Số lượng thực tế kiểm kê (actualStock) phải lớn hơn hoặc bằng 0.' });
      }

      const diff = actualStock - product.stock;
      qtyChange = diff; // có thể âm hoặc dương
      product.stock = actualStock;
      // Kiểm kê đối chiếu với kho vật lý: phần chênh lệch điều chỉnh vào kho vật lý,
      // giữ listedQty không đổi để không làm mất phân bổ đăng bán hiện có
      if (product.warehouseStock === null || product.warehouseStock === undefined) {
        product.warehouseStock = 0;
      }
      if (diff !== 0) {
        product.warehouseStock = Math.max(0, product.warehouseStock);
      }
      await product.save();
    }

    // Lưu vào lịch sử stock_movements
    const newMovement = await StockMovement.create({
      shop_id: targetShopId,
      shopId: targetShopId,
      product_id: product._id,
      productId: product._id,
      supplier_id: supplierId || null,
      supplierId: supplierId || null,
      type: type,
      quantity: qtyChange,
      unit_cost: unitCost ? mongoose.Types.Decimal128.fromString(unitCost.toString()) : 0,
      unitCost: unitCost || 0,
      reference: reference ? reference.trim() : `MOV-${Date.now().toString().slice(-6)}`,
      note: note || `Biến động kho kiểu ${type}`
    });

    return res.status(201).json({
      message:
        type === 'import' ? 'Nhập kho thành công! Hàng đã vào kho vật lý, hãy chọn "Đăng bán" để đưa hàng lên sàn.' :
        type === 'list' ? `Đã phân bổ ${qtyChange} sản phẩm để đăng bán!` :
        type === 'export' ? 'Xuất kho thành công!' :
        'Kiểm kê điều chỉnh kho thành công!',
      movement: newMovement,
      newStock: product.stock,
      warehouseStock: product.warehouseStock,
      listedQty: product.listedQty
    });

  } catch (error) {
    return res.status(500).json({ error: 'Lỗi thực hiện biến động kho.', details: error.message });
  }
});

// ==========================================
// 3. GET /api/stock-movements/summary - Báo cáo tổng hợp kho của shop
// ==========================================
router.get('/summary', auth, async (req, res) => {
  try {
    const userShopId = await getUserShopId(req.user);
    if (!userShopId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Từ chối: Bạn không sở hữu cửa hàng nào.' });
    }

    const filter = userShopId ? { $or: [{ shop_id: userShopId }, { shopId: userShopId }] } : {};

    const totalImport = await StockMovement.aggregate([
      { $match: { ...filter, type: 'import' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const totalSale = await StockMovement.aggregate([
      { $match: { ...filter, type: 'sale' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const totalReturn = await StockMovement.aggregate([
      { $match: { ...filter, type: 'return' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    const totalExport = await StockMovement.aggregate([
      { $match: { ...filter, type: 'export' } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    // Tổng số lượng sản phẩm đang có trong kho (khả dụng bán + kho vật lý)
    const prodFilter = userShopId ? { shopId: userShopId } : {};
    const totalCurrentStock = await Product.aggregate([
      { $match: prodFilter },
      { $group: {
        _id: null,
        total: { $sum: '$stock' },
        warehouse: { $sum: { $ifNull: ['$warehouseStock', 0] } },
        listed: { $sum: { $ifNull: ['$listedQty', 0] } },
        sold: { $sum: { $ifNull: ['$soldCount', 0] } },
        count: { $sum: 1 }
      } }
    ]);

    return res.json({
      totalImported: totalImport[0]?.total || 0,
      totalSold: totalSale[0]?.total || 0,
      totalReturned: totalReturn[0]?.total || 0,
      totalExported: totalExport[0]?.total || 0,
      currentTotalStock: totalCurrentStock[0]?.total || 0,
      totalWarehouseStock: totalCurrentStock[0]?.warehouse || 0,
      totalListedQty: totalCurrentStock[0]?.listed || 0,
      totalSoldCount: totalCurrentStock[0]?.sold || 0,
      totalProductCount: totalCurrentStock[0]?.count || 0
    });

  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy tổng hợp dữ liệu kho.', details: error.message });
  }
});

module.exports = router;
