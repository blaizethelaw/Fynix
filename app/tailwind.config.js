/** @type {import('tailwindcss').Config} */
const typography = require('@tailwindcss/typography')

module.exports = {
  content: ['index.html', 'src/**/*.{ts,tsx}'],
  theme: { extend: {} },
  plugins: [typography]
}
