import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      screens: {
        xs: "375px"
      },
      colors: {
        background: "#020617",
        surface: "#030712",
        accent: "#22c55e"
      },
      fontFamily: {
        sans: ["system-ui", "ui-sans-serif", "sans-serif"]
      },
      minHeight: {
        touch: "44px"
      },
      minWidth: {
        touch: "44px"
      }
    }
  },
  plugins: []
};

export default config;
