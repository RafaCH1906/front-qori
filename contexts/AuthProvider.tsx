import React, { createContext, useContext, useEffect, useState } from "react";
import * as AuthApi from "../lib/api/auth";
import { getStoredTokens, setStoredTokens, clearStoredTokens } from "../lib/auth/storage";
import api from "../lib/api/axios";

type User = any | null;

type AuthContextType = {
  user: User;
  loading: boolean;
  login: (payload: { username?: string; email?: string; password: string }) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function safeParseJwt(token?: string) {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(payload)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // hydrate user: try /auth/me then fallback to decode token
  useEffect(() => {
    (async () => {
      try {
        const tokens = await getStoredTokens();
        if (tokens?.accessToken) {
          // Try to call a /me endpoint if backend provides it. If not available, fallback to decoding token.
          try {
            // attempt /auth/me (if your backend exposes it)
            const resp = await api.get("/auth/me");
            if (resp?.data) {
              setUser(resp.data);
              setLoading(false);
              return;
            }
          } catch (err) {
            // ignore: backend may not expose /auth/me
          }

          // Fallback: decode JWT payload to get minimal user info (unsafe: only for UI hydration)
          const payload = safeParseJwt(tokens.accessToken);
          if (payload) {
            // map payload fields as needed (sub, username, email, etc.)
            setUser({
              username: payload.sub ?? payload.username ?? payload.user ?? null,
              ...payload,
            });
          } else {
            setUser({});
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        // ignore hydration errors
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (payload: { username?: string; email?: string; password: string }) => {
    const resp = await AuthApi.login(payload);
    await setStoredTokens({ accessToken: resp.accessToken, refreshToken: resp.refreshToken });
    setUser(resp.user ?? (resp.accessToken ? safeParseJwt(resp.accessToken) ?? {} : {}));
  };

  const register = async (payload: any) => {
    await AuthApi.register(payload);
    // Attempt auto-login if credentials present
    if ((payload.username || payload.email) && payload.password) {
      await login({ username: payload.username, email: payload.email, password: payload.password });
    }
  };

  const logout = async () => {
    const tokens = await getStoredTokens();
    try {
      await AuthApi.logout(tokens?.refreshToken);
    } catch (e) {
      // ignore
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
