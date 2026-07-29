/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f0ff',
          100: '#e4e3ff',
          200: '#cbc9ff',
          300: '#a7a3ff',
          400: '#8074ff',
          500: '#6355f5',
          600: '#4f3ee0', // primary brand indigo (matches "Sign In" button)
          700: '#4230b8',
          800: '#372a93',
          900: '#302676',
        },
        surface: '#f6f5f1', // page background (warm off-white)
      },
      fontFamily: {
        sans: ['"Poppins"', 'system-ui', 'sans-serif'],
        signature: ['"Caveat"', 'cursive'],
      },
      boxShadow: {
        card: '0 20px 45px -15px rgba(41, 37, 96, 0.25)',
      },
    },
  },
  plugins: [],
};
