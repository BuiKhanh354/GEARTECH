const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const { auth, checkRole } = require('../middleware/auth');

// Helper: tính toán số tiền giảm giá chính xác theo backend
function calculateDiscount(voucher, orderValue) {
  const isPercentage = voucher.discount_type === 'percentage' || voucher.discountType === 'percentage';
  const val = Number(voucher.discountValue || (voucher.discount_value ? voucher.discount_value.toString() : 0));
  const maxCap = Number(voucher.maxDiscount || (voucher.max_discount ? voucher.max_discount.toString() : 0));

  let discount = 0;
  if (isPercentage) {
    discount = Math.round((orderValue * val) / 100);
    if (maxCap > 0 && discount > maxCap) {
      discount = maxCap;
    }
  } else {
    discount = val;
  }

  // Không giảm quá giá trị đơn hàng
  if (discount > orderValue) {
    discount = orderValue;
  }

  return discount;
}

// Helper: tìm shop của user đang đăng nhập
async function findUserShop(userId, userShopId) {
  let shop = null;
  if (userShopId) {
    shop = await Shop.findById(userShopId);
  }
  if (!shop) {
    shop = await Shop.findOne({
      $or: [{ ownerId: userId }, { user_id: userId }]
    });
  }
  return shop;
}

// ==========================================
// 1. GET /api/vouchers - Lấy danh sách voucher công khai đang hoạt động
// Hỗ trợ ?shopId=... để lấy voucher của shop cụ thể + voucher toàn sàn
// ==========================================
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    const { shopId } = req.query;

    const baseConditions = [
      { $or: [{ status: 'active' }, { status: { $exists: false } }] },
      { $or: [{ expiryDate: { $gte: today } }, { end_date: { $gte: today } }] }
    ];

    if (shopId) {
      baseConditions.push({
        $or: [
          { shopId: null, shop_id: null },
          { shopId: shopId },
          { shop_id: shopId }
        ]
      });
    }

    const vouchers = await Voucher.find({
      $and: baseConditions
    }).sort({ created_at: -1, createdAt: -1 });

    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách mã giảm giá.', details: error.message });
  }
});

// ==========================================
// 2. GET /api/vouchers/admin - Admin lấy tất cả voucher
// ==========================================
router.get('/admin', auth, checkRole(['admin']), async (req, res) => {
  try {
    const vouchers = await Voucher.find()
      .populate('shop_id', 'shopName name')
      .populate('shopId', 'shopName name')
      .sort({ created_at: -1, createdAt: -1 });

    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách voucher quản trị.', details: error.message });
  }
});

// ==========================================
// 3. GET /api/vouchers/shop/my-vouchers - Chủ shop xem danh sách voucher của chính shop mình
// ==========================================
router.get('/shop/my-vouchers', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const shop = await findUserShop(req.user._id || req.user.id, req.user.shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Bạn chưa có gian hàng nào để quản lý voucher.' });
    }

    const vouchers = await Voucher.find({
      $or: [{ shopId: shop._id }, { shop_id: shop._id }]
    }).sort({ created_at: -1, createdAt: -1 });

    res.json({
      shop: { id: shop._id, name: shop.shopName || shop.name },
      vouchers
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách voucher của shop.', details: error.message });
  }
});

// ==========================================
// 4. POST /api/vouchers/shop - Chủ shop tạo voucher mới cho shop mình
// ==========================================
router.post('/shop', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const shop = await findUserShop(req.user._id || req.user.id, req.user.shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Bạn chưa có gian hàng để tạo voucher.' });
    }

    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      expiryDate,
      startDate,
      maxUses,
      status,
      emoji
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ error: 'Mã voucher (code) là bắt buộc.' });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Voucher.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ error: `Mã giảm giá "${cleanCode}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` });
    }

    const numDiscountValue = Number(discountValue || 0);
    if (numDiscountValue <= 0) {
      return res.status(400).json({ error: 'Giá trị giảm giá phải lớn hơn 0.' });
    }

    const type = discountType === 'percentage' ? 'percentage' : 'fixed';
    if (type === 'percentage' && (numDiscountValue < 1 || numDiscountValue > 100)) {
      return res.status(400).json({ error: 'Giảm giá theo % phải nằm trong khoảng từ 1% đến 100%.' });
    }

    const parsedStart = startDate ? new Date(startDate) : new Date();
    const parsedExpiry = expiryDate ? new Date(expiryDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    if (parsedExpiry <= parsedStart) {
      return res.status(400).json({ error: 'Thời gian kết thúc voucher phải sau thời gian bắt đầu.' });
    }

    const newVoucher = new Voucher({
      code: cleanCode,
      name: name || description || `Ưu đãi từ ${shop.shopName || shop.name}`,
      description: description || name || `Giảm giá độc quyền tại ${shop.shopName || shop.name}`,
      discountType: type,
      discountValue: numDiscountValue,
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: type === 'percentage' ? Number(maxDiscount || 0) : 0,
      startDate: parsedStart,
      expiryDate: parsedExpiry,
      maxUses: Math.max(1, Number(maxUses || 100)),
      status: status || 'active',
      emoji: emoji || '🏷️',
      shopId: shop._id,
      shop_id: shop._id
    });

    await newVoucher.save();
    res.status(201).json({ message: 'Tạo mã voucher cho gian hàng thành công!', voucher: newVoucher });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tạo mã giảm giá cho shop.', details: error.message });
  }
});

// ==========================================
// 5. PUT /api/vouchers/shop/:id - Chủ shop cập nhật voucher của shop mình
// ==========================================
router.put('/shop/:id', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const shop = await findUserShop(req.user._id || req.user.id, req.user.shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Bạn không có quyền quản lý gian hàng này.' });
    }

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ error: 'Không tìm thấy voucher yêu cầu.' });
    }

    // Bảo vệ quyền sở hữu: chỉ chủ shop sở hữu voucher mới được sửa
    const voucherShopId = String(voucher.shopId || voucher.shop_id || '');
    if (voucherShopId !== String(shop._id)) {
      return res.status(403).json({ error: 'Từ chối: Bạn chỉ được phép chỉnh sửa voucher thuộc gian hàng của mình.' });
    }

    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      expiryDate,
      startDate,
      maxUses,
      status,
      emoji
    } = req.body;

    if (code && code.toUpperCase().trim() !== voucher.code) {
      const cleanCode = code.toUpperCase().trim();
      const conflict = await Voucher.findOne({
        code: cleanCode,
        _id: { $ne: voucher._id }
      });
      if (conflict) {
        return res.status(400).json({ error: `Mã code "${cleanCode}" đã được sử dụng bởi voucher khác.` });
      }
      voucher.code = cleanCode;
    }

    if (discountType !== undefined) {
      voucher.discountType = discountType === 'percentage' ? 'percentage' : 'fixed';
    }
    if (discountValue !== undefined) {
      const val = Number(discountValue);
      if (val <= 0) return res.status(400).json({ error: 'Giá trị giảm giá phải lớn hơn 0.' });
      if (voucher.discountType === 'percentage' && (val < 1 || val > 100)) {
        return res.status(400).json({ error: 'Giảm giá theo % phải từ 1 đến 100.' });
      }
      voucher.discountValue = val;
    }

    if (startDate) voucher.startDate = new Date(startDate);
    if (expiryDate) voucher.expiryDate = new Date(expiryDate);
    if (voucher.expiryDate <= voucher.startDate) {
      return res.status(400).json({ error: 'Thời gian kết thúc voucher phải sau thời gian bắt đầu.' });
    }

    if (name !== undefined) voucher.name = name;
    if (description !== undefined) voucher.description = description;
    if (minOrderValue !== undefined) voucher.minOrderValue = Math.max(0, Number(minOrderValue));
    if (maxDiscount !== undefined) voucher.maxDiscount = Math.max(0, Number(maxDiscount));
    if (maxUses !== undefined) voucher.maxUses = Math.max(1, Number(maxUses));
    if (status && ['active', 'inactive', 'expired'].includes(status)) voucher.status = status;
    if (emoji) voucher.emoji = emoji;

    await voucher.save();
    res.json({ message: 'Cập nhật mã voucher thành công!', voucher });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi cập nhật voucher của shop.', details: error.message });
  }
});

// ==========================================
// 6. PATCH /api/vouchers/shop/:id/status - Chủ shop bật/tắt voucher
// ==========================================
router.patch('/shop/:id/status', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const shop = await findUserShop(req.user._id || req.user.id, req.user.shopId);
    if (!shop) return res.status(404).json({ error: 'Gian hàng không tồn tại.' });

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ error: 'Không tìm thấy voucher.' });

    const voucherShopId = String(voucher.shopId || voucher.shop_id || '');
    if (voucherShopId !== String(shop._id)) {
      return res.status(403).json({ error: 'Từ chối: Bạn không sở hữu voucher này.' });
    }

    const { status } = req.body;
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái chỉ có thể là active hoặc inactive.' });
    }

    voucher.status = status;
    await voucher.save();
    res.json({ message: `Đã đổi trạng thái voucher sang "${status}".`, voucher });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi đổi trạng thái voucher.', details: error.message });
  }
});

// ==========================================
// 7. DELETE /api/vouchers/shop/:id - Chủ shop xóa voucher của shop mình
// ==========================================
router.delete('/shop/:id', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const shop = await findUserShop(req.user._id || req.user.id, req.user.shopId);
    if (!shop) return res.status(404).json({ error: 'Gian hàng không tồn tại.' });

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) return res.status(404).json({ error: 'Không tìm thấy voucher.' });

    const voucherShopId = String(voucher.shopId || voucher.shop_id || '');
    if (voucherShopId !== String(shop._id)) {
      return res.status(403).json({ error: 'Từ chối: Bạn không sở hữu voucher này.' });
    }

    // Bảo toàn lịch sử đơn hàng
    if (voucher.usesCount > 0 || voucher.used_count > 0) {
      voucher.status = 'inactive';
      await voucher.save();
      return res.json({
        message: 'Mã voucher đã từng được sử dụng trong đơn hàng, đã tự động chuyển sang Vô hiệu hóa để bảo tồn lịch sử.',
        voucher
      });
    }

    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa mã voucher thành công.' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xóa voucher của shop.', details: error.message });
  }
});

// ==========================================
// 8. POST /api/vouchers/validate - Kiểm tra và tính toán giảm giá (Khách hàng)
// ==========================================
router.post('/validate', async (req, res) => {
  try {
    const { code, orderValue, items } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Mã giảm giá không được để trống.' });
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase().trim() }).populate('shopId', 'name shopName');
    if (!voucher) {
      return res.status(404).json({ error: 'Mã giảm giá không tồn tại trên hệ thống.' });
    }

    // A. Trạng thái
    if (voucher.status && voucher.status !== 'active') {
      return res.status(400).json({ error: 'Mã giảm giá này hiện đang bị tạm khóa hoặc không khả dụng.' });
    }

    // B. Thời hạn
    const today = new Date();
    const expiry = voucher.expiryDate || voucher.end_date;
    const start = voucher.startDate || voucher.start_date;

    if (start && start > today) {
      return res.status(400).json({ error: 'Mã giảm giá này chưa đến ngày kích hoạt áp dụng.' });
    }

    if (expiry && expiry < today) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết hạn sử dụng.' });
    }

    // C. Số lần sử dụng tối đa
    const currentUses = Number(voucher.usesCount || voucher.used_count || 0);
    const max = Number(voucher.maxUses || voucher.quantity || 100);
    if (currentUses >= max) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết lượt sử dụng.' });
    }

    // D. Kiểm tra phạm vi Shop (C3 Requirement)
    let eligibleOrderValue = Number(orderValue || 0);
    const voucherShopId = voucher.shopId ? (voucher.shopId._id || voucher.shopId) : voucher.shop_id;

    if (voucherShopId) {
      const shopName = voucher.shopId?.shopName || voucher.shopId?.name || 'gian hàng chỉ định';

      if (items && Array.isArray(items) && items.length > 0) {
        // Lấy danh sách sản phẩm thực tế để kiểm tra shop
        let shopMatchingTotal = 0;
        for (const it of items) {
          const pId = it.productId || it.product_id;
          const qty = Number(it.quantity || it.qty || 1);
          const p = await Product.findById(pId).select('shopId price');
          if (p && p.shopId && String(p.shopId) === String(voucherShopId)) {
            const itPrice = Number(it.price || p.price || 0);
            shopMatchingTotal += itPrice * qty;
          }
        }

        if (shopMatchingTotal <= 0) {
          return res.status(400).json({
            error: `Mã giảm giá này chỉ áp dụng cho sản phẩm thuộc ${shopName}. Giỏ hàng của bạn không có sản phẩm nào của shop này.`
          });
        }
        eligibleOrderValue = shopMatchingTotal;
      }
    }

    // E. Giá trị tối thiểu đơn hàng
    const minOrder = Number(voucher.minOrderValue || (voucher.min_order_amount ? voucher.min_order_amount.toString() : 0));
    if (eligibleOrderValue < minOrder) {
      return res.status(400).json({
        error: `Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này (Tối thiểu ${minOrder.toLocaleString('vi-VN')} VND).`
      });
    }

    const calculatedDiscount = calculateDiscount(voucher, eligibleOrderValue);

    res.json({
      message: 'Mã giảm giá hợp lệ!',
      voucherId: voucher._id,
      code: voucher.code,
      discountType: voucher.discount_type || voucher.discountType || 'fixed',
      discountValue: calculatedDiscount,
      rawDiscountValue: voucher.discountValue,
      maxDiscount: voucher.maxDiscount || 0,
      minOrderValue: minOrder,
      description: voucher.description || voucher.name,
      shopId: voucherShopId || null
    });

  } catch (error) {
    res.status(500).json({ error: 'Lỗi kiểm tra mã giảm giá.', details: error.message });
  }
});

// ==========================================
// 9. ADMIN CRUD ENDPOINTS (D5 COMPLIANT)
// ==========================================
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { 
      code, 
      name,
      description, 
      discountType, 
      discountValue, 
      minOrderValue, 
      maxDiscount,
      expiryDate, 
      startDate,
      maxUses, 
      status,
      emoji,
      shopId
    } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Mã voucher (code) là bắt buộc.' });
    }

    const existing = await Voucher.findOne({ code: code.toUpperCase().trim() });
    if (existing) {
      return res.status(400).json({ error: `Mã giảm giá "${code.toUpperCase().trim()}" đã tồn tại.` });
    }

    const newVoucher = new Voucher({
      code: code.toUpperCase().trim(),
      name: name || description || 'Ưu đãi GearTech',
      description: description || name || 'Mã giảm giá đặc quyền',
      discountType: discountType || 'fixed',
      discountValue: Number(discountValue || 0),
      minOrderValue: Number(minOrderValue || 0),
      maxDiscount: Number(maxDiscount || 0),
      startDate: startDate ? new Date(startDate) : new Date(),
      expiryDate: new Date(expiryDate || '2026-12-31'),
      maxUses: Number(maxUses || 100),
      status: status || 'active',
      emoji: emoji || '🎫',
      shopId: shopId || null
    });

    await newVoucher.save();
    res.status(201).json({ message: 'Tạo mã giảm giá mới thành công!', voucher: newVoucher });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tạo mã giảm giá.', details: error.message });
  }
});

router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { 
      code,
      name,
      description, 
      discountType, 
      discountValue, 
      minOrderValue, 
      maxDiscount,
      expiryDate, 
      startDate,
      maxUses, 
      status,
      emoji,
      shopId
    } = req.body;

    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ error: 'Không tìm thấy voucher yêu cầu.' });
    }

    if (code && code.toUpperCase().trim() !== voucher.code) {
      const conflict = await Voucher.findOne({ 
        code: code.toUpperCase().trim(), 
        _id: { $ne: voucher._id } 
      });
      if (conflict) {
        return res.status(400).json({ error: `Mã code "${code}" đã được sử dụng bởi voucher khác.` });
      }
      voucher.code = code.toUpperCase().trim();
    }

    if (description !== undefined) voucher.description = description;
    if (name !== undefined) voucher.name = name;
    if (discountType !== undefined) voucher.discountType = discountType;
    if (discountValue !== undefined) voucher.discountValue = Number(discountValue);
    if (minOrderValue !== undefined) voucher.minOrderValue = Number(minOrderValue);
    if (maxDiscount !== undefined) voucher.maxDiscount = Number(maxDiscount);
    if (expiryDate) voucher.expiryDate = new Date(expiryDate);
    if (startDate) voucher.startDate = new Date(startDate);
    if (maxUses !== undefined) voucher.maxUses = Number(maxUses);
    if (status) voucher.status = status;
    if (emoji) voucher.emoji = emoji;
    if (shopId !== undefined) voucher.shopId = shopId;

    await voucher.save();
    res.json({ message: 'Cập nhật mã giảm giá thành công!', voucher });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi cập nhật mã giảm giá.', details: error.message });
  }
});

router.patch('/:id/status', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'expired'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ (chỉ chấp nhận active, inactive, expired).' });
    }

    const voucher = await Voucher.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!voucher) {
      return res.status(404).json({ error: 'Không tìm thấy voucher yêu cầu.' });
    }

    res.json({ message: `Đã chuyển trạng thái voucher sang "${status}".`, voucher });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi thay đổi trạng thái voucher.', details: error.message });
  }
});

router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ error: 'Không tìm thấy voucher để xóa.' });
    }

    if (voucher.usesCount > 0 || voucher.used_count > 0) {
      voucher.status = 'inactive';
      await voucher.save();
      return res.json({ 
        message: 'Mã voucher đã từng được sử dụng trong đơn hàng, đã tự động chuyển sang trạng thái Vô hiệu hóa để bảo tồn lịch sử đơn hàng.',
        voucher 
      });
    }

    await Voucher.findByIdAndDelete(req.params.id);
    res.json({ message: 'Đã xóa mã giảm giá thành công.' });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xóa mã giảm giá.', details: error.message });
  }
});

module.exports = router;
