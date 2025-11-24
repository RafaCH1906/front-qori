import axios from "axios";
import { Platform } from "react-native";
import { AuthStorage } from "../auth/storage";

// Default to localhost for web/iOS, and 10.0.2.2 for Android emulator
// For physical devices, EXPO_PUBLIC_API_URL must be set to the local IP
const DEFAULT_URL = Platform.OS === "android"
    ? "http://10.0.2.2:8080/api/v1"
    : "http://localhost:8080/api/v1";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;

console.log("[AXIOS] API_BASE_URL:", API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000, // 10 second timeout to prevent infinite hangs
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    async (config) => {
        console.log('[AXIOS] Interceptor started for:', config.url);

        // AuthStorage now uses AsyncStorage exclusively, so this is safe and direct
        const token = await AuthStorage.getToken();
        console.log('[AXIOS] AuthStorage.getToken result:', token ? 'FOUND' : 'MISSING');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`[AXIOS] Final request setup:`, {
            url: config.url,
            hasToken: !!token,
            method: config.method
        });
        return config;
    },
    (error) => {
        console.error('[AXIOS] Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        console.log(`[AXIOS] Response ${response.status}:`, response.config.url);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        console.error('[AXIOS] Response error:', {
            url: originalRequest?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // If 401 and we haven't retried yet, clear auth and reject
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            console.log('[AXIOS] 401 error - clearing auth data');
            // Clear auth data on 401
            await AuthStorage.clearAll();

            // You could implement token refresh here if your backend supports it
            // For now, we just clear the auth and let the user re-login
        }

        return Promise.reject(error);
    }
);

export default api;
