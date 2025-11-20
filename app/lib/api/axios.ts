import axios from "axios";
import { getStoredTokens, setStoredTokens, clearStoredTokens } from "../auth/storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8000/api";

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
                    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refresh: tokens.refresh,
                    });
                    await setStoredTokens(data.access, data.refresh);
                    originalRequest.headers.Authorization = `Bearer ${data.access}`;
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
