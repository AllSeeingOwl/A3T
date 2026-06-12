/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          slate: '#0F172A',      // Primary Deep Background
          navy: '#1E293B',       // Panel/Card Dark Blue
          magenta: '#EC4899',    // Team A / Accent Pink
          cobalt: '#3B82F6',     // Team B / Accent Blue
          crimson: '#EF4444',    // Red Card Red
          amber: '#F59E0B',      // Time-warning Amber
          gold: '#FBBF24',       // Championship Yellow
        }
      },
      fontFamily: {
        display: ['Impact', 'Trebuchet MS', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}