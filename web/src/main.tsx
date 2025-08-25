import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App'
import './index.css'
import './sentry'
import { initAnalytics } from './analytics'
import { AuthProvider } from '@/lib/auth'

// --- Browser polyfill for Node's Buffer (needed by some md libs)
import { Buffer } from 'buffer'
;(window as any).Buffer ??= Buffer
// ---

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))
}
