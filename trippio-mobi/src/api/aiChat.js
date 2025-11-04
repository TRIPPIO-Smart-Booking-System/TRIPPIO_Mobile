import { client } from './client';
import { AI_CONFIG } from '../constants/aiConfig';

// AI Chat API functions using Trippio backend
export const aiChatApi = {
  // Send message to AI via backend
  sendMessage: async (message, conversationHistory = [], systemPrompt = null) => {
    try {
      // Validate message length
      if (!message || message.trim().length === 0) {
        throw new Error('Tin nhắn không được để trống');
      }

      if (message.length > AI_CONFIG.MAX_MESSAGE_LENGTH) {
        throw new Error(AI_CONFIG.ERROR_MESSAGES.INVALID_INPUT);
      }

      // Prepare request payload
      const requestPayload = {
        message: message.trim(),
        conversationHistory: conversationHistory.slice(-AI_CONFIG.MAX_CONVERSATION_HISTORY),
        systemPrompt: systemPrompt || AI_CONFIG.SYSTEM_PROMPTS.TRAVEL_ASSISTANT,
      };

      // Call backend AI endpoint
      const response = await client.post(AI_CONFIG.API_ENDPOINTS.CHAT, requestPayload);

      // Handle response
      if (response.data && response.data.success !== false) {
        const aiResponse = response.data.message || response.data.response || response.data.text;
        
        if (!aiResponse) {
          throw new Error('Không nhận được phản hồi từ AI');
        }

        return {
          success: true,
          message: aiResponse.trim(),
          timestamp: new Date().toISOString(),
          data: response.data,
        };
      } else {
        throw new Error(response.data?.error || response.data?.message || AI_CONFIG.ERROR_MESSAGES.API_ERROR);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      
      // Handle specific error cases
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        
        switch (status) {
          case 400:
            return {
              success: false,
              error: errorData?.message || errorData?.error || AI_CONFIG.ERROR_MESSAGES.INVALID_INPUT,
              timestamp: new Date().toISOString(),
            };
          case 401:
            return {
              success: false,
              error: 'Bạn cần đăng nhập để sử dụng AI Assistant',
              timestamp: new Date().toISOString(),
            };
          case 403:
            return {
              success: false,
              error: 'Bạn không có quyền sử dụng tính năng này',
              timestamp: new Date().toISOString(),
            };
          case 429:
            return {
              success: false,
              error: AI_CONFIG.ERROR_MESSAGES.RATE_LIMIT,
              timestamp: new Date().toISOString(),
            };
          case 500:
          case 502:
          case 503:
            return {
              success: false,
              error: AI_CONFIG.ERROR_MESSAGES.API_ERROR,
              timestamp: new Date().toISOString(),
            };
          default:
            return {
              success: false,
              error: errorData?.message || errorData?.error || AI_CONFIG.ERROR_MESSAGES.API_ERROR,
              timestamp: new Date().toISOString(),
            };
        }
      } else if (error.request) {
        // Network error
        return {
          success: false,
          error: AI_CONFIG.ERROR_MESSAGES.NETWORK_ERROR,
          timestamp: new Date().toISOString(),
        };
      } else {
        // Other error
        return {
          success: false,
          error: error.message || AI_CONFIG.ERROR_MESSAGES.API_ERROR,
          timestamp: new Date().toISOString(),
        };
      }
    }
  },

  // Get AI suggestions based on context
  getSuggestions: async (context = '') => {
    try {
      const response = await client.get(AI_CONFIG.API_ENDPOINTS.SUGGESTIONS, {
        params: { context: context || '' }
      });

      if (response.data && response.data.success !== false) {
        return response.data.suggestions || response.data.data || [];
      }

      // Fallback suggestions
      return [
        'Tôi có thể giúp gì cho chuyến du lịch của bạn?',
        'Bạn muốn tìm khách sạn ở đâu?',
        'Bạn cần phương tiện di chuyển gì?',
        'Bạn quan tâm đến hoạt động giải trí nào?',
        'Bạn có câu hỏi gì về đặt phòng không?'
      ];
    } catch (error) {
      console.error('Get suggestions error:', error);
      // Return fallback suggestions
      return [
        'Tôi có thể giúp gì cho chuyến du lịch của bạn?',
        'Bạn muốn tìm khách sạn ở đâu?',
        'Bạn cần phương tiện di chuyển gì?',
      ];
    }
  },

  // Check if AI API is available
  checkApiStatus: async () => {
    try {
      const response = await client.get(AI_CONFIG.API_ENDPOINTS.STATUS);
      
      if (response.data) {
        return {
          success: true,
          available: response.data.available !== false,
          message: response.data.message,
          model: response.data.model || 'AI Assistant',
        };
      }

      return {
        success: true,
        available: true,
        model: 'AI Assistant',
      };
    } catch (error) {
      console.error('Check API status error:', error);
      
      // If endpoint doesn't exist, assume it's available but might need auth
      if (error.response?.status === 404) {
        return {
          success: true,
          available: true,
          message: 'AI endpoint không tìm thấy, sẽ thử khi gửi tin nhắn',
        };
      }

      return {
        success: false,
        available: false,
        error: error.message || 'Không thể kiểm tra trạng thái API',
      };
    }
  },

  // Get conversation history (if backend supports it)
  getConversationHistory: async (conversationId = null) => {
    try {
      const endpoint = conversationId 
        ? `${AI_CONFIG.API_ENDPOINTS.CONVERSATIONS}/${conversationId}`
        : AI_CONFIG.API_ENDPOINTS.CONVERSATION_CURRENT;
      
      const response = await client.get(endpoint);
      
      if (response.data && response.data.success !== false) {
        return {
          success: true,
          history: response.data.history || response.data.messages || [],
          conversationId: response.data.conversationId,
        };
      }

      return {
        success: false,
        history: [],
      };
    } catch (error) {
      console.error('Get conversation history error:', error);
      return {
        success: false,
        history: [],
      };
    }
  },

  // Clear conversation history (if backend supports it)
  clearConversation: async (conversationId = null) => {
    try {
      const endpoint = conversationId 
        ? `${AI_CONFIG.API_ENDPOINTS.CONVERSATIONS}/${conversationId}`
        : AI_CONFIG.API_ENDPOINTS.CONVERSATION_CURRENT;
      
      await client.delete(endpoint);
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('Clear conversation error:', error);
      // Don't throw error if endpoint doesn't exist
      return {
        success: true, // Assume success even if endpoint doesn't exist
      };
    }
  },
};

export default aiChatApi;
