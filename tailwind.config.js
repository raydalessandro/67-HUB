/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        '67': {
          gold: '#FFD700',
          black: '#0A0A0A',
          dark: '#1A1A1A',
          gray: '#2A2A2A',
        }
      }
    },
  },
  plugins: [],
}
