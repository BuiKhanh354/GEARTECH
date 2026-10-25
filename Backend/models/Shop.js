const mongoose = require('mongoose');

// Cấu hình giao diện mặc định chuẩn GearTech
const defaultStorefrontConfig = {
  template: 'modern-tech', // 'modern-tech' | 'minimal' | 'gaming'
  primaryColor: '#ff4655', // Màu chủ đạo (mặc định đỏ gaming GearTech)
  secondaryColor: '#18181b', // Màu phụ (mặc định nền tối zinc-900)
  textColor: '#ffffff', // Màu chữ nội dung gian hàng (C1)
  bannerUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80',
  logoUrl: '',
  announcement: 'Chào mừng bạn đến với gian hàng chính hãng GearTech! Cam kết 100% hàng mới full box, bảo hành chính hãng.',
  introText: 'Chúng tôi chuyên cung cấp máy tính, linh kiện PC và phụ kiện công nghệ cao cấp với tiêu chuẩn chất lượng hàng đầu.',
  productColumns: 4, // 3 hoặc 4 cột
  productViewMode: 'grid', // 'grid' (lưới) hoặc 'list' (danh sách)
  sections: [
    { id: 'banner', title: 'Banner Đầu Trang', enabled: true, order: 1 },
    { id: 'intro', title: 'Giới Thiệu Gian Hàng', enabled: true, order: 2 },
    { id: 'featured', title: 'Sản Phẩm Nổi Bật', enabled: true, order: 3 },
    { id: 'newest', title: 'Hàng Mới Về', enabled: true, order: 4 },
    { id: 'bestseller', title: 'Bán Chạy Nhất', enabled: true, order: 5 },
    { id: 'catalog', title: 'Toàn Bộ Sản Phẩm', enabled: true, order: 6 }
  ]
};

const ShopSchema = new mongoose.Schema({
  name: { 
    type: String, 
    trim: true,
    default: function() { return this.shop_name || 'CỬA HÀNG CÔNG NGHỆ'; }
  },
  shop_name: { type: String, trim: true },
  description: { type: String, default: '' },
  logo: { type: String, default: '🏬' },
  category: { type: String, default: 'Cửa hàng máy tính & linh kiện công nghệ' },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, trim: true },
  commission_rate: { type: mongoose.Schema.Types.Mixed, default: 5.0 },
  rating: { type: Number, default: 5.0, min: 0, max: 5 },
  followers: { type: String, default: '0' },
  total_products: { type: Number, default: 0 },
  bgClass: { type: String, default: 'from-zinc-900 to-black' },

  // Trạng thái phê duyệt và hoạt động của Shop (Yêu cầu Prompt 3.2)
  // 'pending': Chờ Admin duyệt | 'active': Được duyệt & hoạt động | 'rejected': Bị từ chối | 'locked': Bị khóa
  status: { 
    type: String, 
    enum: ['pending', 'active', 'rejected', 'locked'], 
    default: 'active' 
  },
  rejectReason: { type: String, default: '' }, // Ghi nhận lý do khi Admin từ chối

  // Liên kết chủ sở hữu (Chủ shop)
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: function() { return this.user_id; }
  },
  user_id: { type: mongoose.Schema.Types.Mixed },

  // =========================================================================
  // BỔ SUNG YÊU CẦU REQUIREMENT.MD: TÙY CHỈNH & TRANG TRÍ GIAO DIỆN STOREFRONT
  // =========================================================================
  storefrontDraft: {
    type: mongoose.Schema.Types.Mixed,
    default: () => JSON.parse(JSON.stringify(defaultStorefrontConfig))
  },
  storefrontPublished: {
    type: mongoose.Schema.Types.Mixed,
    default: () => JSON.parse(JSON.stringify(defaultStorefrontConfig))
  },
  publishedAt: { type: Date, default: Date.now }

}, { timestamps: true });

// Tự động đồng bộ name <-> shop_name và ownerId <-> user_id khi lưu
ShopSchema.pre('save', function() {
  if (this.shop_name && !this.name) this.name = this.shop_name;
  if (this.name && !this.shop_name) this.shop_name = this.name;
  if (this.user_id && !this.ownerId) this.ownerId = this.user_id;
  if (this.ownerId && !this.user_id) this.user_id = this.ownerId;

  // Khởi tạo storefront mặc định nếu chưa có
  if (!this.storefrontDraft) {
    this.storefrontDraft = JSON.parse(JSON.stringify(defaultStorefrontConfig));
  }
  if (!this.storefrontPublished) {
    this.storefrontPublished = JSON.parse(JSON.stringify(defaultStorefrontConfig));
  }
});

// Chỉ mục tìm kiếm nhanh
ShopSchema.index({ status: 1 });
ShopSchema.index({ ownerId: 1 });
ShopSchema.index({ name: 1 });

const Shop = mongoose.model('Shop', ShopSchema);
Shop.defaultStorefrontConfig = defaultStorefrontConfig;

module.exports = Shop;
