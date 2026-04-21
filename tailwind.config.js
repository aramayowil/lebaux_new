import { heroui } from "@heroui/react";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["DM Sans", "system-ui", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
      display: ["Syne", "system-ui", "sans-serif"],
    },
    extend: {
      colors: {
        lebaux: {
          amber: "#FBC278",
          "amber-dark": "#D97706",
          "amber-light": "#fff4e6",
          gray: "#8E9191",
        },
        zinc: {
          950: "#121414",
          900: "#1a1c1c",
          800: "#2d3030",
          700: "#424646",
          600: "#5a5f5f",
          500: "#8E9191", // Coincide con el gris del logo
          400: "#a4a8a8",
          300: "#bfc2c2",
          200: "#dadddd",
          100: "#eef0f0",
          50: "#f6f7f7",
        },
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            primary: { DEFAULT: "#334e68", foreground: "#ffffff" },
            secondary: { DEFAULT: "#627d98", foreground: "#ffffff" },
            success: { DEFAULT: "#16a34a" },
            warning: { DEFAULT: "#d97706" },
            danger: { DEFAULT: "#dc2626" },
          },
        },
        dark: {
          colors: {
            background: "#0a1929",
            foreground: "#e2e8f0",
            primary: { DEFAULT: "#829ab1", foreground: "#0a1929" },
            secondary: { DEFAULT: "#486581", foreground: "#e2e8f0" },
          },
        },
      },
    }),
  ],
};
