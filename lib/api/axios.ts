import axios from "axios";
import { Platform } from "react-native";
import { getStoredTokens, setStoredTokens, clearStoredTokens } from "../auth/storage";

// Default to localhost for web/iOS, and 10.0.2.2 for Android emulator
// For physical devices, EXPO_PUBLIC_API_URL must be set to the local IP
const DEFAULT_URL = Platform.OS === "android"
    ? "http://10.0.2.2:8080/api/v1"
    : "http://localhost:8080/api/v1";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_URL;

console.log("API_BASE_URL:", API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    async (config) => {
        const tokens = await getStoredTokens();
        if (tokens?.access) {
            config.headers.Authorization = `Bearer ${tokens.access}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const tokens = await getStoredTokens();
                if (tokens?.refresh) {
                    // Note: We use axios.post directly to avoid interceptors
                    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refresh: tokens.refresh,
                    });
                    await setStoredTokens(data.accessToken, data.refreshToken); // Backend returns accessToken/refreshToken
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                await clearStoredTokens();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
