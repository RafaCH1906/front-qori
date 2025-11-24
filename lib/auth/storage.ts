import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// NOTE: SecureStore is disabled due to device-specific crashes.
// Using AsyncStorage for all platforms as a fallback.
// import * as SecureStore from 'expo-secure-store';

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
}

export class AuthStorage {
    // Use AsyncStorage for ALL platforms to avoid SecureStore crashes
    private static async setSecureItem(key: string, value: string): Promise<void> {
        console.log(`[AuthStorage] Setting item (AsyncStorage). Key: '[${key}]'`);
        await AsyncStorage.setItem(key, value);
    }

    private static async getSecureItem(key: string): Promise<string | null> {
        console.log(`[AuthStorage] Getting item (AsyncStorage). Key: '[${key}]'`);
        return await AsyncStorage.getItem(key);
    }

    private static async deleteSecureItem(key: string): Promise<void> {
        console.log(`[AuthStorage] Removing item (AsyncStorage). Key: '[${key}]'`);
        await AsyncStorage.removeItem(key);
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
            await AsyncStorage.setItem(USER_DATA_KEY, jsonValue);
        } catch (error) {
            console.error('Error saving user data:', error);
            throw error;
        }
    }

    static async getUserData(): Promise<UserData | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(USER_DATA_KEY);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (error) {
            console.error('Error getting user data:', error);
            return null;
        }
    }

    static async removeUserData(): Promise<void> {
        try {
            await AsyncStorage.removeItem(USER_DATA_KEY);
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
