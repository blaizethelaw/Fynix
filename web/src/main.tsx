import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import './sentry'
import { initAnalytics } from './analytics'
import { AuthProvider } from '@/lib/auth'

initAnalytics()

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  addEventListener('load', () => navigator.serviceWorker.register('/sw.js'))
}
