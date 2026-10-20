const mongoose = require('mongoose');

const CustomerAddressSchema = new mongoose.Schema({
  title: { type: String, default: 'Địa chỉ nhận hàng' },
  receiverName: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  detailAddress: { type: String, required: true },
  province: { type: String },
  district: { type: String },
  ward: { type: String },
  isDefault: { type: Boolean, default: false }
});

const CustomerSchema = new mongoose.Schema({
  // Liên kết 1-1 với tài khoản User trong hệ thống để làm rõ quan hệ và tránh trùng lặp dữ liệu
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    unique: true, 
    sparse: true,
    index: true 
  },
  user_id: { type: mongoose.Schema.Types.Mixed }, // Alias tương thích SQL

  name: { 
    type: String, 
    required: [true, 'Họ tên khách hàng không được để trống'], 
    trim: true 
  },
  
  email: { 
    type: String, 
    required: [true, 'Email khách hàng không được để trống'], 
    unique: true, 
    lowercase: true, 
    trim: true,
    index: true
  },

  phone: { 
    type: String, 
    trim: true,
    default: '' 
  },

  password: {
    type: String
  },

  avatar: { 
    type: String, 
    default: '/images/avatar/default.png' 
  },

  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active',
    index: true
  },

  // Địa chỉ giao hàng mặc định phục vụ đặt hàng và xử lý đơn hàng
  shippingAddress: {
    receiverName: { type: String },
    receiverPhone: { type: String },
    detailAddress: { type: String },
    province: { type: String },
    district: { type: String },
    ward: { type: String }
  },

  addresses: [CustomerAddressSchema]
}, { 
  timestamps: true 
});

// Middleware tự động đồng bộ alias tương thích SQL
CustomerSchema.pre('save', function() {
  if (this.userId && !this.user_id) {
    this.user_id = this.userId;
  }
});

// Chỉ mục tìm kiếm nhanh
CustomerSchema.index({ name: 'text', email: 'text', phone: 'text' });

module.exports = mongoose.model('Customer', CustomerSchema);
