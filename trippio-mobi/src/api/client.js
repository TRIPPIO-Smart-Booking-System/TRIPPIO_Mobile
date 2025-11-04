import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Platform-specific localhost configuration
const LOCALHOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

// Get API URL from config or use platform-specific fallback
const extra = Constants.expoConfig?.extra || Constants.manifest?.extra || {};
const BASE_URL = extra.API_BASE_URL || `http://${LOCALHOST}:5126`;



export const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
});
