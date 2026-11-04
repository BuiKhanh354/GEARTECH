/**
 * Middleware kiểm tra hợp lệ dữ liệu đầu vào cho API Chat AI
 */
function validateChatInput(req, res, next) {
  const { messages = [] } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Danh sách tin nhắn không được rỗng.' });
  }

  next();
}

module.exports = {
  validateChatInput
};

