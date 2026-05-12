/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#080B14',
        surface: '#0D1117',
        surfaceBorder: '#1C2333',
        primary: '#F7931A',
        secondary: '#9945FF',
        tertiary: '#00D1FF',
        success: '#00C896',
        warning: '#FFB800',
        danger: '#FF4757',
        textPrimary: '#FFFFFF',
        textSecondary: '#8892A4',
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        cardEntrance: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        orbPulse: {
          '0%': { transform: 'scale(1)', opacity: '0.06' },
          '50%': { transform: 'scale(1.2)', opacity: '0.09' },
          '100%': { transform: 'scale(1)', opacity: '0.06' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'card-entrance': 'cardEntrance 0.5s ease-out forwards',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        shimmer: 'shimmer 2s ease-in-out infinite',
        'orb-pulse': 'orbPulse 4s ease-in-out infinite',
      },
      fontFamily: {
        sketch: ['Caveat', 'cursive'],
        body: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
