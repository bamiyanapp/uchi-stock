# 認証方式の移行ガイド (Cognito → Firebase)

本プロジェクトの認証方式を AWS Cognito から Firebase Authentication に移行しました。
移行を完了するために、以下の手順で設定を行ってください。

## 1. Firebase プロジェクトの設定

1.  [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成します。
2.  **Authentication** を有効にし、**Google** ログインプロバイダーを設定します。
3.  **プロジェクトの設定** > **マイアプリ** で Web アプリを追加し、Firebase SDK 設定（config）を取得します。

## 2. フロントエンドの設定 (.env)

`frontend/.env` (または環境変数) に以下の値を設定してください。

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## 3. バックエンドの設定 (Firebase Admin SDK)

バックエンドで ID トークンを検証するために、サービスアカウントキーが必要です。

1.  Firebase Console の **プロジェクトの設定** > **サービス アカウント** に移動します。
2.  **新しい秘密鍵の生成** をクリックし、JSON ファイルをダウンロードします。
3.  ダウンロードした JSON の内容を、環境変数 `FIREBASE_SERVICE_ACCOUNT` に設定します。
    *   Serverless Framework を使用してデプロイする場合、`.env` ファイル等に JSON 文字列（改行を詰めたもの）を設定してください。
    *   セキュリティのため、本番環境では AWS Secrets Manager 等の使用を推奨します。

### 環境変数リスト (Backend)

| 変数名 | 説明 | デフォルト値 |
| :--- | :--- | :--- |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase サービスアカウントの JSON 文字列 | (必須) |
| `ALLOW_INSECURE_USER_ID` | `x-user-id` ヘッダーによる識別を許可するか | `false` |

## 4. ローカル開発時の注意

ローカル開発やテストで Firebase の認証をスキップしたい場合は、環境変数 `ALLOW_INSECURE_USER_ID=true` を設定することで、従来通り `x-user-id` ヘッダーによるユーザー識別が有効になります。
ただし、本番環境ではセキュリティ確保のため必ず `false` に設定してください。
