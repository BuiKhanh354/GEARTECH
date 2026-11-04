/**
 * Nhóm từ khóa nhận diện danh mục thiết bị công nghệ
 */
const KEYWORD_GROUPS = [
  { key: 'keyboard', terms: ['bàn phím', 'bàn phím cơ', 'phím cơ', 'keyboard', 'switch', 'keycap'] },
  { key: 'mouse', terms: ['chuột gaming', 'chuột', 'mouse', 'chuột không dây', 'con lăn'] },
  { key: 'monitor', terms: ['màn hình', 'monitor', 'oled', 'màn hình cong'] },
  { key: 'laptop', terms: ['laptop', 'macbook', 'máy tính xách tay', 'notebook'] },
  { key: 'pc', terms: ['pc gaming', 'máy tính để bàn', 'pc workstation', 'dàn pc', 'thùng pc'] },
  { key: 'audio', terms: ['tai nghe', 'headphone', 'headset', 'loa'] },
  { key: 'components', terms: ['card màn hình', 'vga', 'gpu', 'cpu', 'ram', 'ssd', 'nguồn', 'tản nhiệt'] }
];

/**
 * Phân tích ý định tìm kiếm theo danh mục cụ thể từ câu hỏi người dùng
 */
function detectCategoryIntents(queryLower) {
  const isAskingKeyboard = queryLower.includes('bàn phím') || queryLower.includes('phím') || queryLower.includes('keyboard');
  const isAskingMouse = (queryLower.includes('chuột') || queryLower.includes('mouse')) && !isAskingKeyboard;
  const isAskingMonitor = queryLower.includes('màn hình') || queryLower.includes('monitor');
  const isAskingLaptop = queryLower.includes('laptop') || queryLower.includes('macbook');
  const isAskingAudio = queryLower.includes('tai nghe') || queryLower.includes('headphone');

  const matchedIntents = KEYWORD_GROUPS.filter(g => g.terms.some(t => queryLower.includes(t)));

  return {
    isAskingKeyboard,
    isAskingMouse,
    isAskingMonitor,
    isAskingLaptop,
    isAskingAudio,
    hasSpecificCategory: isAskingKeyboard || isAskingMouse || isAskingMonitor || isAskingLaptop || isAskingAudio,
    matchedIntents
  };
}

/**
 * Chấm điểm độ phù hợp của 1 sản phẩm dựa trên nhu cầu tìm kiếm và ngân sách
 */
function scoreProduct(product, queryLower, intents, priceRange) {
  const { minPrice, maxPrice } = priceRange;
  const { isAskingKeyboard, isAskingMouse, isAskingMonitor, isAskingLaptop, isAskingAudio, hasSpecificCategory, matchedIntents } = intents;

  let score = 0;
  const title = (product.displayName || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();
  const catName = (product.categoryName || '').toLowerCase();
  const brand = (product.brand || '').toLowerCase();
  const desc = (product.description || '').toLowerCase();

  let hasCategoryMatch = true;

  if (isAskingKeyboard) {
    hasCategoryMatch = title.includes('bàn phím') || title.includes('keyboard');
    if (title.includes('chuột') || title.includes('mouse')) hasCategoryMatch = false;
    if (hasCategoryMatch) score += 150;
  } else if (isAskingMouse) {
    hasCategoryMatch = title.includes('chuột') || title.includes('mouse');
    if (title.includes('bàn phím') || title.includes('keyboard')) hasCategoryMatch = false;
    if (hasCategoryMatch) score += 150;
  } else if (isAskingMonitor) {
    hasCategoryMatch = title.includes('màn hình') || cat.includes('monitor') || catName.includes('màn hình');
    if (hasCategoryMatch) score += 150;
  } else if (isAskingLaptop) {
    hasCategoryMatch = cat.includes('laptop') || title.includes('laptop') || title.includes('macbook');
    if (hasCategoryMatch) score += 150;
  } else if (isAskingAudio) {
    hasCategoryMatch = title.includes('tai nghe') || cat.includes('audio');
    if (hasCategoryMatch) score += 150;
  }

  // Nếu người dùng hỏi đích danh một loại thiết bị mà sản phẩm không khớp, loại bỏ ngay
  if (hasSpecificCategory && !hasCategoryMatch) {
    return { product, score: -999, matchesPrice: false };
  }

  // Điểm khớp danh mục / từ khóa chung
  if (matchedIntents.length > 0) {
    matchedIntents.forEach(intent => {
      intent.terms.forEach(term => {
        if (title.includes(term)) score += 60;
        if (cat.includes(term) || catName.includes(term)) score += 30;
        if (desc.includes(term)) score += 10;
      });
    });
  } else {
    const words = queryLower.split(/\s+/).filter(w => w.length >= 2);
    words.forEach(w => {
      if (title.includes(w)) score += 20;
      if (cat.includes(w) || catName.includes(w)) score += 15;
      if (brand.includes(w)) score += 25;
    });
  }

  // Điểm khớp tầm giá
  let matchesPrice = true;
  if (maxPrice !== null) {
    if (product.price <= maxPrice) {
      score += 100;
    } else {
      matchesPrice = false;
      const diff = product.price - maxPrice;
      score -= Math.min(120, Math.floor(diff / 500000) * 20);
    }
  }

  if (minPrice !== null) {
    if (product.price >= minPrice) {
      score += 80;
    } else {
      matchesPrice = false;
      score -= 60;
    }
  }

  if (product.stock > 0) score += 10;

  return { product, score, matchesPrice };
}

module.exports = {
  KEYWORD_GROUPS,
  detectCategoryIntents,
  scoreProduct
};

