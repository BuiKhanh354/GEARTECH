const express = require('express');
const router = express.Router();
const Shop = require('../models/Shop');
const User = require('../models/User');
const Product = require('../models/Product');
const Voucher = require('../models/Voucher');
const Order = require('../models/Order');
const ShopFollower = require('../models/ShopFollower');
const { auth, checkRole } = require('../middleware/auth');

// Helper: đếm số người theo dõi thực tế từ collection shop_followers
// (mỗi user chỉ đếm 1 lần cho mỗi shop nhờ unique index user_id + shop_id)
async function getRealFollowersCount(shopId) {
  try {
    return await ShopFollower.countDocuments({
      $or: [{ shop_id: shopId }, { shopId: shopId }]
    });
  } catch {
    return null; // fallback về dữ liệu legacy trên document Shop
  }
}

// ==========================================
// 1. LẤY DANH SÁCH GIAN HÀNG ĐANG HOẠT ĐỘNG (PUBLIC)
// GET /api/shops
// ==========================================
router.get('/', async (req, res) => {
  try {
    const { search, limit = 20, page = 1 } = req.query;
    const query = { status: 'active' };

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { shop_name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ];
    }

    const itemsPerPage = Math.max(1, Number(limit));
    const currentPage = Math.max(1, Number(page));
    const skip = (currentPage - 1) * itemsPerPage;

    const [shops, total] = await Promise.all([
      Shop.find(query)
        .populate('ownerId', 'name email phone avatar')
        .sort({ rating: -1, createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage),
      Shop.countDocuments(query)
    ]);

    // Chuẩn hóa tên trường cho client
    const formattedShops = await Promise.all(shops.map(async (s) => {
      const realFollowers = await getRealFollowersCount(s._id);
      return {
        _id: s._id,
        id: s._id,
        name: s.name || s.shop_name,
        shop_name: s.shop_name || s.name,
        description: s.description,
        logo: s.logo,
        category: s.category,
        phone: s.phone,
        email: s.email,
        address: s.address,
        rating: s.rating,
        // Số người theo dõi thực tế từ dữ liệu follow; fallback về giá trị legacy nếu lỗi
        followers: realFollowers !== null ? String(realFollowers) : s.followers,
        followersCount: realFollowers !== null ? realFollowers : Number(s.followers || 0),
        total_products: s.total_products,
        bgClass: s.bgClass,
        status: s.status,
        ownerId: s.ownerId,
        createdAt: s.createdAt
      };
    }));

    return res.json(formattedShops);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy danh sách đối tác shop.', details: error.message });
  }
});

// ==========================================
// 2. ADMIN LẤY TOÀN BỘ DANH SÁCH SHOP (KÈM LỌC STATUS & TÌM KIẾM)
// GET /api/shops/admin/all
// ==========================================
router.get('/admin/all', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { shop_name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ];
    }

    const currentPage = Math.max(1, Number(page));
    const itemsPerPage = Math.max(1, Number(limit));
    const skip = (currentPage - 1) * itemsPerPage;

    const [shops, total] = await Promise.all([
      Shop.find(query)
        .populate('ownerId', 'name email phone role status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage),
      Shop.countDocuments(query)
    ]);

    return res.json({
      shops,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / itemsPerPage)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi tải danh sách cửa hàng cho Admin.', details: error.message });
  }
});

// ==========================================
// 3. CHỦ SHOP LẤY THÔNG TIN SHOP CỦA CHÍNH MÌNH
// GET /api/shops/my-shop
// ==========================================
router.get('/my-shop', auth, async (req, res) => {
  try {
    let shop = null;

    if (req.user.shopId) {
      shop = await Shop.findById(req.user.shopId);
    }
    if (!shop) {
      shop = await Shop.findOne({ ownerId: req.user._id });
    }

    if (!shop) {
      return res.status(404).json({ error: 'Bạn chưa có cửa hàng nào trên hệ thống.' });
    }

    return res.json({ shop });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi tải thông tin gian hàng của bạn.', details: error.message });
  }
});

// =========================================================================
// SELLER CENTRE: THỐNG KÊ KINH DOANH CỦA SHOP (dữ liệu thật từ MongoDB)
// GET /api/shops/me/analytics?days=1|7|30
// - Doanh thu: tổng finalAmount của đơn COMPLETED trong kỳ (nhất quán với
//   trạng thái hoàn tất và chính sách tính tiền hiện tại)
// - Hàng đợi công việc: đếm đơn theo trạng thái Ở MỌI THỜI GIAN (khối lượng
//   công việc hiện tại), không giới hạn trong kỳ
// =========================================================================
router.get('/me/analytics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'shop' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Từ chối: Chỉ chủ shop hoặc quản trị viên mới được xem thống kê.' });
    }

    let shop = null;
    if (req.user.shopId) {
      shop = await Shop.findById(req.user.shopId);
    }
    if (!shop) {
      shop = await Shop.findOne({ ownerId: req.user._id });
    }
    if (!shop) {
      return res.status(404).json({ error: 'Bạn chưa có cửa hàng nào trên hệ thống.' });
    }

    const shopMatch = { $or: [{ shop_id: shop._id }, { shopId: shop._id }] };

    // ---- Kỳ thống kê (mặc định 7 ngày, cho phép 1 = hôm nay, 30) ----
    const days = [1, 7, 30].includes(Number(req.query.days)) ? Number(req.query.days) : 7;
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    // ---- 1. Đơn hàng trong kỳ ----
    const periodOrders = await Order.find({
      ...shopMatch,
      created_at: { $gte: since }
    }).select('order_status orderStatus final_amount finalAmount items created_at').lean();

    const normStatus = (o) => (o.orderStatus || o.order_status || 'pending').toLowerCase();
    const amount = (o) => Number(o.finalAmount ?? (o.final_amount ? parseFloat(o.final_amount.toString()) : 0)) || 0;

    const completedInPeriod = periodOrders.filter(o => normStatus(o) === 'completed');
    const revenue = completedInPeriod.reduce((sum, o) => sum + amount(o), 0);
    const itemsSold = completedInPeriod.reduce((sum, o) =>
      sum + (o.items || []).reduce((s, it) => s + (Number(it.quantity ?? it.qty ?? 0) || 0), 0), 0);
    const aov = completedInPeriod.length > 0 ? Math.round(revenue / completedInPeriod.length) : 0;

    // ---- 2. Chuỗi dữ liệu theo ngày (doanh thu đơn hoàn tất + số đơn mới) ----
    const seriesMap = new Map();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      seriesMap.set(d.toISOString().slice(0, 10), { date: d.toISOString().slice(0, 10), revenue: 0, orders: 0 });
    }
    for (const o of periodOrders) {
      const key = new Date(o.created_at).toISOString().slice(0, 10);
      const bucket = seriesMap.get(key);
      if (!bucket) continue;
      bucket.orders += 1;
      if (normStatus(o) === 'completed') bucket.revenue += amount(o);
    }
    const series = Array.from(seriesMap.values());

    // ---- 3. Hàng đợi công việc: trạng thái hiện có của TẤT CẢ đơn thuộc shop ----
    const statusAgg = await Order.aggregate([
      { $match: { $and: [shopMatch] } },
      { $group: {
          _id: { $ifNull: ['$orderStatus', '$order_status'] },
          count: { $sum: 1 }
      } }
    ]);
    const statusCounts = { pending: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 };
    for (const row of statusAgg) {
      const k = String(row._id || 'pending').toLowerCase();
      if (statusCounts[k] !== undefined) statusCounts[k] = row.count;
    }

    // ---- 4. Tồn kho cảnh báo + sản phẩm bán chạy (dựa trên soldCount thật) ----
    const products = await Product.find(
      { shopId: shop._id, status: { $in: ['active', 'out_of_stock'] } },
      'title price imageEmoji stock soldCount status'
    ).sort({ soldCount: -1 }).lean();

    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 5);
    const outOfStockProducts = products.filter(p => p.stock === 0 || p.status === 'out_of_stock');

    // ---- 5. Người theo dõi shop (thực tế từ shop_followers) ----
    const ShopFollower = require('../models/ShopFollower');
    const followersCount = await ShopFollower.countDocuments(shopMatch);

    // ---- 6. Voucher của shop sắp hết hạn trong 7 ngày tới ----
    const soon = new Date();
    soon.setDate(soon.getDate() + 7);
    const expiringVouchers = await Voucher.find({
      ...shopMatch,
      status: 'active',
      expiryDate: { $gte: new Date(), $lte: soon }
    }).select('code description expiryDate').lean();

    // ---- 7. Đơn hàng gần đây (che dữ liệu nhạy cảm của khách) ----
    const recentOrders = await Order.find(shopMatch)
      .sort({ created_at: -1 })
      .limit(8)
      .select('created_at order_status orderStatus final_amount finalAmount items')
      .lean();
    const recent = recentOrders.map(o => ({
      _id: o._id,
      createdAt: o.created_at,
      status: normStatus(o),
      total: amount(o),
      itemCount: (o.items || []).length,
      itemNames: (o.items || []).slice(0, 2).map(it => it.title || it.product_name || 'Sản phẩm')
    }));

    return res.json({
      shop: { _id: shop._id, name: shop.name || shop.shop_name, status: shop.status },
      period: { days, since },
      kpis: {
        revenue,
        completedCount: completedInPeriod.length,
        ordersCount: periodOrders.length,
        itemsSold,
        aov,
        followersCount
      },
      statusCounts,
      series,
      topProducts: products.slice(0, 5).map(p => ({
        _id: p._id, title: p.title, price: p.price,
        imageEmoji: p.imageEmoji, soldCount: p.soldCount || 0, stock: p.stock
      })),
      inventoryAlerts: {
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        lowStock: lowStockProducts.slice(0, 5).map(p => ({ _id: p._id, title: p.title, stock: p.stock })),
        outOfStock: outOfStockProducts.slice(0, 5).map(p => ({ _id: p._id, title: p.title }))
      },
      expiringVouchers,
      recentOrders: recent
    });
  } catch (error) {
    console.error('Lỗi thống kê shop:', error);
    return res.status(500).json({ error: 'Lỗi lấy thống kê kinh doanh.', details: error.message });
  }
});

// =========================================================================
// 4A. CHỦ SHOP XEM CẤU HÌNH GIAO DIỆN (NHÁP & XUẤT BẢN) CỦA SHOP MÌNH
// GET /api/shops/me/storefront
// =========================================================================
router.get('/me/storefront', auth, async (req, res) => {
  try {
    const shop = await Shop.findOne({
      $or: [{ ownerId: req.user._id }, { _id: req.user.shopId }]
    });

    if (!shop) {
      return res.status(404).json({ error: 'Bạn không sở hữu gian hàng nào trên hệ thống.' });
    }

    const draft = shop.storefrontDraft || Shop.defaultStorefrontConfig;
    const published = shop.storefrontPublished || Shop.defaultStorefrontConfig;

    return res.json({
      shop: {
        _id: shop._id,
        name: shop.name || shop.shop_name,
        logo: shop.logo,
        description: shop.description,
        status: shop.status
      },
      storefrontDraft: draft,
      storefrontPublished: published,
      publishedAt: shop.publishedAt
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy cấu hình giao diện shop.', details: error.message });
  }
});

// =========================================================================
// 4B. CHỦ SHOP LƯU CẤU HÌNH BẢN NHÁP (DRAFT)
// PUT /api/shops/me/storefront
// =========================================================================
router.put('/me/storefront', auth, async (req, res) => {
  try {
    const shop = await Shop.findOne({
      $or: [{ ownerId: req.user._id }, { _id: req.user.shopId }]
    });

    if (!shop) {
      return res.status(404).json({ error: 'Bạn không sở hữu gian hàng nào để chỉnh sửa giao diện.' });
    }

    if (shop.status === 'locked' || shop.status === 'rejected') {
      return res.status(403).json({ error: 'Gian hàng của bạn hiện đang bị khóa hoặc bị từ chối, không thể chỉnh sửa giao diện!' });
    }

    const { 
      name,
      template, 
      primaryColor, 
      secondaryColor, 
      textColor,
      bannerUrl, 
      logoUrl, 
      announcement, 
      introText, 
      productColumns, 
      productViewMode, 
      sections 
    } = req.body;

    // Validation template
    const allowedTemplates = ['modern-tech', 'minimal', 'gaming'];
    const selectedTemplate = allowedTemplates.includes(template) ? template : 'modern-tech';

    // Validate colors (Hex code regex)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const validPrimary = (primaryColor && hexColorRegex.test(primaryColor)) ? primaryColor : '#ff4655';
    const validSecondary = (secondaryColor && hexColorRegex.test(secondaryColor)) ? secondaryColor : '#18181b';
    const validTextColor = (textColor && hexColorRegex.test(textColor)) ? textColor : '#ffffff';

    // Validate sections array
    let validSections = Shop.defaultStorefrontConfig.sections;
    if (Array.isArray(sections) && sections.length > 0) {
      validSections = sections.map((sec, idx) => ({
        id: String(sec.id || `sec_${idx}`),
        title: String(sec.title || 'Mục sản phẩm').trim().slice(0, 80),
        enabled: Boolean(sec.enabled !== false),
        order: Number(sec.order || idx + 1)
      }));
    }

    const newDraft = {
      template: selectedTemplate,
      primaryColor: validPrimary,
      secondaryColor: validSecondary,
      textColor: validTextColor,
      bannerUrl: bannerUrl ? String(bannerUrl).trim() : (shop.storefrontDraft?.bannerUrl || Shop.defaultStorefrontConfig.bannerUrl),
      logoUrl: logoUrl ? String(logoUrl).trim() : (shop.storefrontDraft?.logoUrl || ''),
      announcement: announcement ? String(announcement).trim().slice(0, 300) : '',
      introText: introText ? String(introText).trim().slice(0, 1000) : (shop.description || ''),
      productColumns: [3, 4].includes(Number(productColumns)) ? Number(productColumns) : 4,
      productViewMode: ['grid', 'list'].includes(productViewMode) ? productViewMode : 'grid',
      sections: validSections
    };

    shop.storefrontDraft = newDraft;

    // Đồng bộ thông tin thương hiệu cơ bản nếu có thay đổi
    if (name && name.trim()) {
      shop.name = name.trim();
      shop.shop_name = name.trim();
    }
    if (logoUrl && logoUrl.trim()) {
      shop.logo = logoUrl.trim();
    }
    if (introText && introText.trim()) {
      shop.description = introText.trim();
    }

    await shop.save();

    return res.json({
      message: 'Đã lưu bản nháp thiết kế gian hàng thành công!',
      storefrontDraft: shop.storefrontDraft
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lưu bản nháp thiết kế gian hàng.', details: error.message });
  }
});

// =========================================================================
// 4C. CHỦ SHOP XUẤT BẢN GIAO DIỆN RA CÔNG KHAI (PUBLISH)
// POST /api/shops/me/storefront/publish
// =========================================================================
router.post('/me/storefront/publish', auth, async (req, res) => {
  try {
    const shop = await Shop.findOne({
      $or: [{ ownerId: req.user._id }, { _id: req.user.shopId }]
    });

    if (!shop) {
      return res.status(404).json({ error: 'Không tìm thấy gian hàng của bạn.' });
    }

    if (shop.status !== 'active') {
      return res.status(403).json({ error: 'Gian hàng cần được Admin phê duyệt (active) mới có thể xuất bản giao diện công khai.' });
    }

    // Sao chép từ bản nháp sang bản công khai
    const draft = shop.storefrontDraft || Shop.defaultStorefrontConfig;
    shop.storefrontPublished = JSON.parse(JSON.stringify(draft));
    shop.publishedAt = new Date();

    if (draft.logoUrl) shop.logo = draft.logoUrl;
    if (draft.introText) shop.description = draft.introText;

    await shop.save();

    return res.json({
      message: 'Xuất bản giao diện gian hàng thành công! Khách hàng đã có thể nhìn thấy giao diện mới nhất.',
      storefrontPublished: shop.storefrontPublished,
      publishedAt: shop.publishedAt
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi xuất bản giao diện gian hàng.', details: error.message });
  }
});

// =========================================================================
// 4D. KHÔI PHỤC THIẾT KẾ MẶC ĐỊNH (RESET)
// POST /api/shops/me/storefront/reset
// =========================================================================
router.post('/me/storefront/reset', auth, async (req, res) => {
  try {
    const shop = await Shop.findOne({
      $or: [{ ownerId: req.user._id }, { _id: req.user.shopId }]
    });

    if (!shop) {
      return res.status(404).json({ error: 'Không tìm thấy gian hàng của bạn.' });
    }

    shop.storefrontDraft = JSON.parse(JSON.stringify(Shop.defaultStorefrontConfig));
    await shop.save();

    return res.json({
      message: 'Đã khôi phục thiết kế bản nháp về mặc định! Hãy bấm "Xuất bản" nếu muốn áp dụng ra ngoài trang công khai.',
      storefrontDraft: shop.storefrontDraft
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi khôi phục giao diện mặc định.', details: error.message });
  }
});

// =========================================================================
// 4D-2. HỦY CÁC THAY ĐỔI CHƯA LƯU (DISCARD DRAFT -> RESTORE FROM PUBLISHED)
// POST /api/shops/me/storefront/discard
// =========================================================================
router.post('/me/storefront/discard', auth, async (req, res) => {
  try {
    const shop = await Shop.findOne({
      $or: [{ ownerId: req.user._id }, { _id: req.user.shopId }]
    });

    if (!shop) {
      return res.status(404).json({ error: 'Không tìm thấy gian hàng của bạn.' });
    }

    const published = shop.storefrontPublished || Shop.defaultStorefrontConfig;
    shop.storefrontDraft = JSON.parse(JSON.stringify(published));
    await shop.save();

    return res.json({
      message: 'Đã hủy các thay đổi chưa lưu, khôi phục lại cấu hình đã xuất bản gần nhất!',
      storefrontDraft: shop.storefrontDraft
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi hủy thay đổi.', details: error.message });
  }
});

// =========================================================================
// 4E. KHÁCH HÀNG XEM STOREFRONT CÔNG KHAI CỦA SHOP
// GET /api/shops/:id/storefront
// =========================================================================
router.get('/:id/storefront', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('ownerId', 'name email phone avatar');
    if (!shop) {
      return res.status(404).json({ error: 'Không tìm thấy gian hàng yêu cầu.' });
    }

    if (shop.status !== 'active') {
      return res.status(400).json({ 
        error: 'Gian hàng này hiện đang tạm ngưng hoạt động hoặc chưa được kích hoạt.',
        status: shop.status 
      });
    }

    // Lấy cấu hình đã xuất bản (hoặc mặc định nếu chưa xuất bản)
    const storefront = shop.storefrontPublished || Shop.defaultStorefrontConfig;

    // Lấy danh sách sản phẩm ĐANG BÁN của shop (Yêu cầu 3.5 & requirement.md)
    const activeProducts = await Product.find({
      shopId: shop._id,
      status: { $in: ['active', 'out_of_stock'] }
    }).sort({ createdAt: -1 });

    // Phân loại danh mục sản phẩm của shop
    const categoriesSet = new Set();
    activeProducts.forEach(p => {
      if (p.category) categoriesSet.add(p.category);
    });

    // Lấy số lượng người theo dõi thực tế từ ShopFollower
    let followersCount = 0;
    try {
      const ShopFollower = require('../models/ShopFollower');
      followersCount = await ShopFollower.countDocuments({
        $or: [{ shop_id: shop._id }, { shopId: shop._id }]
      });
    } catch {
      followersCount = Number(shop.followers || 0);
    }

    // Nhóm sản phẩm theo section phục vụ render động
    const featured = activeProducts.filter(p => p.rating >= 4.5 || (p.oldPrice && p.oldPrice > p.price)).slice(0, 8);
    const newest = activeProducts.slice(0, 8);
    const bestsellers = [...activeProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 8);

    return res.json({
      shop: {
        _id: shop._id,
        name: shop.name || shop.shop_name,
        shop_name: shop.shop_name || shop.name,
        description: shop.description,
        logo: storefront.logoUrl || shop.logo,
        rating: shop.rating,
        phone: shop.phone,
        email: shop.email,
        address: shop.address,
        followersCount: Math.max(followersCount, Number(shop.followers || 0)),
        totalProducts: activeProducts.length,
        createdAt: shop.createdAt
      },
      storefront,
      products: activeProducts,
      allProducts: activeProducts,
      featuredProducts: featured,
      totalProducts: activeProducts.length,
      sectionsData: {
        featured,
        newest,
        bestsellers,
        catalog: activeProducts
      },
      categories: Array.from(categoriesSet)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy giao diện gian hàng công khai.', details: error.message });
  }
});

// ==========================================
// 4. KHÁCH HÀNG XEM TRANG RIÊNG CỦA TỪNG SHOP
// GET /api/shops/:id
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('ownerId', 'name email avatar');
    if (!shop) {
      return res.status(404).json({ error: 'Không tìm thấy gian hàng này.' });
    }

    // Nếu shop không active mà không phải chủ shop/admin xem, từ chối
    if (shop.status !== 'active') {
      return res.status(400).json({ 
        error: 'Gian hàng này hiện đang tạm ngưng hoạt động hoặc đang chờ xét duyệt.',
        status: shop.status 
      });
    }

    // Lấy kèm danh sách sản phẩm đang bán của shop này
    const products = await Product.find({ shopId: shop._id }).limit(50);

    // C2: Số người theo dõi thực tế từ dữ liệu follow (không dùng giá trị mock)
    const realFollowers = await getRealFollowersCount(shop._id);
    if (realFollowers !== null) {
      shop.followers = String(realFollowers);
    }

    return res.json({
      shop,
      products,
      productsCount: products.length,
      followersCount: realFollowers !== null ? realFollowers : Number(shop.followers || 0)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy thông tin gian hàng.', details: error.message });
  }
});

// ==========================================
// 5. GỬI YÊU CẦU MỞ GIAN HÀNG (DÀNH CHO NGƯỜI DÙNG)
// POST /api/shops/apply
// ==========================================
router.post('/apply', auth, async (req, res) => {
  try {
    const { name, shop_name, description, phone, email, address, logo, category, bgClass } = req.body;
    const finalName = (name || shop_name || '').trim();

    if (!finalName) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tên cửa hàng.' });
    }

    // Kiểm tra tên shop đã tồn tại chưa
    const existingName = await Shop.findOne({
      $or: [
        { name: { $regex: `^${finalName}$`, $options: 'i' } },
        { shop_name: { $regex: `^${finalName}$`, $options: 'i' } }
      ]
    });
    if (existingName) {
      return res.status(400).json({ error: 'Tên cửa hàng này đã có người đăng ký. Vui lòng chọn tên khác.' });
    }

    // Kiểm tra người dùng đã có shop chưa
    const existingUserShop = await Shop.findOne({ 
      ownerId: req.user._id,
      status: { $in: ['pending', 'active'] }
    });
    if (existingUserShop) {
      return res.status(400).json({ 
        error: `Bạn đã có cửa hàng "${existingUserShop.name || existingUserShop.shop_name}" đang ở trạng thái ${existingUserShop.status}.` 
      });
    }

    // Tạo shop mới với trạng thái 'pending' chờ Admin duyệt
    const newShop = new Shop({
      name: finalName,
      shop_name: finalName,
      description: description ? description.trim() : 'Gian hàng đối tác GearTech',
      phone: phone ? phone.trim() : req.user.phone,
      email: email ? email.trim().toLowerCase() : req.user.email,
      address: address ? address.trim() : 'Việt Nam',
      logo: logo || '🏬',
      category: category || 'Đối tác phần cứng công nghệ',
      bgClass: bgClass || 'from-zinc-900 to-black',
      status: 'pending', // Chờ duyệt
      ownerId: req.user._id
    });

    await newShop.save();

    // Cập nhật shopId cho user
    const user = await User.findById(req.user._id);
    if (user) {
      user.shopId = newShop._id;
      await user.save();
    }

    return res.status(201).json({
      message: 'Yêu cầu mở gian hàng đã được gửi thành công! Quản trị viên sẽ xét duyệt trong thời gian sớm nhất.',
      shop: newShop
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi gửi yêu cầu mở gian hàng.', details: error.message });
  }
});

// ==========================================
// 6. CHỦ SHOP CẬP NHẬT THÔNG TIN GIAN HÀNG
// PUT /api/shops/:id
// ==========================================
router.put('/:id', auth, async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ error: 'Không tìm thấy gian hàng.' });
    }

    // Yêu cầu Prompt 3.2: Chủ shop chỉ được chỉnh sửa cửa hàng thuộc quyền sở hữu của mình
    const isOwner = shop.ownerId && shop.ownerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền chỉnh sửa cửa hàng này!' });
    }

    const { name, shop_name, description, phone, email, address, logo, category, bgClass } = req.body;

    // Cập nhật thông tin cho phép
    if (name) {
      shop.name = name.trim();
      shop.shop_name = name.trim();
    }
    if (shop_name) {
      shop.name = shop_name.trim();
      shop.shop_name = shop_name.trim();
    }
    if (description !== undefined) shop.description = description;
    if (phone) shop.phone = phone.trim();
    if (email) shop.email = email.trim().toLowerCase();
    if (address) shop.address = address.trim();
    if (logo) shop.logo = logo;
    if (category) shop.category = category;
    if (bgClass) shop.bgClass = bgClass;

    await shop.save();

    return res.json({
      message: 'Cập nhật thông tin gian hàng thành công!',
      shop
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi cập nhật thông tin gian hàng.', details: error.message });
  }
});

// ==========================================
// 7. ADMIN DUYỆT / TỪ CHỐI / KHÓA GIAN HÀNG
// PUT /api/shops/:id/status
// ==========================================
router.put('/:id/status', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { status, rejectReason } = req.body;

    if (!['pending', 'active', 'rejected', 'locked'].includes(status)) {
      return res.status(400).json({ error: "Trạng thái không hợp lệ. Chọn 'active', 'rejected', 'locked' hoặc 'pending'." });
    }

    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ error: 'Không tìm thấy gian hàng cần thao tác.' });
    }

    shop.status = status;
    if (status === 'rejected' && rejectReason) {
      shop.rejectReason = rejectReason.trim();
    }

    await shop.save();

    // Nếu duyệt shop thành công ('active'), tự động nâng quyền chủ sở hữu lên 'shop'
    if (status === 'active' && shop.ownerId) {
      await User.findByIdAndUpdate(shop.ownerId, {
        role: 'shop',
        shopId: shop._id
      });
    }

    // Nếu từ chối hoặc khóa shop, hạ quyền chủ sở hữu nếu cần
    if (status === 'rejected' && shop.ownerId) {
      await User.findByIdAndUpdate(shop.ownerId, {
        role: 'user'
      });
    }

    const actionText = 
      status === 'active' ? 'Duyệt thành công' :
      status === 'rejected' ? 'Từ chối yêu cầu' :
      status === 'locked' ? 'Khóa gian hàng' : 'Cập nhật trạng thái';

    return res.json({
      message: `${actionText} gian hàng thành công!`,
      shop
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi thay đổi trạng thái gian hàng.', details: error.message });
  }
});

module.exports = router;
