const { getDevelopmentErrorDetails } = require('../../utils/errorDetails')
const aiChatService = require('./services/aiChat.service');

/**
 * Controller kiểm tra trạng thái hoạt động của hệ thống AI / Ollama
 * GET /api/ai/status
 */
async function getStatus(req, res) {
  try {
    const statusData = await aiChatService.checkOllamaStatus();
    return res.json(statusData);
  } catch (error) {
    return res.json({
      available: false,
      message: 'Ollama service tạm thời chưa kết nối, hệ thống tự động sử dụng bộ tư vấn nội bộ GearTech AI.',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message }),
      currentModel: process.env.OLLAMA_MODEL || 'qwen2.5:1.5b'
    });
  }
}

/**
 * Controller nhận câu hỏi và trả về nội dung tư vấn kèm sản phẩm gợi ý
 * POST /api/ai/chat
 */
async function chat(req, res) {
  try {
    const { messages = [], productId = null } = req.body;
    const result = await aiChatService.processChatConsultation({ messages, productId });
    return res.json(result);
  } catch (error) {
    console.error('Lỗi khi gọi AI Chat Controller:', error);
    return res.status(500).json({
      error: 'Không thể kết nối đến Trợ lý AI.',
      ...getDevelopmentErrorDetails(error)
    });
  }
}

module.exports = {
  getStatus,
  chat
};

