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
 * Gửi tin nhắn đến Ollama để nhận phản hồi tư vấn (hỗ trợ Tool Calling / Function Calling)
 */
async function chat({ messages, systemPrompt, tools = null, timeoutMs = 25000, options = null }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const formattedMessages = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const requestPayload = {
      model: DEFAULT_MODEL,
      messages: formattedMessages,
      stream: false,
      options: options || {
        temperature: 0.1,
        num_predict: 350
      }
    };

    if (tools && Array.isArray(tools) && tools.length > 0) {
      requestPayload.tools = tools;
    }

    const ollamaRes = await fetch(`${OLLAMA_HOST}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify(requestPayload)
    });

    if (!ollamaRes.ok) {
      return { replyContent: '', thinkingContent: null, toolCalls: null, rawMessage: null };
    }

    const ollamaData = await ollamaRes.json();
    const message = ollamaData.message || {};
    let replyContent = message.content?.trim() || '';
    let thinkingContent = message.thinking || null;
    const toolCalls = message.tool_calls || null;

    if (!replyContent && thinkingContent && (!toolCalls || toolCalls.length === 0)) {
      const lines = thinkingContent.split('\n').map(l => l.trim()).filter(Boolean);
      replyContent = lines.slice(-2).join('\n');
    }

    return { 
      replyContent, 
      thinkingContent, 
      toolCalls,
      rawMessage: message 
    };
  } catch (error) {
    console.warn('Ollama không phản hồi hoặc timeout:', error.message);
    return { replyContent: '', thinkingContent: null, toolCalls: null, rawMessage: null };
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

