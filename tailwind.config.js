/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sketch: ['Caveat', 'cursive'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--border)',
        'card-bg': 'var(--card-bg)',
        accent: {
          DEFAULT: 'var(--accent)',
          400: 'var(--accent)',
          500: 'var(--accent)',
        },
      },
      borderRadius: {
        sketch: '12px',
      },
    },
  },
  plugins: [],
};
