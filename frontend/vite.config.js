import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // a simulated browser, so tests can render components
    setupFiles: './src/setupTests.js',
  },
})
