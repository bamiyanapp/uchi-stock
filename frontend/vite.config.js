import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/uchi-stock/",
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
})
