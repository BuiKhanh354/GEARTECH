const mongoose = require('mongoose');

const HomepageBannerItemSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  badge: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  priceTag: { type: String, default: '' },
  ctaText: { type: String, default: 'Khám phá ngay' },
  link: { type: String, default: '/ProductPage' },
  imageUrl: { type: String, default: '' },
  bgGradient: { type: String, default: 'from-zinc-950 via-zinc-900 to-black' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  startDate: { type: Date, default: null },
  endDate: { type: Date, default: null }
}, { _id: true });

const HomepageSectionSchema = new mongoose.Schema({
  sectionKey: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  subtitle: { type: String, default: '', trim: true },
  type: {
    type: String,
    enum: [
      'category_products', // Sản phẩm theo danh mục (PC, Laptop, Mac, Linh kiện...)
      'banner_slider',     // Banner quảng bá đôi / đơn
      'flash_sale',        // Giờ vàng Flash Deals có đếm ngược
      'category_grid',     // Lưới phân khu danh mục biểu tượng
      'featured_shops',    // Gian hàng chính hãng đối tác
      'featured_products', // Bộ sưu tập sản phẩm hàng đầu (Showcase/Tabs)
      'service_features'   // Trụ cột dịch vụ & đặc quyền
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  order: {
    type: Number,
    default: 0
  },
  schedule: {
    isScheduled: { type: Boolean, default: false },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null }
  },
  config: {
    // Cho category_products:
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    categorySlug: { type: String, default: '' },
    categoryName: { type: String, default: '' },
    includeChildren: { type: Boolean, default: true },
    limit: { type: Number, default: 8, min: 1, max: 24 },
    sortBy: {
      type: String,
      enum: ['newest', 'price_asc', 'price_desc', 'sold_desc', 'rating_desc'],
      default: 'newest'
    },
    showOutOfStock: { type: Boolean, default: false },
    showViewAll: { type: Boolean, default: true },
    viewAllLink: { type: String, default: '' },

    // Cho banner_slider:
    banners: [HomepageBannerItemSchema],

    // Cho flash_sale:
    countdownEnd: { type: Date, default: null },
    tagline: { type: String, default: 'CẬP NHẬT GIÁ SỐC MỖI 24 GIỜ' },

    // Cho featured_products:
    manualProductIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
  }
}, { _id: true, timestamps: true });

const HomepageConfigSchema = new mongoose.Schema({
  state: {
    type: String,
    enum: ['published', 'draft'],
    required: true,
    unique: true
  },
  version: {
    type: Number,
    default: 1
  },
  publishedAt: {
    type: Date,
    default: null
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sections: [HomepageSectionSchema]
}, { timestamps: true });

module.exports = mongoose.model('HomepageConfig', HomepageConfigSchema);
