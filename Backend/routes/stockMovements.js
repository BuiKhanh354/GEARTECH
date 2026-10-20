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

    const allowedTypes = ['import', 'export', 'adjustment'];
    if (!type || !allowedTypes.includes(type)) {
      return res.status(400).json({ 
        error: `Loại biến động không hợp lệ. Chỉ chấp nhận thao tác: ${allowedTypes.join(', ')}` 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm cần biến động kho.' });
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

      // Cộng tồn kho
      product.stock += qtyChange;
      await product.save();

    } else if (type === 'export') {
      if (qtyChange <= 0) {
        return res.status(400).json({ error: 'Số lượng xuất kho phải lớn hơn 0.' });
      }

      // Quy tắc bảo vệ: Không để tồn kho âm
      if (product.stock < qtyChange) {
        return res.status(400).json({ 
          error: `Không thể xuất ${qtyChange} cái vì tồn kho hiện tại chỉ còn ${product.stock} cái. Hệ thống không cho phép tồn kho âm!` 
        });
      }

      // Trừ tồn kho
      product.stock -= qtyChange;
      await product.save();

    } else if (type === 'adjustment') {
      if (actualStock === undefined || actualStock < 0) {
        return res.status(400).json({ error: 'Số lượng thực tế kiểm kê (actualStock) phải lớn hơn hoặc bằng 0.' });
      }

      const diff = actualStock - product.stock;
      qtyChange = diff; // có thể âm hoặc dương
      product.stock = actualStock;
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
      message: `Thao tác ${type === 'import' ? 'nhập kho' : type === 'export' ? 'xuất kho' : 'kiểm kê điều chỉnh'} thành công!`,
      movement: newMovement,
      newStock: product.stock
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

    // Tổng số lượng sản phẩm đang có trong kho
    const prodFilter = userShopId ? { shopId: userShopId } : {};
    const totalCurrentStock = await Product.aggregate([
      { $match: prodFilter },
      { $group: { _id: null, total: { $sum: '$stock' }, count: { $sum: 1 } } }
    ]);

    return res.json({
      totalImported: totalImport[0]?.total || 0,
      totalSold: totalSale[0]?.total || 0,
      totalReturned: totalReturn[0]?.total || 0,
      totalExported: totalExport[0]?.total || 0,
      currentTotalStock: totalCurrentStock[0]?.total || 0,
      totalProductCount: totalCurrentStock[0]?.count || 0
    });

  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy tổng hợp dữ liệu kho.', details: error.message });
  }
});

module.exports = router;
