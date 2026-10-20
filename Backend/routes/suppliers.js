const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');
const Shop = require('../models/Shop');
const { auth } = require('../middleware/auth');

// Helper: Lấy shopId của user đang đăng nhập
async function getUserShopId(user) {
  if (user.shopId) return user.shopId;
  const ownedShop = await Shop.findOne({ ownerId: user.id });
  return ownedShop ? ownedShop._id : null;
}

// ==========================================
// 1. GET /api/suppliers - Danh sách nhà cung cấp
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isShop = req.user.role === 'shop' || !!req.user.shopId;

    if (!isAdmin && !isShop) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền xem thông tin nhà cung cấp.' });
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

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }

    const suppliers = await Supplier.find(filter)
      .populate('shop_id', 'shopName')
      .sort({ created_at: -1 });

    return res.json(suppliers);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy danh sách nhà cung cấp.', details: error.message });
  }
});

// ==========================================
// 2. GET /api/suppliers/:id - Chi tiết 1 nhà cung cấp
// ==========================================
router.get('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).populate('shop_id', 'shopName');
    if (!supplier) {
      return res.status(404).json({ error: 'Không tìm thấy nhà cung cấp.' });
    }

    const isAdmin = req.user.role === 'admin';
    const userShopId = await getUserShopId(req.user);

    if (!isAdmin && String(supplier.shop_id || supplier.shopId) !== String(userShopId)) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền xem nhà cung cấp này.' });
    }

    return res.json(supplier);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy chi tiết nhà cung cấp.', details: error.message });
  }
});

// ==========================================
// 3. POST /api/suppliers - Thêm nhà cung cấp mới
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const isShop = req.user.role === 'shop' || !!req.user.shopId;

    if (!isAdmin && !isShop) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền thêm nhà cung cấp.' });
    }

    const { name, contactName, contact_name, phone, email, address, status, shopId } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tên nhà cung cấp là bắt buộc.' });
    }
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Số điện thoại nhà cung cấp là bắt buộc.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email nhà cung cấp là bắt buộc.' });
    }

    let targetShopId = null;
    if (isAdmin && shopId) {
      targetShopId = shopId;
    } else {
      targetShopId = await getUserShopId(req.user);
      if (!targetShopId) {
        return res.status(400).json({ error: 'Không tìm thấy thông tin cửa hàng liên kết của bạn.' });
      }
    }

    // Kiểm tra trùng tên nhà cung cấp trong cùng 1 shop
    const existing = await Supplier.findOne({
      $or: [{ shop_id: targetShopId }, { shopId: targetShopId }],
      name: name.trim()
    });

    if (existing) {
      return res.status(400).json({ error: `Nhà cung cấp "${name.trim()}" đã tồn tại trong cửa hàng.` });
    }

    const newSupplier = await Supplier.create({
      shop_id: targetShopId,
      shopId: targetShopId,
      name: name.trim(),
      contact_name: (contactName || contact_name || '').trim(),
      contactName: (contactName || contact_name || '').trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      address: (address || '').trim(),
      status: status || 'active'
    });

    return res.status(201).json({
      message: 'Thêm mới nhà cung cấp thành công!',
      supplier: newSupplier
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi thêm nhà cung cấp.', details: error.message });
  }
});

// ==========================================
// 4. PUT /api/suppliers/:id - Cập nhật nhà cung cấp
// ==========================================
router.put('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Không tìm thấy nhà cung cấp để cập nhật.' });
    }

    const isAdmin = req.user.role === 'admin';
    const userShopId = await getUserShopId(req.user);

    if (!isAdmin && String(supplier.shop_id || supplier.shopId) !== String(userShopId)) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền chỉnh sửa nhà cung cấp này.' });
    }

    const { name, contactName, contact_name, phone, email, address, status } = req.body;

    if (name && name.trim()) {
      // Kiểm tra trùng với nhà cung cấp khác cùng shop
      const duplicate = await Supplier.findOne({
        _id: { $ne: supplier._id },
        $or: [{ shop_id: supplier.shop_id }, { shopId: supplier.shopId }],
        name: name.trim()
      });
      if (duplicate) {
        return res.status(400).json({ error: `Tên nhà cung cấp "${name.trim()}" đã bị trùng lặp.` });
      }
      supplier.name = name.trim();
    }

    if (contactName !== undefined || contact_name !== undefined) {
      supplier.contact_name = (contactName || contact_name || '').trim();
      supplier.contactName = supplier.contact_name;
    }
    if (phone) supplier.phone = phone.trim();
    if (email) supplier.email = email.trim().toLowerCase();
    if (address !== undefined) supplier.address = address.trim();
    if (status) supplier.status = status;

    await supplier.save();

    return res.json({
      message: 'Cập nhật thông tin nhà cung cấp thành công!',
      supplier
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi cập nhật nhà cung cấp.', details: error.message });
  }
});

// ==========================================
// 5. DELETE /api/suppliers/:id - Xóa nhà cung cấp
// ==========================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Không tìm thấy nhà cung cấp.' });
    }

    const isAdmin = req.user.role === 'admin';
    const userShopId = await getUserShopId(req.user);

    if (!isAdmin && String(supplier.shop_id || supplier.shopId) !== String(userShopId)) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền xóa nhà cung cấp này.' });
    }

    // Kiểm tra xem đã có biến động nhập kho nào tham chiếu chưa
    const StockMovement = require('../models/StockMovement');
    const hasMovements = await StockMovement.exists({
      $or: [{ supplier_id: supplier._id }, { supplierId: supplier._id }]
    });

    if (hasMovements) {
      // Chuyển sang inactive để giữ toàn vẹn lịch sử
      supplier.status = 'inactive';
      await supplier.save();
      return res.json({
        message: 'Nhà cung cấp đã có lịch sử nhập hàng nên được chuyển sang trạng thái "Không hoạt động" (inactive) để bảo toàn dữ liệu kho!',
        supplier
      });
    }

    await Supplier.deleteOne({ _id: supplier._id });
    return res.json({ message: 'Xóa nhà cung cấp thành công!' });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi xóa nhà cung cấp.', details: error.message });
  }
});

module.exports = router;
