import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import getAppVersionDefine from './getAppVersionDefine.js' // symlink

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
  // __APP_VERSION__・__APP_BUILD_TIME__をビルド時に埋め込む
  // （dev-standards/docs/frontend-ui-conventions.md「トップページの必須構成」）。
  // frontend/package.jsonではなくリポジトリルートのpackage.jsonを参照する
  // （semantic-releaseがバージョンを更新する対象がルート側のため）
  define: {
    ...getAppVersionDefine(new URL('../package.json', import.meta.url)),
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
})
