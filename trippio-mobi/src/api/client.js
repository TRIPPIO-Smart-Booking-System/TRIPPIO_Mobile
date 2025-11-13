import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Production API URL
const BASE_URL = 'https://trippiowebapp.azurewebsites.net';

export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased timeout for better reliability
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to all requests
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors and refresh token
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return client(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Get refresh token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const accessToken = await AsyncStorage.getItem('accessToken');

        if (!refreshToken || !accessToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh token
        const refreshResponse = await axios.post(
          `${BASE_URL}/api/admin/token/refresh`,
          {
            accessToken,
            refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          refreshResponse.data || {};

        if (newAccessToken && newRefreshToken) {
          // Save new tokens
          await AsyncStorage.setItem('accessToken', newAccessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);

          // Update user data if exists
          const userDataStr = await AsyncStorage.getItem('userData');
          if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            userData.accessToken = newAccessToken;
            userData.refreshToken = newRefreshToken;
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
          }

          // Update authorization header
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Process queued requests
          processQueue(null, newAccessToken);

          // Retry original request
          return client(originalRequest);
        } else {
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Process queued requests with error
        processQueue(refreshError, null);

        // Clear tokens and user data
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'userData']);

        // Return original error with refreshFailed flag
        // The calling code should handle navigation to login screen
        const errorToReturn = {
          ...error,
          refreshFailed: true,
          message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          code: 'SESSION_EXPIRED',
        };
        return Promise.reject(errorToReturn);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, just return them
    return Promise.reject(error);
  }
);
