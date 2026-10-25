const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b';

// 1. Kiểm tra trạng thái Ollama
router.get('/status', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(502).json({
        available: false,
        message: 'Ollama service đang không phản hồi.'
      });
    }

    const data = await response.json();
    const hasModel = data.models?.some(m => m.name.includes(DEFAULT_MODEL) || m.model.includes(DEFAULT_MODEL));

    return res.json({
      available: true,
      currentModel: DEFAULT_MODEL,
      modelReady: hasModel,
      availableModels: data.models?.map(m => m.name) || []
    });
  } catch (error) {
    return res.json({
      available: false,
      message: 'Không thể kết nối tới Ollama trên cổng 11434. Vui lòng bật ứng dụng Ollama.',
      error: error.message
    });
  }
});

// 2. Chat tư vấn sản phẩm thông minh (RAG)
router.post('/chat', async (req, res) => {
  try {
    const { messages = [], productId = null } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Danh sách tin nhắn không được rỗng.' });
    }

    // Lấy toàn bộ sản phẩm thực tế đang active trên sàn GEAR TECH
    let productCatalogText = '';
    let products = [];
    try {
      products = await Product.find({ status: 'active' })
        .select('name price discountPrice category brand slug description stock')
        .populate('category', 'name')
        .lean();

      // Sắp xếp ưu tiên các sản phẩm khớp với câu hỏi của khách hàng
      const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content?.toLowerCase() || '';
      
      const prioritizedProducts = [...products].sort((a, b) => {
        const aMatch = lastUserMsg.includes(a.name.toLowerCase()) || 
                       (a.category?.name && lastUserMsg.includes(a.category.name.toLowerCase()));
        const bMatch = lastUserMsg.includes(b.name.toLowerCase()) || 
                       (b.category?.name && lastUserMsg.includes(b.category.name.toLowerCase()));
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });

      if (prioritizedProducts.length > 0) {
        productCatalogText = prioritizedProducts.map((p, index) => {
          const priceStr = new Intl.NumberFormat('vi-VN').format(p.price);
          const discountStr = p.discountPrice ? ` (Giá KM: ${new Intl.NumberFormat('vi-VN').format(p.discountPrice)}₫)` : '';
          const catName = p.category?.name || 'Thiết bị Gear';
          return `- [${p.name}] | Giá: ${priceStr}₫${discountStr} | Danh mục: ${catName} | Còn: ${p.stock} cái | Slug: ${p.slug}`;
        }).join('\n');
      }
    } catch (dbErr) {
      console.warn('Không thể truy vấn danh sách sản phẩm từ DB:', dbErr.message);
    }

    // Nếu người dùng đang đứng ở một trang sản phẩm cụ thể, lấy thêm thông tin chi tiết
    let currentProductInfo = '';
    if (productId) {
      try {
        const currentP = await Product.findById(productId).populate('category', 'name').lean();
        if (currentP) {
          currentProductInfo = `\nKHÁCH HÀNG ĐANG XEM TRỰC TIẾP SẢN PHẨM NÀY:\n- Tên: ${currentP.name}\n- Giá: ${new Intl.NumberFormat('vi-VN').format(currentP.price)}₫\n- Mô tả: ${currentP.description || 'Chất lượng cao'}\n- Tồn kho: ${currentP.stock} cái\n`;
        }
      } catch (e) {}
    }

    // Xây dựng System Prompt với nguyên tắc chống bịa đặt (Zero Hallucination)
    const systemPrompt = `Bạn là "GearTech AI" - Chuyên gia tư vấn thiết bị công nghệ & Gaming Gear của sàn thương mại điện tử GEAR TECH.
Nhiệm vụ của bạn là tư vấn đúng nhu cầu mua sắm và cung cấp thông số kỹ thuật cho khách hàng.

${currentProductInfo}

DANH SÁCH TẤT CẢ SẢN PHẨM THỰC TẾ ĐANG BÁN TRÊN SÀN GEAR TECH:
${productCatalogText || 'Hiện tại sàn đang có nhiều sản phẩm chính hãng.'}

QUY TẮC BẮT BUỘC (TUYỆT ĐỐI KHÔNG BỊA ĐẶT THÔNG TIN):
1. BẠN CHỈ ĐƯỢC PHÉP gợi ý các sản phẩm CÓ TÊN CHÍNH XÁC trong danh sách "DANH SÁCH TẤT CẢ SẢN PHẨM THỰC TẾ ĐANG BÁN TRÊN SÀN GEAR TECH" ở trên.
2. TUYỆT ĐỐI KHÔNG TỰ BỊA RA TÊN BẤT KỲ SẢN PHẨM NÀO KHÁC (như Akko, Razer, Logitech, Corsair, Microsoft...) nếu tên đó không nằm trong danh sách trên!
3. Luôn trích dẫn chính xác Tên sản phẩm trong ngoặc vuông và Giá tiền theo danh sách.
4. Nếu khách hàng hỏi một món đồ mà trong danh sách trên KHÔNG CÓ (ví dụ khách tìm "bàn phím dưới 1 triệu" nhưng sàn chỉ có mẫu 12.990.000₫), HÃY THÀNH THẬT BÁO:
   "Hiện tại sàn GearTech chỉ có mẫu [Tên sản phẩm] giá [Giá tiền], chưa có mẫu [loại khách tìm] bạn nhé."
5. BẮT BUỘC TRẢ LỜI 100% BẰNG TIẾNG VIỆT, đi thẳng vào câu trả lời, ngắn gọn từ 2 - 4 câu.`;

    const chatPayloadMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-4) // Lấy 4 tin nhắn gần nhất để giữ tốc độ nhanh
    ];

    // Gọi Ollama Chat API
    const ollamaRes = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: chatPayloadMessages,
        stream: false,
        options: {
          temperature: 0.3, // Nhiệt độ thấp giúp AI trả lời chính xác dữ liệu thật, không sáng tạo bịa đặt
          top_p: 0.8,
          num_predict: 250 // Giới hạn 250 tokens giúp phản hồi siêu nhanh trong 1-3 giây ngay cả trên máy yếu
        }
      })
    });

    if (!ollamaRes.ok) {
      const errText = await ollamaRes.text();
      return res.status(502).json({
        error: 'Lỗi từ Ollama Service',
        details: errText
      });
    }

    const ollamaData = await ollamaRes.json();
    let replyContent = ollamaData.message?.content?.trim();
    const thinkingContent = ollamaData.message?.thinking || null;

    // Nếu content rỗng do đang suy nghĩ dở, trích xuất các dòng tiếng Việt trong thinking
    if (!replyContent && thinkingContent) {
      const vietnameseLines = thinkingContent.split('\n')
        .map(l => l.trim())
        .filter(l => /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(l));
      
      if (vietnameseLines.length > 0) {
        replyContent = vietnameseLines.join('\n');
      } else {
        const lines = thinkingContent.split('\n').filter(l => l.trim().length > 0);
        replyContent = lines.slice(-2).join('\n');
      }
    }

    if (!replyContent) {
      replyContent = 'Chào bạn! Tôi là GearTech AI. Bạn đang quan tâm đến bàn phím cơ, chuột gaming hay linh kiện nào?';
    }

    // Tìm kiếm các sản phẩm được nhắc đến trong câu trả lời để gửi kèm cho giao diện hiển thị Mini Card
    const suggestedProducts = products.filter(p => {
      const pNameLower = p.name.toLowerCase();
      return replyContent.toLowerCase().includes(pNameLower) ||
             (p.slug && replyContent.includes(p.slug));
    }).slice(0, 3);

    return res.json({
      success: true,
      reply: replyContent,
      thinking: thinkingContent,
      suggestedProducts: suggestedProducts.map(p => ({
        _id: p._id,
        name: p.name,
        price: p.price,
        discountPrice: p.discountPrice,
        slug: p.slug,
        image: p.images?.[0] || null
      }))
    });

  } catch (error) {
    console.error('Lỗi khi gọi AI Chat:', error);
    return res.status(500).json({
      error: 'Không thể kết nối đến Trợ lý AI.',
      details: error.message
    });
  }
});

module.exports = router;
