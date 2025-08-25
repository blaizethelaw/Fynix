import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true, // enables `node:buffer` etc
      include: ['buffer', 'process']
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      buffer: 'buffer' // allow `import { Buffer } from "buffer"`
    }
  },
  define: {
    // some libs look for process.env in browser
    'process.env': {}
  },
  build: { sourcemap: true }
})
