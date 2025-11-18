import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const token = await AsyncStorage.getItem('authToken');
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get('/auth/me'),
};

export const bettingAPI = {
  getMatches: () => api.get('/matches'),
  
  getMatch: (id: string) => api.get(`/matches/${id}`),
  
  placeBet: (betData: any) => api.post('/bets', betData),
  
  getUserBets: () => api.get('/bets/user'),
  
  getBetHistory: () => api.get('/bets/history'),
};
