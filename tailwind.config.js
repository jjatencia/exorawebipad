/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'exora-primary': 'var(--exora-primary)',
        'exora-secondary': 'var(--exora-secondary)',
        'exora-dark': 'var(--exora-dark)',
        'exora-light-blue': 'var(--exora-light-blue)',
        'exora-light-yellow': 'var(--exora-light-yellow)',
        'exora-background': 'var(--exora-background)',
      },
      fontFamily: {
        'main': ['Work Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}