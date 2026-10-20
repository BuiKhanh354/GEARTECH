const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'favorites',
  timestamps: false,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

FavoriteSchema.pre('validate', function() {
  if (this.userId && !this.user_id) this.user_id = this.userId;
  if (this.user_id && !this.userId) this.userId = this.user_id;
  if (this.customerId && !this.customer_id) this.customer_id = this.customerId;
  if (this.customer_id && !this.customerId) this.customerId = this.customer_id;
  if (this.productId && !this.product_id) this.product_id = this.productId;
  if (this.product_id && !this.productId) this.productId = this.product_id;
});

// Ngăn một khách hàng lưu trùng cùng một sản phẩm
FavoriteSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
