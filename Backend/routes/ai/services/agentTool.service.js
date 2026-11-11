const Product = require('../../../models/Product');
const Shop = require('../../../models/Shop');
const Category = require('../../../models/Category');
const { extractPriceRange } = require('../utils/priceParser');

/**
 * Định nghĩa Tool (Function Calling) cho LLM (Ollama)
 * Giúp AI tự động quyết định khi nào cần truy vấn MongoDB và tự sinh tham số tìm kiếm
 */
const MONGODB_PRODUCT_TOOL = {
  type: 'function',
  function: {
    name: 'query_mongodb_products',
    description: 'Truy vấn trực tiếp cơ sở dữ liệu MongoDB của GearTech để tìm sản phẩm thực tế theo yêu cầu của khách hàng. Hãy gọi công cụ này khi khách muốn tìm kiếm, so sánh hoặc tư vấn sản phẩm.',
    parameters: {
      type: 'object',
      properties: {
        categoryName: {
          type: 'string',
          description: 'Tên danh mục sản phẩm (ví dụ: Bàn phím, Chuột, Màn hình, Tai nghe, Laptop, GPU, PC, Linh kiện)'
        },
        keyword: {
          type: 'string',
          description: 'Từ khóa kỹ thuật hoặc tính năng (ví dụ: switch cơ, hotswap, 2K, không dây, 240Hz, siêu nhẹ, IPS)'
        },
        brand: {
          type: 'string',
          description: 'Thương hiệu sản phẩm (ví dụ: ASUS, Logitech, Razer, Corsair, Dell, Acer)'
        },
        minPrice: {
          type: 'number',
          description: 'Giá tối thiểu tính bằng VNĐ (ví dụ: 1000000)'
        },
        maxPrice: {
          type: 'number',
          description: 'Giá tối đa tính bằng VNĐ (ví dụ: 5000000)'
        }
      },
      required: ['categoryName']
    }
  }
};

/**
 * Chuẩn hóa giá do LLM sinh ra (phòng trường hợp model 1.5B/4B sinh '15' hoặc '1500' thay vì '15000000')
 */
function normalizePriceInput(val) {
  if (val === null || val === undefined) return null;
  const num = Number(val);
  if (isNaN(num) || num <= 0) return null;
  if (num < 1000) {
    return Math.round(num * 1000000);
  }
  if (num < 100000) {
    return Math.round(num * 1000);
  }
  return num;
}

/**
 * Trích xuất chuỗi thông số kỹ thuật gọn gàng từ Map hoặc Array trong MongoDB
 */
function extractSpecsText(p) {
  const parts = [];
  if (p.specs) {
    if (typeof p.specs.entries === 'function') {
      for (const [key, val] of p.specs.entries()) {
        if (val && parts.length < 5) parts.push(`${key}: ${val}`);
      }
    } else if (typeof p.specs === 'object') {
      for (const [key, val] of Object.entries(p.specs)) {
        if (val && parts.length < 5) parts.push(`${key}: ${val}`);
      }
    }
  }
  if (parts.length === 0 && Array.isArray(p.specifications)) {
    p.specifications.slice(0, 4).forEach(s => {
      if (s.name && s.value) parts.push(`${s.name}: ${s.value}`);
    });
  }
  return parts.length > 0 ? parts.join(', ') : 'Thông số tiêu chuẩn GearTech';
}

/**
 * Thực thi câu truy vấn MongoDB thực tế dựa trên tham số do AI yêu cầu
 */
async function executeMongoProductQuery(toolArgs = {}, rawUserMsg = '') {
  try {
    // 1. Chỉ lấy sản phẩm từ các shop có status 'active' (Loại bỏ 100% shop bị khóa, pending, rejected)
    const activeShops = await Shop.find({ status: 'active' }).select('_id name').lean();
    const activeShopIds = activeShops.map(s => s._id);
    const activeShopIdStrings = activeShops.map(s => s._id.toString());

    const filter = {
      status: 'active',
      $or: [
        { shopId: { $in: activeShopIds } },
        { shop_id: { $in: activeShopIds } }
      ]
    };

    // 2. Lọc theo khoảng giá (kết hợp parser tiếng Việt chuẩn xác để bù đắp sai số số 0 của LLM)
    let minPrice = normalizePriceInput(toolArgs.minPrice);
    let maxPrice = normalizePriceInput(toolArgs.maxPrice);

    if (rawUserMsg) {
      const parsedRange = extractPriceRange(rawUserMsg);
      if (parsedRange.maxPrice && (!maxPrice || parsedRange.maxPrice > maxPrice * 3)) {
        maxPrice = parsedRange.maxPrice;
      }
      if (parsedRange.minPrice && (!minPrice || parsedRange.minPrice > minPrice * 3)) {
        minPrice = parsedRange.minPrice;
      }
    }

    if (minPrice && minPrice > 0) {
      filter.price = { ...(filter.price || {}), $gte: minPrice };
    }
    if (maxPrice && maxPrice > 0) {
      filter.price = { ...(filter.price || {}), $lte: maxPrice };
    }

    // 3. Lọc theo thương hiệu
    if (toolArgs.brand && typeof toolArgs.brand === 'string' && toolArgs.brand.trim()) {
      filter.brand = new RegExp(toolArgs.brand.trim(), 'i');
    }

    // 4. Lọc theo danh mục (hỗ trợ cả Category ObjectId, Category slug chuỗi, và từ khóa trong tên)
    const categoryConditions = [];
    if (toolArgs.categoryName && typeof toolArgs.categoryName === 'string') {
      const catKeywords = toolArgs.categoryName.trim().split(/\s+/).filter(w => w.length > 1);
      const catRegex = new RegExp(catKeywords.join('|'), 'i');

      const matchedCats = await Category.find({
        $or: [{ name: catRegex }, { slug: catRegex }]
      }).select('_id slug').lean();

      const matchedCatIds = matchedCats.map(c => c._id);
      const matchedSlugs = matchedCats.map(c => c.slug);

      if (matchedCatIds.length > 0) {
        categoryConditions.push({ category: { $in: matchedCatIds } });
      }
      if (matchedSlugs.length > 0) {
        categoryConditions.push({ category: { $in: matchedSlugs } });
      }
      categoryConditions.push({ name: new RegExp(toolArgs.categoryName.trim(), 'i') });
    }

    // Lọc theo từ khóa chi tiết (keyword)
    if (toolArgs.keyword && typeof toolArgs.keyword === 'string' && toolArgs.keyword.trim()) {
      const kw = toolArgs.keyword.trim();
      categoryConditions.push({ name: new RegExp(kw, 'i') });
      categoryConditions.push({ description: new RegExp(kw, 'i') });
    }

    // Nhận diện từ khóa sản phẩm cụ thể từ câu hỏi (ví dụ: macbook, apple, zephyrus, predator, azoth...)
    if (rawUserMsg) {
      const specificKeywords = ['macbook', 'apple', 'zephyrus', 'predator', 'legion', 'viper', 'azoth', 'odyssey', 'proart', 'blackwidow'];
      const foundKw = specificKeywords.find(k => rawUserMsg.toLowerCase().includes(k));
      if (foundKw) {
        categoryConditions.push({ name: new RegExp(foundKw, 'i') });
        categoryConditions.push({ brand: new RegExp(foundKw, 'i') });
      }
    }

    if (categoryConditions.length > 0) {
      filter.$and = filter.$and || [];
      filter.$and.push({ $or: categoryConditions });
    }

    // 5. Thực thi truy vấn MongoDB
    let matchedProducts = await Product.find(filter)
      .select('name title displayName price oldPrice discount brand category specs specifications stock slug gallery rating ratingAvg shopId shop_id')
      .populate('shopId', 'name')
      .sort({ rating: -1, createdAt: -1 })
      .limit(6)
      .lean();

    // 6. Nếu lọc quá chặt không có sản phẩm, nới lỏng bỏ bớt khoảng giá nhưng VẪN PHẢI GIỮ BỘ LỌC SHOP ACTIVE
    if (matchedProducts.length === 0) {
      const relaxedFilter = {
        status: 'active',
        $or: [
          { shopId: { $in: activeShopIds } },
          { shop_id: { $in: activeShopIds } }
        ]
      };
      if (filter.brand) relaxedFilter.brand = filter.brand;
      if (categoryConditions.length > 0) {
        relaxedFilter.$and = [{ $or: categoryConditions }];
      }

      matchedProducts = await Product.find(relaxedFilter)
        .select('name title displayName price oldPrice discount brand category specs specifications stock slug gallery rating ratingAvg shopId shop_id')
        .populate('shopId', 'name')
        .sort({ rating: -1 })
        .limit(4)
        .lean();
    }

    // 7. Chốt chặn bảo mật 3 lớp: Lọc bỏ triệt để sản phẩm của bất kỳ Shop nào bị khóa
    matchedProducts = matchedProducts.filter(p => {
      const rawShopId = p.shopId?._id || p.shopId || p.shop_id;
      if (!rawShopId) return false;
      return activeShopIdStrings.includes(rawShopId.toString());
    });

    // 8. Lọc nghiêm ngặt theo đúng thương hiệu/dòng máy đích danh khi người dùng hỏi cụ thể (VD: "macbook", "mac", "apple", "razer", "logitech")
    if (rawUserMsg) {
      const lowerQuery = rawUserMsg.toLowerCase();
      const specificKeywords = ['macbook', 'mac', 'apple', 'razer', 'logitech', 'asus', 'acer', 'dell', 'lenovo', 'corsair', 'sony', 'samsung'];
      
      const foundKeyword = specificKeywords.find(k => {
        if (k === 'mac') {
          return /\bmac\b/i.test(lowerQuery) || lowerQuery.includes('macbook');
        }
        return new RegExp(`\\b${k}\\b`, 'i').test(lowerQuery);
      });

      if (foundKeyword) {
        const strictMatches = matchedProducts.filter(p => {
          const pName = (p.displayName || p.name || p.title || '').toLowerCase();
          const pBrand = (p.brand || '').toLowerCase();
          if (foundKeyword === 'mac' || foundKeyword === 'macbook' || foundKeyword === 'apple') {
            return pName.includes('macbook') || pBrand.includes('apple') || pName.includes('apple');
          }
          return pName.includes(foundKeyword) || pBrand.includes(foundKeyword);
        });

        // Nếu có sản phẩm khớp đúng thương hiệu/dòng máy khách hỏi, CHỈ GIỮ LẠI sản phẩm đó, loại bỏ các hãng khác
        if (strictMatches.length > 0) {
          matchedProducts = strictMatches;
        }
      }

      // Sắp xếp: Đưa sản phẩm khớp từ khóa truy vấn lên đầu
      const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2);
      matchedProducts.sort((a, b) => {
        const aName = (a.displayName || a.name || a.title || '').toLowerCase();
        const bName = (b.displayName || b.name || b.title || '').toLowerCase();
        const aMatch = queryWords.some(w => aName.includes(w));
        const bMatch = queryWords.some(w => bName.includes(w));
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    // 9. Định dạng kết quả dữ liệu thực tế để gửi ngược lại cho AI đọc
    const aiContextData = matchedProducts.map(p => ({
      id: p._id.toString(),
      tenSanPham: p.displayName || p.name || p.title,
      hang: (p.brand || 'Chính hãng').toUpperCase(),
      giaBanChinhThuc: `${(p.price || 0).toLocaleString('vi-VN')} VNĐ`,
      thongSoKyThuat: extractSpecsText(p),
      tonKho: p.stock || 0
    }));

    return {
      products: matchedProducts,
      aiContextData,
      count: matchedProducts.length
    };
  } catch (error) {
    console.error('Lỗi khi thực thi Mongo Product Query:', error);
    return { products: [], aiContextData: [], count: 0 };
  }
}

module.exports = {
  MONGODB_PRODUCT_TOOL,
  executeMongoProductQuery,
  extractSpecsText
};
