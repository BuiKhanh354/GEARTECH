const { getDevelopmentErrorDetails } = require('../utils/errorDetails')
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ShopWallet = require('../models/ShopWallet');
const FinancialTransaction = require('../models/FinancialTransaction');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const PlatformFeeConfig = require('../models/PlatformFeeConfig');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const { auth, checkRole } = require('../middleware/auth');
const financeService = require('../services/financeService');

// Helper lấy shopId của user hiện tại
async function getEffectiveShopId(user) {
  if (!user) return null;
  if (user.shopId) return user.shopId.toString();
  const shop = await Shop.findOne({ $or: [{ ownerId: user._id }, { user_id: user._id }] });
  return shop ? shop._id.toString() : null;
}

// =========================================================================
// PHÂN HỆ DÀNH CHO SHOP OWNER (CHỦ GIAN HÀNG)
// =========================================================================

// 1. GET /api/finance/shop/overview - Tổng quan tài chính & số dư ví của Shop
router.get('/shop/overview', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const shopId = await getEffectiveShopId(req.user);
    if (!shopId) {
      return res.status(403).json({ error: 'Tài khoản chưa được liên kết với bất kỳ cửa hàng nào.' });
    }

    const wallet = await financeService.getOrCreateWallet(shopId);
    const feeRate = await financeService.getActiveFeeRate();

    // Tính doanh thu hôm nay và tháng này
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

    const [todayTxns, monthTxns] = await Promise.all([
      FinancialTransaction.find({
        shopId,
        type: 'ORDER_REVENUE',
        createdAt: { $gte: startOfToday }
      }),
      FinancialTransaction.find({
        shopId,
        type: 'ORDER_REVENUE',
        createdAt: { $gte: startOfMonth }
      })
    ]);

    const revenueToday = todayTxns.reduce((sum, t) => sum + (t.orderAmount || 0), 0);
    const revenueMonth = monthTxns.reduce((sum, t) => sum + (t.orderAmount || 0), 0);

    return res.json({
      shopId,
      wallet: {
        pendingBalance: wallet.pendingBalance,
        availableBalance: wallet.availableBalance,
        lockedBalance: wallet.lockedBalance,
        withdrawnBalance: wallet.withdrawnBalance,
        totalRevenue: wallet.totalRevenue,
        totalPlatformFee: wallet.totalPlatformFee,
        totalRefunded: wallet.totalRefunded,
        payoutAccount: wallet.payoutAccount
      },
      stats: {
        revenueToday,
        revenueMonth,
        currentFeeRate: feeRate
      }
    });
  } catch (error) {
    console.error('Lỗi lấy tổng quan tài chính shop:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ khi lấy dữ liệu tài chính.', ...getDevelopmentErrorDetails(error) });
  }
});

// 2. GET /api/finance/shop/transactions - Danh sách lịch sử giao dịch sổ cái của Shop
router.get('/shop/transactions', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const shopId = await getEffectiveShopId(req.user);
    if (!shopId) {
      return res.status(403).json({ error: 'Tài khoản chưa liên kết gian hàng.' });
    }

    const { type, search, page = 1, limit = 20 } = req.query;
    const filter = { shopId };

    if (type && type !== 'all') {
      filter.type = type;
    }

    if (search && search.trim()) {
      filter.$or = [
        { transactionCode: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      FinancialTransaction.find(filter)
        .populate('orderId', 'totalAmount finalAmount orderStatus paymentStatus items')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      FinancialTransaction.countDocuments(filter)
    ]);

    return res.json({
      transactions,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Lỗi lấy lịch sử giao dịch shop:', error);
    return res.status(500).json({ error: 'Lỗi tải danh sách giao dịch.', ...getDevelopmentErrorDetails(error) });
  }
});

// 3. GET /api/finance/shop/withdrawals - Danh sách yêu cầu rút tiền của Shop
router.get('/shop/withdrawals', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const shopId = await getEffectiveShopId(req.user);
    if (!shopId) {
      return res.status(403).json({ error: 'Tài khoản chưa liên kết gian hàng.' });
    }

    const withdrawals = await WithdrawalRequest.find({ shopId })
      .sort({ createdAt: -1 });

    return res.json(withdrawals);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi tải yêu cầu rút tiền.', ...getDevelopmentErrorDetails(error) });
  }
});

// 4. POST /api/finance/shop/withdraw - Tạo yêu cầu rút tiền
router.post('/shop/withdraw', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const shopId = await getEffectiveShopId(req.user);
    if (!shopId) {
      return res.status(403).json({ error: 'Tài khoản chưa liên kết gian hàng.' });
    }

    const { amount, bankName, accountNumber, accountHolder, bankCode } = req.body;

    if (!amount || Number(amount) < 50000) {
      return res.status(400).json({ error: 'Số tiền rút tối thiểu là 50.000 VNĐ.' });
    }

    if (!bankName || !accountNumber || !accountHolder) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin tài khoản ngân hàng nhận tiền.' });
    }

    const bankInfo = {
      bankName: String(bankName).trim(),
      bankCode: bankCode ? String(bankCode).trim() : '',
      accountNumber: String(accountNumber).trim(),
      accountHolder: String(accountHolder).toUpperCase().trim()
    };

    const withdrawal = await financeService.requestWithdrawal(
      shopId,
      req.user._id,
      amount,
      bankInfo
    );

    return res.status(201).json({
      message: `Đã tạo yêu cầu rút tiền ${Number(amount).toLocaleString('vi-VN')}đ thành công. Quản trị viên sẽ kiểm tra và giải ngân sớm nhất.`,
      withdrawal
    });
  } catch (error) {
    console.error('Lỗi tạo yêu cầu rút tiền:', error);
    return res.status(400).json({ error: error.message });
  }
});

// 5. PUT /api/finance/shop/payout-account - Cập nhật tài khoản ngân hàng mặc định
router.put('/shop/payout-account', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const shopId = await getEffectiveShopId(req.user);
    if (!shopId) {
      return res.status(403).json({ error: 'Tài khoản chưa liên kết gian hàng.' });
    }

    const { bankName, accountNumber, accountHolder, bankCode } = req.body;
    if (!bankName || !accountNumber || !accountHolder) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ tên ngân hàng, số tài khoản và chủ tài khoản.' });
    }

    const wallet = await financeService.getOrCreateWallet(shopId);
    wallet.payoutAccount = {
      bankName: String(bankName).trim(),
      bankCode: bankCode ? String(bankCode).trim() : '',
      accountNumber: String(accountNumber).trim(),
      accountHolder: String(accountHolder).toUpperCase().trim(),
      isVerified: true
    };
    await wallet.save();

    return res.json({
      message: 'Cập nhật tài khoản nhận tiền thành công!',
      payoutAccount: wallet.payoutAccount
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi cập nhật tài khoản ngân hàng.', ...getDevelopmentErrorDetails(error) });
  }
});


// =========================================================================
// PHÂN HỆ DÀNH CHO ADMIN (QUẢN TRỊ VIÊN TOÀN SÀN)
// =========================================================================

// 6. GET /api/finance/admin/overview - Tổng quan tài chính toàn sàn GEARTECH
router.get('/admin/overview', auth, checkRole(['admin']), async (req, res) => {
  try {
    const [wallets, pendingWithdrawalsCount, feeConfig] = await Promise.all([
      ShopWallet.find().populate('shopId', 'name status logo'),
      WithdrawalRequest.countDocuments({ status: 'PENDING' }),
      PlatformFeeConfig.findOne({ isActive: true }).sort({ effectiveFrom: -1 })
    ]);

    const totalRevenue = wallets.reduce((sum, w) => sum + (w.totalRevenue || 0), 0);
    const totalPlatformFee = wallets.reduce((sum, w) => sum + (w.totalPlatformFee || 0), 0);
    const totalPendingBalance = wallets.reduce((sum, w) => sum + (w.pendingBalance || 0), 0);
    const totalAvailableBalance = wallets.reduce((sum, w) => sum + (w.availableBalance || 0), 0);
    const totalLockedBalance = wallets.reduce((sum, w) => sum + (w.lockedBalance || 0), 0);
    const totalWithdrawnBalance = wallets.reduce((sum, w) => sum + (w.withdrawnBalance || 0), 0);
    const totalRefunded = wallets.reduce((sum, w) => sum + (w.totalRefunded || 0), 0);

    return res.json({
      metrics: {
        totalRevenue,
        totalPlatformFee,
        totalPendingBalance,
        totalAvailableBalance,
        totalLockedBalance,
        totalWithdrawnBalance,
        totalRefunded,
        totalShopsWithWallet: wallets.length,
        pendingWithdrawalsCount,
        currentFeeRate: feeConfig ? feeConfig.defaultRate : 5.0
      },
      shopWallets: wallets
    });
  } catch (error) {
    console.error('Lỗi lấy tổng quan tài chính admin:', error);
    return res.status(500).json({ error: 'Lỗi nạp dữ liệu tài chính admin.', ...getDevelopmentErrorDetails(error) });
  }
});

// 7. GET /api/finance/admin/withdrawals - Danh sách tất cả yêu cầu rút tiền toàn sàn
router.get('/admin/withdrawals', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [withdrawals, total] = await Promise.all([
      WithdrawalRequest.find(filter)
        .populate('shopId', 'name phone email logo status')
        .populate('requestedBy', 'name email phone')
        .populate('processedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      WithdrawalRequest.countDocuments(filter)
    ]);

    return res.json({
      withdrawals,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi tải danh sách yêu cầu rút tiền.', ...getDevelopmentErrorDetails(error) });
  }
});

// 8. PUT /api/finance/admin/withdrawals/:id/reject - Admin từ chối yêu cầu rút tiền
router.put('/admin/withdrawals/:id/reject', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp lý do từ chối yêu cầu rút tiền.' });
    }

    const withdrawal = await financeService.rejectWithdrawal(
      req.params.id,
      req.user._id,
      reason.trim()
    );

    return res.json({
      message: `Đã từ chối yêu cầu rút tiền #${withdrawal.requestCode}. Số tiền ${withdrawal.amount.toLocaleString('vi-VN')}đ đã được hoàn trả lại ví khả dụng của Shop.`,
      withdrawal
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// 9. PUT /api/finance/admin/withdrawals/:id/payout - Admin xác nhận đã giải ngân tiền thành công
router.put('/admin/withdrawals/:id/payout', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { payoutReference, payoutProofUrl } = req.body;

    const withdrawal = await financeService.payoutWithdrawal(
      req.params.id,
      req.user._id,
      payoutReference,
      payoutProofUrl
    );

    return res.json({
      message: `Đã xác nhận giải ngân thành công ${withdrawal.amount.toLocaleString('vi-VN')}đ cho shop!`,
      withdrawal
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// 10. GET /api/finance/admin/fee-config - Xem cấu hình phí nền tảng
router.get('/admin/fee-config', auth, checkRole(['admin']), async (req, res) => {
  try {
    let config = await PlatformFeeConfig.findOne({ isActive: true }).sort({ effectiveFrom: -1 });
    if (!config) {
      config = await PlatformFeeConfig.create({
        name: 'Chính sách phí tiêu chuẩn GearTech',
        defaultRate: 5.0,
        isActive: true,
        updatedBy: req.user._id
      });
    }
    return res.json(config);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi nạp cấu hình phí nền tảng.', ...getDevelopmentErrorDetails(error) });
  }
});

// 11. PUT /api/finance/admin/fee-config - Cập nhật cấu hình phí nền tảng mới
router.put('/admin/fee-config', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { defaultRate, name, notes } = req.body;
    const rate = Number(defaultRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      return res.status(400).json({ error: 'Tỷ lệ phí phải là số từ 0% đến 100%.' });
    }

    // Vô hiệu hóa cấu hình cũ và tạo cấu hình mới để giữ nguyên lịch sử giao dịch cũ
    await PlatformFeeConfig.updateMany({}, { isActive: false });

    const newConfig = await PlatformFeeConfig.create({
      name: name || 'Chính sách phí sàn GearTech',
      defaultRate: rate,
      effectiveFrom: new Date(),
      updatedBy: req.user._id,
      isActive: true,
      notes: notes || `Admin ${req.user.name || req.user.username} cập nhật mức phí thành ${rate}%.`
    });

    return res.json({
      message: `Đã cập nhật mức phí nền tảng thành công (${rate}%)! Mức phí mới sẽ áp dụng cho các giao dịch mới phát sinh.`,
      config: newConfig
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi cập nhật cấu hình phí.', ...getDevelopmentErrorDetails(error) });
  }
});

// 12. GET /api/finance/admin/transactions - Toàn bộ sổ cái giao dịch tài chính trên sàn
router.get('/admin/transactions', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { shopId, type, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (shopId && shopId !== 'all') {
      filter.shopId = shopId;
    }
    if (type && type !== 'all') {
      filter.type = type;
    }
    if (search && search.trim()) {
      filter.$or = [
        { transactionCode: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      FinancialTransaction.find(filter)
        .populate('shopId', 'name logo')
        .populate('orderId', 'totalAmount finalAmount orderStatus paymentStatus')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      FinancialTransaction.countDocuments(filter)
    ]);

    return res.json({
      transactions,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi tải sổ cái tài chính toàn sàn.', ...getDevelopmentErrorDetails(error) });
  }
});

module.exports = router;

