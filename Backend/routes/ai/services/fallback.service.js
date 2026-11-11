const { formatVND } = require('../utils/currencyFormatter');

/**
 * Trích xuất điểm nổi bật ngắn gọn từ thông số kỹ thuật của sản phẩm
 */
function getSpecSnippet(p) {
  if (p && p.specs && typeof p.specs === 'object') {
    const entries = p.specs instanceof Map ? Array.from(p.specs.entries()) : Object.entries(p.specs);
    if (entries.length > 0) {
      return ` Sản phẩm nổi bật với ${entries.slice(0, 2).map(([k, v]) => `${k.toLowerCase()} ${v}`).join(', ')}.`;
    }
  }
  if (p && Array.isArray(p.specifications) && p.specifications.length > 0) {
    return ` Sản phẩm nổi bật với ${p.specifications.slice(0, 2).map(s => `${s.name.toLowerCase()} ${s.value}`).join(', ')}.`;
  }
  return '';
}

/**
 * Tạo câu trả lời thông minh nội bộ (Fallback RAG) khi Ollama không khả dụng
 */
function generateFallbackReply({ exactMatches = [], alternativeMatches = [], maxPrice = null }) {
  if (exactMatches.length > 0) {
    const best = exactMatches[0];
    const bestPrice = formatVND(best.price);
    const specHighlight = getSpecSnippet(best);
    let extraNote = '';

    if (exactMatches.length > 1) {
      const second = exactMatches[1];
      const secondSpec = getSpecSnippet(second);
      extraNote = ` Ngoài ra bạn có thể tham khảo thêm mẫu [${second.displayName}] giá ${formatVND(second.price)}.${secondSpec}`;
    } else if (alternativeMatches.length > 0) {
      const alt = alternativeMatches[0];
      extraNote = ` Nếu muốn nâng ngân sách thêm một chút, mẫu cao cấp [${alt.displayName}] giá ${formatVND(alt.price)} cũng rất đáng cân nhắc!`;
    }

    const priceScope = maxPrice ? `tầm giá dưới ${formatVND(maxPrice)}` : 'nhu cầu của bạn';
    return `Chào bạn! Trong ${priceScope}, GearTech xin gợi ý cho bạn mẫu [${best.displayName}] hiện có giá bán cực tốt là ${bestPrice}.${specHighlight}${extraNote} Sản phẩm đang có sẵn hàng chính hãng tại sàn bạn nhé!`;
  }

  if (alternativeMatches.length > 0) {
    const nearest = alternativeMatches[0];
    const specHighlight = getSpecSnippet(nearest);
    const priceScope = maxPrice ? `dưới ${formatVND(maxPrice)}` : 'mức giá này';
    return `Dạ hiện tại sàn GearTech chưa có mẫu đúng tầm giá ${priceScope}. Mẫu có mức giá gần nhất mà bạn có thể tham khảo là [${nearest.displayName}] với giá ${formatVND(nearest.price)}.${specHighlight} Bạn tham khảo thử nhé!`;
  }

  return `Chào bạn! Tôi là GearTech AI. Bạn đang quan tâm đến bàn phím cơ, chuột gaming, màn hình hay linh kiện máy tính nào để tôi hỗ trợ tư vấn chi tiết nhất nhé!`;
}

module.exports = {
  generateFallbackReply
};
