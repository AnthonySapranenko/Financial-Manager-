import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // The browser calls /api/... on this same server (no CORS needed), and
      // Vite forwards it to FastAPI without the "/api" prefix:
      // /api/transactions -> http://127.0.0.1:8000/transactions
      '/api': {
        target: 'http://127.0.0.1:8000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom', // a simulated browser, so tests can render components
    setupFiles: './src/setupTests.js',
  },
})
