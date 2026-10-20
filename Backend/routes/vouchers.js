const express = require('express');
const router = express.Router();
const Voucher = require('../models/Voucher');
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

// ==========================================
// 1. GET /api/vouchers - Lấy danh sách voucher công khai đang hoạt động
// ==========================================
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    const vouchers = await Voucher.find({
      $and: [
        { $or: [{ status: 'active' }, { status: { $exists: false } }] },
        { $or: [{ expiryDate: { $gte: today } }, { end_date: { $gte: today } }] }
      ]
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
      .populate('shop_id', 'shopName')
      .sort({ created_at: -1, createdAt: -1 });

    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách voucher quản trị.', details: error.message });
  }
});

// ==========================================
// 3. POST /api/vouchers/validate - Kiểm tra và tính toán giảm giá
// ==========================================
router.post('/validate', async (req, res) => {
  try {
    const { code, orderValue } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Mã giảm giá không được để trống.' });
    }

    const voucher = await Voucher.findOne({ code: code.toUpperCase().trim() });
    if (!voucher) {
      return res.status(404).json({ error: 'Mã giảm giá không tồn tại trên hệ thống.' });
    }

    // A. Kiểm tra trạng thái
    if (voucher.status && voucher.status !== 'active') {
      return res.status(400).json({ error: 'Mã giảm giá này hiện đang bị tạm khóa hoặc không khả dụng.' });
    }

    // B. Kiểm tra thời hạn
    const today = new Date();
    const expiry = voucher.expiryDate || voucher.end_date;
    const start = voucher.startDate || voucher.start_date;

    if (start && start > today) {
      return res.status(400).json({ error: 'Mã giảm giá này chưa đến ngày kích hoạt áp dụng.' });
    }

    if (expiry && expiry < today) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết hạn sử dụng.' });
    }

    // C. Kiểm tra số lần sử dụng tối đa
    const currentUses = Number(voucher.usesCount || voucher.used_count || 0);
    const max = Number(voucher.maxUses || voucher.quantity || 100);
    if (currentUses >= max) {
      return res.status(400).json({ error: 'Mã giảm giá đã hết lượt sử dụng.' });
    }

    // D. Kiểm tra giá trị tối thiểu đơn hàng
    const numOrderValue = Number(orderValue || 0);
    const minOrder = Number(voucher.minOrderValue || (voucher.min_order_amount ? voucher.min_order_amount.toString() : 0));
    if (numOrderValue < minOrder) {
      return res.status(400).json({ 
        error: `Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã này (Tối thiểu ${minOrder.toLocaleString('vi-VN')} VND).` 
      });
    }

    const calculatedDiscount = calculateDiscount(voucher, numOrderValue);

    res.json({
      message: 'Mã giảm giá hợp lệ!',
      voucherId: voucher._id,
      code: voucher.code,
      discountType: voucher.discount_type || voucher.discountType || 'fixed',
      discountValue: calculatedDiscount,
      rawDiscountValue: voucher.discountValue,
      maxDiscount: voucher.maxDiscount || 0,
      minOrderValue: minOrder,
      description: voucher.description || voucher.name
    });

  } catch (error) {
    res.status(500).json({ error: 'Lỗi kiểm tra mã giảm giá.', details: error.message });
  }
});

// ==========================================
// 4. POST /api/vouchers - Admin tạo voucher mới
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

// ==========================================
// 5. PUT /api/vouchers/:id - Admin cập nhật voucher
// ==========================================
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
      emoji 
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

    await voucher.save();
    res.json({ message: 'Cập nhật mã giảm giá thành công!', voucher });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi cập nhật mã giảm giá.', details: error.message });
  }
});

// ==========================================
// 6. PATCH /api/vouchers/:id/status - Admin kích hoạt / vô hiệu hóa
// ==========================================
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

// ==========================================
// 7. DELETE /api/vouchers/:id - Admin xóa voucher
// ==========================================
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ error: 'Không tìm thấy voucher để xóa.' });
    }

    // Nếu voucher đã được dùng trong đơn hàng, ưu tiên chuyển sang inactive thay vì xóa cứng
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
