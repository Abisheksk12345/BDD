import type { Config } from "tailwindcss";
import lineClamp from "@tailwindcss/line-clamp"; // ✅ import the plugin

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)"],
      },
    },
  },
  plugins: [
    lineClamp, // ✅ enable the plugin here
  ],
};

export default config;
