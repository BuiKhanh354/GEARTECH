const mongoose = require('mongoose');

const PayoutAccountSchema = new mongoose.Schema({
  bankName: { type: String, default: '' },
  bankCode: { type: String, default: '' },
  accountNumber: { type: String, default: '' },
  accountHolder: { type: String, default: '' },
  isVerified: { type: Boolean, default: false }
}, { _id: false });

const ShopWalletSchema = new mongoose.Schema({
  shopId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shop', 
    required: true, 
    unique: true 
  },
  // Tiền đang chờ đối soát (khi khách thanh toán nhưng đơn chưa hoàn tất/đáp ứng điều kiện giải ngân)
  pendingBalance: { type: Number, default: 0, min: 0 },
  // Tiền đủ điều kiện rút sau khi đối soát thành công
  availableBalance: { type: Number, default: 0, min: 0 },
  // Tiền đang tạm khóa do shop tạo yêu cầu rút hoặc đang có khiếu nại
  lockedBalance: { type: Number, default: 0, min: 0 },
  // Tổng số tiền đã giải ngân thành công ra tài khoản ngân hàng
  withdrawnBalance: { type: Number, default: 0, min: 0 },
  // Tổng doanh thu lũy kế (giá trị sản phẩm bán được)
  totalRevenue: { type: Number, default: 0, min: 0 },
  // Tổng phí nền tảng đã chi trả
  totalPlatformFee: { type: Number, default: 0, min: 0 },
  // Tổng số tiền đã hoàn trả cho khách hàng
  totalRefunded: { type: Number, default: 0, min: 0 },

  // Thông tin tài khoản nhận tiền giải ngân của Shop
  payoutAccount: {
    type: PayoutAccountSchema,
    default: () => ({})
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('ShopWallet', ShopWalletSchema);
