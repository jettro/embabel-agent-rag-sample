import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173,
    proxy: {
      '/chat': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ingest': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
