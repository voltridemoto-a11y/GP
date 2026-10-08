/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a5b8fc',
          400: '#8193f8',
          500: '#6170f1',
          600: '#4a52e4',
          700: '#3c41c9',
          800: '#3237a3',
          900: '#1e2261',
          950: '#0f1133',
        },
        brand: {
          navy: '#0D1B3E',
          navyLight: '#1A2F5A',
          navyMid: '#162448',
          orange: '#FF6B1A',
          orangeLight: '#FF8C47',
          orangeDark: '#E55A0E',
        }
      }
    },
  },
  plugins: [],
}
