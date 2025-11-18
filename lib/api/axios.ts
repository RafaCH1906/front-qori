import axios from 'axios';
import { getStoredTokens } from '../auth/storage';

// Configure your backend URL here
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8080/api' // Development
  : 'https://your-production-api.com/api'; // Production

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const tokens = await getStoredTokens();
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - handled by AuthProvider
      // You could trigger a logout event here if needed
    }
    return Promise.reject(error);
  }
);

export default api;
