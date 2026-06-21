import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#090A0F",         // Deep obsidian
          surface: "#12151F",    // Card background
          "surface-hover": "#1E2230",
          primary: "#00F0FF",    // Electric Bitwrangler Cyan
          accent: "#FFB000",     // Warm Amber
          muted: "#8B949E",      // De-emphasized text
          border: "#1F2433",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
