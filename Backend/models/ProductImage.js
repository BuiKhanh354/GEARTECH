const mongoose = require('mongoose');

const ProductImageSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: [true, 'Sản phẩm liên kết không được để trống'],
    index: true 
  },
  product_id: { type: mongoose.Schema.Types.Mixed }, // Alias cho SQL schema

  imageUrl: { 
    type: String, 
    required: [true, 'Đường dẫn hình ảnh không được để trống'],
    trim: true 
  },
  image_url: { type: String, trim: true }, // Alias cho SQL schema

  isPrimary: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  is_primary: { type: Boolean }, // Alias cho SQL schema

  sortOrder: { 
    type: Number, 
    default: 0,
    index: true 
  },
  sort_order: { type: Number } // Alias cho SQL schema
}, { 
  timestamps: true 
});

// Middleware tự động đồng bộ alias trước khi lưu
ProductImageSchema.pre('save', function() {
  if (this.imageUrl && !this.image_url) {
    this.image_url = this.imageUrl;
  }
  if (!this.imageUrl && this.image_url) {
    this.imageUrl = this.image_url;
  }

  if (this.isPrimary !== undefined && this.is_primary === undefined) {
    this.is_primary = this.isPrimary;
  }
  if (this.is_primary !== undefined && this.isPrimary === undefined) {
    this.isPrimary = this.is_primary;
  }

  if (this.sortOrder !== undefined && this.sort_order === undefined) {
    this.sort_order = this.sortOrder;
  }
  if (this.sort_order !== undefined && this.sortOrder === undefined) {
    this.sortOrder = this.sort_order;
  }

  if (this.productId && !this.product_id) {
    this.product_id = this.productId;
  }
});

// Chỉ mục hỗ trợ truy vấn sắp xếp ảnh theo sản phẩm
ProductImageSchema.index({ productId: 1, isPrimary: -1, sortOrder: 1, createdAt: 1 });

module.exports = mongoose.model('ProductImage', ProductImageSchema);
