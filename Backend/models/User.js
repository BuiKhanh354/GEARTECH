const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  title: { type: String, default: 'Nhà riêng' },
  receiverName: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  detailAddress: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    trim: true, 
    default: function() { return this.username || 'Người dùng GearTech'; }
  },
  username: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // Mật khẩu đã được mã hóa (bcrypt)
  phone: { type: String, trim: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
  gender: { type: String, enum: ['Nam', 'Nữ', 'Khác'], default: 'Khác' },
  birthday: { type: Date },
  role: { type: String, enum: ['user', 'admin', 'shop'], default: 'user' }, // Phân quyền: user (khách hàng), shop (chủ shop), admin (quản trị)
  status: { type: String, enum: ['active', 'locked'], default: 'active' }, // Trạng thái: active (hoạt động), locked (bị khóa)
  
  // D1: Khóa tài khoản khách hàng theo khoảng thời gian
  lockedAt: { type: Date, default: null }, // Thời điểm khóa
  lockExpiresAt: { type: Date, default: null }, // Thời điểm hết hạn khóa (null = vô thời hạn)
  lockReason: { type: String, default: '' }, // Lý do khóa tài khoản

  // Section 8: Khóa riêng quyền đặt hàng của khách hàng (vẫn cho đăng nhập & xem hàng)
  isOrderLocked: { type: Boolean, default: false },
  orderLockedAt: { type: Date, default: null },
  orderLockExpiresAt: { type: Date, default: null },
  orderLockReason: { type: String, default: '' },

  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null }, // Liên kết tới Shop (dành cho tài khoản doanh nghiệp)
  memberRank: { type: String, enum: ['THUONG', 'DONG', 'BAC', 'VANG', 'KIM_CUONG'], default: 'THUONG' },
  points: { type: Number, default: 0, min: 0 },
  addresses: [AddressSchema]
}, { timestamps: true });

// Tự động xóa trường password khi serialize JSON hoặc Object để bảo mật thông tin
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

UserSchema.set('toObject', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

// Đánh chỉ mục để tìm kiếm nhanh
UserSchema.index({ role: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ lockExpiresAt: 1 });

module.exports = mongoose.model('User', UserSchema);
