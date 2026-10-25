const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  cartId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Cart', 
    required: true,
    index: true 
  },
  cart_id: { type: mongoose.Schema.Types.Mixed }, // Alias cho SQL schema

  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true,
    index: true 
  },
  product_id: { type: mongoose.Schema.Types.Mixed }, // Alias cho SQL schema

  quantity: { 
    type: Number, 
    required: [true, 'Số lượng không được để trống'], 
    min: [1, 'Số lượng tối thiểu là 1'],
    default: 1 
  },

  // Giá tại thời điểm thêm vào giỏ (xác định bởi backend để tính thành tiền)
  price: { 
    type: Number, 
    required: true, 
    min: [0, 'Giá không được âm'] 
  },
  originalPrice: { type: Number, min: 0 },
  priceLockedAt: { type: Date, default: Date.now },
  priceLockExpiresAt: { type: Date },
  promotionNote: { type: String, default: '' },

  selected: { 
    type: Boolean, 
    default: true 
  },

  variant: { 
    type: String, 
    default: 'Tiêu chuẩn / Chính hãng' 
  }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

// Đồng bộ alias SQL
CartItemSchema.pre('save', function() {
  if (this.cartId && !this.cart_id) this.cart_id = this.cartId;
  if (this.productId && !this.product_id) this.product_id = this.productId;
});

module.exports = mongoose.model('CartItem', CartItemSchema);
