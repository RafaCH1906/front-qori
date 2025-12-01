import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'authtoken';
const USER_DATA_KEY = 'userdata';

export interface UserData {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
    hasReceivedWelcomeGift?: boolean;
    freeBetsCount?: number;
    profilePhotoUrl?: string;
}

export class AuthStorage {
    // Platform-specific storage for tokens
    private static async setSecureItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            // Use sessionStorage for web (cleared when tab closes)
            console.log(`[AuthStorage] Setting item (sessionStorage). Key: '[${key}]'`);
            if (typeof window !== 'undefined' && window.sessionStorage) {
                window.sessionStorage.setItem(key, value);
            }
        } else {
            // Use SecureStore for mobile with AsyncStorage fallback
            console.log(`[AuthStorage] Setting item (SecureStore). Key: '[${key}]'`);
            try {
                await SecureStore.setItemAsync(key, value);
            } catch (error) {
                console.warn('[AuthStorage] SecureStore failed, falling back to AsyncStorage:', error);
                await AsyncStorage.setItem(key, value);
            }
        }
    }

    private static async getSecureItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            // Use sessionStorage for web
            console.log(`[AuthStorage] Getting item (sessionStorage). Key: '[${key}]'`);
            if (typeof window !== 'undefined' && window.sessionStorage) {
                return window.sessionStorage.getItem(key);
            }
            return null;
        } else {
            // Use SecureStore for mobile with AsyncStorage fallback
            console.log(`[AuthStorage] Getting item (SecureStore). Key: '[${key}]'`);
            try {
                return await SecureStore.getItemAsync(key);
            } catch (error) {
                console.warn('[AuthStorage] SecureStore failed, falling back to AsyncStorage:', error);
                return await AsyncStorage.getItem(key);
            }
        }
    }

    private static async deleteSecureItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            // Use sessionStorage for web
            console.log(`[AuthStorage] Removing item (sessionStorage). Key: '[${key}]'`);
            if (typeof window !== 'undefined' && window.sessionStorage) {
                window.sessionStorage.removeItem(key);
            }
        } else {
            // Use SecureStore for mobile with AsyncStorage fallback
            console.log(`[AuthStorage] Removing item (SecureStore). Key: '[${key}]'`);
            try {
                await SecureStore.deleteItemAsync(key);
            } catch (error) {
                console.warn('[AuthStorage] SecureStore failed, falling back to AsyncStorage:', error);
                await AsyncStorage.removeItem(key);
            }
        }
    }

    // Platform-specific storage for user data
    private static async setUserDataItem(key: string, value: string): Promise<void> {
        if (Platform.OS === 'web') {
            // Use localStorage for web (persists across sessions)
            console.log(`[AuthStorage] Setting user data (localStorage). Key: '[${key}]'`);
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, value);
            }
        } else {
            // Use AsyncStorage for mobile
            console.log(`[AuthStorage] Setting user data (AsyncStorage). Key: '[${key}]'`);
            await AsyncStorage.setItem(key, value);
        }
    }

    private static async getUserDataItem(key: string): Promise<string | null> {
        if (Platform.OS === 'web') {
            // Use localStorage for web
            console.log(`[AuthStorage] Getting user data (localStorage). Key: '[${key}]'`);
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(key);
            }
            return null;
        } else {
            // Use AsyncStorage for mobile
            console.log(`[AuthStorage] Getting user data (AsyncStorage). Key: '[${key}]'`);
            return await AsyncStorage.getItem(key);
        }
    }

    private static async deleteUserDataItem(key: string): Promise<void> {
        if (Platform.OS === 'web') {
            // Use localStorage for web
            console.log(`[AuthStorage] Removing user data (localStorage). Key: '[${key}]'`);
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(key);
            }
        } else {
            // Use AsyncStorage for mobile
            console.log(`[AuthStorage] Removing user data (AsyncStorage). Key: '[${key}]'`);
            await AsyncStorage.removeItem(key);
        }
    }

    // Token management
    static async saveToken(token: string): Promise<void> {
        try {
            await this.setSecureItem(AUTH_TOKEN_KEY, token);
        } catch (error) {
            console.error('Error saving token:', error);
            throw error;
        }
    }

    static async getToken(): Promise<string | null> {
        try {
            return await this.getSecureItem(AUTH_TOKEN_KEY);
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    }

    static async removeToken(): Promise<void> {
        try {
            await this.deleteSecureItem(AUTH_TOKEN_KEY);
        } catch (error) {
            console.error('Error removing token:', error);
            throw error;
        }
    }

    // User data management
    static async saveUserData(userData: UserData): Promise<void> {
        try {
            const jsonValue = JSON.stringify(userData);
            await this.setUserDataItem(USER_DATA_KEY, jsonValue);
        } catch (error) {
            console.error('Error saving user data:', error);
            throw error;
        }
    }

    static async getUserData(): Promise<UserData | null> {
        try {
            const jsonValue = await this.getUserDataItem(USER_DATA_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    static async removeUserData(): Promise<void> {
        try {
            await this.deleteUserDataItem(USER_DATA_KEY);
        } catch (error) {
            console.error('Error removing user data:', error);
            throw error;
        }
    }

    // Check if user is authenticated
    static async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return token !== null;
    }

    // Clear all auth data
    static async clearAll(): Promise<void> {
        try {
            await this.removeToken();
            await this.removeUserData();
        } catch (error) {
            console.error('Error clearing auth data:', error);
            throw error;
        }
    }
}
