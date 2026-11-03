const mongoose = require('mongoose');
const ShopWallet = require('../models/ShopWallet');
const FinancialTransaction = require('../models/FinancialTransaction');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const PlatformFeeConfig = require('../models/PlatformFeeConfig');
const Order = require('../models/Order');
const Shop = require('../models/Shop');

// Helper sinh mã giao dịch duy nhất
function generateCode(prefix) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${dateStr}-${rand}`;
}

const financeService = {
  // 1. Tìm hoặc khởi tạo ví của Shop
  getOrCreateWallet: async (shopId) => {
    let wallet = await ShopWallet.findOne({ shopId });
    if (!wallet) {
      wallet = await ShopWallet.create({
        shopId,
        pendingBalance: 0,
        availableBalance: 0,
        lockedBalance: 0,
        withdrawnBalance: 0,
        totalRevenue: 0,
        totalPlatformFee: 0,
        totalRefunded: 0
      });
    }
    return wallet;
  },

  // 2. Lấy tỷ lệ phí sàn hiện hành
  getActiveFeeRate: async () => {
    const config = await PlatformFeeConfig.findOne({ isActive: true }).sort({ effectiveFrom: -1 });
    return config ? config.defaultRate : 5.0; // Mặc định 5% nếu chưa cấu hình
  },

  // 3. Ghi nhận doanh thu đơn hàng vào Pending Balance (khi thanh toán thành công)
  recordOrderPayment: async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order || !order.shopId && !order.shop_id) return null;
    const shopId = order.shopId || order.shop_id;

    // Chống ghi nhận trùng (Idempotency): Kiểm tra xem đơn đã ghi nhận ORDER_REVENUE chưa
    const existing = await FinancialTransaction.findOne({
      orderId: order._id,
      type: 'ORDER_REVENUE'
    });
    if (existing) {
      return existing; // Đã ghi nhận, bỏ qua để chống nhân đôi tiền
    }

    const wallet = await financeService.getOrCreateWallet(shopId);
    const feeRate = await financeService.getActiveFeeRate();

    // Giá trị hàng hóa thực tế của đơn (chưa tính phí ship, vì phí ship thanh toán cho đơn vị vận chuyển GHN)
    const orderAmount = Number(order.totalAmount || (order.total_amount ? parseFloat(order.total_amount.toString()) : 0));
    const discountAmount = Number(order.discountAmount || (order.discount_amount ? parseFloat(order.discount_amount.toString()) : 0));
    const shippingFee = Number(order.shippingFee || (order.shipping_fee ? parseFloat(order.shipping_fee.toString()) : 0));
    
    // Doanh thu tính phí sàn là giá trị sản phẩm sau giảm giá
    const netProductValue = Math.max(0, orderAmount - discountAmount);
    const platformFeeAmount = Math.round((netProductValue * feeRate) / 100);
    const netAmount = Math.max(0, netProductValue - platformFeeAmount);

    const balanceBefore = wallet.availableBalance;

    // Cập nhật ví: Tiền vào Pending Balance (đang chờ đối soát)
    wallet.pendingBalance += netAmount;
    wallet.totalRevenue += netProductValue;
    wallet.totalPlatformFee += platformFeeAmount;
    await wallet.save();

    // Ghi sổ cái giao dịch
    const txn = await FinancialTransaction.create({
      transactionCode: generateCode('FT-REV'),
      shopId,
      orderId: order._id,
      type: 'ORDER_REVENUE',
      amount: netAmount,
      balanceBefore,
      balanceAfter: wallet.availableBalance, // Available chưa đổi
      orderAmount: netProductValue,
      shippingFee,
      platformFeeRate: feeRate,
      platformFeeAmount,
      netAmount,
      status: 'COMPLETED',
      description: `Ghi nhận doanh thu tạm giữ đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`,
      metadata: {
        paymentMethod: order.paymentMethod || order.payment_method,
        paymentStatus: order.paymentStatus || order.payment_status
      }
    });

    return txn;
  },

  // 4. Đối soát đơn hàng khi hoàn tất (chuyển từ Pending Balance sang Available Balance)
  settleOrder: async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order || !order.shopId && !order.shop_id) return null;
    const shopId = order.shopId || order.shop_id;

    // Chống giải ngân trùng (Idempotency)
    const existingSettled = await FinancialTransaction.findOne({
      orderId: order._id,
      type: 'ORDER_SETTLED'
    });
    if (existingSettled) {
      return existingSettled;
    }

    const wallet = await financeService.getOrCreateWallet(shopId);

    // Tìm bản ghi doanh thu ban đầu để lấy số tiền chính xác
    let revenueTxn = await FinancialTransaction.findOne({
      orderId: order._id,
      type: 'ORDER_REVENUE'
    });

    // Nếu đơn hàng chưa từng ghi nhận doanh thu (ví dụ đơn COD hoàn thành mới trả tiền)
    if (!revenueTxn) {
      revenueTxn = await financeService.recordOrderPayment(order._id);
    }

    if (!revenueTxn) return null;

    const netAmount = revenueTxn.netAmount;
    const balanceBefore = wallet.availableBalance;

    // Chuyển từ Pending sang Available
    wallet.pendingBalance = Math.max(0, wallet.pendingBalance - netAmount);
    wallet.availableBalance += netAmount;
    await wallet.save();

    const settleTxn = await FinancialTransaction.create({
      transactionCode: generateCode('FT-SET'),
      shopId,
      orderId: order._id,
      type: 'ORDER_SETTLED',
      amount: netAmount,
      balanceBefore,
      balanceAfter: wallet.availableBalance,
      orderAmount: revenueTxn.orderAmount,
      shippingFee: revenueTxn.shippingFee,
      platformFeeRate: revenueTxn.platformFeeRate,
      platformFeeAmount: revenueTxn.platformFeeAmount,
      netAmount,
      status: 'COMPLETED',
      description: `Giải ngân doanh thu khả dụng đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`,
      metadata: {
        orderStatus: order.orderStatus || order.order_status
      }
    });

    return settleTxn;
  },

  // 5. Xử lý khi đơn hàng bị hủy
  handleOrderCancellation: async (orderId) => {
    const order = await Order.findById(orderId);
    if (!order || !order.shopId && !order.shop_id) return null;
    const shopId = order.shopId || order.shop_id;

    const revenueTxn = await FinancialTransaction.findOne({
      orderId: order._id,
      type: 'ORDER_REVENUE'
    });

    // Nếu chưa ghi nhận doanh thu thì không cần xử lý tài chính
    if (!revenueTxn) return null;

    // Kiểm tra xem đơn đã bị ghi nhận hủy chưa
    const existingCancel = await FinancialTransaction.findOne({
      orderId: order._id,
      type: 'ORDER_CANCELLED'
    });
    if (existingCancel) return existingCancel;

    const wallet = await financeService.getOrCreateWallet(shopId);
    const netAmount = revenueTxn.netAmount;
    const isSettled = await FinancialTransaction.findOne({
      orderId: order._id,
      type: 'ORDER_SETTLED'
    });

    const balanceBefore = wallet.availableBalance;

    if (!isSettled) {
      // Đơn chưa hoàn tất -> thu hồi từ Pending Balance
      wallet.pendingBalance = Math.max(0, wallet.pendingBalance - netAmount);
      wallet.totalRevenue = Math.max(0, wallet.totalRevenue - revenueTxn.orderAmount);
      wallet.totalPlatformFee = Math.max(0, wallet.totalPlatformFee - revenueTxn.platformFeeAmount);
      await wallet.save();

      return await FinancialTransaction.create({
        transactionCode: generateCode('FT-CAN'),
        shopId,
        orderId: order._id,
        type: 'ORDER_CANCELLED',
        amount: -netAmount,
        balanceBefore,
        balanceAfter: wallet.availableBalance,
        status: 'COMPLETED',
        description: `Hủy ghi nhận doanh thu tạm giữ do hủy đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`
      });
    } else {
      // Đơn đã giải ngân mà sau đó hoàn trả -> thu hồi từ Available Balance
      wallet.availableBalance = Math.max(0, wallet.availableBalance - netAmount);
      wallet.totalRefunded += netAmount;
      await wallet.save();

      return await FinancialTransaction.create({
        transactionCode: generateCode('FT-REF'),
        shopId,
        orderId: order._id,
        type: 'ORDER_REFUND',
        amount: -netAmount,
        balanceBefore,
        balanceAfter: wallet.availableBalance,
        status: 'COMPLETED',
        description: `Thu hồi tiền hoàn trả đơn hàng #${order._id.toString().slice(-6).toUpperCase()}`
      });
    }
  },

  // 6. Shop tạo yêu cầu rút tiền
  requestWithdrawal: async (shopId, userId, amount, bankInfo) => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 50000) {
      throw new Error('Số tiền rút tối thiểu là 50.000 VNĐ.');
    }

    const wallet = await financeService.getOrCreateWallet(shopId);

    // Kiểm tra số dư khả dụng thực tế trên backend
    if (wallet.availableBalance < numAmount) {
      throw new Error(`Số dư khả dụng không đủ (Hiện có: ${wallet.availableBalance.toLocaleString('vi-VN')}đ, Yêu cầu: ${numAmount.toLocaleString('vi-VN')}đ).`);
    }

    const balanceBefore = wallet.availableBalance;

    // Tạm khóa tiền từ Available sang Locked
    wallet.availableBalance -= numAmount;
    wallet.lockedBalance += numAmount;
    await wallet.save();

    const requestCode = generateCode('WR');
    const withdrawal = await WithdrawalRequest.create({
      requestCode,
      shopId,
      requestedBy: userId,
      amount: numAmount,
      bankInfo,
      status: 'PENDING'
    });

    // Ghi nhận vào sổ cái
    await FinancialTransaction.create({
      transactionCode: generateCode('FT-WDR'),
      shopId,
      withdrawalRequestId: withdrawal._id,
      type: 'WITHDRAWAL_REQUEST',
      amount: -numAmount,
      balanceBefore,
      balanceAfter: wallet.availableBalance,
      status: 'COMPLETED',
      description: `Tạo yêu cầu rút tiền ${numAmount.toLocaleString('vi-VN')}đ về tài khoản ${bankInfo.bankName} - ${bankInfo.accountNumber}`
    });

    return withdrawal;
  },

  // 7. Admin từ chối yêu cầu rút tiền -> Hoàn trả lại số dư khả dụng
  rejectWithdrawal: async (requestId, adminUserId, reason) => {
    const withdrawal = await WithdrawalRequest.findById(requestId);
    if (!withdrawal) throw new Error('Không tìm thấy yêu cầu rút tiền.');
    if (withdrawal.status !== 'PENDING') {
      throw new Error(`Yêu cầu này đã được xử lý trước đó (Trạng thái: ${withdrawal.status}).`);
    }

    const wallet = await financeService.getOrCreateWallet(withdrawal.shopId);
    const balanceBefore = wallet.availableBalance;

    // Mở khóa tiền hoàn trả về Available
    wallet.lockedBalance = Math.max(0, wallet.lockedBalance - withdrawal.amount);
    wallet.availableBalance += withdrawal.amount;
    await wallet.save();

    withdrawal.status = 'REJECTED';
    withdrawal.rejectReason = reason || 'Admin từ chối yêu cầu rút tiền.';
    withdrawal.processedBy = adminUserId;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    await FinancialTransaction.create({
      transactionCode: generateCode('FT-REJ'),
      shopId: withdrawal.shopId,
      withdrawalRequestId: withdrawal._id,
      type: 'WITHDRAWAL_REJECT',
      amount: withdrawal.amount,
      balanceBefore,
      balanceAfter: wallet.availableBalance,
      status: 'COMPLETED',
      description: `Hoàn tiền yêu cầu rút ${withdrawal.requestCode} bị từ chối: ${withdrawal.rejectReason}`
    });

    return withdrawal;
  },

  // 8. Admin xác nhận giải ngân thành công ra ngân hàng
  payoutWithdrawal: async (requestId, adminUserId, payoutReference, payoutProofUrl) => {
    const withdrawal = await WithdrawalRequest.findById(requestId);
    if (!withdrawal) throw new Error('Không tìm thấy yêu cầu rút tiền.');
    if (withdrawal.status !== 'PENDING' && withdrawal.status !== 'APPROVED') {
      throw new Error(`Yêu cầu này không ở trạng thái có thể giải ngân (Trạng thái: ${withdrawal.status}).`);
    }

    const wallet = await financeService.getOrCreateWallet(withdrawal.shopId);
    const balanceBefore = wallet.availableBalance;

    // Trừ khỏi LockedBalance và cộng vào WithdrawnBalance
    wallet.lockedBalance = Math.max(0, wallet.lockedBalance - withdrawal.amount);
    wallet.withdrawnBalance += withdrawal.amount;
    await wallet.save();

    withdrawal.status = 'PAID_OUT';
    withdrawal.payoutReference = payoutReference || `REF-${Date.now()}`;
    withdrawal.payoutProofUrl = payoutProofUrl || '';
    withdrawal.processedBy = adminUserId;
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    await FinancialTransaction.create({
      transactionCode: generateCode('FT-PAY'),
      shopId: withdrawal.shopId,
      withdrawalRequestId: withdrawal._id,
      type: 'WITHDRAWAL_SUCCESS',
      amount: withdrawal.amount,
      balanceBefore,
      balanceAfter: wallet.availableBalance,
      status: 'COMPLETED',
      description: `Giải ngân thành công ${withdrawal.amount.toLocaleString('vi-VN')}đ (Mã giao dịch NH: ${withdrawal.payoutReference})`
    });

    return withdrawal;
  }
};

module.exports = financeService;

