const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  payment_method: { 
    type: String, 
    enum: ['COD', 'cod', 'BANK_TRANSFER', 'bank_transfer', 'MOMO', 'momo', 'VNPAY', 'vnpay', 'credit_card', 'CREDIT_CARD'], 
    required: true 
  },
  paymentMethod: { type: String },
  transaction_code: { type: String, default: null },
  transactionCode: { type: String },
  amount: { type: mongoose.Schema.Types.Decimal128, required: true },
  numericAmount: { type: Number },
  payment_status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'paid', 'failed'], 
    default: 'pending' 
  },
  paymentStatus: { type: String },
  paid_at: { type: Date, default: null },
  paidAt: { type: Date },
  failure_reason: { type: String, default: null },
  failureReason: { type: String },
  // Lưu thông tin an toàn (tuyệt đối không lưu CVV / thẻ đầy đủ)
  payment_details: {
    bank_code: { type: String },
    card_last4: { type: String },
    card_brand: { type: String },
    gateway_reference: { type: String }
  },
  created_at: { type: Date, default: Date.now }
}, {
  collection: 'payments',
  timestamps: false,
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

// Dual syncing pre-validate hook
PaymentSchema.pre('validate', function() {
  if (this.orderId && !this.order_id) this.order_id = this.orderId;
  if (this.order_id && !this.orderId) this.orderId = this.order_id;
  if (this.paymentMethod && !this.payment_method) this.payment_method = this.paymentMethod;
  if (this.payment_method && !this.paymentMethod) this.paymentMethod = this.payment_method;
  if (this.transactionCode && !this.transaction_code) this.transaction_code = this.transactionCode;
  if (this.transaction_code && !this.transactionCode) this.transactionCode = this.transaction_code;
  if (this.paymentStatus && !this.payment_status) this.payment_status = this.paymentStatus.toLowerCase();
  if (this.payment_status && !this.paymentStatus) this.paymentStatus = this.payment_status;
  if (this.paidAt && !this.paid_at) this.paid_at = this.paidAt;
  if (this.paid_at && !this.paidAt) this.paidAt = this.paid_at;
  if (this.failureReason && !this.failure_reason) this.failure_reason = this.failureReason;
  if (this.failure_reason && !this.failureReason) this.failureReason = this.failure_reason;

  const num = this.numericAmount !== undefined 
    ? Number(this.numericAmount)
    : (this.amount ? parseFloat(this.amount.toString()) : 0);
  this.numericAmount = num;
  if (!this.amount && num !== undefined) {
    this.amount = mongoose.Types.Decimal128.fromString(num.toString());
  }
});

PaymentSchema.index({ order_id: 1 });
PaymentSchema.index({ transaction_code: 1 });
PaymentSchema.index({ payment_status: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
