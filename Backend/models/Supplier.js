const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
  name: { 
    type: String, 
    required: [true, 'Tên nhà cung cấp không được để trống'], 
    trim: true 
  },
  contact_name: { type: String, default: '', trim: true },
  contactName: { type: String, trim: true },
  phone: { 
    type: String, 
    required: [true, 'Số điện thoại nhà cung cấp không được để trống'], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, 'Email nhà cung cấp không được để trống'], 
    trim: true,
    lowercase: true 
  },
  address: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['active', 'inactive'], 
    default: 'active' 
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
}, {
  collection: 'suppliers',
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: { getters: true, virtuals: true },
  toObject: { getters: true, virtuals: true }
});

SupplierSchema.pre('validate', function() {
  if (this.shopId && !this.shop_id) this.shop_id = this.shopId;
  if (this.shop_id && !this.shopId) this.shopId = this.shop_id;
  if (this.contactName && !this.contact_name) this.contact_name = this.contactName;
  if (this.contact_name && !this.contactName) this.contactName = this.contact_name;
  this.updated_at = new Date();
});

SupplierSchema.index({ shop_id: 1, name: 1 }, { unique: true });
SupplierSchema.index({ email: 1 });

module.exports = mongoose.model('Supplier', SupplierSchema);
