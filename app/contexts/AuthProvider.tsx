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
        const initAuth = async () => {
            const tokens = await getStoredTokens();
            if (tokens?.access) {
                try {
                    // TODO: Validate token or fetch user info
                    setUser({ tokens });
                } catch (error) {
                    await clearStoredTokens();
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (payload: { username?: string; email?: string; password: string }) => {
        const data = await AuthApi.login(payload);
        await setStoredTokens(data.access, data.refresh);
        setUser(data.user || { tokens: data });
    };

    const register = async (payload: any) => {
        const data = await AuthApi.register(payload);
        await setStoredTokens(data.access, data.refresh);
        setUser(data.user || { tokens: data });
    };

    const logout = async () => {
        await clearStoredTokens();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
