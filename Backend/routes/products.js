const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const Category = require('../models/Category');
const { auth, checkRole } = require('../middleware/auth');

// Helper: Lấy shopId của user (từ req.user.shopId hoặc tra cứu qua bảng Shop theo ownerId/user_id)
async function getEffectiveShopId(user) {
  if (!user) return null;
  if (user.shopId) return user.shopId.toString();
  const shop = await Shop.findOne({ $or: [{ ownerId: user._id }, { user_id: user._id }] });
  return shop ? shop._id.toString() : null;
}

// ==========================================
// 1. LẤY DANH SÁCH SẢN PHẨM (PUBLIC CHO KHÁCH HÀNG & BỘ LỌC TOÀN DIỆN)
// GET /api/products
// ==========================================
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      category, 
      brand, 
      minPrice, 
      maxPrice, 
      rating, 
      sortBy, 
      shopId, 
      status,
      page = 1, 
      limit = 10 
    } = req.query;

    const query = {};

    // A. Trạng thái bán (Yêu cầu 3.5: Khách hàng chỉ xem được sản phẩm đang bán 'active' hoặc 'out_of_stock')
    if (status && status !== 'all') {
      query.status = status;
    } else if (status === 'all' || req.query.includeInactive === 'true' || req.query.includeInactive === true) {
      // Cho phép lấy tất cả trạng thái (kể cả hidden, inactive) khi yêu cầu cụ thể
    } else {
      // Mặc định công khai: chỉ lấy sản phẩm active hoặc out_of_stock (để hiển thị báo hết hàng)
      query.status = { $in: ['active', 'out_of_stock'] };
    }

    // B. Lọc theo từ khóa tìm kiếm (Search Query)
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ];
    }

    // C. Lọc theo danh mục (Category)
    // Chấp nhận: slug danh mục, ID danh mục (bao gồm cả danh mục con), hoặc tên danh mục cũ (string) trên sản phẩm
    if (category && category !== 'all') {
      let categoryCondition = [{ category: String(category).toLowerCase() }];

      try {
        const catDoc = /^[0-9a-fA-F]{24}$/.test(category)
          ? await Category.findById(category).select('_id')
          : await Category.findOne({
              $or: [
                { slug: String(category).toLowerCase() },
                { name: { $regex: `^${category}$`, $options: 'i' } }
              ]
            }).select('_id');

        if (catDoc) {
          // Gộp cả danh mục con để lọc theo cả cây danh mục cha
          const children = await Category.find({
            $or: [{ parent_id: catDoc._id }, { parent_category_id: catDoc._id }]
          }).select('_id slug name');
          const childIds = children.map(c => c._id);
          const childSlugs = children.map(c => c.slug).filter(Boolean);

          categoryCondition = [
            { categoryId: catDoc._id },
            { category_id: catDoc._id },
            { categoryId: { $in: childIds } },
            { category_id: { $in: childIds } },
            { category: { $in: [String(category).toLowerCase(), ...childSlugs] } },
            { category: String(category).toLowerCase() }
          ];
        }
      } catch (catErr) {
        console.error('Lỗi tra cứu danh mục khi lọc sản phẩm:', catErr.message);
      }

      if (query.$or) {
        query.$and = [...(query.$and || []), { $or: query.$or }, { $or: categoryCondition }];
        delete query.$or;
      } else {
        query.$or = categoryCondition;
      }
    }

    // D. Lọc theo thương hiệu (Brand)
    if (brand && brand !== 'all') {
      const b = brand.trim();
      const brandCondition = [
        { brand: { $regex: new RegExp(`^${b}$`, 'i') } },
        { brand_id: b },
        { title: { $regex: b, $options: 'i' } },
        { name: { $regex: b, $options: 'i' } }
      ];
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: brandCondition }];
        delete query.$or;
      } else {
        query.$or = brandCondition;
      }
    }

    // E. Lọc theo Shop cụ thể
    if (shopId) {
      query.shopId = shopId;
    }

    // F. Lọc theo khoảng giá (Price Range)
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // G. Lọc theo đánh giá tối thiểu (Min Rating)
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // H. Thiết lập sắp xếp (Sorting)
    let sortOptions = {};
    if (sortBy === 'priceAsc') {
      sortOptions.price = 1;
    } else if (sortBy === 'priceDesc') {
      sortOptions.price = -1;
    } else if (sortBy === 'reviews') {
      sortOptions.reviewsCount = -1;
    } else if (sortBy === 'newest') {
      sortOptions.createdAt = -1;
    } else {
      sortOptions.rating = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);

    // Lấy danh sách sản phẩm kèm thông tin Shop
    const [rawProducts, total] = await Promise.all([
      Product.find(query)
        .populate('shopId', 'name status address logo rating total_products')
        .populate('categoryId', 'name slug icon')
        .populate('brandId', 'name slug logo')
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    // Yêu cầu 3.5: Tôn trọng trạng thái duyệt shop - loại bỏ sản phẩm của shop chưa được duyệt nếu là xem công khai
    const visibleProducts = rawProducts.filter(p => {
      if (!p.shopId) return true;
      if (typeof p.shopId === 'object' && p.shopId.status) {
        return p.shopId.status === 'active';
      }
      return true;
    });

    return res.json({
      products: visibleProducts,
      total: visibleProducts.length === rawProducts.length ? total : visibleProducts.length,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });

  } catch (error) {
    console.error('Lỗi lấy danh sách sản phẩm:', error);
    return res.status(500).json({ error: 'Lỗi lấy danh sách sản phẩm.', details: error.message });
  }
});

// ==========================================
// 2. CHỦ SHOP LẤY TOÀN BỘ SẢN PHẨM CỦA GIAN HÀNG MÌNH
// GET /api/products/shop/my-products
// ==========================================
router.get('/shop/my-products', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    let shopId = await getEffectiveShopId(req.user);
    if (!shopId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Tài khoản chưa liên kết gian hàng.' });
    }

    const { search, status, category, brand, page = 1, limit = 100 } = req.query;
    const filter = {};
    if (shopId) filter.shopId = shopId;

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (brand && brand !== 'all') {
      filter.brand = brand.toLowerCase();
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { name: { $regex: search.trim(), $options: 'i' } },
        { sku: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sản phẩm của shop:', error);
    res.status(500).json({ error: 'Không thể tải danh sách sản phẩm shop: ' + error.message });
  }
});

// ==========================================
// 3. LẤY CHI TIẾT SẢN PHẨM BẰNG ID HOẶC SLUG
// GET /api/products/:id
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let product = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id)
        .populate('shopId', 'name status address logo rating total_products phone')
        .populate('categoryId', 'name slug icon')
        .populate('brandId', 'name slug logo');
    }
    if (!product) {
      product = await Product.findOne({ slug: id })
        .populate('shopId', 'name status address logo rating total_products phone')
        .populate('categoryId', 'name slug icon')
        .populate('brandId', 'name slug logo');
    }

    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm công nghệ.' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy chi tiết sản phẩm.', details: error.message });
  }
});

// ==========================================
// 4. ĐĂNG BÁN SẢN PHẨM MỚI (CHỦ SHOP HOẶC ADMIN)
// POST /api/products
// Kiểm tra giá hợp lệ, dữ liệu bắt buộc và quyền sở hữu shop
// ==========================================
router.post('/', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const effectiveShopId = await getEffectiveShopId(req.user);
    const userShopId = effectiveShopId || req.body.shopId;

    if (!userShopId) {
      return res.status(403).json({ error: 'Tài khoản của bạn chưa được liên kết với bất kỳ cửa hàng nào.' });
    }

    // Yêu cầu Prompt 3.2 & 3.5: Chỉ shop được duyệt (active) mới được đăng bán sản phẩm
    const shop = await Shop.findById(userShopId);
    if (!shop) {
      return res.status(404).json({ error: 'Cửa hàng không tồn tại trên hệ thống.' });
    }

    if (shop.status !== 'active') {
      return res.status(403).json({ 
        error: `Cửa hàng đang ở trạng thái "${shop.status}". Chỉ cửa hàng đã được Admin phê duyệt (active) mới được phép đăng bán sản phẩm!`,
        shopStatus: shop.status 
      });
    }

    const { 
      title, 
      name,
      description, 
      price, 
      oldPrice, 
      discount, 
      imageEmoji, 
      gallery, 
      category, 
      categoryName, 
      brand,
      brandId,
      brand_id,
      stock, 
      status,
      specs 
    } = req.body;

    const finalTitle = (title || name || '').trim();
    if (!finalTitle) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tên sản phẩm.' });
    }

    // Kiểm tra tính hợp lệ của giá và tồn kho
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ error: 'Giá bán sản phẩm không hợp lệ (phải >= 0).' });
    }

    if (oldPrice !== undefined && oldPrice !== null && oldPrice !== '') {
      const numOldPrice = Number(oldPrice);
      if (isNaN(numOldPrice) || numOldPrice < 0) {
        return res.status(400).json({ error: 'Giá gốc/cũ của sản phẩm không hợp lệ.' });
      }
    }

    const numStock = stock !== undefined ? Number(stock) : 10;
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({ error: 'Số lượng tồn kho không được là số âm.' });
    }

    const newProduct = new Product({
      title: finalTitle,
      name: finalTitle,
      description: description ? description.trim() : 'Thiết bị công nghệ cao cấp',
      price: numPrice,
      oldPrice: oldPrice ? Number(oldPrice) : undefined,
      discount: discount || undefined,
      imageEmoji: imageEmoji || '📦',
      gallery: Array.isArray(gallery) && gallery.length > 0 ? gallery : [imageEmoji || '📦'],
      category: category ? category.trim().toLowerCase() : 'accessories',
      categoryName: categoryName || 'Phụ kiện công nghệ',
      brand: brand ? brand.trim().toLowerCase() : undefined,
      brandId: brandId || undefined,
      brand_id: brand_id || undefined,
      stock: numStock,
      status: status || (numStock === 0 ? 'out_of_stock' : 'active'),
      specs: specs || {},
      shopId: shop._id
    });

    await newProduct.save();

    // Cập nhật tổng số sản phẩm của shop
    shop.total_products = (shop.total_products || 0) + 1;
    await shop.save();

    return res.status(201).json({ 
      message: 'Sản phẩm đã được đăng bán thành công trên hệ thống GearTech!', 
      product: newProduct 
    });

  } catch (error) {
    console.error('Lỗi đăng bán sản phẩm:', error);
    return res.status(500).json({ error: 'Lỗi hệ thống khi đăng bán sản phẩm.', details: error.message });
  }
});

// ==========================================
// 5. CHỈNH SỬA SẢN PHẨM (CHỈ CHỦ SHOP HOẶC ADMIN)
// PUT /api/products/:id
// Yêu cầu: Không cho chủ shop chỉnh sửa sản phẩm của shop khác
// ==========================================
router.put('/:id', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm cần chỉnh sửa.' });
    }

    // Yêu cầu Prompt 3.5: Không cho chủ shop chỉnh sửa sản phẩm của shop khác!
    const effectiveShopId = await getEffectiveShopId(req.user);
    const isOwner = effectiveShopId && product.shopId.toString() === effectiveShopId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        error: 'Từ chối truy cập: Bạn không có quyền chỉnh sửa sản phẩm thuộc cửa hàng khác!' 
      });
    }

    // Kiểm tra cửa hàng vẫn đang active
    const shop = await Shop.findById(product.shopId);
    if (shop && shop.status !== 'active' && !isAdmin) {
      return res.status(403).json({ error: 'Cửa hàng đang bị khóa hoặc chưa được duyệt, không thể chỉnh sửa sản phẩm.' });
    }

    const { 
      title, 
      name, 
      description, 
      price, 
      oldPrice, 
      discount, 
      imageEmoji, 
      gallery, 
      category, 
      categoryName, 
      brand, 
      brandId, 
      brand_id, 
      stock, 
      status, 
      specs 
    } = req.body;

    if (title || name) {
      product.title = (title || name).trim();
      product.name = (title || name).trim();
    }
    if (description !== undefined) product.description = description;

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({ error: 'Giá bán không hợp lệ (phải >= 0).' });
      }
      product.price = numPrice;
    }

    if (oldPrice !== undefined) {
      if (oldPrice === null || oldPrice === '') {
        product.oldPrice = undefined;
      } else {
        const numOldPrice = Number(oldPrice);
        if (isNaN(numOldPrice) || numOldPrice < 0) {
          return res.status(400).json({ error: 'Giá cũ không hợp lệ.' });
        }
        product.oldPrice = numOldPrice;
      }
    }

    if (discount !== undefined) product.discount = discount;
    if (imageEmoji !== undefined) product.imageEmoji = imageEmoji;
    if (gallery !== undefined) product.gallery = gallery;
    if (category !== undefined) product.category = category.trim().toLowerCase();
    if (categoryName !== undefined) product.categoryName = categoryName;
    if (brand !== undefined) product.brand = brand.trim().toLowerCase();
    if (brandId !== undefined) product.brandId = brandId;
    if (brand_id !== undefined) product.brand_id = brand_id;

    if (stock !== undefined) {
      const numStock = Number(stock);
      if (isNaN(numStock) || numStock < 0) {
        return res.status(400).json({ error: 'Số lượng tồn kho không được âm.' });
      }
      product.stock = numStock;
      if (numStock === 0 && product.status === 'active') {
        product.status = 'out_of_stock';
      }
    }

    if (status !== undefined) {
      if (!['active', 'hidden', 'out_of_stock', 'inactive'].includes(status)) {
        return res.status(400).json({ error: 'Trạng thái sản phẩm không hợp lệ.' });
      }
      product.status = status;
    }

    if (specs !== undefined) product.specs = specs;

    await product.save();

    return res.json({
      message: 'Cập nhật thông tin sản phẩm thành công!',
      product
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi cập nhật sản phẩm.', details: error.message });
  }
});

// ==========================================
// 6. ĐỔI NHANH TRẠNG THÁI SẢN PHẨM (ẨN / HIỆN / HẾT HÀNG)
// PUT /api/products/:id/status
// ==========================================
router.put('/:id/status', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'hidden', 'out_of_stock', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái sản phẩm không hợp lệ.' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    }

    const effectiveShopId = await getEffectiveShopId(req.user);
    const isOwner = effectiveShopId && product.shopId.toString() === effectiveShopId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Bạn chỉ được phép cập nhật trạng thái sản phẩm của shop mình!' });
    }

    product.status = status;
    await product.save();

    res.json({
      message: `Đã chuyển trạng thái sản phẩm sang "${status}".`,
      product
    });
  } catch (error) {
    res.status(500).json({ error: 'Không thể cập nhật trạng thái sản phẩm: ' + error.message });
  }
});

// ==========================================
// 7. XÓA SẢN PHẨM (CHỈ CHỦ SHOP HOẶC ADMIN)
// DELETE /api/products/:id
// Bảo vệ dữ liệu lịch sử đơn hàng: Nếu đã có đơn mua thì chuyển trạng thái 'inactive'
// ==========================================
router.delete('/:id', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    }

    const effectiveShopId = await getEffectiveShopId(req.user);
    const isOwner = effectiveShopId && product.shopId.toString() === effectiveShopId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Bạn chỉ được phép xóa sản phẩm thuộc cửa hàng của chính mình!' });
    }

    // Kiểm tra an toàn dữ liệu lịch sử đơn hàng
    const orderCount = await Order.countDocuments({
      'items.productId': req.params.id
    });

    if (orderCount > 0) {
      // Bảo toàn lịch sử đơn hàng: Soft-delete sang trạng thái inactive
      product.status = 'inactive';
      await product.save();

      if (product.shopId) {
        await Shop.findByIdAndUpdate(product.shopId, { $inc: { total_products: -1 } });
      }

      return res.json({
        message: `Sản phẩm "${product.title}" đã phát sinh ${orderCount} đơn hàng trong quá khứ nên được chuyển sang "Ngừng kinh doanh" (inactive) để bảo toàn dữ liệu lịch sử.`,
        isSoftDeleted: true,
        product
      });
    }

    // Nếu chưa có đơn hàng nào, cho phép xóa cứng an toàn
    await Product.findByIdAndDelete(req.params.id);

    // Cập nhật lại số lượng sản phẩm của shop
    if (product.shopId) {
      await Shop.findByIdAndUpdate(product.shopId, { $inc: { total_products: -1 } });
    }

    return res.json({ 
      message: `Đã xóa sản phẩm "${product.title}" thành công!`,
      isSoftDeleted: false 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi xóa sản phẩm.', details: error.message });
  }
});

// ==========================================
// 8. QUẢN LÝ HÌNH ẢNH SẢN PHẨM (Section 3.6 - product_images)
// ==========================================
router.use('/:productId/images', require('./productImages'));

module.exports = router;
