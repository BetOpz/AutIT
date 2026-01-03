/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2563eb', // Bright blue
        'success': '#10b981', // Bright green
        'warning': '#f59e0b', // Bright orange
        'danger': '#ef4444', // Bright red
      },
      fontFamily: {
        'sans': ['Segoe UI', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
