/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',    // Indigo-600 (Corporate blue/purple)
        secondary: '#10B981',  // Emerald-500 (Success/Money)
        dark: '#0F172A',       // Slate-900 (Soft black)
        background: '#F8FAFC', // Slate-50 (Clean light gray)
        accent: '#8B5CF6'      // Violet-500 (Youthful accent)
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
