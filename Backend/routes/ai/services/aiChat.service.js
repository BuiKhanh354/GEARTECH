const { extractPriceRange } = require('../utils/priceParser');
const { buildSystemPrompt } = require('../prompts/productAdvisor.prompt');
const { checkStatus, chat } = require('./ollama.service');
const { 
  getActiveProducts, 
  findRecommendations, 
  extractSuggestedProducts 
} = require('./productRecommendation.service');
const { generateFallbackReply } = require('./fallback.service');
const { MONGODB_PRODUCT_TOOL, executeMongoProductQuery } = require('./agentTool.service');

/**
 * Điều phối toàn bộ quy trình tư vấn sản phẩm thông minh
 * Hỗ trợ 2 chế độ:
 * 1. AI Tool Calling (Mô hình 2: AI tự phân tích nhu cầu và tự phát lệnh truy vấn MongoDB)
 * 2. Fallback RAG thông minh (Khi Ollama tắt hoặc quá tải)
 */
async function processChatConsultation({ messages, productId = null }) {
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';

  // 1. Kiểm tra trạng thái sẵn sàng của Ollama
  const ollamaStatus = await checkStatus();

  // NẾU OLLAMA KHẢ DỤNG: SỬ DỤNG CƠ CHẾ AI AGENT TOOL CALLING
  if (ollamaStatus.available && ollamaStatus.modelReady) {
    try {
      const systemPromptStep1 = `Bạn là Chuyên gia tư vấn của sàn thương mại điện tử GearTech.
GearTech là đại lý phân phối chính hãng các sản phẩm công nghệ của Apple, ASUS, Logitech, Razer, Acer, Lenovo, Corsair, Dell, v.v.
Nhiệm vụ: Khi khách hàng nhắc đến bất kỳ thiết bị công nghệ nào (MacBook, Laptop, Bàn phím, Chuột, Màn hình, Tai nghe, PC, VGA, v.v.) hoặc hỏi shop có bán sản phẩm hay không, bạn BẮT BUỘC PHẢI gọi công cụ 'query_mongodb_products' ngay lập tức để kiểm tra kho hàng thực tế của GearTech trước khi trả lời.
Chỉ trả lời văn bản thông thường khi khách chỉ chào hỏi xã giao (chào bạn, hello, hi) hoặc cảm ơn.`;

      const step1Result = await chat({
        messages: messages.slice(-4),
        systemPrompt: systemPromptStep1,
        tools: [MONGODB_PRODUCT_TOOL],
        timeoutMs: 15000
      });

      // 1. Kiểm tra xem AI có tự phát lệnh Tool Call không
      let toolArgs = null;
      let rawToolMessage = step1Result.rawMessage;

      if (step1Result.toolCalls && step1Result.toolCalls.length > 0) {
        toolArgs = step1Result.toolCalls[0].function?.arguments || {};
        console.log('🤖 AI tự phát lệnh Tool Call truy vấn MongoDB:', toolArgs);
      } else {
        // Dự phòng thông minh: Nếu người dùng hỏi mua/tư vấn sản phẩm nhưng AI 1.5B chưa gọi tool
        const lowerMsg = lastUserMsg.toLowerCase();
        const HARDWARE_CATS = [
          { pattern: /\b(mac|macbook)\b/i, cat: 'Laptop', kw: 'macbook' },
          { pattern: /\bapple\b/i, cat: 'Laptop', kw: 'apple' },
          { pattern: /\blaptop\b/i, cat: 'Laptop', kw: 'laptop' },
          { pattern: /\b(bàn phím|phím)\b/i, cat: 'Bàn phím', kw: 'bàn phím' },
          { pattern: /\bchuột\b/i, cat: 'Chuột', kw: 'chuột' },
          { pattern: /\bmàn hình\b/i, cat: 'Màn hình', kw: 'màn hình' },
          { pattern: /\btai nghe\b/i, cat: 'Tai nghe', kw: 'tai nghe' },
          { pattern: /\b(vga|gpu|card)\b/i, cat: 'GPU', kw: 'gpu' },
          { pattern: /\b(pc|máy tính)\b/i, cat: 'PC', kw: 'pc' }
        ];
        const matched = HARDWARE_CATS.find(item => item.pattern.test(lowerMsg));
        if (matched) {
          toolArgs = {
            categoryName: matched.cat,
            keyword: matched.kw || lastUserMsg
          };
          rawToolMessage = {
            role: 'assistant',
            content: '',
            tool_calls: [{
              id: 'call_auto_' + Date.now(),
              function: { name: 'query_mongodb_products', arguments: toolArgs }
            }]
          };
          console.log('⚡ Hệ thống tự động kích hoạt truy vấn MongoDB cho:', matched.cat);
        }
      }

      // 2. Nếu có truy vấn DB (từ AI Tool Call hoặc nhận diện ngữ nghĩa)
      if (toolArgs) {
        // Node.js thực thi câu truy vấn MongoDB theo đúng tham số AI yêu cầu
        const { products, aiContextData } = await executeMongoProductQuery(toolArgs, lastUserMsg);

        // Nạp kết quả từ MongoDB trở lại vào ngữ cảnh cho AI phân tích
        const step2Messages = [
          ...messages.slice(-4),
          rawToolMessage,
          {
            role: 'tool',
            content: JSON.stringify(aiContextData)
          }
        ];

        const systemPromptStep2 = `Bạn là Chuyên gia tư vấn của sàn thương mại điện tử GearTech - Đại lý phân phối chính hãng các thương hiệu Apple, ASUS, Logitech, Razer, Acer, Lenovo, Dell, Corsair.
Dưới đây là các sản phẩm thực tế ĐANG CÓ SẴN trong kho hàng GearTech vừa được truy vấn trực tiếp từ cơ sở dữ liệu MongoDB:
QUY TẮC BẮT BUỘC:
1. Tập trung đúng trọng tâm: Khách hỏi đích danh thương hiệu hay sản phẩm nào (ví dụ hỏi về 'Mac', 'MacBook', 'Apple', 'Razer'...), bạn CHỈ ĐƯỢC trả lời và tư vấn DUY NHẤT sản phẩm đó. Tuyệt đối KHÔNG tự ý kể thêm các sản phẩm khác hãng/khác dòng vào câu trả lời.
2. Khi khách hỏi shop có bán sản phẩm hay không, nếu sản phẩm có trong danh sách trên, bạn hãy khẳng định chắc chắn: "Dạ có ạ! GearTech hiện đang phân phối chính hãng sản phẩm..." và giới thiệu chi tiết thông số kỹ thuật (Chip, RAM, Ổ cứng, Màn hình...) cùng giá bán chính thức.
3. Tuyệt đối KHÔNG ĐƯỢC từ chối bằng các câu như "Tôi không thể truy cập dữ liệu" hay "Hãy sang trang web khác mua".
4. Chỉ tư vấn sản phẩm có trong dữ liệu, không tự bịa đặt giá hoặc thông số ngoài danh sách.
5. Trả lời bằng tiếng Việt thân thiện, chuyên nghiệp, súc tích (khoảng 3-4 câu).`;

        const step2Result = await chat({
          messages: step2Messages,
          systemPrompt: systemPromptStep2,
          tools: [MONGODB_PRODUCT_TOOL],
          timeoutMs: 25000
        });

        if (step2Result.replyContent && step2Result.replyContent.length > 10) {
          const suggestedProducts = products.slice(0, 3).map(p => {
            const img = (Array.isArray(p.gallery) && p.gallery.length > 0 && p.gallery[0]) || p.imageEmoji || null;
            return {
              _id: p._id,
              name: p.displayName || p.name,
              price: p.price,
              oldPrice: p.oldPrice || null,
              discount: p.discount || null,
              discountPrice: p.price,
              slug: p.slug,
              image: img,
              shopName: p.shop?.name || 'GearTech'
            };
          });

          return {
            success: true,
            reply: step2Result.replyContent,
            thinking: step2Result.thinkingContent,
            suggestedProducts
          };
        }
      } else if (step1Result.replyContent && step1Result.replyContent.length > 0) {
        // AI trả lời trực tiếp cho các câu chào hỏi xã giao
        return {
          success: true,
          reply: step1Result.replyContent,
          thinking: step1Result.thinkingContent,
          suggestedProducts: []
        };
      }
    } catch (agentError) {
      console.warn('AI Tool Calling gặp sự cố, tự động chuyển về chế độ RAG dự phòng:', agentError.message);
    }
  }

  // 2. CHẾ ĐỘ DỰ PHÒNG (FALLBACK RAG): Nếu Ollama không khả dụng hoặc lỗi
  const priceRange = extractPriceRange(lastUserMsg);
  const activeProducts = await getActiveProducts();

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

  const fallbackReply = generateFallbackReply({
    exactMatches,
    alternativeMatches,
    maxPrice: priceRange.maxPrice
  });

  const suggestedProducts = extractSuggestedProducts({
    replyContent: fallbackReply,
    exactMatches,
    alternativeMatches,
    activeProducts
  });

  return {
    success: true,
    reply: fallbackReply,
    thinking: null,
    suggestedProducts
  };
}

module.exports = {
  checkOllamaStatus: checkStatus,
  processChatConsultation
};

