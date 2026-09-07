/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          DEFAULT: '#FF9933',
          50: '#FFF5EB',
          100: '#FFE6CC',
          500: '#FF9933',
          600: '#E67E17',
          700: '#CC6600',
        },
        indiagreen: {
          DEFAULT: '#138808',
          50: '#E8F5E9',
          500: '#138808',
          600: '#0E6606',
        },
        chakranavy: {
          DEFAULT: '#000080',
          50: '#E8E8F8',
          500: '#000080',
          800: '#00004D',
          900: '#000033',
        },
        weather: {
          dark: '#0B0F19',
          card: 'rgba(17, 24, 39, 0.75)',
          border: 'rgba(255, 255, 255, 0.1)',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 12px rgba(255, 153, 51, 0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 4px rgba(255, 153, 51, 0.2))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
