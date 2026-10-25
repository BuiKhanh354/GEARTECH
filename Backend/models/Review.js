const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: false },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { 
    type: Number, 
    required: [true, 'Số sao đánh giá là bắt buộc'], 
    min: [1, 'Đánh giá tối thiểu là 1 sao'], 
    max: [5, 'Đánh giá tối đa là 5 sao'] 
  },
  comment: { 
    type: String, 
    required: [true, 'Nội dung nhận xét không được để trống'], 
    trim: true,
    maxlength: [1000, 'Nội dung nhận xét tối đa 1000 ký tự']
  },
  images: [{ type: String }],
  status: { 
    type: String, 
    enum: ['approved', 'pending', 'rejected'], 
    default: 'approved' 
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  collection: 'reviews',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

ReviewSchema.pre('validate', function() {
  if (this.userId && !this.user_id) this.user_id = this.userId;
  if (this.user_id && !this.userId) this.userId = this.user_id;
  if (this.customerId && !this.customer_id) this.customer_id = this.customerId;
  if (this.customer_id && !this.customerId) this.customerId = this.customer_id;
  if (this.productId && !this.product_id) this.product_id = this.productId;
  if (this.product_id && !this.productId) this.productId = this.product_id;
  if (this.shopId && !this.shop_id) this.shop_id = this.shopId;
  if (this.shop_id && !this.shopId) this.shopId = this.shop_id;
  if (this.orderId && !this.order_id) this.order_id = this.orderId;
  if (this.order_id && !this.orderId) this.orderId = this.order_id;
  this.updated_at = new Date();
});

// Chỉ cho phép 1 đánh giá cho mỗi khách hàng / sản phẩm hoặc khách hàng / shop
ReviewSchema.index({ user_id: 1, product_id: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ user_id: 1, shop_id: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ product_id: 1, status: 1 });
ReviewSchema.index({ shop_id: 1, status: 1 });

module.exports = mongoose.model('Review', ReviewSchema);
