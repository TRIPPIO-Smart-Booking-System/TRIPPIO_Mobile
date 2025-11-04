import axios from 'axios';
import { AI_CONFIG } from '../constants/aiConfig';

// Create axios instance for AI API
const aiApiClient = axios.create({
  baseURL: AI_CONFIG.GEMINI_API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add API key
aiApiClient.interceptors.request.use(
  (config) => {
    // Get API key from environment or constants
    const apiKey = process.env.GOOGLE_AI_API_KEY || 'YOUR_API_KEY_HERE';
    config.params = {
      ...config.params,
      key: apiKey,
    };
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
aiApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('AI API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      switch (status) {
        case 400:
          throw new Error(AI_CONFIG.ERROR_MESSAGES.INVALID_INPUT);
        case 429:
          throw new Error(AI_CONFIG.ERROR_MESSAGES.RATE_LIMIT);
        case 500:
        case 502:
        case 503:
          throw new Error(AI_CONFIG.ERROR_MESSAGES.API_ERROR);
        default:
          throw new Error(AI_CONFIG.ERROR_MESSAGES.API_ERROR);
      }
    } else if (error.request) {
      // Network error
      throw new Error(AI_CONFIG.ERROR_MESSAGES.NETWORK_ERROR);
    } else {
      // Other error
      throw new Error(AI_CONFIG.ERROR_MESSAGES.API_ERROR);
    }
  }
);

// AI Chat API functions
export const aiChatApi = {
  // Send message to AI
  sendMessage: async (message, conversationHistory = [], systemPrompt = AI_CONFIG.SYSTEM_PROMPTS.TRAVEL_ASSISTANT) => {
    try {
      // Validate message length
      if (message.length > AI_CONFIG.MAX_MESSAGE_LENGTH) {
        throw new Error(AI_CONFIG.ERROR_MESSAGES.INVALID_INPUT);
      }

      // Prepare conversation context
      const contents = [];
      
      // Add system prompt as first message
      contents.push({
        role: 'user',
        parts: [{ text: systemPrompt }]
      });
      
      contents.push({
        role: 'model',
        parts: [{ text: 'Tôi hiểu. Tôi sẽ giúp bạn với các câu hỏi về du lịch và dịch vụ của Trippio.' }]
      });

      // Add conversation history (limit to max history)
      const limitedHistory = conversationHistory.slice(-AI_CONFIG.MAX_CONVERSATION_HISTORY);
      limitedHistory.forEach(msg => {
        contents.push({
          role: msg.user ? 'user' : 'model',
          parts: [{ text: msg.text }]
        });
      });

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await aiApiClient.post(
        `/models/${AI_CONFIG.GEMINI_MODEL}:generateContent`,
        {
          contents: contents,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }
      );

      // Extract AI response
      const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!aiResponse) {
        throw new Error(AI_CONFIG.ERROR_MESSAGES.API_ERROR);
      }

      return {
        success: true,
        message: aiResponse.trim(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('AI Chat Error:', error);
      return {
        success: false,
        error: error.message || AI_CONFIG.ERROR_MESSAGES.API_ERROR,
        timestamp: new Date().toISOString(),
      };
    }
  },

  // Get AI suggestions based on context
  getSuggestions: async (context = '') => {
    try {
      const suggestions = [
        'Tôi có thể giúp gì cho chuyến du lịch của bạn?',
        'Bạn muốn tìm khách sạn ở đâu?',
        'Bạn cần phương tiện di chuyển gì?',
        'Bạn quan tâm đến hoạt động giải trí nào?',
        'Bạn có câu hỏi gì về đặt phòng không?'
      ];

      // Filter suggestions based on context if provided
      if (context.toLowerCase().includes('khách sạn')) {
        return suggestions.filter(s => s.includes('khách sạn'));
      } else if (context.toLowerCase().includes('phương tiện')) {
        return suggestions.filter(s => s.includes('phương tiện'));
      } else if (context.toLowerCase().includes('giải trí')) {
        return suggestions.filter(s => s.includes('giải trí'));
      }

      return suggestions.slice(0, 3); // Return first 3 suggestions
    } catch (error) {
      console.error('Get suggestions error:', error);
      return [];
    }
  },

  // Check if API is available
  checkApiStatus: async () => {
    try {
      const response = await aiApiClient.get(`/models/${AI_CONFIG.GEMINI_MODEL}`);
      return {
        success: true,
        available: true,
        model: response.data?.name || AI_CONFIG.GEMINI_MODEL,
      };
    } catch (error) {
      return {
        success: false,
        available: false,
        error: error.message,
      };
    }
  },
};

export default aiChatApi;
