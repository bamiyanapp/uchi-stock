import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'src/changelog.json', 'coverage']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
        // vite.config.jsのdefineでビルド時に埋め込むグローバル定数
        // （dev-standards/shared/ui/getAppVersionDefine.js参照）
        __APP_VERSION__: 'readonly',
        __APP_BUILD_TIME__: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // sw.js（dev-standardsからsymlink）・sw-config.jsはService Worker専用の
    // グローバル（self・importScripts・caches等）を使うため、上記のbrowser/node
    // globalsとは別にserviceworker globalsを適用する
    files: ['public/sw.js', 'public/sw-config.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },
])
