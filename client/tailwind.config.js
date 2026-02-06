
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#7c3aed',
        secondary: '#a78bfa',
        dark: '#1e1b4b',
        surface: '#ffffff',
        background: '#f8fafc',
      }
    },
  },
  plugins: [],
}
