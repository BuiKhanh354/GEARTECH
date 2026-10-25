const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const HomepageConfig = require('../models/HomepageConfig');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { auth, checkRole } = require('../middleware/auth');

// Helper: Sinh danh sách khu vực mặc định chuẩn phong cách GearTech
async function getDefaultSections() {
  // Tìm danh mục PC & Laptop thực tế trong database
  const [desktopsCat, laptopsCat, componentsCat] = await Promise.all([
    Category.findOne({ $or: [{ slug: 'desktops' }, { name: /PC/i }] }),
    Category.findOne({ $or: [{ slug: 'laptops' }, { name: /LAPTOP/i }] }),
    Category.findOne({ $or: [{ slug: 'components' }, { name: /LINH KIỆN/i }] })
  ]);

  return [
    {
      sectionKey: 'sec_service_features',
      title: 'Trụ cột dịch vụ & Đặc quyền GearTech',
      subtitle: 'Build PC trả góp 0%, bảo hành 1 đổi 1 trong 30 ngày, giao hỏa tốc 2H',
      type: 'service_features',
      status: 'active',
      order: 0,
      schedule: { isScheduled: false, startDate: null, endDate: null },
      config: {}
    },
    {
      sectionKey: 'sec_battle_station_banners',
      title: 'Bộ sưu tập chiến hạm 2026',
      subtitle: 'Trang bị cấu hình GeForce RTX 4090 & AI Workstation độc bản',
      type: 'banner_slider',
      status: 'active',
      order: 1,
      schedule: { isScheduled: false, startDate: null, endDate: null },
      config: {
        banners: [
          {
            title: 'CHIẾN HẠM PC GAMING ĐỈNH CAO THI ĐẤU ESPORTS',
            badge: 'ROG // TITAN SERIES 2026',
            subtitle: 'FPS 240+ RAY TRACING',
            description: 'Trang bị cấu hình GeForce RTX 4090, Intel Core Ultra 9 và bo mạch chủ ROG Strix tối tân nhất.',
            priceTag: 'Giá từ 28.990.000₫',
            ctaText: 'Khám phá ngay',
            link: '/ProductPage?category=desktops',
            bgGradient: 'from-zinc-950 via-zinc-900 to-black',
            status: 'active'
          },
          {
            title: 'HỆ THỐNG ĐỒ HỌA CHUYÊN NGHIỆP & TẢN NƯỚC ĐỘC BẢN',
            badge: 'AI WORKSTATION & CUSTOM WATERCOOL',
            subtitle: 'RENDER 8K // TRAINING AI',
            description: 'Hỗ trợ Dual GPU, tản nhiệt nước ống đồng mạ niken tối ưu nhiệt độ hoạt động 24/7 không giới hạn.',
            priceTag: 'Tùy biến theo yêu cầu',
            ctaText: 'Nhận tư vấn',
            link: '/ProductPage?category=components',
            bgGradient: 'from-zinc-950 via-zinc-900 to-[#071324]',
            status: 'active'
          }
        ]
      }
    },
    {
      sectionKey: 'sec_category_grid',
      title: 'Danh mục thiết bị công nghệ chuyên sâu',
      subtitle: '10 Phân khu thi đấu & trải nghiệm công nghệ cao cấp',
      type: 'category_grid',
      status: 'active',
      order: 2,
      schedule: { isScheduled: false, startDate: null, endDate: null },
      config: { limit: 10 }
    },
    {
      sectionKey: 'sec_flash_sale',
      title: 'Giờ vàng chiến đấu // Flash Deals',
      subtitle: 'Cập nhật giá sốc mỗi 24 giờ với ưu đãi độc quyền',
      type: 'flash_sale',
      status: 'active',
      order: 3,
      schedule: { isScheduled: false, startDate: null, endDate: null },
      config: {
        tagline: 'CẬP NHẬT GIÁ SỐC MỖI 24 GIỜ',
        countdownEnd: new Date(Date.now() + 86400000),
        limit: 5
      }
    },
    {
      sectionKey: 'sec_pc_gaming',
      title: 'PC Gaming & Workstation Chiến Hạm',
      subtitle: 'Cấu hình thi đấu tối tân, tản nhiệt hiệu năng cao sẵn sàng cho mọi tựa game AAA',
      type: 'category_products',
      status: 'active',
      order: 4,
      schedule: { isScheduled: false, startDate: null, endDate: null },
      config: {
        categoryId: desktopsCat ? desktopsCat._id : null,
        categorySlug: desktopsCat ? desktopsCat.slug : 'desktops',
        categoryName: desktopsCat ? desktopsCat.name : 'PC & WORKSTATION',
        includeChildren: true,
        limit: 8,
        sortBy: 'newest',
        showOutOfStock: false,
        showViewAll: true,
        viewAllLink: '/ProductPage?category=desktops'
      }
    },
    {
      sectionKey: 'sec_laptops_flagship',
      title: 'Laptop Gaming & MacBook Đồ Họa',
      subtitle: 'Sức mạnh đồ họa di động, màn hình tần số quét cao cho game thủ & creator',
      type: 'category_products',
      status: 'active',
      order: 5,
      schedule: { isScheduled: false, startDate: null, endDate: null },
      config: {
        categoryId: laptopsCat ? laptopsCat._id : null,
        categorySlug: laptopsCat ? laptopsCat.slug : 'laptops',
        categoryName: laptopsCat ? laptopsCat.name : 'LAPTOP & MACBOOK',
        includeChildren: true,
        limit: 8,
        sortBy: 'newest',
        showOutOfStock: false,
        showViewAll: true,
        viewAllLink: '/ProductPage?category=laptops'
      }
    },
    {
      sectionKey: 'sec_featured_products',
      title: 'Bộ sưu tập thiết bị hàng đầu // Flagship Series',
      subtitle: 'Tuyển tập linh kiện, màn hình và phụ kiện Esports đạt chứng chỉ thi đấu',
      type: 'featured_products',
      status: 'active',
      order: 6,
      schedule: { isScheduled: false, startDate: null, endDate: null },
      config: { limit: 8 }
    },
    {
      sectionKey: 'sec_featured_shops',
      title: 'Đối tác công nghệ liên minh',
      subtitle: '100% gian hàng chính hãng được ủy quyền trên GearTech',
      type: 'featured_shops',
      status: 'active',
      order: 7,
      schedule: { isScheduled: false, startDate: null, endDate: null },
      config: { limit: 4 }
    }
  ];
}

// Helper: Kiểm tra một section có nằm trong khung giờ hiệu lực hay không
function isSectionInSchedule(section, now = new Date()) {
  if (section.status !== 'active') return false;
  if (!section.schedule || !section.schedule.isScheduled) return true;

  const { startDate, endDate } = section.schedule;
  if (startDate && new Date(startDate) > now) return false;
  if (endDate && new Date(endDate) < now) return false;

  return true;
}

// Helper: Truy vấn sản phẩm theo danh mục và điều kiện cấu hình
async function populateCategoryProducts(section) {
  const {
    categoryId,
    categorySlug,
    includeChildren = true,
    limit = 8,
    sortBy = 'newest',
    showOutOfStock = false
  } = section.config || {};

  const query = {};

  // Điều kiện trạng thái bán hàng hợp lệ
  if (showOutOfStock) {
    query.status = { $in: ['active', 'out_of_stock'] };
  } else {
    query.status = 'active';
  }

  // Tra cứu cây danh mục
  let targetCat = null;
  if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
    targetCat = await Category.findById(categoryId);
  } else if (categorySlug) {
    targetCat = await Category.findOne({
      $or: [{ slug: String(categorySlug).toLowerCase() }, { name: new RegExp(`^${categorySlug}$`, 'i') }]
    });
  }

  if (targetCat) {
    let catIds = [targetCat._id];
    let catSlugs = [targetCat.slug];

    if (includeChildren) {
      const childDocs = await Category.find({
        $or: [{ parent_id: targetCat._id }, { parent_category_id: targetCat._id }]
      }).select('_id slug');
      catIds = catIds.concat(childDocs.map(c => c._id));
      catSlugs = catSlugs.concat(childDocs.map(c => c.slug).filter(Boolean));
    }

    const catNames = [targetCat.name, ...(targetCat.slug ? [targetCat.slug] : [])];
    query.$or = [
      { categoryId: { $in: catIds } },
      { category_id: { $in: catIds } },
      { category: { $in: catSlugs.map(s => String(s).toLowerCase()) } },
      { category: { $in: catNames } },
      { categoryName: { $in: catNames } }
    ];
  } else if (categorySlug) {
    query.$or = [
      { category: String(categorySlug).toLowerCase() },
      { categoryName: new RegExp(`^${categorySlug}$`, 'i') }
    ];
  }

  // Tiêu chí sắp xếp
  let sortOption = { createdAt: -1 };
  if (sortBy === 'price_asc') sortOption = { price: 1 };
  else if (sortBy === 'price_desc') sortOption = { price: -1 };
  else if (sortBy === 'sold_desc') sortOption = { soldCount: -1 };
  else if (sortBy === 'rating_desc') sortOption = { rating: -1 };

  const parsedLimit = Math.min(Math.max(Number(limit) || 8, 1), 24);

  const products = await Product.find(query)
    .sort(sortOption)
    .limit(parsedLimit)
    .lean();

  return {
    ...section.toObject ? section.toObject() : section,
    populatedData: {
      products,
      totalCount: products.length,
      categoryInfo: targetCat ? {
        _id: targetCat._id,
        name: targetCat.name,
        slug: targetCat.slug
      } : null
    }
  };
}

// Helper: Điền dữ liệu cho tất cả các loại khu vực
async function populateSectionData(section, isPreview = false) {
  const plainSection = section.toObject ? section.toObject() : section;

  try {
    switch (plainSection.type) {
      case 'category_products':
        return await populateCategoryProducts(plainSection);

      case 'banner_slider': {
        const now = new Date();
        const rawBanners = plainSection.config?.banners || [];
        const activeBanners = isPreview
          ? rawBanners
          : rawBanners.filter(b => {
              if (b.status === 'inactive') return false;
              if (b.startDate && new Date(b.startDate) > now) return false;
              if (b.endDate && new Date(b.endDate) < now) return false;
              return true;
            });
        return {
          ...plainSection,
          populatedData: { banners: activeBanners }
        };
      }

      case 'flash_sale': {
        const limit = Math.min(Number(plainSection.config?.limit) || 5, 10);
        // Ưu tiên sản phẩm có discount hoặc giá tốt
        const products = await Product.find({ status: 'active' })
          .sort({ soldCount: -1, rating: -1, createdAt: -1 })
          .limit(limit)
          .lean();
        return {
          ...plainSection,
          populatedData: {
            products,
            countdownEnd: plainSection.config?.countdownEnd || new Date(Date.now() + 86400000)
          }
        };
      }

      case 'category_grid': {
        const limit = Math.min(Number(plainSection.config?.limit) || 10, 20);
        const categories = await Category.find({})
          .sort({ createdAt: 1 })
          .limit(limit)
          .lean();
        return {
          ...plainSection,
          populatedData: { categories }
        };
      }

      case 'featured_shops': {
        const limit = Math.min(Number(plainSection.config?.limit) || 4, 12);
        const shops = await Shop.find({ status: { $in: ['active', 'approved'] } })
          .sort({ rating: -1, followers: -1 })
          .limit(limit)
          .lean();
        return {
          ...plainSection,
          populatedData: { shops }
        };
      }

      case 'featured_products': {
        const limit = Math.min(Number(plainSection.config?.limit) || 8, 20);
        const products = await Product.find({ status: 'active' })
          .sort({ rating: -1, soldCount: -1 })
          .limit(limit)
          .lean();
        return {
          ...plainSection,
          populatedData: { products }
        };
      }

      default:
        return {
          ...plainSection,
          populatedData: {}
        };
    }
  } catch (err) {
    console.error(`Lỗi populate section [${plainSection.sectionKey}]:`, err.message);
    return {
      ...plainSection,
      populatedData: { error: err.message, products: [] }
    };
  }
}

// =========================================================================
// 1. PUBLIC ENDPOINT: GET /api/homepage
// Trang chủ khách hàng: chỉ lấy cấu hình đã xuất bản (published)
// Lọc các khu vực active và còn trong khung giờ schedule hợp lệ
// =========================================================================
router.get('/', async (req, res) => {
  try {
    let publishedConfig = await HomepageConfig.findOne({ state: 'published' });

    // Nếu chưa từng có cấu hình xuất bản nào, tự động khởi tạo mặc định
    if (!publishedConfig) {
      const defaultSections = await getDefaultSections();
      publishedConfig = await HomepageConfig.create({
        state: 'published',
        version: 1,
        publishedAt: new Date(),
        sections: defaultSections
      });

      // Tạo đồng thời bản nháp tương ứng
      await HomepageConfig.findOneAndUpdate(
        { state: 'draft' },
        {
          state: 'draft',
          version: 1,
          sections: defaultSections
        },
        { upsert: true, new: true }
      );
    }

    const now = new Date();
    // Lọc các khu vực hợp lệ: status active + trong khung giờ hiển thị
    const validSections = (publishedConfig.sections || [])
      .filter(sec => isSectionInSchedule(sec, now))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    // Điền dữ liệu thực tế từ database cho từng khu vực
    const populatedSections = await Promise.all(
      validSections.map(sec => populateSectionData(sec, false))
    );

    res.json({
      success: true,
      state: 'published',
      version: publishedConfig.version,
      publishedAt: publishedConfig.publishedAt,
      sections: populatedSections
    });
  } catch (error) {
    console.error('Lỗi nạp cấu hình trang chủ:', error);
    res.status(500).json({ error: 'Lỗi tải cấu hình trang chủ.', details: error.message });
  }
});

// =========================================================================
// 2. ADMIN ENDPOINT: GET /api/homepage/admin/config
// Lấy toàn bộ cấu hình Bản nháp (draft) & Xuất bản (published) để chỉnh sửa
// =========================================================================
router.get('/admin/config', auth, checkRole(['admin']), async (req, res) => {
  try {
    let [draftConfig, publishedConfig, categories] = await Promise.all([
      HomepageConfig.findOne({ state: 'draft' }),
      HomepageConfig.findOne({ state: 'published' }),
      Category.find({}).sort({ name: 1 }).lean()
    ]);

    // Nếu chưa có bản nháp, tạo từ mặc định hoặc từ published
    if (!draftConfig) {
      const defaultSections = publishedConfig ? publishedConfig.sections : await getDefaultSections();
      draftConfig = await HomepageConfig.create({
        state: 'draft',
        version: publishedConfig ? publishedConfig.version : 1,
        sections: defaultSections
      });
    }

    res.json({
      success: true,
      draft: draftConfig,
      published: publishedConfig,
      categories: categories.map(c => ({
        _id: c._id,
        name: c.name,
        slug: c.slug,
        parent_id: c.parent_id || c.parent_category_id || null,
        description: c.description || ''
      }))
    });
  } catch (error) {
    console.error('Lỗi tải cấu hình Admin Homepage:', error);
    res.status(500).json({ error: 'Lỗi nạp cấu hình quản trị trang chủ.', details: error.message });
  }
});

// =========================================================================
// 3. ADMIN ENDPOINT: PUT /api/homepage/admin/draft
// Lưu bản nháp (Save Draft) - Không ảnh hưởng trang chủ khách hàng
// =========================================================================
router.put('/admin/draft', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { sections } = req.body;

    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'Dữ liệu sections phải là một mảng danh sách khu vực.' });
    }

    // Xác thực và chuẩn hóa từng section
    const sanitizedSections = sections.map((sec, idx) => {
      // Kiểm tra thời gian schedule nếu có
      if (sec.schedule && sec.schedule.isScheduled) {
        if (sec.schedule.startDate && sec.schedule.endDate) {
          const start = new Date(sec.schedule.startDate);
          const end = new Date(sec.schedule.endDate);
          if (end <= start) {
            throw new Error(`Khu vực "${sec.title || idx + 1}": Thời điểm kết thúc phải sau thời điểm bắt đầu.`);
          }
        }
      }

      return {
        ...sec,
        sectionKey: sec.sectionKey || `sec_${Date.now()}_${idx}`,
        order: typeof sec.order === 'number' ? sec.order : idx,
        status: sec.status === 'inactive' ? 'inactive' : 'active'
      };
    });

    const updatedDraft = await HomepageConfig.findOneAndUpdate(
      { state: 'draft' },
      {
        state: 'draft',
        updatedBy: req.user._id,
        sections: sanitizedSections
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Đã lưu bản nháp bố cục trang chủ thành công!',
      draft: updatedDraft
    });
  } catch (error) {
    console.error('Lỗi lưu bản nháp trang chủ:', error);
    res.status(400).json({ error: error.message || 'Lỗi lưu bản nháp.' });
  }
});

// =========================================================================
// 4. ADMIN ENDPOINT: POST /api/homepage/admin/publish
// Xuất bản (Publish) - Sao chép bản nháp sang published
// =========================================================================
router.post('/admin/publish', auth, checkRole(['admin']), async (req, res) => {
  try {
    const draftConfig = await HomepageConfig.findOne({ state: 'draft' });
    if (!draftConfig || !draftConfig.sections || draftConfig.sections.length === 0) {
      return res.status(400).json({ error: 'Bản nháp rỗng hoặc chưa được tạo, không thể xuất bản.' });
    }

    // Kiểm tra tính hợp lệ trước khi xuất bản
    for (const sec of draftConfig.sections) {
      if (sec.schedule && sec.schedule.isScheduled) {
        if (sec.schedule.startDate && sec.schedule.endDate) {
          if (new Date(sec.schedule.endDate) <= new Date(sec.schedule.startDate)) {
            return res.status(400).json({
              error: `Khu vực "${sec.title}": Thời gian kết thúc phải sau thời gian bắt đầu.`
            });
          }
        }
      }
    }

    const currentPublished = await HomepageConfig.findOne({ state: 'published' });
    const nextVersion = (currentPublished?.version || 0) + 1;

    const published = await HomepageConfig.findOneAndUpdate(
      { state: 'published' },
      {
        state: 'published',
        version: nextVersion,
        publishedAt: new Date(),
        publishedBy: req.user._id,
        updatedBy: req.user._id,
        sections: draftConfig.sections
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: `Đã xuất bản trang chủ phiên bản v${nextVersion} thành công! Khách hàng sẽ thấy giao diện mới ngay lập tức.`,
      published
    });
  } catch (error) {
    console.error('Lỗi xuất bản trang chủ:', error);
    res.status(500).json({ error: 'Lỗi xuất bản trang chủ.', details: error.message });
  }
});

// =========================================================================
// 5. ADMIN ENDPOINT: POST /api/homepage/admin/restore-default
// Khôi phục bản nháp về bố cục chuẩn mặc định
// =========================================================================
router.post('/admin/restore-default', auth, checkRole(['admin']), async (req, res) => {
  try {
    const defaultSections = await getDefaultSections();

    const draft = await HomepageConfig.findOneAndUpdate(
      { state: 'draft' },
      {
        state: 'draft',
        updatedBy: req.user._id,
        sections: defaultSections
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'Đã khôi phục bản nháp về cấu hình mặc định ban đầu. Bạn có thể chỉnh sửa thêm và bấm Xuất bản khi sẵn sàng.',
      draft
    });
  } catch (error) {
    console.error('Lỗi khôi phục cấu hình mặc định:', error);
    res.status(500).json({ error: 'Lỗi khôi phục cấu hình mặc định.', details: error.message });
  }
});

// =========================================================================
// 6. ADMIN ENDPOINT: GET /api/homepage/admin/preview
// Xem trước bản nháp với dữ liệu sản phẩm THẬT được điền đầy đủ
// =========================================================================
router.get('/admin/preview', auth, checkRole(['admin']), async (req, res) => {
  try {
    let draftConfig = await HomepageConfig.findOne({ state: 'draft' });
    if (!draftConfig) {
      const defaultSections = await getDefaultSections();
      draftConfig = await HomepageConfig.create({
        state: 'draft',
        sections: defaultSections
      });
    }

    const now = new Date();
    // Gán cờ trạng thái preview (đang hoạt động / lên lịch tương lai / đã hết hạn / bị tắt)
    const populatedSections = await Promise.all(
      (draftConfig.sections || []).map(async (sec) => {
        const populated = await populateSectionData(sec, true);

        let previewBadge = 'active';
        if (sec.status === 'inactive') {
          previewBadge = 'inactive';
        } else if (sec.schedule?.isScheduled) {
          if (sec.schedule.startDate && new Date(sec.schedule.startDate) > now) {
            previewBadge = 'scheduled';
          } else if (sec.schedule.endDate && new Date(sec.schedule.endDate) < now) {
            previewBadge = 'expired';
          }
        }

        return {
          ...populated,
          _previewBadge: previewBadge
        };
      })
    );

    res.json({
      success: true,
      state: 'draft_preview',
      sections: populatedSections
    });
  } catch (error) {
    console.error('Lỗi nạp xem trước bản nháp:', error);
    res.status(500).json({ error: 'Lỗi nạp dữ liệu xem trước.', details: error.message });
  }
});

module.exports = router;
