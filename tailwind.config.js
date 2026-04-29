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
          amber: "#db924b",
          "amber-hover": "#c47d3a", // Un tono más profundo para el hover de botones principales
          gray: "#8E9191",
          "surface-hover": "rgba(142, 145, 145, 0.1)", // Hover sutil para filas de tablas o listas
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
            // Texto principal menos oscuro (un gris carbón suave)
            foreground: "#424646",
            background: "#ffffff",
            primary: {
              DEFAULT: "#db924b",
              foreground: "#ffffff",
            },
            focus: "#db924b",
            default: {
              50: "#f6f7f7",
              100: "#eef0f0",
              200: "#dadddd",
              300: "#bfc2c2",
              400: "#a4a8a8",
              500: "#8E9191",
              600: "#5a5f5f",
              700: "#424646",
              800: "#2d3030",
              900: "#1a1c1c",
              DEFAULT: "#eef0f0",
              // Texto dentro de componentes 'default' (como tooltips/chips)
              foreground: "#424646",
            },
          },
        },
        dark: {
          colors: {
            // Texto principal más gris/tenue (menos blanco brillante)
            foreground: "#a4a8a8",
            background: "#121414",
            primary: {
              DEFAULT: "#db924b",
              foreground: "#ffffff",
            },
            focus: "#db924b",
            default: {
              50: "#1a1c1c",
              100: "#2d3030",
              200: "#424646",
              300: "#5a5f5f",
              400: "#8E9191",
              500: "#a4a8a8",
              600: "#bfc2c2",
              700: "#dadddd",
              800: "#eef0f0",
              900: "#f6f7f7",
              DEFAULT: "#2d3030",
              // Texto dentro de componentes oscuros un poco más visible que el general
              foreground: "#dadddd",
            },
          },
        },
      },
    }),
  ],
};
