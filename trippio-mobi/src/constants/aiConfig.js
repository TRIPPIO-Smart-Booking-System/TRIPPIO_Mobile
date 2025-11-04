// AI Configuration constants
export const AI_CONFIG = {
  // Backend API endpoints (will use Trippio backend)
  API_ENDPOINTS: {
    CHAT: '/api/ai/chat',
    SUGGESTIONS: '/api/ai/suggestions',
    STATUS: '/api/ai/status',
    CONVERSATIONS: '/api/ai/conversations',
    CONVERSATION_CURRENT: '/api/ai/conversations/current',
  },
  
  // Chat settings
  MAX_MESSAGE_LENGTH: 2000, // Increased for better UX
  MAX_CONVERSATION_HISTORY: 30, // Increased for better context
  
  // AI Personality
  AI_NAME: 'Trippio Assistant',
  AI_AVATAR: 'https://via.placeholder.com/40/6366F1/FFFFFF?text=AI',
  
  // System prompts
  SYSTEM_PROMPTS: {
    TRAVEL_ASSISTANT: `Bạn là Trippio Assistant, một trợ lý du lịch thông minh và thân thiện. 
Bạn giúp người dùng tìm hiểu về du lịch, khách sạn, phương tiện di chuyển, và các hoạt động giải trí.
Hãy trả lời một cách nhiệt tình, hữu ích và chính xác về thông tin du lịch.
Khi người dùng hỏi về khách sạn, hãy gợi ý họ tìm trong app.
Khi người dùng hỏi về phương tiện, hãy gợi ý họ xem phần Transport.
Khi người dùng hỏi về giải trí, hãy gợi ý họ xem phần Shows & Events.`,
    
    GENERAL: `Bạn là Trippio Assistant. Hãy trả lời câu hỏi của người dùng một cách hữu ích và thân thiện về dịch vụ du lịch của Trippio.`
  },
  
  // Error messages
  ERROR_MESSAGES: {
    API_ERROR: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
    NETWORK_ERROR: 'Không thể kết nối. Vui lòng kiểm tra internet và thử lại.',
    RATE_LIMIT: 'Bạn đã gửi quá nhiều tin nhắn. Vui lòng chờ một chút.',
    INVALID_INPUT: 'Tin nhắn của bạn quá dài hoặc không hợp lệ.',
    UNAUTHORIZED: 'Bạn cần đăng nhập để sử dụng AI Assistant.',
    FORBIDDEN: 'Bạn không có quyền sử dụng tính năng này.',
  }
};

export default AI_CONFIG;
