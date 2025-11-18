/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand colors matching web version
        primary: {
          DEFAULT: "#1a1a5e", // Deep blue - main brand color
          foreground: "#f8f8fc",
        },
        accent: {
          DEFAULT: "#ffc627", // Vibrant gold/yellow for highlights
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
        // Dark mode colors
        dark: {
          primary: "#ffc627",
          background: "#0f0f1e",
          foreground: "#f0f0f5",
          card: "#1a1a2e",
          border: "#2e2e4e",
          input: "#252540",
        },
      },
      borderRadius: {
        lg: "0.625rem",
        md: "calc(0.625rem - 2px)",
        sm: "calc(0.625rem - 4px)",
      },
    },
  },
  plugins: [],
}

