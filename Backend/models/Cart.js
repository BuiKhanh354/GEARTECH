const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  // Liên kết khách hàng / tài khoản người dùng
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    index: true 
  },
  user_id: { type: mongoose.Schema.Types.Mixed },

  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer', 
    index: true 
  },
  customer_id: { type: mongoose.Schema.Types.Mixed },

  // Danh sách sản phẩm trong giỏ hàng (hỗ trợ truy vấn nhanh và đồng bộ với CartItem)
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: [1, 'Số lượng tối thiểu là 1'], default: 1 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 }, // Giá niêm yết/gốc tại thời điểm thêm
    priceLockedAt: { type: Date, default: Date.now }, // Thời điểm chốt giá
    priceLockExpiresAt: { type: Date }, // Thời điểm hết hạn giữ giá khuyến mãi (mặc định 48h)
    promotionNote: { type: String, default: '' }, // Ghi chú chương trình ưu đãi
    selected: { type: Boolean, default: true },
    variant: { type: String, default: 'Tiêu chuẩn / Chính hãng' }
  }],

  // Tạm tính giỏ hàng theo giá backend
  subtotal: { type: Number, default: 0, min: 0 },
  totalCount: { type: Number, default: 0, min: 0 }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// Middleware tự động đồng bộ alias SQL trước khi lưu
CartSchema.pre('save', function() {
  if (this.userId && !this.user_id) this.user_id = this.userId;
  if (this.customerId && !this.customer_id) this.customer_id = this.customerId;
  
  // Tự động tính lại tổng số lượng và tạm tính
  if (Array.isArray(this.items)) {
    this.totalCount = this.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    this.subtotal = this.items
      .filter(item => item.selected !== false)
      .reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  }
});

module.exports = mongoose.model('Cart', CartSchema);
