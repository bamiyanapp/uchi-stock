# API Specification (Backend API)

本アプリのバックエンド（AWS Lambda）で提供されている API の仕様です。

## エンドポイント一覧

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

## 認証
すべての API リクエストには、`Authorization: Bearer <ID_TOKEN>` ヘッダーが必要です。
詳細については [内部設計書](internal-design.md) の「ユーザー識別とセキュリティ」を参照してください。
