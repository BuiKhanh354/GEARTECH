import apiClient from '../api/client';

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface SuggestedProduct {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  slug?: string;
  image?: string;
}

export interface AIChatResponse {
  success: boolean;
  reply: string;
  thinking?: string | null;
  suggestedProducts?: SuggestedProduct[];
  error?: string;
}

export interface AIStatusResponse {
  available: boolean;
  currentModel?: string;
  modelReady?: boolean;
  availableModels?: string[];
  message?: string;
}

export const aiService = {
  // Kiểm tra tình trạng kết nối tới Ollama
  async getStatus(): Promise<AIStatusResponse> {
    try {
      const response = await apiClient.get<AIStatusResponse>('/ai/status');
      return response.data;
    } catch (error: any) {
      return {
        available: false,
        message: error.response?.data?.message || 'Không thể kết nối đến Trợ lý AI'
      };
    }
  },

  // Gửi tin nhắn chat tới Ollama Qwen3
  async chat(messages: AIChatMessage[], productId?: string): Promise<AIChatResponse> {
    try {
      const response = await apiClient.post<AIChatResponse>('/ai/chat', {
        messages,
        productId
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        reply: error.response?.data?.details || 'Hệ thống AI hiện đang bận hoặc đang khởi động. Bạn vui lòng thử lại sau ít giây nhé!',
        suggestedProducts: []
      };
    }
  }
};

export default aiService;
