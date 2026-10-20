const mongoose = require('mongoose');

const ShopFollowerSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'shop_followers',
  timestamps: false,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

ShopFollowerSchema.pre('validate', function() {
  if (this.userId && !this.user_id) this.user_id = this.userId;
  if (this.user_id && !this.userId) this.userId = this.user_id;
  if (this.customerId && !this.customer_id) this.customer_id = this.customerId;
  if (this.customer_id && !this.customerId) this.customerId = this.customer_id;
  if (this.shopId && !this.shop_id) this.shop_id = this.shopId;
  if (this.shop_id && !this.shopId) this.shopId = this.shop_id;
});

// Ngăn một khách hàng theo dõi cùng một shop nhiều lần
ShopFollowerSchema.index({ user_id: 1, shop_id: 1 }, { unique: true });

module.exports = mongoose.model('ShopFollower', ShopFollowerSchema);
