import React, { createContext, useContext, useEffect, useState } from "react";
import * as AuthApi from "@/lib/api/auth";
import { AuthStorage, UserData } from "@/lib/auth/storage";

type AuthContextType = {
    user: UserData | null;
    loading: boolean;
    login: (payload: { username?: string; email?: string; password: string }) => Promise<void>;
    register: (payload: any) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const token = await AuthStorage.getToken();
                if (token) {
                    const userData = await AuthStorage.getUserData();
                    if (userData) {
                        setUser(userData);
                    } else {
                        // Token exists but no user data, clear everything
                        await AuthStorage.clearAll();
                    }
                } else {
                    // No token found (or failed to retrieve), ensure we are logged out
                    // This fixes the "zombie" state where userData exists but token is gone
                    console.log('[AuthProvider] No token found during init, clearing any stale data');
                    await AuthStorage.clearAll();
                    setUser(null);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                await AuthStorage.clearAll();
            } finally {
                setLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (payload: { username?: string; email?: string; password: string }) => {
        try {
            const data = await AuthApi.login(payload);
            console.log('[AuthProvider] Login API success. User:', data.user?.username);

            if (!data.accessToken) {
                console.error('[AuthProvider] No access token received!');
                throw new Error('No access token received from server');
            }

            // Save token securely
            console.log('[AuthProvider] Saving token to storage...');
            await AuthStorage.saveToken(data.accessToken);
            console.log('[AuthProvider] Token saved.');

            // VERIFICATION: Read it back immediately to ensure persistence
            const savedToken = await AuthStorage.getToken();
            console.log('[AuthProvider] Immediate token read-back:', savedToken ? 'SUCCESS' : 'FAILED');

            if (!savedToken) {
                throw new Error('Failed to save authentication token. Storage issue detected.');
            }

            // Save user data
            const userData: UserData = {
                id: data.user.id,
                username: data.user.username,
                email: data.user.email,
                firstName: data.user.firstName,
                lastName: data.user.lastName,
                phone: data.user.phone,
                role: data.user.role,
            };

            console.log('[AuthProvider] Saving user data:', userData);
            await AuthStorage.saveUserData(userData);
            setUser(userData);
        } catch (error) {
            console.error('[AuthProvider] Login error:', error);
            throw error;
        }
    };

    const register = async (payload: any) => {
        try {
            await AuthApi.register(payload);
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AuthStorage.clearAll();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const refreshUser = async () => {
        try {
            const userData = await AuthStorage.getUserData();
            setUser(userData);
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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
