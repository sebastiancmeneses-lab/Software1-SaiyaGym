import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Las peticiones a /api se redirigen al backend (Express) en el puerto 3000.
// Así React usa rutas como "/api/usuarios" sin preocuparse por CORS.
const proxyApi = {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: proxyApi },
  preview: { proxy: proxyApi },
})
