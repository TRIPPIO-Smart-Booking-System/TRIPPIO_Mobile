import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Handle API errors with proper user feedback and navigation
 * @param {Error} error - The error object from API call
 * @param {Function} navigation - Navigation object (optional)
 * @param {Function} logoutCallback - Logout callback function (optional)
 * @returns {Object} - { shouldNavigate: boolean, message: string }
 */
export const handleApiError = async (error, navigation = null, logoutCallback = null) => {
  console.error('API Error:', error);

  // Check if it's a session expired error
  if (error.refreshFailed || error.code === 'SESSION_EXPIRED') {
    // Clear all storage
    try {
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);
    } catch (storageError) {
      console.error('Error clearing storage:', storageError);
    }

    // Call logout callback if provided
    if (logoutCallback) {
      try {
        await logoutCallback();
      } catch (logoutError) {
        console.error('Error during logout:', logoutError);
      }
    }

    // Show alert
    Alert.alert(
      'Phiên đăng nhập hết hạn',
      'Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại.',
      [
        {
          text: 'Đăng nhập',
          onPress: () => {
            if (navigation) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            }
          },
        },
      ]
    );

    return {
      shouldNavigate: true,
      message: 'Phiên đăng nhập đã hết hạn',
      isSessionExpired: true,
    };
  }

  // Handle 401 Unauthorized
  if (error.response?.status === 401) {
    const errorMessage = error.response?.data?.message || 'Không có quyền truy cập';
    
    Alert.alert('Lỗi xác thực', errorMessage);
    
    return {
      shouldNavigate: false,
      message: errorMessage,
      isUnauthorized: true,
    };
  }

  // Handle 403 Forbidden
  if (error.response?.status === 403) {
    Alert.alert('Không có quyền', 'Bạn không có quyền thực hiện thao tác này.');
    
    return {
      shouldNavigate: false,
      message: 'Không có quyền thực hiện thao tác này',
      isForbidden: true,
    };
  }

  // Handle 400 Bad Request
  if (error.response?.status === 400) {
    const errorMessage = error.response?.data?.message || error.response?.data?.detail || 'Dữ liệu không hợp lệ';
    
    return {
      shouldNavigate: false,
      message: errorMessage,
      isBadRequest: true,
    };
  }

  // Handle 404 Not Found
  if (error.response?.status === 404) {
    return {
      shouldNavigate: false,
      message: 'Không tìm thấy tài nguyên',
      isNotFound: true,
    };
  }

  // Handle 500 Server Error
  if (error.response?.status >= 500) {
    Alert.alert('Lỗi server', 'Server đang gặp sự cố. Vui lòng thử lại sau.');
    
    return {
      shouldNavigate: false,
      message: 'Lỗi server',
      isServerError: true,
    };
  }

  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network')) {
    Alert.alert('Lỗi kết nối', 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
    
    return {
      shouldNavigate: false,
      message: 'Không thể kết nối đến server',
      isNetworkError: true,
    };
  }

  // Handle timeout
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    Alert.alert('Hết thời gian chờ', 'Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.');
    
    return {
      shouldNavigate: false,
      message: 'Hết thời gian chờ',
      isTimeout: true,
    };
  }

  // Default error message
  const defaultMessage = error.message || error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
  
  return {
    shouldNavigate: false,
    message: defaultMessage,
    isUnknown: true,
  };
};

/**
 * Show error alert with custom message
 */
export const showErrorAlert = (title, message) => {
  Alert.alert(title || 'Lỗi', message);
};

/**
 * Show success alert
 */
export const showSuccessAlert = (title, message, onPress = null) => {
  Alert.alert(title || 'Thành công', message, [{ text: 'OK', onPress }]);
};

