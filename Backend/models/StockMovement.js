const mongoose = require('mongoose');

const StockMovementSchema = new mongoose.Schema({
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  supplier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  type: { 
    type: String, 
    enum: ['import', 'export', 'sale', 'return', 'adjustment'], 
    required: true 
  },
  quantity: { type: Number, required: true },
  unit_cost: { type: mongoose.Schema.Types.Decimal128, default: 0 },
  unitCost: { type: Number, default: 0 },
  reference: { type: String, default: '' },
  note: { type: String, default: '' },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'stock_movements',
  timestamps: false,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

StockMovementSchema.pre('validate', function() {
  if (this.shopId && !this.shop_id) this.shop_id = this.shopId;
  if (this.shop_id && !this.shopId) this.shopId = this.shop_id;
  if (this.productId && !this.product_id) this.product_id = this.productId;
  if (this.product_id && !this.productId) this.productId = this.product_id;
  if (this.supplierId && !this.supplier_id) this.supplier_id = this.supplierId;
  if (this.supplier_id && !this.supplierId) this.supplierId = this.supplier_id;

  const cost = this.unitCost !== undefined 
    ? Number(this.unitCost)
    : (this.unit_cost ? parseFloat(this.unit_cost.toString()) : 0);
  this.unitCost = cost;
  if (cost !== undefined && !this.unit_cost) {
    this.unit_cost = mongoose.Types.Decimal128.fromString(cost.toString());
  }
});

StockMovementSchema.index({ shop_id: 1, created_at: -1 });
StockMovementSchema.index({ product_id: 1 });
StockMovementSchema.index({ reference: 1 });

module.exports = mongoose.model('StockMovement', StockMovementSchema);
