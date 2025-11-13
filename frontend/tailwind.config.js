/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ivory': '#E4E4DE',
        'sage': '#C4C5BA',
        'moss': '#595F39',
        'charcoal': '#1B1B1B',
      },
    },
  },
  plugins: [],
}

