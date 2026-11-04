// `userId`が指定されている場合のみ`?userId=...`クエリを付与する。
// ネストしたテンプレートリテラル（sonarjs/no-nested-template-literals）を
// 避けるための共通ヘルパー（issue #633）。
export function appendUserIdQuery(path: string, userId: string | null | undefined): string {
  return userId ? `${path}?userId=${userId}` : path;
}
