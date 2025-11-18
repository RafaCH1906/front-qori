export type ThemeMode = "light" | "dark";

export type ThemeColors = {
  primary: { DEFAULT: string; foreground: string };
  accent: { DEFAULT: string; foreground: string };
  background: string;
  foreground: string;
  card: { DEFAULT: string; foreground: string };
  border: string;
  input: string;
  ring: string;
  destructive: { DEFAULT: string; foreground: string };
  muted: { DEFAULT: string; foreground: string };
  secondary: { DEFAULT: string; foreground: string };
};

export const lightColors: ThemeColors = {
  primary: {
    DEFAULT: "#1a1a5e",
    foreground: "#f8f8fc",
  },
  accent: {
    DEFAULT: "#ffc627",
    foreground: "#1a1a2e",
  },
  background: "#f8f8fc",
  foreground: "#1a1a2e",
  card: {
    DEFAULT: "#ffffff",
    foreground: "#1a1a2e",
  },
  border: "#e5e6f0",
  input: "#e5e6f0",
  ring: "#1a1a5e",
  destructive: {
    DEFAULT: "#dc4446",
    foreground: "#f8f8fc",
  },
  muted: {
    DEFAULT: "#e5e6f0",
    foreground: "#6b6b8c",
  },
  secondary: {
    DEFAULT: "#ffc627",
    foreground: "#1a1a2e",
  },
};

export const darkColors: ThemeColors = {
  primary: {
    DEFAULT: "#ffc627",
    foreground: "#0f0f1e",
  },
  accent: {
    DEFAULT: "#3b82f6",
    foreground: "#0f0f1e",
  },
  background: "#0f0f1e",
  foreground: "#f0f0f5",
  card: {
    DEFAULT: "#1a1a2e",
    foreground: "#f0f0f5",
  },
  border: "#2e2e4e",
  input: "#252540",
  ring: "#ffc627",
  destructive: {
    DEFAULT: "#f87171",
    foreground: "#1a1a2e",
  },
  muted: {
    DEFAULT: "#1f1f3a",
    foreground: "#a0a0c2",
  },
  secondary: {
    DEFAULT: "#2b2b45",
    foreground: "#f0f0f5",
  },
};

export const colors: ThemeColors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 10,
  xl: 12,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
};

export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};
