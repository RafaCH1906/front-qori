import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "qoribet_access_token";
const REFRESH_KEY = "qoribet_refresh_token";

export async function setStoredTokens(tokens: { accessToken: string; refreshToken?: string }) {
  try {
    await SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken);
    if (tokens.refreshToken) await SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken);
  } catch (e) {
    // fallback for web/dev
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCESS_KEY, tokens.accessToken);
      if (tokens.refreshToken) localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    }
  }
}

export async function getStoredTokens(): Promise<{ accessToken: string; refreshToken?: string } | null> {
  try {
    const accessToken = await SecureStore.getItemAsync(ACCESS_KEY);
    if (!accessToken) {
      if (typeof window !== "undefined") {
        const a = localStorage.getItem(ACCESS_KEY);
        const r = localStorage.getItem(REFRESH_KEY);
        if (!a) return null;
        return { accessToken: a, refreshToken: r ?? undefined };
      }
      return null;
    }
    const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
    return { accessToken, refreshToken: refreshToken ?? undefined };
  } catch (e) {
    return null;
  }
}

export async function clearStoredTokens() {
  try {
    await SecureStore.deleteItemAsync(ACCESS_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
  } catch (e) {
    if (typeof window !== "undefined") {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
    }
  }
}
