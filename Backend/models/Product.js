const mongoose = require('mongoose');

// Hàm tạo slug tiếng Việt
function createSlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Tên sản phẩm không được để trống'], trim: true },
  name: { type: String, trim: true }, // Alias cho title tương thích SQL
  slug: { type: String, trim: true, lowercase: true },
  sku: { type: String, trim: true }, // Mã kho quản lý hàng
  description: { type: String, required: [true, 'Mô tả sản phẩm không được để trống'] },
  price: { 
    type: Number, 
    required: [true, 'Giá bán không được để trống'], 
    min: [0, 'Giá bán phải lớn hơn hoặc bằng 0'] 
  },
  oldPrice: { 
    type: Number, 
    min: [0, 'Giá cũ phải lớn hơn hoặc bằng 0'] 
  },
  discount: { type: String }, // VD: '12%'
  imageEmoji: { type: String, default: '📦' }, // Emoji hiển thị nhanh hoặc link ảnh đại diện
  gallery: [{ type: String }], // Danh sách emoji hoặc URL ảnh thư viện
  category: { 
    type: String, 
    required: [true, 'Danh mục không được để trống'], 
    trim: true,
    lowercase: true
  },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  category_id: { type: mongoose.Schema.Types.Mixed },
  categoryName: { type: String, default: 'Phụ kiện công nghệ' },
  brand: { type: String, trim: true, lowercase: true },
  brandId: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' },
  brand_id: { type: mongoose.Schema.Types.Mixed },
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  salesCount: { type: String, default: 'ĐÃ BÁN 0' },
  stock: { 
    type: Number, 
    required: [true, 'Số lượng tồn kho không được để trống'], 
    default: 10, 
    min: [0, 'Số lượng tồn kho không được âm'] 
  },
  status: {
    type: String,
    enum: ['active', 'hidden', 'out_of_stock', 'inactive'],
    default: 'active'
  },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  shop_id: { type: mongoose.Schema.Types.Mixed }, // Alias cho SQL import
  
  // Thông số kỹ thuật động (Dynamic Technical Specs)
  specs: {
    type: Map,
    of: String
  }
}, { timestamps: true });

// Pre-validate hook
ProductSchema.pre('validate', function() {
  if (this.title && !this.name) {
    this.name = this.title;
  }
  if (!this.title && this.name) {
    this.title = this.name;
  }
  if (this.title && !this.slug) {
    this.slug = createSlug(this.title);
  }
  if (!this.sku) {
    this.sku = 'GT-' + Date.now().toString(36).toUpperCase();
  }
  if (this.stock === 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  }
});

// Đánh chỉ mục tìm kiếm
ProductSchema.index({ title: 'text', description: 'text', name: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ shopId: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ price: 1 });

module.exports = mongoose.model('Product', ProductSchema);
