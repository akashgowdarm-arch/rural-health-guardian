/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        socio: {
          50: '#EEF6FF',
          100: '#DBECFE',
          200: '#BFDEFE',
          300: '#93C5FD',
          400: '#3B82F6',
          500: '#0284C7',
          600: '#0258A6', // Primary SOCIO Blue
          700: '#004787',
          800: '#00376B',
          900: '#08254A',
        },
        solar: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#FF7D26',
          600: '#F36F21', // Primary Solar Orange
          700: '#E85908',
          800: '#C2410C',
          900: '#7C2D12',
        },
        navy: {
          800: '#0D224A',
          900: '#0B1B3D',
          950: '#070F23',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        heading: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(2, 88, 166, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'premium': '0 12px 36px -4px rgba(2, 88, 166, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 20px 40px -8px rgba(2, 88, 166, 0.18), 0 8px 16px -4px rgba(243, 111, 33, 0.12)',
        'orange-glow': '0 0 25px rgba(243, 111, 33, 0.35)',
        'blue-glow': '0 0 30px rgba(2, 88, 166, 0.3)',
      },
      borderRadius: {
        'card': '16px',
      }
    },
  },
  plugins: [],
}
