import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.svg', 'og.png'],
    manifest: {
      name: 'Fynix',
      short_name: 'Fynix',
      theme_color: '#0b0f1f',
      background_color: '#0b0f1f',
      display: 'standalone',
      icons: [
        { src: '/favicon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any maskable' },
        { src: '/favicon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
      ]
    }
  })],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  server: { port: 5173 },
  build: { sourcemap: true }
})
