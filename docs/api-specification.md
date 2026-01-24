# API Specification (Backend API)

本アプリのバックエンド（AWS Lambda）で提供されている API の仕様です。

## 目次
- [1. エンドポイント一覧](#1-エンドポイント一覧)
- [2. 認証](#2-認証)
- [3. エラーレスポンス](#3-エラーレスポンス)

---

## 1. エンドポイント一覧

| 関数名 | パス | メソッド | 説明 |
| :--- | :--- | :--- | :--- |
| createItem | `/items` | POST | 新しい品目を登録する。 |
| getItems | `/items` | GET | ユーザーに紐づくすべての品目を取得する。 |
| updateItem | `/items/{itemId}` | PUT | 品目情報（名称、単位等）を更新する。 |
| deleteItem | `/items/{itemId}` | DELETE | 品目を削除する。 |
| addStock | `/items/{itemId}/stock` | POST | 在庫を追加（購入）し、現在の在庫数を増加させる。 |
| consumeStock | `/items/{itemId}/consume` | POST | 在庫を消費し、現在の在庫数を減少させる。同時に平均消費ペースを再計算する。 |
| getConsumptionHistory | `/items/{itemId}/history` | GET | 品目の履歴（作成・購入・消費・更新）を取得する。 |
| getEstimatedDepletionDate | `/items/{itemId}/estimate` | GET | 現在の在庫数と消費ペースに基づき、在庫切れ推定日を計算して取得する。 |

---

## 2. 認証
原則として、すべての API リクエストには `Authorization: Bearer <ID_TOKEN>` ヘッダーが必要です。

### テストモード（ログイン未済の場合）
ログインせずにアプリを試用できる「テストモード」を提供しています。
以下の条件を満たす場合、認証なしで API を利用できます。

-   `x-user-id` ヘッダーに `test-user` が指定されていること。
-   この場合、データは共有のテストユーザー領域に保存されます。

### 開発・テスト環境
開発およびテスト環境では、環境変数 `ALLOW_INSECURE_USER_ID=true` を設定することで、任意の `x-user-id` ヘッダーによる簡易認証が可能です。

詳細については [内部設計書](internal-design.md) の「ユーザー識別とセキュリティ」を参照してください。

---

## 3. エラーレスポンス
API はエラー発生時に以下の形式の JSON レスポンスを返します。

```json
{
  "message": "エラーの内容説明",
  "error": "詳細なエラーメッセージ",
  "stack": "スタックトレース（開発環境のみ）"
}
```

主なステータスコード:
- `400 Bad Request`: リクエストボディの欠如、不正な JSON、必須パラメータの欠如など。
- `401 Unauthorized`: 認証情報の欠如、無効なトークンなど。
- `404 Not Found`: 指定されたアイテムが見つからない場合。
- `500 Internal Server Error`: サーバー内部での予期せぬエラー。
