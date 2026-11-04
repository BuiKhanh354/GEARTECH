const { formatVND } = require('../utils/currencyFormatter');

/**
 * Tạo câu trả lời thông minh nội bộ (Fallback RAG) khi Ollama không khả dụng
 */
function generateFallbackReply({ exactMatches = [], alternativeMatches = [], maxPrice = null }) {
  if (exactMatches.length > 0) {
    const best = exactMatches[0];
    const bestPrice = formatVND(best.price);
    let extraNote = '';

    if (exactMatches.length > 1) {
      const second = exactMatches[1];
      extraNote = ` Ngoài ra bạn có thể xem thêm mẫu [${second.displayName}] giá ${formatVND(second.price)}.`;
    } else if (alternativeMatches.length > 0) {
      const alt = alternativeMatches[0];
      extraNote = ` Nếu muốn nâng ngân sách thêm một chút, mẫu cao cấp [${alt.displayName}] giá ${formatVND(alt.price)} cũng rất đáng cân nhắc!`;
    }

    const priceScope = maxPrice ? `tầm giá dưới ${formatVND(maxPrice)}` : 'nhu cầu của bạn';
    return `Chào bạn! Trong ${priceScope}, GearTech xin gợi ý cho bạn mẫu [${best.displayName}] hiện có giá bán cực tốt là ${bestPrice}.${extraNote} Sản phẩm đang có sẵn hàng chính hãng tại sàn bạn nhé!`;
  }

  if (alternativeMatches.length > 0) {
    const nearest = alternativeMatches[0];
    const priceScope = maxPrice ? `dưới ${formatVND(maxPrice)}` : 'mức giá này';
    return `Dạ hiện tại sàn GearTech chưa có mẫu đúng tầm giá ${priceScope}. Mẫu có mức giá gần nhất mà bạn có thể tham khảo là [${nearest.displayName}] với giá ${formatVND(nearest.price)} bạn nhé!`;
  }

  return `Chào bạn! Tôi là GearTech AI. Bạn đang quan tâm đến bàn phím cơ, chuột gaming, màn hình hay linh kiện máy tính nào để tôi hỗ trợ tư vấn chi tiết nhất nhé!`;
}

module.exports = {
  generateFallbackReply
};

