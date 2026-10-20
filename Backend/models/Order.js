const mongoose = require('mongoose');

const EmbeddedOrderItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  product_name: { type: String },
  title: { type: String },
  sku: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  qty: { type: Number, min: 1 },
  unit_price: { type: Number, required: true, min: 0 },
  price: { type: Number, min: 0 },
  subtotal: { type: Number, min: 0 },
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' }
}, { _id: true });

EmbeddedOrderItemSchema.pre('validate', function() {
  if (this.productId && !this.product_id) this.product_id = this.productId;
  if (this.product_id && !this.productId) this.productId = this.product_id;
  if (this.title && !this.product_name) this.product_name = this.title;
  if (this.product_name && !this.title) this.title = this.product_name;
  if (this.qty && !this.quantity) this.quantity = this.qty;
  if (this.quantity && !this.qty) this.qty = this.quantity;
  if (this.price !== undefined && this.unit_price === undefined) this.unit_price = this.price;
  if (this.unit_price !== undefined && this.price === undefined) this.price = this.unit_price;
  if (this.subtotal === undefined && this.quantity && this.unit_price !== undefined) {
    this.subtotal = this.quantity * this.unit_price;
  }
  if (this.shopId && !this.shop_id) this.shop_id = this.shopId;
  if (this.shop_id && !this.shopId) this.shopId = this.shop_id;
});

const OrderSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', default: null },
  voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher', default: null },
  voucher_code: { type: String, default: null },
  voucherCode: { type: String, default: null },

  total_amount: { type: mongoose.Schema.Types.Decimal128 },
  totalAmount: { type: Number, min: 0 },
  discount_amount: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  discountAmount: { type: Number, default: 0 },
  shipping_fee: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  shippingFee: { type: Number, default: 0 },
  final_amount: { type: mongoose.Schema.Types.Decimal128 },
  finalAmount: { type: Number, min: 0 },

  shipping_address: { type: String, required: true },
  phone: { type: String, required: true },
  receiver_name: { type: String },
  shippingAddress: {
    receiverName: { type: String },
    receiverPhone: { type: String },
    detailAddress: { type: String }
  },

  payment_method: { 
    type: String, 
    enum: ['COD', 'cod', 'BANK_TRANSFER', 'bank_transfer', 'MOMO', 'momo', 'VNPAY', 'vnpay', 'credit_card', 'CREDIT_CARD'], 
    default: 'COD' 
  },
  paymentMethod: { type: String },
  payment_status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'paid', 'failed', 'Pending', 'Paid', 'Failed'], 
    default: 'pending' 
  },
  paymentStatus: { type: String },

  order_status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  orderStatus: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'], 
    default: 'pending' 
  },

  items: [EmbeddedOrderItemSchema],
  note: { type: String, default: '' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, { 
  collection: 'orders',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

// Dual syncing pre-save hook
OrderSchema.pre('validate', function() {
  // Sync user / customer
  if (this.userId && !this.user_id) this.user_id = this.userId;
  if (this.user_id && !this.userId) this.userId = this.user_id;
  if (this.customerId && !this.customer_id) this.customer_id = this.customerId;
  if (this.customer_id && !this.customerId) this.customerId = this.customer_id;
  if (this.shopId && !this.shop_id) this.shop_id = this.shopId;
  if (this.shop_id && !this.shopId) this.shopId = this.shop_id;

  // Sync voucher
  if (this.voucherId && !this.voucher_id) this.voucher_id = this.voucherId;
  if (this.voucher_id && !this.voucherId) this.voucherId = this.voucher_id;
  if (this.voucherCode && !this.voucher_code) this.voucher_code = this.voucherCode;
  if (this.voucher_code && !this.voucherCode) this.voucherCode = this.voucher_code;

  // Sync amounts
  const numTotal = this.totalAmount !== undefined 
    ? Number(this.totalAmount) 
    : (this.total_amount ? parseFloat(this.total_amount.toString()) : 0);
  this.totalAmount = numTotal;
  this.total_amount = mongoose.Types.Decimal128.fromString(numTotal.toString());

  const numDiscount = this.discountAmount !== undefined 
    ? Number(this.discountAmount) 
    : (this.discount_amount ? parseFloat(this.discount_amount.toString()) : 0);
  this.discountAmount = numDiscount;
  this.discount_amount = mongoose.Types.Decimal128.fromString(numDiscount.toString());

  const numShipping = this.shippingFee !== undefined 
    ? Number(this.shippingFee) 
    : (this.shipping_fee ? parseFloat(this.shipping_fee.toString()) : 0);
  this.shippingFee = numShipping;
  this.shipping_fee = mongoose.Types.Decimal128.fromString(numShipping.toString());

  const numFinal = this.finalAmount !== undefined 
    ? Number(this.finalAmount) 
    : (this.final_amount ? parseFloat(this.final_amount.toString()) : Math.max(0, numTotal - numDiscount + numShipping));
  this.finalAmount = numFinal;
  this.final_amount = mongoose.Types.Decimal128.fromString(numFinal.toString());

  // Sync shipping info
  if (this.shippingAddress) {
    if (typeof this.shippingAddress === 'string') {
      this.shipping_address = this.shippingAddress;
    } else {
      const parts = [
        this.shippingAddress.detailAddress,
        this.shippingAddress.ward,
        this.shippingAddress.district,
        this.shippingAddress.province
      ].filter(Boolean);
      if (parts.length > 0 && !this.shipping_address) {
        this.shipping_address = parts.join(', ');
      }
      if (this.shippingAddress.receiverPhone && !this.phone) {
        this.phone = this.shippingAddress.receiverPhone;
      }
      if (this.shippingAddress.receiverName && !this.receiver_name) {
        this.receiver_name = this.shippingAddress.receiverName;
      }
    }
  }

  if (this.shipping_address && (!this.shippingAddress || typeof this.shippingAddress === 'string')) {
    this.shippingAddress = {
      receiverName: this.receiver_name || '',
      receiverPhone: this.phone || '',
      detailAddress: this.shipping_address
    };
  }

  // Sync payment
  if (this.paymentMethod && !this.payment_method) this.payment_method = this.paymentMethod;
  if (this.payment_method && !this.paymentMethod) this.paymentMethod = this.payment_method;
  if (this.paymentStatus && !this.payment_status) this.payment_status = this.paymentStatus.toLowerCase();
  if (this.payment_status && !this.paymentStatus) this.paymentStatus = this.payment_status;

  // Sync order status
  if (this.orderStatus && !this.order_status) this.order_status = this.orderStatus.toLowerCase();
  if (this.order_status && !this.orderStatus) this.orderStatus = this.order_status.toLowerCase();

  this.updated_at = new Date();
});

OrderSchema.index({ customer_id: 1 });
OrderSchema.index({ user_id: 1 });
OrderSchema.index({ shop_id: 1 });
OrderSchema.index({ order_status: 1 });
OrderSchema.index({ created_at: -1 });

module.exports = mongoose.model('Order', OrderSchema);
