const { extractPriceRange } = require('../utils/priceParser');
const { buildSystemPrompt } = require('../prompts/productAdvisor.prompt');
const { checkStatus, chat } = require('./ollama.service');
const { 
  getActiveProducts, 
  findRecommendations, 
  extractSuggestedProducts 
} = require('./productRecommendation.service');
const { generateFallbackReply } = require('./fallback.service');

/**
 * Điều phối toàn bộ quy trình tư vấn sản phẩm thông minh
 */
async function processChatConsultation({ messages, productId = null }) {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
  const priceRange = extractPriceRange(lastUserMsg);

  // 1. Lấy danh sách sản phẩm active từ DB
  const activeProducts = await getActiveProducts();

  // 2. Phân loại và xếp hạng sản phẩm theo nhu cầu khách hàng
  const {
    exactMatches,
    alternativeMatches,
    currentProductInfo,
    contextProductText
  } = findRecommendations({
    userQuery: lastUserMsg,
    priceRange,
    activeProducts,
    productId
  });

  // 3. Xây dựng System Prompt chuẩn mực cho AI
  const systemPrompt = buildSystemPrompt({
    lastUserMsg,
    currentProductInfo,
    contextProductText
  });

  // 4. Gọi Ollama nếu có sẵn
  let { replyContent, thinkingContent } = await chat({
    messages,
    systemPrompt
  });

  // 5. Nếu Ollama không khả dụng hoặc trả lời quá ngắn, kích hoạt Fallback RAG thông minh
  if (!replyContent || replyContent.length < 10) {
    replyContent = generateFallbackReply({
      exactMatches,
      alternativeMatches,
      maxPrice: priceRange.maxPrice
    });
  }

  // 6. Trích xuất danh sách sản phẩm gợi ý (Mini Cards)
  const suggestedProducts = extractSuggestedProducts({
    replyContent,
    exactMatches,
    alternativeMatches,
    activeProducts
  });

  return {
    success: true,
    reply: replyContent,
    thinking: thinkingContent,
    suggestedProducts
  };
}

module.exports = {
  checkOllamaStatus: checkStatus,
  processChatConsultation
};

