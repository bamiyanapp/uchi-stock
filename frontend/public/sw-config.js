// sw.js（dev-standardsからsymlink）のプロダクト固有設定。
// docs/service-worker-update-pattern.md参照。
self.SW_CONFIG = {
  // sw.js・sw-config.jsの内容やprecacheUrls等のキャッシュ戦略を変更した際は
  // 必ず値を変更し、activate時に旧キャッシュを確実に破棄させること
  cacheVersion: "v1",
  // インストール時に先読みキャッシュするページ一覧。GitHub Pagesのプロジェクト
  // サイトとしてサブパス（/uchi-stock/）配信のため、絶対パスにはこのサブパスを含める
  precacheUrls: ["/uchi-stock/"],
  // バックエンドAPI（b974xlcqia.execute-api.ap-northeast-1.amazonaws.com）は
  // x-user-id/Authorizationヘッダーでユーザーごとに異なるレスポンスを返す。
  // Cache StorageのキーはURLのみでヘッダーを考慮しないため、Stale-While-Revalidate
  // 対象に含めると別ユーザーのレスポンスを返してしまう恐れがある。そのため
  // 空のままキャッシュ対象外とし、常にネットワークへ直接流す
  apiHostnames: [],
  noCacheSameOriginPrefixes: [],
};
