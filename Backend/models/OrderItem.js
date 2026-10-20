const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  product_name: { type: String, required: true },
  sku: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  unit_price: { type: mongoose.Schema.Types.Decimal128, required: true },
  subtotal: { type: mongoose.Schema.Types.Decimal128, required: true },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'order_items',
  timestamps: false,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

// Virtuals & Getters for camelCase compatibility
OrderItemSchema.virtual('orderId').get(function() { return this.order_id; });
OrderItemSchema.virtual('productId').get(function() { return this.product_id; });
OrderItemSchema.virtual('shopId').get(function() { return this.shop_id; });
OrderItemSchema.virtual('productName').get(function() { return this.product_name; });
OrderItemSchema.virtual('unitPrice').get(function() {
  if (!this.unit_price) return 0;
  return typeof this.unit_price === 'object' && this.unit_price.toString
    ? parseFloat(this.unit_price.toString())
    : Number(this.unit_price);
});
OrderItemSchema.virtual('subtotalAmount').get(function() {
  if (!this.subtotal) return 0;
  return typeof this.subtotal === 'object' && this.subtotal.toString
    ? parseFloat(this.subtotal.toString())
    : Number(this.subtotal);
});

// Pre-save alias
OrderItemSchema.pre('validate', function() {
  if (this.orderId && !this.order_id) this.order_id = this.orderId;
  if (this.productId && !this.product_id) this.product_id = this.productId;
  if (this.shopId && !this.shop_id) this.shop_id = this.shopId;
  if (this.productName && !this.product_name) this.product_name = this.productName;
  if (this.unitPrice !== undefined && !this.unit_price) {
    this.unit_price = mongoose.Types.Decimal128.fromString(this.unitPrice.toString());
  }
  if (this.subtotalAmount !== undefined && !this.subtotal) {
    this.subtotal = mongoose.Types.Decimal128.fromString(this.subtotalAmount.toString());
  }
});

OrderItemSchema.index({ order_id: 1 });
OrderItemSchema.index({ product_id: 1 });
OrderItemSchema.index({ shop_id: 1 });

module.exports = mongoose.model('OrderItem', OrderItemSchema);
