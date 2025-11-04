import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { GiftedChat, Bubble, InputToolbar, Send, SystemMessage } from 'react-native-gifted-chat';
import { Ionicons } from '@expo/vector-icons';
import { aiChatApi } from '../../api/aiChat';
import { AI_CONFIG } from '../../constants/aiConfig';
import { Colors } from '../../constants/colors';

const AIChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    // Initialize chat with welcome message
    initializeChat();
    checkApiStatus();
  }, []);

  const initializeChat = () => {
    const welcomeMessage = {
      _id: 1,
      text: `Xin chào! Tôi là ${AI_CONFIG.AI_NAME}. Tôi có thể giúp bạn tìm hiểu về du lịch, khách sạn, phương tiện di chuyển và các hoạt động giải trí. Bạn cần hỗ trợ gì?`,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: AI_CONFIG.AI_NAME,
        avatar: AI_CONFIG.AI_AVATAR,
      },
    };
    setMessages([welcomeMessage]);
  };

  const checkApiStatus = async () => {
    const status = await aiChatApi.checkApiStatus();
    setApiStatus(status);
    
    if (!status.available) {
      Alert.alert(
        'Lỗi kết nối',
        'Không thể kết nối đến AI Assistant. Vui lòng kiểm tra kết nối mạng và thử lại.',
        [{ text: 'OK' }]
      );
    }
  };

  const onSend = useCallback(async (newMessages = []) => {
    if (newMessages.length === 0) return;

    const userMessage = newMessages[0];
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Prepare conversation history for AI
      const conversationHistory = messages
        .filter(msg => msg.user._id !== 2) // Filter out AI messages
        .map(msg => ({
          text: msg.text,
          user: msg.user._id === 1, // true for user, false for AI
        }));

      // Send message to AI
      const response = await aiChatApi.sendMessage(
        userMessage.text,
        conversationHistory
      );

      if (response.success) {
        const aiMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: response.message,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: AI_CONFIG.AI_NAME,
            avatar: AI_CONFIG.AI_AVATAR,
          },
        };

        setMessages(previousMessages => 
          GiftedChat.append(previousMessages, [aiMessage])
        );
      } else {
        // Show error message
        const errorMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: response.error || AI_CONFIG.ERROR_MESSAGES.API_ERROR,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: AI_CONFIG.AI_NAME,
            avatar: AI_CONFIG.AI_AVATAR,
          },
          system: true,
        };

        setMessages(previousMessages => 
          GiftedChat.append(previousMessages, [errorMessage])
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: AI_CONFIG.ERROR_MESSAGES.API_ERROR,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: AI_CONFIG.AI_NAME,
          avatar: AI_CONFIG.AI_AVATAR,
        },
        system: true,
      };

      setMessages(previousMessages => 
        GiftedChat.append(previousMessages, [errorMessage])
      );
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  }, [messages]);

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: Colors.primary,
            marginVertical: 2,
          },
          left: {
            backgroundColor: Colors.surface,
            marginVertical: 2,
          },
        }}
        textStyle={{
          right: {
            color: Colors.textWhite,
          },
          left: {
            color: Colors.textPrimary,
          },
        }}
        timeTextStyle={{
          right: {
            color: Colors.textWhite,
            opacity: 0.7,
          },
          left: {
            color: Colors.textSecondary,
          },
        }}
      />
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={styles.inputToolbar}
        textInputStyle={styles.textInput}
        placeholder="Nhập tin nhắn..."
        placeholderTextColor={Colors.textHint}
      />
    );
  };

  const renderSend = (props) => {
    return (
      <Send {...props} containerStyle={styles.sendButton}>
        <View style={styles.sendButtonContent}>
          <Ionicons 
            name="send" 
            size={20} 
            color={isLoading ? Colors.textHint : Colors.primary} 
          />
        </View>
      </Send>
    );
  };

  const renderSystemMessage = (props) => {
    return (
      <SystemMessage
        {...props}
        containerStyle={styles.systemMessage}
        textStyle={styles.systemMessageText}
      />
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={styles.typingIndicator}>
        <ActivityIndicator size="small" color={Colors.primary} />
        <Text style={styles.typingText}>AI đang trả lời...</Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.textWhite} />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle}>{AI_CONFIG.AI_NAME}</Text>
        <Text style={styles.headerSubtitle}>
          {apiStatus?.available ? 'Đang hoạt động' : 'Không kết nối được'}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => {
          Alert.alert(
            'Menu',
            'Chọn hành động',
            [
              { text: 'Xóa cuộc trò chuyện', onPress: initializeChat },
              { text: 'Kiểm tra kết nối', onPress: checkApiStatus },
              { text: 'Hủy', style: 'cancel' },
            ]
          );
        }}
      >
        <Ionicons name="ellipsis-vertical" size={24} color={Colors.textWhite} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      {renderHeader()}
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{
          _id: 1,
          name: 'Bạn',
        }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        renderSend={renderSend}
        renderSystemMessage={renderSystemMessage}
        renderTypingIndicator={renderTypingIndicator}
        placeholder="Nhập tin nhắn..."
        alwaysShowSend
        scrollToBottom
        infiniteScroll
        maxComposerHeight={100}
        minInputToolbarHeight={60}
        listViewProps={{
          keyboardShouldPersistTaps: 'handled',
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textWhite,
    opacity: 0.8,
  },
  menuButton: {
    padding: 8,
  },
  inputToolbar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  textInput: {
    fontSize: 16,
    color: Colors.textPrimary,
    backgroundColor: Colors.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 80,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  sendButtonContent: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  systemMessage: {
    backgroundColor: Colors.warning,
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
  },
  systemMessageText: {
    color: Colors.textWhite,
    fontSize: 14,
    textAlign: 'center',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingText: {
    marginLeft: 8,
    color: Colors.textSecondary,
    fontSize: 14,
  },
});

export default AIChatScreen;
