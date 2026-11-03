const mongoose = require('mongoose');

const WithdrawalRequestSchema = new mongoose.Schema({
  requestCode: { 
    type: String, 
    required: true, 
    unique: true 
  }, // WR-YYYYMMDD-XXXXXX
  shopId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Shop', 
    required: true 
  },
  requestedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: [50000, 'Số tiền rút tối thiểu là 50.000 VNĐ'] 
  },
  bankInfo: {
    bankName: { type: String, required: true },
    bankCode: { type: String, default: '' },
    accountNumber: { type: String, required: true },
    accountHolder: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'PAID_OUT'],
    default: 'PENDING'
  },
  rejectReason: { 
    type: String, 
    default: '' 
  },
  processedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    default: null 
  },
  processedAt: { 
    type: Date, 
    default: null 
  },
  payoutProofUrl: { 
    type: String, 
    default: '' 
  }, // URL hình ảnh ủy nhiệm chi hoặc hóa đơn chuyển khoản thực tế
  payoutReference: { 
    type: String, 
    default: '' 
  }, // Mã giao dịch ngân hàng thực tế
  note: { 
    type: String, 
    default: '' 
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

WithdrawalRequestSchema.index({ shopId: 1, createdAt: -1 });
WithdrawalRequestSchema.index({ status: 1 });

module.exports = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);
