/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        skyglass: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        heavy: '24px',
      },
      animation: {
        'blob-spin': 'blob-spin 18s infinite linear',
        'blob-float': 'blob-float 10s ease-in-out infinite alternate',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s infinite',
      },
      keyframes: {
        'blob-spin': {
          '0%': { transform: 'rotate(0deg) scale(1)' },
          '50%': { transform: 'rotate(180deg) scale(1.12)' },
          '100%': { transform: 'rotate(360deg) scale(1)' },
        },
        'blob-float': {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '100%': { transform: 'translate(40px, 30px) scale(1.08)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', filter: 'blur(30px)' },
          '50%': { opacity: '0.7', filter: 'blur(45px)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      boxShadow: {
        'glass-card': '0 8px 32px 0 rgba(14, 165, 233, 0.15)',
        'glass-glow': '0 0 25px rgba(56, 189, 248, 0.35)',
        'glass-inset': 'inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
      },
    },
  },
  plugins: [],
}

