import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 400: '#ff7a45', 500: '#ff6a3d', 600: '#ff5a35' }
      },
      borderRadius: { '2xl': '1.25rem' }
    }
  },
  plugins: [typography]
} satisfies Config
