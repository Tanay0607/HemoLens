/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#d9e8ff',
          200: '#bcd4fe',
          500: '#3b7dd8',
          600: '#2563c0',
          700: '#1d4f9e',
        },
        blood: {
          50:  '#fff1f1',
          100: '#ffe0e0',
          500: '#e53e3e',
          600: '#c53030',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
