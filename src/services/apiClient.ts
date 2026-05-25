import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform, DeviceEventEmitter, NativeModules } from 'react-native';
import Constants from 'expo-constants';

const getBundleIp = () => {
  // 1. Try Expo Constants hostUri (standard for Expo Go development)
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip) return ip;
  }

  // 2. Try NativeModules.SourceCode.scriptURL fallback
  const scriptURL = NativeModules.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/^https?:\/\/([^:/]+)(:\d+)?/);
    if (match) {
      return match[1];
    }
  }
  return null;
};

// Default to 10.0.2.2 for Android emulator to access host localhost
// For web and iOS simulator, localhost works perfectly.
// For physical devices on the same network, dynamically resolve the Metro packager host IP.
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  
  const bundleIp = getBundleIp();
  if (bundleIp && bundleIp !== 'localhost' && bundleIp !== '127.0.0.1' && bundleIp !== '10.0.2.2') {
    return `http://${bundleIp}:5000/api`;
  }
  
  if (Platform.OS === 'android') return 'http://10.0.2.2:5000/api';
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the token to every request
apiClient.interceptors.request.use(
  async (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    if (config.data) {
      console.log(`[API Request Body]:`, JSON.stringify(config.data));
    }
    try {
      const token = await AsyncStorage.getItem('@sterling_height_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from storage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors (e.g., 401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`);
      console.error(`[API Error Data]:`, JSON.stringify(error.response.data));
      
      if (error.response.status === 401) {
        // Handle unauthorized errors (e.g., clear storage and redirect to login)
        console.log('Unauthorized access - token may be expired');
        DeviceEventEmitter.emit('UNAUTHORIZED');
      }
    } else if (error.request) {
      console.error(`[API Network Error] No response received for ${error.config?.method?.toUpperCase()} ${error.config?.url}. Is the backend running and accessible at ${error.config?.baseURL}?`);
    } else {
      console.error(`[API Setup Error]`, error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
