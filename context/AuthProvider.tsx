import React, { createContext, useContext, useEffect, useState } from "react";
import * as AuthApi from "@/lib/api/auth";
import { AuthStorage, UserData } from "@/lib/auth/storage";

type AuthContextType = {
    user: UserData | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (payload: { username?: string; email?: string; password: string }) => Promise<UserData>;
    register: (payload: any) => Promise<UserData>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const isAuthenticated = !!user;

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
                freeBetsCount: data.user.freeBetsCount || 0,
                profilePhotoUrl: data.user.profilePhotoUrl,
            };

            console.log('[AuthProvider] Saving user data:', userData);
            await AuthStorage.saveUserData(userData);
            setUser(userData);
            return userData;
        } catch (error) {
            console.error('[AuthProvider] Login error:', error);
            throw error;
        }
    };

    const register = async (payload: any): Promise<UserData> => {
        try {
            const data = await AuthApi.register(payload);
            // After registration, save user data if provided
            if (data.accessToken && data.user) {
                await AuthStorage.saveToken(data.accessToken);
                await AuthStorage.saveUserData(data.user);
                setUser(data.user);
                return data.user;
            }
            // If no user data returned, still return a basic user object
            // This can happen if backend only returns token
            const basicUser: UserData = {
                id: 0,
                username: payload.username || payload.email,
                email: payload.email,
                firstName: payload.firstName || '',
                lastName: payload.lastName || '',
                phone: payload.phone || '',
                role: 'PLAYER',
                freeBetsCount: 0,
                profilePhotoUrl: undefined,
            };
            return basicUser;
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
            console.log('[AuthProvider] Refreshing user data from backend');
            const data = await AuthApi.getCurrentUser();
            
            if (data && data.user) {
                const userData: UserData = {
                    id: data.user.id,
                    username: data.user.username,
                    email: data.user.email,
                    firstName: data.user.firstName,
                    lastName: data.user.lastName,
                    phone: data.user.phone,
                    role: data.user.role,
                    freeBetsCount: data.user.freeBetsCount || 0,
                    profilePhotoUrl: data.user.profilePhotoUrl,
                };
                
                await AuthStorage.saveUserData(userData);
                setUser(userData);
                console.log('[AuthProvider] User data refreshed successfully');
            }
        } catch (error) {
            console.error('[AuthProvider] Error refreshing user:', error);
            // Si falla, intentar cargar desde storage local
            try {
                const userData = await AuthStorage.getUserData();
                setUser(userData);
            } catch (storageError) {
                console.error('[AuthProvider] Error loading user from storage:', storageError);
            }
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, refreshUser }}>
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
