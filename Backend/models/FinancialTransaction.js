const mongoose = require('mongoose');

const FinancialTransactionSchema = new mongoose.Schema({
  transactionCode: { 
    type: String, 
    required: true, 
    unique: true 
  }, // FT-YYYYMMDD-XXXXXX
  shopId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shop', 
    required: true 
  },
  orderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Order', 
    default: null 
  },
  withdrawalRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WithdrawalRequest',
    default: null
  },
  type: {
    type: String,
    enum: [
      'ORDER_REVENUE',      // Ghi nhận doanh thu đơn hàng vào Pending Balance
      'ORDER_SETTLED',      // Chuyển tiền từ Pending Balance sang Available Balance khi đơn hoàn tất
      'PLATFORM_FEE',       // Ghi nhận phí nền tảng
      'WITHDRAWAL_REQUEST', // Tạm khóa tiền Available Balance khi Shop tạo lệnh rút
      'WITHDRAWAL_SUCCESS', // Giải ngân thành công (trừ Locked, tăng Withdrawn)
      'WITHDRAWAL_REJECT',  // Admin từ chối rút tiền -> hoàn lại Available Balance
      'ORDER_CANCELLED',    // Đơn hàng hủy trước khi hoàn tất -> hoàn Pending Balance
      'ORDER_REFUND',       // Hoàn tiền đơn hàng sau khi hoàn tất
      'ADJUSTMENT'          // Điều chỉnh thủ công bởi Admin (có kiểm soát & audit log)
    ],
    required: true
  },
  // Số tiền tác động vào tài khoản (+ hoặc -)
  amount: { 
    type: Number, 
    required: true 
  },
  // Snapshot số dư khả dụng trước và sau giao dịch
  balanceBefore: { 
    type: Number, 
    default: 0 
  },
  balanceAfter: { 
    type: Number, 
    default: 0 
  },
  // Chi tiết đơn hàng đối với các giao dịch đơn hàng
  orderAmount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 0 },
  platformFeeRate: { type: Number, default: 0 }, // Tỷ lệ % phí sàn snapshot tại thời điểm đơn
  platformFeeAmount: { type: Number, default: 0 },
  netAmount: { type: Number, default: 0 }, // Thực nhận = orderAmount - platformFeeAmount
  
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'],
    default: 'COMPLETED'
  },
  description: { 
    type: String, 
    default: '' 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed, 
    default: () => ({}) 
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

FinancialTransactionSchema.index({ shopId: 1, createdAt: -1 });
FinancialTransactionSchema.index({ orderId: 1 });
FinancialTransactionSchema.index({ type: 1 });

module.exports = mongoose.model('FinancialTransaction', FinancialTransactionSchema);
