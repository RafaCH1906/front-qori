import React, { createContext, useContext, useEffect, useState } from "react";
import * as AuthApi from "../lib/api/auth";
import { getStoredTokens, setStoredTokens, clearStoredTokens } from "../lib/auth/storage";

type User = any | null;

type AuthContextType = {
    user: User;
    loading: boolean;
    login: (payload: { username?: string; email?: string; password: string }) => Promise<void>;
    register: (payload: any) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const tokens = await getStoredTokens();
            if (tokens?.accessToken) {
                // optionally decode or call /me; for now set a placeholder user object
                setUser({});
            }
            setLoading(false);
        })();
    }, []);

    const login = async (payload: { username?: string; email?: string; password: string }) => {
        const resp = await AuthApi.login(payload);
        await setStoredTokens({ accessToken: resp.accessToken, refreshToken: resp.refreshToken });
        setUser(resp.user ?? {});
    };

    const register = async (payload: any) => {
        await AuthApi.register(payload);
        // Attempt auto-login if we have credentials
        if ((payload.username || payload.email) && payload.password) {
            await login({ username: payload.username, email: payload.email, password: payload.password });
        }
    };

    const logout = async () => {
        const tokens = await getStoredTokens();
        try {
            await AuthApi.logout(tokens?.refreshToken);
        } catch (e) {
            // ignore logout errors
        }
        await clearStoredTokens();
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}