/**
 * Phân tích khoảng giá (minPrice, maxPrice) từ tin nhắn người dùng
 * Hỗ trợ các mẫu câu: dưới 5 triệu, 2.5tr, 500k, 2 triệu đổ lại, trên 3 triệu, v.v.
 */
function extractPriceRange(text) {
  const lower = (text || '').toLowerCase();
  let maxPrice = null;
  let minPrice = null;

  // 1. Khoảng giá giữa 2 số: VD "10-15 triệu", "tầm 2 đến 4tr", "từ 500k tới 1 triệu"
  const rangeMatch = lower.match(/(?:tầm|khoảng|từ)?\s*(\d+(?:[.,]\d+)?)\s*(?:-|đến|tới)\s*(\d+(?:[.,]\d+)?)\s*(triệu|tr|m|k|nghìn|ngàn)?/i);
  if (rangeMatch) {
    let num1 = parseFloat(rangeMatch[1].replace(',', '.'));
    let num2 = parseFloat(rangeMatch[2].replace(',', '.'));
    const unit = (rangeMatch[3] || '').toLowerCase();
    const multiplier = (unit === 'triệu' || unit === 'tr' || unit === 'm' || (!unit && num2 < 100)) ? 1000000
                     : (unit === 'k' || unit === 'nghìn' || unit === 'ngàn') ? 1000 : 1;
    minPrice = Math.min(num1, num2) * multiplier;
    maxPrice = Math.max(num1, num2) * multiplier;
    return { minPrice, maxPrice };
  }

  // 2. Dưới X, nhỏ hơn X, tối đa X, X đổ lại
  const underMatch = lower.match(/(?:dưới|nhỏ hơn|ít hơn|<|tối đa|đổ lại|tầm|khoảng)\s*(\d+(?:[.,]\d+)?)\s*(triệu|tr|m|k|nghìn|ngàn|đ|vnd)?/i)
    || lower.match(/(\d+(?:[.,]\d+)?)\s*(triệu|tr|m|k|nghìn|ngàn)?\s*(?:đổ lại|trở xuống)/i);

  if (underMatch) {
    let num = parseFloat(underMatch[1].replace(',', '.'));
    const unit = (underMatch[2] || '').toLowerCase();
    if (unit === 'triệu' || unit === 'tr' || unit === 'm' || (!unit && num < 100)) {
      maxPrice = num * 1000000;
    } else if (unit === 'k' || unit === 'nghìn' || unit === 'ngàn') {
      maxPrice = num * 1000;
    } else if (num >= 1000) {
      maxPrice = num;
    }
  }

  // Trên X, lớn hơn X, từ X
  const overMatch = lower.match(/(?:trên|lớn hơn|>|tối thiểu|từ)\s*(\d+(?:[.,]\d+)?)\s*(triệu|tr|m|k|nghìn|ngàn)?/i);
  if (overMatch && !underMatch) {
    let num = parseFloat(overMatch[1].replace(',', '.'));
    const unit = (overMatch[2] || '').toLowerCase();
    if (unit === 'triệu' || unit === 'tr' || unit === 'm' || (!unit && num < 100)) {
      minPrice = num * 1000000;
    } else if (unit === 'k' || unit === 'nghìn' || unit === 'ngàn') {
      minPrice = num * 1000;
    } else if (num >= 1000) {
      minPrice = num;
    }
  }

  // Nhận diện mức giá độc lập (VD: "2 triệu", "2.5tr", "500k", "giá 2tr") khi người dùng không ghi từ khóa "dưới/trên"
  if (!underMatch && !overMatch) {
    const standaloneMatch = lower.match(/(?:giá\s*)?(\d+(?:[.,]\d+)?)\s*(triệu|tr|m|k|nghìn|ngàn)\b/i);
    if (standaloneMatch) {
      let num = parseFloat(standaloneMatch[1].replace(',', '.'));
      const unit = (standaloneMatch[2] || '').toLowerCase();
      if (unit === 'triệu' || unit === 'tr' || unit === 'm') {
        maxPrice = num * 1000000;
      } else if (unit === 'k' || unit === 'nghìn' || unit === 'ngàn') {
        maxPrice = num * 1000;
      }
    }
  }

  return { minPrice, maxPrice };
}

module.exports = {
  extractPriceRange
};
