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
          gold: '#FF8533',      // Arancione principale (dal logo)
          amber: '#FFB84D',     // Oro caldo
          black: '#0A0A0A',     // Nero profondo
          dark: '#1A1A1A',      // Grigio molto scuro
          gray: '#2A2A2A',      // Grigio scuro
          'gray-light': '#3A3A3A', // Grigio medio
        }
      }
    },
  },
  plugins: [],
}
