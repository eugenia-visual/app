/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0D0D0D',
          cream: '#F5F0E8',
          rose: '#C8A99A',
          'rose-dark': '#A07060',
          sand: '#E8DDD0',
          muted: '#6B6259',
        },
      },
      fontFamily: {
        display: ['Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
