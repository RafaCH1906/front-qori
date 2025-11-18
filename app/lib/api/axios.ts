import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getStoredTokens, setStoredTokens, clearStoredTokens } from "../auth/storage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const api = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// Refresh control
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: any) => void;
    config: AxiosRequestConfig;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((p) => {
        if (error) p.reject(error);
        else {
            if (token && p.config.headers) {
                p.config.headers["Authorization"] = `Bearer ${token}`;
            }
            p.resolve(api(p.config));
        }
    });
    failedQueue = [];
};

api.interceptors.request.use(async (config) => {
    const tokens = await getStoredTokens();
    if (tokens?.accessToken && config.headers) {
        config.headers["Authorization"] = `Bearer ${tokens.accessToken}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject, config: originalRequest });
                });
            }

            isRefreshing = true;
            try {
                const tokens = await getStoredTokens();
                if (!tokens?.refreshToken) throw new Error("No refresh token available");

                // Use a plain axios call to refresh to avoid infinite interceptor recursion.
                const resp = await axios.post(
                    `${BASE_URL}/auth/refresh?refreshToken=${encodeURIComponent(tokens.refreshToken)}`,
                    null,
                    { headers: { "Content-Type": "application/json" } }
                );

                const data = resp.data as { accessToken: string; refreshToken?: string };
                const newAccessToken = data.accessToken;
                const newRefreshToken = data.refreshToken ?? tokens.refreshToken;

                await setStoredTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });

                api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                await clearStoredTokens();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;