/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff4ff",
          100: "#dbe5ff",
          600: "#265ffb",
          700: "#1e4fd8",
          800: "#1a3fac"
        }
      },
      boxShadow: {
        card: "0 12px 32px -20px rgba(15, 23, 42, 0.28)"
      }
    }
  },
  plugins: []
};
