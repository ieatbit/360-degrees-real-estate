/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A2E1C', // Deep forest green
          dark: '#072213',
          light: '#184D30',
        },
        secondary: {
          DEFAULT: '#D4AF37', // Gold
          dark: '#C5A028',
          light: '#E5C158',
        },
        navy: {
          50: '#F0F4F9',
          100: '#D9E2EF',
          200: '#BACADF',
          300: '#8FA7C9',
          400: '#6A89B7',
          500: '#476FA1',
          600: '#0F2C5A', // Primary navy
          700: '#081B3A', // Dark navy
          800: '#061428',
          900: '#040D1A',
        },
        background: {
          DEFAULT: '#fafafa',
          dark: '#f0f0f0',
        },
        accent1: "#D4AF37", // Gold
        accent2: "#0A2E1C", // Deep forest green
        neutralLight: "#F8F7F2", // Light cream
        neutralDark: "#333333",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 