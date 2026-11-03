const mongoose = require('mongoose');

const PlatformFeeConfigSchema = new mongoose.Schema({
  name: { 
    type: String, 
    default: 'Chính sách phí tiêu chuẩn GearTech' 
  },
  defaultRate: { 
    type: Number, 
    default: 5.0, 
    min: 0, 
    max: 100 
  }, // Tỷ lệ % phí nền tảng mặc định (ví dụ 5%)
  categoryOverrides: [{
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    categoryName: { type: String, default: '' },
    rate: { type: Number, min: 0, max: 100 }
  }],
  effectiveFrom: { 
    type: Date, 
    default: Date.now 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  notes: { 
    type: String, 
    default: 'Cấu hình phí áp dụng cho các giao dịch mới phát sinh.' 
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

module.exports = mongoose.model('PlatformFeeConfig', PlatformFeeConfigSchema);

