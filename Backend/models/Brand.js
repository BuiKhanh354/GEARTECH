const mongoose = require('mongoose');

// Hàm tạo slug chuẩn tiếng Việt
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

const BrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên thương hiệu không được để trống'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  logo: {
    type: String,
    default: '🏷️'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  website: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'hidden', 'inactive'],
    default: 'active'
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Tự động tạo slug nếu chưa được cung cấp
BrandSchema.pre('validate', function() {
  if (this.name && !this.slug) {
    this.slug = createSlug(this.name);
  }
});

// Đánh chỉ mục tối ưu truy vấn
BrandSchema.index({ status: 1 });
BrandSchema.index({ slug: 1 });
BrandSchema.index({ name: 1 });

module.exports = mongoose.model('Brand', BrandSchema);
