const mongoose = require('mongoose');

// Hàm tạo slug chuẩn tiếng Việt
function generateSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Tên danh mục không được để trống.'], 
    trim: true 
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  // Hỗ trợ danh mục cha/con (phân cấp đa tầng)
  parent_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null 
  },
  parent_category_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Category', 
    default: null 
  },
  description: { 
    type: String, 
    default: '' 
  },
  image: { 
    type: String, 
    default: '' 
  },
  icon: { 
    type: String, 
    default: '💻' 
  },
  // Trạng thái: 'active' (hiển thị), 'hidden' (ẩn), 'inactive' (ngừng hoạt động)
  status: { 
    type: String, 
    enum: ['active', 'hidden', 'inactive'], 
    default: 'active' 
  },
  order: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// Tự động đồng bộ parent_id <-> parent_category_id và sinh slug nếu chưa có
CategorySchema.pre('save', function() {
  if (!this.slug && this.name) {
    this.slug = generateSlug(this.name);
  }
  if (this.parent_id && !this.parent_category_id) {
    this.parent_category_id = this.parent_id;
  }
  if (this.parent_category_id && !this.parent_id) {
    this.parent_id = this.parent_category_id;
  }
});

// Chỉ mục tìm kiếm nhanh
CategorySchema.index({ status: 1 });
CategorySchema.index({ parent_id: 1 });
CategorySchema.index({ name: 1 });

module.exports = mongoose.model('Category', CategorySchema);
