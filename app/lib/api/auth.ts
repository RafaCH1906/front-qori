import api from "./axios";

export const login = async (payload: { username?: string; email?: string; password: string }) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
};

export const register = async (payload: any) => {
    const { data } = await api.post("/auth/register", payload);
    return data;
};

export const refreshToken = async (refreshToken: string) => {
    const { data } = await api.post("/auth/refresh", { refresh: refreshToken });
    return data;
};
