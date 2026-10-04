/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#070B14',
          sidebar: '#0F172A',
          card: '#111827',
          elevated: '#1E293B',
        },
        primary: {
          DEFAULT: '#6366F1',
          soft: '#818CF8',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        metric: {
          cpu: '#EF4444',
          memory: '#06B6D4',
          network: '#3B82F6',
          disk: '#A855F7',
          requests: '#EC4899',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px rgba(99, 102, 241, 0.25)',
        'glow-soft': '0 0 16px rgba(99, 102, 241, 0.15)',
        card: '0 8px 32px rgba(0, 0, 0, 0.35)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.6' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        shimmer: 'shimmer 2s infinite linear',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
      },
    },
  },
  plugins: [],
};
