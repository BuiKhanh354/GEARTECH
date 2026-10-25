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

    // Lấy tối đa 15 sản phẩm thực tế đang active trên sàn GEAR TECH để làm ngữ cảnh
    let productCatalogText = '';
    let products = [];
    try {
      products = await Product.find({ status: 'active' })
        .select('name price discountPrice category brand slug description stock')
        .populate('category', 'name')
        .limit(15)
        .lean();

      if (products.length > 0) {
        productCatalogText = products.map((p, index) => {
          const priceStr = new Intl.NumberFormat('vi-VN').format(p.price);
          const discountStr = p.discountPrice ? ` (Khuyến mãi: ${new Intl.NumberFormat('vi-VN').format(p.discountPrice)}₫)` : '';
          const catName = p.category?.name || 'Công nghệ';
          return `${index + 1}. [${p.name}] - Giá: ${priceStr}₫${discountStr} | Danh mục: ${catName} | Còn: ${p.stock} cái | Slug: ${p.slug}`;
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
          currentProductInfo = `\nKHÁCH HÀNG ĐANG XEM SẢN PHẨM NÀY:\n- Tên: ${currentP.name}\n- Giá: ${new Intl.NumberFormat('vi-VN').format(currentP.price)}₫\n- Mô tả: ${currentP.description || 'Chất lượng cao'}\n- Tồn kho: ${currentP.stock} cái\n`;
        }
      } catch (e) {}
    }

    // Xây dựng System Prompt chuyên nghiệp
    const systemPrompt = `Bạn là "GearTech AI" - Chuyên gia tư vấn thiết bị công nghệ & Gaming Gear hàng đầu của sàn thương mại điện tử GEAR TECH.
Nhiệm vụ của bạn là giải đáp thắc mắc, tư vấn lựa chọn bàn phím cơ, chuột gaming, tai nghe, màn hình và linh kiện PC cho khách hàng.

PHONG CÁCH TƯ VẤN:
- BẮT BUỘC TRẢ LỜI 100% BẰNG TIẾNG VIỆT THÂN THIỆN, LỊCH SỰ, RÕ RÀNG.
- ĐI THẲNG VÀO CÂU TRẢ LỜI NGAY LẬP TỨC, KHÔNG VIẾT SUY NGHĨ TIẾNG ANH.
- Trình bày mạch lạc, dùng gạch đầu dòng rõ ràng, thêm emoji công nghệ (🖱️, ⌨️, 🎧, ⚡, 💻) để sinh động.
- Trả lời ngắn gọn 2 - 4 câu, đúng trọng tâm câu hỏi của khách hàng.

${currentProductInfo}

DANH SÁCH SẢN PHẨM ĐANG BÁN TRÊN SÀN GEAR TECH:
${productCatalogText || 'Hiện tại sàn đang có nhiều mẫu bàn phím cơ, chuột gaming, tai nghe và màn hình.'}

QUY TẮC BẮT BUỘC:
1. TRẢ LỜI BẰNG TIẾNG VIỆT. Khi khách hỏi mua sản phẩm theo tầm giá hoặc nhu cầu, HÃY GỢI Ý CÁC SẢN PHẨM TRÊN KÈM THEO GIÁ TIỀN CHÍNH XÁC.
2. Nếu khách hỏi kiến thức phần cứng (như switch bấm, polling rate, cảm biến quang học, tấm nền IPS...), hãy giải thích dễ hiểu.
3. Luôn sẵn sàng hướng dẫn khách thêm vào giỏ hàng hoặc xem chi tiết sản phẩm.`;

    const chatPayloadMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-6) // Lấy tối đa 6 tin nhắn gần nhất để giữ ngữ cảnh hội thoại
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
          temperature: 0.5,
          top_p: 0.9,
          num_predict: 1000
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
