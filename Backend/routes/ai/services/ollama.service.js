const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b';

/**
 * Kiểm tra trạng thái hoạt động của Ollama service
 */
async function checkStatus() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: controller.signal });

    if (!response.ok) {
      return {
        available: false,
        message: 'Ollama service đang không phản hồi.',
        currentModel: DEFAULT_MODEL
      };
    }

    const data = await response.json();
    const hasModel = data.models?.some(m => m.name.includes(DEFAULT_MODEL) || m.model?.includes(DEFAULT_MODEL));

    return {
      available: true,
      currentModel: DEFAULT_MODEL,
      modelReady: hasModel,
      availableModels: data.models?.map(m => m.name) || []
    };
  } catch (error) {
    return {
      available: false,
      message: 'Ollama service tạm thời chưa kết nối, hệ thống tự động sử dụng bộ tư vấn nội bộ GearTech AI.',
      ...(process.env.NODE_ENV !== 'production' && { error: error.message }),
      currentModel: DEFAULT_MODEL
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Gửi tin nhắn đến Ollama để nhận phản hồi tư vấn
 */
async function chat({ messages, systemPrompt, timeoutMs = 6000 }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const ollamaRes = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-4)
        ],
        stream: false,
        options: {
          temperature: 0.1,
          num_predict: 220
        }
      })
    });

    if (!ollamaRes.ok) {
      return { replyContent: '', thinkingContent: null };
    }

    const ollamaData = await ollamaRes.json();
    let replyContent = ollamaData.message?.content?.trim() || '';
    let thinkingContent = ollamaData.message?.thinking || null;

    if (!replyContent && thinkingContent) {
      const lines = thinkingContent.split('\n').map(l => l.trim()).filter(Boolean);
      replyContent = lines.slice(-2).join('\n');
    }

    return { replyContent, thinkingContent };
  } catch (error) {
    console.warn('Ollama không phản hồi hoặc timeout, chuyển sang bộ tư vấn thông minh nội bộ:', error.message);
    return { replyContent: '', thinkingContent: null };
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  OLLAMA_HOST,
  DEFAULT_MODEL,
  checkStatus,
  chat
};

