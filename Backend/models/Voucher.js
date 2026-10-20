const mongoose = require('mongoose');

const VoucherSchema = new mongoose.Schema({
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', default: null },

  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String },
  description: { type: String, required: true },

  discount_type: { 
    type: String, 
    enum: ['fixed', 'percentage']
  },
  discountType: {
    type: String,
    enum: ['fixed', 'percentage'],
    default: 'fixed'
  },

  discount_value: { type: mongoose.Schema.Types.Decimal128 },
  discountValue: { type: Number, required: true, min: 0 },

  min_order_amount: { type: mongoose.Schema.Types.Decimal128 },
  minOrderValue: { type: Number, default: 0, min: 0 },

  max_discount: { type: mongoose.Schema.Types.Decimal128 },
  maxDiscount: { type: Number, default: 0 },

  quantity: { type: Number, default: 100 },
  maxUses: { type: Number, default: 100 },

  used_count: { type: Number, default: 0 },
  usesCount: { type: Number, default: 0 },

  start_date: { type: Date, default: Date.now },
  startDate: { type: Date, default: Date.now },

  end_date: { type: Date },
  expiryDate: { type: Date, required: true },

  status: { 
    type: String, 
    enum: ['active', 'inactive', 'expired'], 
    default: 'active' 
  },
  emoji: { type: String, default: '🎫' }
}, { 
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { getters: true },
  toObject: { getters: true }
});

// Pre-validate hook bridging SQL / Mongo fields synchronously (no next callback in Mongoose 7+)
VoucherSchema.pre('validate', function() {
  if (this.shopId && !this.shop_id) this.shop_id = this.shopId;
  if (this.shop_id && !this.shopId) this.shopId = this.shop_id;

  if (this.name && !this.description) this.description = this.name;
  if (this.description && !this.name) this.name = this.description;

  // Đồng bộ discountType và discount_type
  const dType = this.discountType || this.discount_type || 'fixed';
  this.discountType = dType;
  this.discount_type = dType;

  if (this.discountValue !== undefined && !this.discount_value) {
    this.discount_value = mongoose.Types.Decimal128.fromString(this.discountValue.toString());
  } else if (this.discount_value && this.discountValue === undefined) {
    this.discountValue = parseFloat(this.discount_value.toString());
  }

  if (this.minOrderValue !== undefined && !this.min_order_amount) {
    this.min_order_amount = mongoose.Types.Decimal128.fromString(this.minOrderValue.toString());
  } else if (this.min_order_amount && this.minOrderValue === undefined) {
    this.minOrderValue = parseFloat(this.min_order_amount.toString());
  }

  if (this.maxDiscount !== undefined && !this.max_discount) {
    this.max_discount = mongoose.Types.Decimal128.fromString(this.maxDiscount.toString());
  } else if (this.max_discount && this.maxDiscount === undefined) {
    this.maxDiscount = parseFloat(this.max_discount.toString());
  }

  if (this.maxUses !== undefined && this.quantity === undefined) this.quantity = this.maxUses;
  if (this.quantity !== undefined && this.maxUses === undefined) this.maxUses = this.quantity;

  if (this.usesCount !== undefined && this.used_count === undefined) this.used_count = this.usesCount;
  if (this.used_count !== undefined && this.usesCount === undefined) this.usesCount = this.used_count;

  if (this.expiryDate && !this.end_date) this.end_date = this.expiryDate;
  if (this.end_date && !this.expiryDate) this.expiryDate = this.end_date;

  if (this.startDate && !this.start_date) this.start_date = this.startDate;
  if (this.start_date && !this.startDate) this.startDate = this.start_date;
});

module.exports = mongoose.model('Voucher', VoucherSchema);
