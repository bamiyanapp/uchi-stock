# セットアップガイド (Setup Guide)

本プロジェクトをローカル環境で実行、またはデプロイするための手順です。

## 1. 認証の設定 (Firebase)

本アプリの認証には Firebase Authentication を使用しています。設定の詳細は [認証方式の移行ガイド](auth-migration.md) を参照してください。

## 2. バックエンドのセットアップ

1.  `backend` ディレクトリに移動します。
    ```bash
    cd backend
    ```
2.  依存関係をインストールします。
    ```bash
    npm install
    ```
3.  必要に応じて `serverless.yml` の環境変数を設定します。
    -   `FIREBASE_SERVICE_ACCOUNT` は必須です。
4.  AWS へのデプロイを実行します。
    ```bash
    npx serverless deploy
    ```

## 3. フロントエンドのセットアップ

1.  `frontend` ディレクトリに移動します。
    ```bash
    cd frontend
    ```
2.  依存関係をインストールします。
    ```bash
    npm install
    ```
3.  `.env` ファイルを作成し、Firebase の設定値を入力します。
4.  ローカル開発サーバーを起動します。
    ```bash
    npm run dev
    ```
