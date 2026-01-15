/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable manual toggling
  theme: {
    extend: {
      colors: {
        // Semantic Background Colors
        primary: 'rgb(var(--color-bg-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--color-bg-tertiary) / <alpha-value>)',

        // Custom Brand Palette (keep existing)
        nomad: {
          black: '#0c0a09',
          dark: '#1C1C1E',
          light: '#F5F5F7',
        },
        neon: {
          blue: '#007FFF',
          azure: '#2A52BE',
          cyan: '#00F0FF',
          purple: '#B026FF',
          green: '#00FF94'
        },
        // Brand gradient colors - use these for consistent branding
        brand: {
          primary: '#007FFF',   // Azure Blue
          secondary: '#2A52BE', // Royal Blue
        }
      },
      backgroundColor: {
        primary: 'rgb(var(--color-bg-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
      },
      textColor: {
        primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--color-text-tertiary) / <alpha-value>)',
      },
      borderColor: {
        light: 'rgb(var(--color-border-light) / <alpha-value>)',
        medium: 'rgb(var(--color-border-medium) / <alpha-value>)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.7', filter: 'brightness(0.8)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'], // Assuming these are imported or fallbacks
      }
    },
  },
  plugins: [],
}
