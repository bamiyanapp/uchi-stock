import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import sonarjs from 'eslint-plugin-sonarjs'

const sharedLanguageOptions = {
  ecmaVersion: 2020,
  globals: {
    ...globals.browser,
    ...globals.node,
    // vite.config.tsのdefineでビルド時に埋め込むグローバル定数
    // （dev-standards/shared/ui/getAppVersionDefine.js参照）
    __APP_VERSION__: 'readonly',
    __APP_BUILD_TIME__: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
}

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    // TypeScript化していないプレーンJS/JSX（dev-standardsからのsymlink共有
    // コンポーネント、e2eスペック、Service Worker設定等）向けの基本ルール。
    // complexity・sonarjs・max-lines等の厳格なルールは、新規に書く.ts/.tsx
    // のみへ適用する（下のブロック参照）
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: sharedLanguageOptions,
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      sonarjs.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: sharedLanguageOptions,
    rules: {
      complexity: ['error', 15],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
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
)
