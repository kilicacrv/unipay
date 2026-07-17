/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFD600',    // Primary yellow
        secondary: '#00B894',  // Teal/green
        dark: '#000000',       // Black
        background: '#FFFFFF', // White
        accent: '#00B894'      // Teal/green
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
