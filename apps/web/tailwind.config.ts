import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      colors: {
        brand: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
          subtle: "#EEF2FF",
        },
        success: "#22C55E",
        warning: "#F59E0B",
        danger: "#EF4444",
      },
      letterSpacing: {
        tighter: "-0.05em",
        tight: "-0.03em",
        snug: "-0.02em",
        normal: "0",
        wide: "0.01em",
        wider: "0.02em",
        widest: "0.05em",
      },
      lineHeight: {
        "3xs": "1.1",
        "2xs": "1.15",
        "xs": "1.25",
        "sm": "1.3",
        "base": "1.4",
        "lg": "1.5",
        "xl": "1.6",
      },
    },
  },
  plugins: [],
};

export default config;
