import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/uchi-stock/",
  // dev-standards/shared/pwa/UpdateNotifier.jsxをsymlink共有しており、reactを
  // importしている。Viteは既定でシンボリックリンクの実体パス（dev-standards配下）を
  // 起点にnode_modulesを探索してしまうため、preserveSymlinksが必須
  // （dev-standards/docs/shared-ui-components.md参照）
  resolve: {
    preserveSymlinks: true,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
})
