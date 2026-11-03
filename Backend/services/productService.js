const Product = require('../models/Product');
const Shop = require('../models/Shop');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Brand = require('../models/Brand');

// Helper: Lấy shopId của user (từ req.user.shopId hoặc tra cứu qua bảng Shop theo ownerId/user_id)
async function getEffectiveShopId(user) {
  if (!user) return null;
  if (user.shopId) return user.shopId.toString();
  const shop = await Shop.findOne({ $or: [{ ownerId: user._id }, { user_id: user._id }] });
  return shop ? shop._id.toString() : null;
}

// Helper chuẩn hóa dữ liệu thông số kỹ thuật (specifications array & specs map)
function normalizeSpecificationsInput(specsInput, specificationsInput) {
  let list = [];
  if (Array.isArray(specificationsInput)) {
    list = specificationsInput;
  } else if (typeof specificationsInput === 'string') {
    try {
      const parsed = JSON.parse(specificationsInput);
      if (Array.isArray(parsed)) list = parsed;
    } catch {}
  } else if (specificationsInput && typeof specificationsInput === 'object') {
    list = Object.entries(specificationsInput).map(([name, value]) => ({ name, value }));
  }

  // Nếu không có specificationsInput nhưng có specs
  if (list.length === 0 && specsInput) {
    if (typeof specsInput === 'string') {
      try {
        const parsed = JSON.parse(specsInput);
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          list = Object.entries(parsed).map(([name, value]) => ({ name, value }));
        } else if (Array.isArray(parsed)) {
          list = parsed;
        }
      } catch {}
    } else if (typeof specsInput === 'object') {
      list = Object.entries(specsInput).map(([name, value]) => ({ name, value }));
    }
  }

  // Lọc và làm sạch các hàng
  return list
    .filter(item => item && typeof item === 'object' && item.name && String(item.name).trim() && item.value && String(item.value).trim())
    .map(item => ({
      name: String(item.name).trim(),
      value: String(item.value).trim()
    }));
}

const productService = {
  getEffectiveShopId,
  normalizeSpecificationsInput,

  // 1. Danh sách sản phẩm với bộ lọc công khai
  async getProducts(queryParams) {
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
      sale,
      includeInactive,
      page = 1, 
      limit = 10 
    } = queryParams;

    const andConditions = [];

    // A. Trạng thái bán
    if (status && status !== 'all') {
      andConditions.push({ status: status });
    } else if (status === 'all' || includeInactive === 'true' || includeInactive === true) {
      // Cho phép lấy tất cả trạng thái
    } else {
      andConditions.push({ status: { $in: ['active', 'out_of_stock'] } });
    }

    // B. Lọc theo từ khóa tìm kiếm
    if (search && search.trim()) {
      const q = search.trim();
      andConditions.push({
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } }
        ]
      });
    }

    // C. Lọc theo danh mục
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

      andConditions.push({ $or: categoryCondition });
    }

    // D. Lọc theo thương hiệu
    if (brand && brand !== 'all') {
      try {
        const b = brand.trim();
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(b);
        let brandDoc = isObjectId
          ? await Brand.findById(b).select('_id name slug')
          : await Brand.findOne({
              $or: [
                { slug: b.toLowerCase() },
                { name: { $regex: `^${b}$`, $options: 'i' } }
              ]
            }).select('_id name slug');

        const brandName = brandDoc ? brandDoc.name : b;
        const brandSlug = brandDoc ? brandDoc.slug : b.toLowerCase();

        const brandCondition = [
          { brand: { $regex: new RegExp(brandName, 'i') } },
          { brand: { $regex: new RegExp(brandSlug, 'i') } },
          { title: { $regex: new RegExp(brandName, 'i') } },
          { title: { $regex: new RegExp(brandSlug, 'i') } },
          { name: { $regex: new RegExp(brandName, 'i') } },
          { name: { $regex: new RegExp(brandSlug, 'i') } }
        ];

        if (brandDoc) {
          brandCondition.push({ brandId: brandDoc._id });
          brandCondition.push({ brand_id: brandDoc._id });
        }
        if (isObjectId) {
          brandCondition.push({ brandId: b });
          brandCondition.push({ brand_id: b });
        }

        andConditions.push({ $or: brandCondition });
      } catch (brandErr) {
        console.error('Lỗi tra cứu thương hiệu khi lọc sản phẩm:', brandErr.message);
      }
    }

    // E. Lọc theo Shop
    if (shopId) {
      andConditions.push({ shopId: shopId });
    } else if (includeInactive !== 'true' && includeInactive !== true) {
      const activeShops = await Shop.find({ status: 'active' }).select('_id');
      const activeShopIds = activeShops.map(s => s._id);
      andConditions.push({
        $or: [
          { shopId: { $in: activeShopIds } },
          { shopId: null },
          { shopId: { $exists: false } }
        ]
      });
    }

    // F. Lọc theo giá
    if (minPrice || maxPrice) {
      const priceCondition = {};
      if (minPrice) priceCondition.$gte = Number(minPrice);
      if (maxPrice) priceCondition.$lte = Number(maxPrice);
      andConditions.push({ price: priceCondition });
    }

    // G. Lọc theo rating
    if (rating) {
      andConditions.push({ rating: { $gte: Number(rating) } });
    }

    // G2. Lọc khuyến mãi
    if (sale === 'true' || sale === true) {
      andConditions.push({
        $or: [
          { oldPrice: { $gt: 0 } },
          { discount: { $exists: true, $nin: ['', null, '0%'] } }
        ]
      });
    }

    const query = andConditions.length > 0 ? { $and: andConditions } : {};

    // H. Sắp xếp
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

    return {
      products: rawProducts,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    };
  },

  // 2. Chủ shop lấy danh sách sản phẩm của gian hàng
  async getMyProducts(user, queryParams) {
    let shopId = await getEffectiveShopId(user);
    if (!shopId && user.role !== 'admin') {
      const error = new Error('Tài khoản chưa liên kết gian hàng.');
      error.statusCode = 403;
      throw error;
    }

    const { search, status, category, brand, page = 1, limit = 100 } = queryParams;
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

    return {
      products,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    };
  },

  // 3. Chi tiết sản phẩm theo ID hoặc Slug
  async getProductById(id) {
    let product = null;

    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
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

    return product;
  },

  // 4. Đăng bán sản phẩm mới
  async createProduct(user, body) {
    const effectiveShopId = await getEffectiveShopId(user);
    const userShopId = effectiveShopId || body.shopId;

    if (!userShopId) {
      const error = new Error('Tài khoản của bạn chưa được liên kết với bất kỳ cửa hàng nào.');
      error.statusCode = 403;
      throw error;
    }

    const shop = await Shop.findById(userShopId);
    if (!shop) {
      const error = new Error('Cửa hàng không tồn tại trên hệ thống.');
      error.statusCode = 404;
      throw error;
    }

    if (shop.status !== 'active') {
      const error = new Error(`Cửa hàng đang ở trạng thái "${shop.status}". Chỉ cửa hàng đã được Admin phê duyệt (active) mới được phép đăng bán sản phẩm!`);
      error.statusCode = 403;
      error.shopStatus = shop.status;
      throw error;
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
      isFeatured,
      specs,
      specifications
    } = body;

    const finalTitle = (title || name || '').trim();
    if (!finalTitle) {
      const error = new Error('Vui lòng cung cấp tên sản phẩm.');
      error.statusCode = 400;
      throw error;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      const error = new Error('Giá bán sản phẩm không hợp lệ (phải >= 0).');
      error.statusCode = 400;
      throw error;
    }

    if (oldPrice !== undefined && oldPrice !== null && oldPrice !== '') {
      const numOldPrice = Number(oldPrice);
      if (isNaN(numOldPrice) || numOldPrice < 0) {
        const error = new Error('Giá gốc/cũ của sản phẩm không hợp lệ.');
        error.statusCode = 400;
        throw error;
      }
    }

    const numStock = stock !== undefined ? Number(stock) : 10;
    if (isNaN(numStock) || numStock < 0) {
      const error = new Error('Số lượng tồn kho không được là số âm.');
      error.statusCode = 400;
      throw error;
    }

    const normalizedSpecs = normalizeSpecificationsInput(specs, specifications);
    const specsMap = {};
    normalizedSpecs.forEach(s => {
      specsMap[s.name] = s.value;
    });

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
      isFeatured: Boolean(isFeatured),
      status: status || (numStock === 0 ? 'out_of_stock' : 'active'),
      specifications: normalizedSpecs,
      specs: specsMap,
      shopId: shop._id
    });

    await newProduct.save();

    shop.total_products = (shop.total_products || 0) + 1;
    await shop.save();

    return newProduct;
  },

  // 5. Cập nhật sản phẩm
  async updateProduct(id, user, body) {
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Không tìm thấy sản phẩm cần chỉnh sửa.');
      error.statusCode = 404;
      throw error;
    }

    const effectiveShopId = await getEffectiveShopId(user);
    const isOwner = effectiveShopId && product.shopId.toString() === effectiveShopId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      const error = new Error('Từ chối truy cập: Bạn không có quyền chỉnh sửa sản phẩm thuộc cửa hàng khác!');
      error.statusCode = 403;
      throw error;
    }

    const shop = await Shop.findById(product.shopId);
    if (shop && shop.status !== 'active' && !isAdmin) {
      const error = new Error('Cửa hàng đang bị khóa hoặc chưa được duyệt, không thể chỉnh sửa sản phẩm.');
      error.statusCode = 403;
      throw error;
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
      isFeatured,
      specs,
      specifications
    } = body;

    if (title || name) {
      product.title = (title || name).trim();
      product.name = (title || name).trim();
    }
    if (description !== undefined) product.description = description;

    if (price !== undefined) {
      const numPrice = Number(price);
      if (isNaN(numPrice) || numPrice < 0) {
        const error = new Error('Giá bán không hợp lệ (phải >= 0).');
        error.statusCode = 400;
        throw error;
      }
      product.price = numPrice;
    }

    if (oldPrice !== undefined) {
      if (oldPrice === null || oldPrice === '') {
        product.oldPrice = undefined;
      } else {
        const numOldPrice = Number(oldPrice);
        if (isNaN(numOldPrice) || numOldPrice < 0) {
          const error = new Error('Giá cũ không hợp lệ.');
          error.statusCode = 400;
          throw error;
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
    if (isFeatured !== undefined) product.isFeatured = Boolean(isFeatured);

    if (stock !== undefined) {
      const numStock = Number(stock);
      if (isNaN(numStock) || numStock < 0) {
        const error = new Error('Số lượng tồn kho không được âm.');
        error.statusCode = 400;
        throw error;
      }
      product.stock = numStock;
      if (numStock === 0 && product.status === 'active') {
        product.status = 'out_of_stock';
      }
    }

    if (status !== undefined) {
      if (!['active', 'hidden', 'out_of_stock', 'inactive'].includes(status)) {
        const error = new Error('Trạng thái sản phẩm không hợp lệ.');
        error.statusCode = 400;
        throw error;
      }
      product.status = status;
    }

    if (specifications !== undefined || specs !== undefined) {
      const normalizedSpecs = normalizeSpecificationsInput(specs, specifications);
      product.specifications = normalizedSpecs;
      const specsMap = new Map();
      normalizedSpecs.forEach(s => {
        specsMap.set(s.name, s.value);
      });
      product.specs = specsMap;
    }

    await product.save();
    return product;
  },

  // 6. Đổi nhanh trạng thái
  async updateProductStatus(id, user, status) {
    if (!['active', 'hidden', 'out_of_stock', 'inactive'].includes(status)) {
      const error = new Error('Trạng thái sản phẩm không hợp lệ.');
      error.statusCode = 400;
      throw error;
    }

    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Không tìm thấy sản phẩm.');
      error.statusCode = 404;
      throw error;
    }

    const effectiveShopId = await getEffectiveShopId(user);
    const isOwner = effectiveShopId && product.shopId.toString() === effectiveShopId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      const error = new Error('Bạn chỉ được phép cập nhật trạng thái sản phẩm của shop mình!');
      error.statusCode = 403;
      throw error;
    }

    product.status = status;
    await product.save();
    return product;
  },

  // 7. Xóa hoặc dừng kinh doanh
  async deleteProduct(id, user) {
    const product = await Product.findById(id);
    if (!product) {
      const error = new Error('Không tìm thấy sản phẩm.');
      error.statusCode = 404;
      throw error;
    }

    const effectiveShopId = await getEffectiveShopId(user);
    const isOwner = effectiveShopId && product.shopId.toString() === effectiveShopId;
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      const error = new Error('Bạn chỉ được phép xóa sản phẩm thuộc cửa hàng của chính mình!');
      error.statusCode = 403;
      throw error;
    }

    const orderCount = await Order.countDocuments({
      'items.productId': id
    });

    if (orderCount > 0) {
      product.status = 'inactive';
      await product.save();

      if (product.shopId) {
        await Shop.findByIdAndUpdate(product.shopId, { $inc: { total_products: -1 } });
      }

      return {
        isSoftDeleted: true,
        orderCount,
        product
      };
    }

    await Product.findByIdAndDelete(id);

    if (product.shopId) {
      await Shop.findByIdAndUpdate(product.shopId, { $inc: { total_products: -1 } });
    }

    return {
      isSoftDeleted: false,
      product
    };
  }
};

module.exports = productService;

