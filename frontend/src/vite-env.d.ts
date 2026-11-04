/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// vite.config.tsのdefineでビルド時に埋め込むグローバル定数
// （dev-standards/shared/ui/getAppVersionDefine.js参照）
declare const __APP_VERSION__: string;
declare const __APP_BUILD_TIME__: string;
