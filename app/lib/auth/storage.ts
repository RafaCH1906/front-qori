import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const setStoredTokens = async (accessToken: string, refreshToken: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const getStoredTokens = async () => {
    const access = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return access && refresh ? { access, refresh } : null;
};

export const clearStoredTokens = async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
};
