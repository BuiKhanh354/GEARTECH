const express = require('express');
const router = express.Router();

const aiController = require('./ai.controller');
const { validateChatInput } = require('./validators/ai.validator');

// 1. Kiểm tra trạng thái Ollama
router.get('/status', aiController.getStatus);

// 2. Chat tư vấn sản phẩm thông minh (RAG)
router.post('/chat', validateChatInput, aiController.chat);

module.exports = router;

