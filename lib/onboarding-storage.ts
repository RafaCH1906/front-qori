import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@onboarding_completed';

export class OnboardingStorage {
    static async hasCompletedOnboarding(): Promise<boolean> {
        try {
            const value = await AsyncStorage.getItem(ONBOARDING_KEY);
            return value === 'true';
        } catch (error) {
            console.error('Error reading onboarding status:', error);
            return false;
        }
    }

    static async setOnboardingCompleted(completed: boolean = true): Promise<void> {
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, completed ? 'true' : 'false');
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    }

    static async clearOnboardingStatus(): Promise<void> {
        try {
            await AsyncStorage.removeItem(ONBOARDING_KEY);
        } catch (error) {
            console.error('Error clearing onboarding status:', error);
        }
    }
}
