# 家庭用品在庫管理アプリ (uchi-stock)

## 目的
家庭の日用品の在庫を効率的に管理し、無くなる日を予測することで、買い忘れや買いすぎを防ぎます。

## 主な機能 (Features)

- **品目管理**: ユーザーが自由に品目を追加・編集・削除、購入単位の設定が可能。
- **在庫記録**: 現在の在庫数、追加購入の数量と購入日を記録。
- **消費状況の可視化**: 品目ごとの消費履歴をグラフなどで確認。
- **在庫切れ予測**: 消費ペースに基づき、在庫が無くなる日を推定。
- **通知機能**: 在庫切れが近づいた品物をお知らせ（検討中）。

## 技術スタック (Tech Stack)

| 技術 | 名称 | 説明 |
| :---: | :--- | :--- |
| <img src="https://cdn.simpleicons.org/react/61DAFB" width="20" height="20" /> | **React** | UI構築ライブラリ (v19) |
| <img src="https://cdn.simpleicons.org/vite/646CFF" width="20" height="20" /> | **Vite** | 高速ビルドツール & 開発サーバー |
| <img src="./docs/resources/aws-icons/Asset-Package_07312025.49d3aab7f9e6131e51ade8f7c6c8b961ee7d3bb1/Architecture-Service-Icons_07312025/Arch_Database/32/Arch_Amazon-DynamoDB_32.svg" width="20" height="20" /> | **DynamoDB** | フルマネージド NoSQL データベース |
| <img src="./docs/resources/aws-icons/Asset-Package_07312025.49d3aab7f9e6131e51ade8f7c6c8b961ee7d3bb1/Architecture-Service-Icons_07312025/Arch_Compute/32/Arch_AWS-Lambda_32.svg" width="20" height="20" /> | **AWS Lambda** | サーバーレス・コンピューティング |
| <img src="https://cdn.simpleicons.org/serverless/FD5750" width="20" height="20" /> | **Serverless Framework** | サーバーレス構成・デプロイ管理 |
| <img src="https://cdn.simpleicons.org/firebase/FFCA28" width="20" height="20" /> | **Firebase Auth** | Google SSO による認証管理 |
| <img src="https://cdn.simpleicons.org/githubactions/2088FF" width="20" height="20" /> | **GitHub Actions** | CI/CD オートメーション |
| <img src="https://cdn.simpleicons.org/vitest/6E9F18" width="20" height="20" /> | **Vitest** | 高速なユニットテストフレームワーク |

## ドキュメント (Documentation)

詳細な情報は以下のドキュメントを参照してください。

### 開発・設計
- [**内部設計書**](docs/internal-design.md): システム構成、画面遷移、DB設計、在庫予測アルゴリズム。
- [**API仕様書**](docs/api-specification.md): バックエンド API のエンドポイント一覧と仕様。
- [**セットアップガイド**](docs/setup-guide.md): ローカル開発環境の構築とデプロイ手順。
- [**テスト戦略**](docs/test-strategy.md): テストの基本方針、カテゴリ、自動化範囲。
- [**認証方式の移行ガイド**](docs/auth-migration.md): Firebase Auth への移行に関する詳細。

### 運用・管理
- [**CI/CD パイプライン仕様**](docs/cicd-pipeline-specification.md): 自動テスト、バックアップ、デプロイフロー。
- [**リリースガイド**](docs/release-guide.md): `semantic-release` によるリリース手順。
- [**運用ガイド**](docs/operations-guide.md): バックアップと復旧の手順（DynamoDB PITR等）。
- [**メンテナンス記録**](docs/maintenance.md): 定期的なリポジトリ整理の記録。
