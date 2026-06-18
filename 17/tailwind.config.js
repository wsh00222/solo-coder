/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      animation: {
        'highlight': 'highlight 2s ease-in-out',
      },
      keyframes: {
        highlight: {
          '0%': {
            backgroundColor: 'rgb(254 243 199)',
            borderColor: 'rgb(251 191 36)',
            boxShadow: '0 0 0 3px rgba(251, 191, 36, 0.2)',
          },
          '50%': {
            backgroundColor: 'rgb(254 243 199)',
            borderColor: 'rgb(251 191 36)',
          },
          '100%': {
            backgroundColor: 'white',
            borderColor: 'rgb(241 245 249)',
            boxShadow: 'none',
          },
        },
      },
    },
  },
  plugins: [],
};
