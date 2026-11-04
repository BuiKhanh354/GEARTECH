const Product = require('../../../models/Product');
const Shop = require('../../../models/Shop');
const { detectCategoryIntents, scoreProduct } = require('../utils/productScoring');
const { formatVND } = require('../utils/currencyFormatter');

/**
 * Lấy danh sách sản phẩm active từ các shop đang active
 */
async function getActiveProducts() {
  try {
    const activeShops = await Shop.find({ status: 'active' }).select('_id name');
    const activeShopIds = activeShops.map(s => s._id.toString());
    const shopMap = {};
    activeShops.forEach(s => { shopMap[s._id.toString()] = s.name; });

    const allProds = await Product.find({ status: 'active' })
      .select('title name price oldPrice discount category categoryName brand slug description stock gallery imageEmoji shopId')
      .lean();

    return allProds
      .filter(p => !p.shopId || activeShopIds.includes(p.shopId.toString()))
      .map(p => ({
        ...p,
        displayName: p.title || p.name || 'Sản phẩm GearTech',
        shopName: p.shopId ? (shopMap[p.shopId.toString()] || 'GearTech Partner') : 'GearTech Official'
      }));
  } catch (error) {
    console.warn('Lỗi truy vấn sản phẩm từ DB:', error.message);
    return [];
  }
}

/**
 * Phân tích và chấm điểm sản phẩm theo nhu cầu người dùng
 */
function findRecommendations({ userQuery, priceRange, activeProducts, productId = null }) {
  const queryLower = (userQuery || '').toLowerCase();
  const intents = detectCategoryIntents(queryLower);

  const scoredProducts = activeProducts.map(p => scoreProduct(p, queryLower, intents, priceRange));
  scoredProducts.sort((a, b) => b.score - a.score);

  const exactMatches = scoredProducts
    .filter(s => s.score >= 100 && s.matchesPrice)
    .map(s => s.product);

  const alternativeMatches = scoredProducts
    .filter(s => !exactMatches.includes(s.product) && s.score >= 50)
    .map(s => s.product);

  let currentProductInfo = '';
  if (productId) {
    const curP = activeProducts.find(p => p._id.toString() === productId);
    if (curP) {
      currentProductInfo = `\nKHÁCH HÀNG ĐANG XEM TRỰC TIẾP:\n- [${curP.displayName}] | Giá: ${formatVND(curP.price)} | Tồn kho: ${curP.stock} cái\n`;
    }
  }

  let contextProductText = '';
  if (exactMatches.length > 0) {
    contextProductText += `SẢN PHẨM KHỚP CHÍNH XÁC YÊU CẦU VÀ NGÂN SÁCH CỦA KHÁCH:\n`;
    exactMatches.slice(0, 4).forEach(p => {
      const promoStr = (p.oldPrice && p.oldPrice > p.price) ? ` (Giá gốc: ${formatVND(p.oldPrice)}${p.discount ? ', Giảm ' + p.discount : ''})` : '';
      contextProductText += `- [${p.displayName}] | Giá bán: ${formatVND(p.price)}${promoStr} | Hãng: ${p.brand?.toUpperCase() || 'Chính hãng'} | Tồn kho: ${p.stock} cái\n`;
    });
  }

  if (alternativeMatches.length > 0) {
    contextProductText += `\nSẢN PHẨM LIÊN QUAN THAM KHẢO THÊM:\n`;
    alternativeMatches.slice(0, 3).forEach(p => {
      const promoStr = (p.oldPrice && p.oldPrice > p.price) ? ` (Giá gốc: ${formatVND(p.oldPrice)})` : '';
      contextProductText += `- [${p.displayName}] | Giá bán: ${formatVND(p.price)}${promoStr} | Hãng: ${p.brand?.toUpperCase() || 'Chính hãng'}\n`;
    });
  }

  if (!contextProductText) {
    contextProductText = activeProducts.slice(0, 6).map(p => 
      `- [${p.displayName}] | Giá bán: ${formatVND(p.price)} | Hãng: ${p.brand?.toUpperCase() || 'Chính hãng'}`
    ).join('\n');
  }

  return {
    exactMatches,
    alternativeMatches,
    currentProductInfo,
    contextProductText
  };
}

/**
 * Trích xuất danh sách sản phẩm gợi ý (Mini Cards) gửi kèm phản hồi
 */
function extractSuggestedProducts({ replyContent, exactMatches = [], alternativeMatches = [], activeProducts = [] }) {
  let finalSuggested = [];

  const candidateList = (exactMatches.length > 0 || alternativeMatches.length > 0)
    ? [...exactMatches, ...alternativeMatches]
    : activeProducts;

  candidateList.forEach(p => {
    const pNameLower = p.displayName.toLowerCase();
    const cleanTitle = pNameLower.replace(/\d{10,}/g, '').trim();
    const inReply = replyContent.toLowerCase().includes(pNameLower) ||
                   (cleanTitle.length > 5 && replyContent.toLowerCase().includes(cleanTitle)) ||
                   (p.slug && replyContent.includes(p.slug)) ||
                   replyContent.includes(`[${p.displayName}]`);
    if (inReply && !finalSuggested.some(item => item._id.toString() === p._id.toString())) {
      finalSuggested.push(p);
    }
  });

  if (finalSuggested.length === 0) {
    finalSuggested = exactMatches.slice(0, 3);
  }
  if (finalSuggested.length === 0) {
    finalSuggested = alternativeMatches.slice(0, 2);
  }

  return finalSuggested.slice(0, 3).map(p => {
    const img = (Array.isArray(p.gallery) && p.gallery.length > 0 && p.gallery[0]) ||
                p.imageEmoji ||
                null;
    return {
      _id: p._id,
      name: p.displayName,
      price: p.price,
      oldPrice: p.oldPrice || null,
      discount: p.discount || null,
      discountPrice: p.price,
      slug: p.slug,
      image: img,
      shopName: p.shopName
    };
  });
}

module.exports = {
  getActiveProducts,
  findRecommendations,
  extractSuggestedProducts
};

