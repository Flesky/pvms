/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#87179d',
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
