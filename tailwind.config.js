import { fontFamily } from 'tailwindcss/defaultTheme';
import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        display: ['var(--font-display)', ...fontFamily.sans],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        brand: {
          50: '#eef5ff',
          100: '#d9e6ff',
          200: '#b3ccff',
          300: '#86adff',
          400: '#5b8eff',
          500: '#3a6efb',
          600: '#2c55d4',
          700: '#213fa3',
          800: '#182c73',
          900: '#101f4f',
        },
        slate: {
          25: '#f8fafc',
          50: '#f4f6fb',
          100: '#e6eaf3',
          200: '#c7cede',
          300: '#a9b5ca',
          400: '#7a89a0',
          500: '#4c5b70',
          600: '#374356',
          700: '#252f3b',
          800: '#141821',
          900: '#090b11',
        },
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
      },
      boxShadow: {
        card: '0 15px 45px -20px rgba(15, 23, 42, 0.35)',
        glow: '0 0 90px rgba(58, 110, 251, 0.35)',
      },
      backgroundImage: {
        'mesh-blue': 'radial-gradient(circle at 20% 20%, rgba(58,110,251,.25), transparent 35%), radial-gradient(circle at 80% 0, rgba(28,254,255,.25), transparent 45%), radial-gradient(circle at 50% 80%, rgba(255,117,165,.25), transparent 40%)',
      },
      animation: {
        'fade-in': 'fade-in 0.45s ease var(--delay, 0s) both',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.25s ease-out',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: 0, transform: 'translateY(30px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
