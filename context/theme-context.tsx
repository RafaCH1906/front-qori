import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import {
  lightColors,
  darkColors,
  ThemeColors,
  ThemeMode,
} from "@/constants/theme";

interface ThemeContextValue {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  isManualOverride: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  useSystemTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>(
    systemScheme === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    if (!isManualOverride && systemScheme) {
      setThemeState(systemScheme === "dark" ? "dark" : "light");
    }
  }, [systemScheme, isManualOverride]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setIsManualOverride(true);
    setThemeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsManualOverride(true);
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const useSystemTheme = useCallback(() => {
    setIsManualOverride(false);
    if (systemScheme) {
      setThemeState(systemScheme === "dark" ? "dark" : "light");
    }
  }, [systemScheme]);

  const colors = theme === "dark" ? darkColors : lightColors;

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors,
      isDark: theme === "dark",
      isManualOverride,
      toggleTheme,
      setTheme,
      useSystemTheme,
    }),
    [theme, colors, isManualOverride, toggleTheme, setTheme, useSystemTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors]);
}
