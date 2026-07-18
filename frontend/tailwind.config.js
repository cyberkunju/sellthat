/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          ink: "#000002",
          paper: "#fafafa",
          50: "#eef2ff",
          100: "#d8e4ff",
          200: "#b8caff",
          600: "#265ffb",
          700: "#1d45b4",
          800: "#10245e"
        },
        surface: {
          50: "#f7f8fb",
          100: "#f0f2f7",
          200: "#e1e4ea",
          300: "#c9ced9",
          400: "#7a8191",
          500: "#5f6472",
          700: "#303641",
          800: "#1a1e27",
          900: "#11131a"
        }
      },
      boxShadow: {
        card: "0 18px 44px -28px rgba(0, 0, 2, 0.28)"
      }
    }
  },
  plugins: []
};
