import api from "./axios";

export const login = async (payload: { username?: string; email?: string; password: string }) => {
    try {
        console.log('[AUTH API] Login attempt:', { email: payload.email, username: payload.username });
        // Backend expects either email or username. Since user inputs email, we should send it as email.
        const { data } = await api.post("/auth/login", payload);
        console.log('[AUTH API] Login successful:', { user: data.user?.username });
        return data;
    } catch (error: any) {
        console.error('[AUTH API] Login failed:', error.response?.data || error.message);
        throw error;
    }
};

export const register = async (payload: any) => {
    try {
        console.log('[AUTH API] Register attempt:', { email: payload.email });
        const { data } = await api.post("/auth/register", payload);
        console.log('[AUTH API] Register successful');
        return data;
    } catch (error: any) {
        console.error('[AUTH API] Register failed:', error.response?.data || error.message);
        throw error;
    }
};

export const refreshToken = async (refreshToken: string) => {
    const { data } = await api.post("/auth/refresh", { refresh: refreshToken });
    return data;
};

export const getCurrentUser = async () => {
    try {
        console.log('[AUTH API] Getting current user profile');
        const { data } = await api.get("/auth/me");
        console.log('[AUTH API] Current user profile retrieved');
        return data;
    } catch (error: any) {
        console.error('[AUTH API] Get current user failed:', error.response?.data || error.message);
        throw error;
    }
};

export const verifyEmail = async (token: string) => {
    try {
        console.log('[AUTH API] Verifying email with token');
        const { data } = await api.get(`/auth/verify-email?token=${token}`);
        console.log('[AUTH API] Email verification successful');
        return data;
    } catch (error: any) {
        console.error('[AUTH API] Email verification failed:', error.response?.data || error.message);
        throw error;
    }
};
