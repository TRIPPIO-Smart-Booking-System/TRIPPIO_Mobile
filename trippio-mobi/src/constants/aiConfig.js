// AI Configuration constants
export const AI_CONFIG = {
  // Google Gemini API
  GEMINI_API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  GEMINI_MODEL: 'gemini-pro',
  
  // Chat settings
  MAX_MESSAGE_LENGTH: 1000,
  MAX_CONVERSATION_HISTORY: 20,
  
  // AI Personality
  AI_NAME: 'Trippio Assistant',
  AI_AVATAR: 'https://via.placeholder.com/40/2196F3/FFFFFF?text=AI',
  
  // System prompts
  SYSTEM_PROMPTS: {
    TRAVEL_ASSISTANT: `Bạn là Trippio Assistant, một trợ lý du lịch thông minh và thân thiện. 
    Bạn giúp người dùng tìm hiểu về du lịch, khách sạn, phương tiện di chuyển, và các hoạt động giải trí.
    Hãy trả lời một cách nhiệt tình, hữu ích và chính xác về thông tin du lịch.`,
    
    GENERAL: `Bạn là Trippio Assistant. Hãy trả lời câu hỏi của người dùng một cách hữu ích và thân thiện.`
  },
  
  // Error messages
  ERROR_MESSAGES: {
    API_ERROR: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
    NETWORK_ERROR: 'Không thể kết nối. Vui lòng kiểm tra internet và thử lại.',
    RATE_LIMIT: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng chờ một chút.',
    INVALID_INPUT: 'Tin nhắn của bạn quá dài hoặc không hợp lệ.',
  }
};

export default AI_CONFIG;
