import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    port: 8080,
    host: '0.0.0.0',
    allowedHosts: [
      'tpplaylearn-publicfront-production.up.railway.app',
      '.railway.app', // Permet tous les sous-domaines Railway
      'localhost'
    ]
  }
})
