/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sanctuary: {
          50: '#fbf8f5',
          100: '#f5eee6',
          200: '#ebd9c8',
          300: '#debfa4',
          400: '#c79870',
          500: '#b47948',
          600: '#9b5e35',
          700: '#7e462a',
          800: '#673926',
          900: '#4e2a1e',
          950: '#2d150e',
        },
        coffee: {
          dark: '#1c130e',
          espresso: '#2a1a12',
          roast: '#3b251a',
          mocha: '#5c3a28',
          latte: '#d8c2ad',
          foam: '#fdfbf7',
        },
        paper: {
          DEFAULT: '#fbf9f4',
          dark: '#f3efe6',
          aged: '#eae3d2'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 4px 20px -2px rgba(92, 58, 40, 0.08), 0 2px 6px -1px rgba(92, 58, 40, 0.04)',
        'warm-lg': '0 10px 25px -3px rgba(92, 58, 40, 0.12), 0 4px 10px -2px rgba(92, 58, 40, 0.06)',
      }
    },
  },
  plugins: [],
}
