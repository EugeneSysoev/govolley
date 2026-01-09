import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        phuket: {
          purple: "#6A4C93",
          "purple-dark": "#5A3C83",
          yellow: "#FFC145",
          "yellow-dark": "#FFB347",
          sand: "#F8F5F0",
          peach: "#FFD8B1",
          light: "#F5F1EB",
          dark: "#333333",
          sunset: "linear-gradient(135deg, #FFC145 0%, #6A4C93 100%)",
        },
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
        opensans: ["Open Sans", "sans-serif"],
      },
      backgroundImage: {
        "sunset-gradient": "linear-gradient(135deg, #FFC145 0%, #6A4C93 100%)",
        "beach-gradient":
          "linear-gradient(to right, rgba(106, 76, 147, 0.3), rgba(255, 193, 69, 0.2))",
      },
    },
  },
  plugins: [],
};

export default config;
