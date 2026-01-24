# うちストック (uchi-stock) - 家庭用品在庫管理アプリ

家庭の日用品の在庫を効率的に管理し、無くなる日を予測することで、買い忘れや買いすぎを防ぎます。

## 目次
- [1. 主な機能 (Features)](#1-主な機能-features)
- [2. 技術スタック (Tech Stack)](#2-技術スタック-tech-stack)
- [3. ドキュメント一覧 (Documentation)](#3-ドキュメント一覧-documentation)
- [4. クイックスタート (Quick Start)](#4-クイックスタート-quick-start)

---

## 1. 主な機能 (Features)

- **品目管理**: ユーザーが自由に品目を追加・編集・削除、購入単位の設定が可能。
- **在庫記録**: 現在の在庫数、追加購入の数量と購入日を記録。
- **消費状況の可視化**: 品目ごとの消費履歴をグラフなどで確認。
- **在庫切れ予測**: 消費ペースに基づき、在庫が無くなる日を推定。

---

## 2. 技術スタック (Tech Stack)

| 技術 | 名称 | 説明 |
| :---: | :--- | :--- |
| <img src="https://cdn.simpleicons.org/react/61DAFB" width="20" height="20" /> | **React** | UI構築ライブラリ (v19) |
| <img src="https://cdn.simpleicons.org/vite/646CFF" width="20" height="20" /> | **Vite** | 高速ビルドツール & 開発サーバー |
| <img src="./docs/resources/aws-icons/Asset-Package_07312025.49d3aab7f9e6131e51ade8f7c6c8b961ee7d3bb1/Architecture-Service-Icons_07312025/Arch_Database/32/Arch_Amazon-DynamoDB_32.svg" width="20" height="20" /> | **DynamoDB** | フルマネージド NoSQL データベース |
| <img src="./docs/resources/aws-icons/Asset-Package_07312025.49d3aab7f9e6131e51ade8f7c6c8b961ee7d3bb1/Architecture-Service-Icons_07312025/Arch_Compute/32/Arch_AWS-Lambda_32.svg" width="20" height="20" /> | **AWS Lambda** | サーバーレス・コンピューティング |
| <img src="https://cdn.simpleicons.org/firebase/FFCA28" width="20" height="20" /> | **Firebase Auth** | Google SSO 認証 |

---

## 3. ドキュメント一覧 (Documentation)

プロジェクトの詳細については、以下のドキュメントを参照してください。

### 設計・仕様
- [内部設計書](docs/internal-design.md): アーキテクチャ、アルゴリズム、データベース設計
- [API仕様書](docs/api-specification.md): バックエンド API のエンドポイント詳細
- [テスト戦略](docs/test-strategy.md): テスト方針とカバレッジ

### 開発・ガイド
- [セットアップガイド](docs/setup-guide.md): ローカル開発環境の構築手順
- [認証移行ガイド](docs/auth-migration.md): Firebase Auth への移行に関する詳細
- [CI/CD パイプライン仕様](docs/cicd-pipeline-specification.md): GitHub Actions による自動化

### 運用・管理
- [運用ガイド](docs/operations-guide.md): バックアップ、復旧、監視手順
- [リリースガイド](docs/release-guide.md): バージョン管理とリリース手順
- [メンテナンス記録](docs/maintenance.md): 定期的な保守作業のログ

---

## 4. クイックスタート (Quick Start)

詳細な手順は [セットアップガイド](docs/setup-guide.md) を参照してください。

### バックエンド
```bash
cd backend
npm install
npx serverless deploy
```

### フロントエンド
```bash
cd frontend
npm install
npm run dev
```
