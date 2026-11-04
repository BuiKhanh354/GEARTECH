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
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false }, // Đánh dấu sản phẩm nổi bật của shop
  salesCount: { type: String, default: 'ĐÃ BÁN 0' },
  // Số lượng đã bán thực tế (đếm từ đơn hàng COMPLETED, do backend cập nhật)
  soldCount: { type: Number, default: 0, min: 0 },
  stock: {
    type: Number,
    required: [true, 'Số lượng tồn kho không được để trống'],
    default: 10,
    min: [0, 'Số lượng tồn kho không được âm']
  },
  // =========================================================================
  // C3: PHÂN BIỆT TỒN KHO VẬT LÝ VÀ SỐ LƯỢNG ĐĂNG BÁN
  // - warehouseStock: tồn kho vật lý trong kho (chưa phân bổ đăng bán)
  // - listedQty: tổng số lượng đã phân bổ để đăng bán (thống kê)
  // - stock: số lượng CÓ THỂ BÁN hiện tại (nguồn sự thật khi checkout)
  // Luồng: Nhập kho -> warehouseStock tăng. Đăng bán x (x <= warehouseStock)
  // -> warehouseStock -= x, stock += x, listedQty += x. Bán hàng -> stock giảm.
  // =========================================================================
  warehouseStock: { type: Number, default: null, min: 0 },
  listedQty: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ['active', 'hidden', 'out_of_stock', 'inactive'],
    default: 'active'
  },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  shop_id: { type: mongoose.Schema.Types.Mixed }, // Alias cho SQL import
  
  // Thông số kỹ thuật có cấu trúc (Structured Technical Specifications: Array of { name, value })
  specifications: [{
    name: { type: String, trim: true },
    value: { type: String, trim: true }
  }],

  // Thông số kỹ thuật động (Dynamic Technical Specs - Map/Object for backward compatibility)
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
  // Tương thích dữ liệu cũ: sản phẩm chưa từng dùng phân bổ kho thì toàn bộ stock coi như đã đăng bán
  if (this.warehouseStock === null || this.warehouseStock === undefined) {
    this.warehouseStock = 0;
  }
  if (this.stock > 0 && this.listedQty === 0) {
    this.listedQty = this.stock;
  }
  if (this.stock === 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  }

  // Chuẩn hóa và đồng bộ hai chiều giữa specifications (Array) và specs (Map)
  if (Array.isArray(this.specifications)) {
    // Lọc bỏ các dòng rỗng
    this.specifications = this.specifications.filter(s => s && s.name && s.name.trim() && s.value && s.value.trim());
    if (this.specifications.length > 0) {
      if (!this.specs) this.specs = new Map();
      this.specifications.forEach(s => {
        this.specs.set(s.name.trim(), s.value.trim());
      });
    }
  } else if (this.specs) {
    // Nếu có specs nhưng chưa có specifications
    const list = [];
    if (this.specs instanceof Map) {
      this.specs.forEach((val, key) => {
        if (key && val) list.push({ name: String(key).trim(), value: String(val).trim() });
      });
    } else if (typeof this.specs === 'object') {
      Object.entries(this.specs).forEach(([k, v]) => {
        if (k && v) list.push({ name: String(k).trim(), value: String(v).trim() });
      });
    }
    if (list.length > 0 && (!this.specifications || this.specifications.length === 0)) {
      this.specifications = list;
    }
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
