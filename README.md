# 名称
家庭用品在庫管理アプリ

## 目的
家庭の日用品の在庫を効率的に管理し、無くなる日を予測することで、買い忘れや買いすぎを防ぎます。

## Features

- **品目管理**:
  - ユーザーが自由に品目を追加・編集・削除できます。
  - 各品目に対して、購入単位（個、パック、本など）を自由に設定できます。
- **在庫記録**:
  - 現在の在庫数を記録・更新できます。
  - 追加購入した品目の数量と購入日を記録できます。
- **消費状況の可視化**:
  - 品目ごとの消費履歴をグラフなどで確認できます。
- **在庫切れ予測**:
  - 消費状況に基づいて、在庫が無くなる日を推定し、ユーザーに提示します。
- **通知機能**:
  - 在庫切れが近づいた品目について、通知（検討中）を行うことができます。

## Tech Stack

| 技術 | 名称 | 説明 |
| :---: | :--- | :--- |
| <img src="https://cdn.simpleicons.org/react/61DAFB" width="20" height="20" /> | **React** | ユーザーインターフェース構築のためのJavaScriptライブラリ。最新のv19を使用。 |
| <img src="https://cdn.simpleicons.org/vite/646CFF" width="20" height="20" /> | **Vite** | 高速なビルドツールおよび開発サーバー。 |
| <img src="./docs/resources/aws-icons/Asset-Package_07312025.49d3aab7f9e6131e51ade8f7c6c8b961ee7d3bb1/Architecture-Service-Icons_07312025/Arch_Database/32/Arch_Amazon-DynamoDB_32.svg" width="20" height="20" /> | **DynamoDB** | フルマネージドなNoSQLデータベース。品目や在庫情報を格納。 |
| <img src="./docs/resources/aws-icons/Asset-Package_07312025.49d3aab7f9e6131e51ade8f7c6c8b961ee7d3bb1/Architecture-Service-Icons_07312025/Arch_Compute/32/Arch_AWS-Lambda_32.svg" width="20" height="20" /> | **AWS Lambda** | サーバーレスなイベント駆動型コンピューティングサービス。 |
| <img src="https://cdn.simpleicons.org/serverless/FD5750" width="20" height="20" /> | **Serverless Framework** | サーバーレスアプリケーションの構成・デプロイを管理するフレームワーク。 |
| <img src="./docs/resources/aws-icons/Asset-Package_07312025.49d3aab7f9e6131e51ade8f7c6c8b961ee7d3bb1/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/32/Arch_Amazon-Cognito_32.svg" width="20" height="20" /> | **Amazon Cognito** | Google SSO認証を提供するID管理サービス。 |
| <img src="./docs/resources/aws-icons/Asset-Package_07312025.49d3aab7f9e6131e51ade8f7c6c8b961ee7d3bb1/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/32/Arch_Amazon-Polly_32.svg" width="20" height="20" /> | **Amazon Polly** | テキストをリアルな音声に変換するクラウドサービス。（現時点では利用予定なし、構成は引き継ぐ） |
| <img src="https://cdn.simpleicons.org/githubactions/2088FF" width="20" height="20" /> | **GitHub Actions** | CI/CD（継続的インテグレーション/継続的デプロイ）を自動化。 |
| <img src="https://cdn.simpleicons.org/vitest/6E9F18" width="20" height="20" /> | **Vitest** | Viteネイティブで高速なユニットテストフレームワーク。 |

## Architecture

### System Architecture

```mermaid
graph TD
    subgraph "Frontend (GitHub Pages)"
        I[React + Vite]
    end

    subgraph "Auth"
        C[Amazon Cognito / Google SSO]
    end

    subgraph "Backend (AWS)"
        J[API Gateway] --> K[AWS Lambda];
        K --> L[DynamoDB];
    end

    I -- Login --> C;
    I -- API Request with JWT --> J;
```

### Screen Transitions

```mermaid
graph TD
    Login[Google ログイン画面] --> |ログイン成功| Home[在庫一覧画面]
    Home --> |品目名をクリック| Detail[品目詳細・履歴画面]
    Home --> |「在庫を更新する」をクリック| Update[在庫更新画面]
    Detail --> |「在庫を更新する」をクリック| Update
    Update --> |「更新を保存する」をクリック| Detail
    Detail --> |「在庫一覧へ戻る」をクリック| Home
    Home --> |ログアウト| Login
```

### 画面一覧

| 画面名 | パス | 説明 |
| :--- | :--- | :--- |
| 在庫一覧 | `/` | 登録されている品目の一覧、現在の在庫数、および在庫切れ予想日を表示します。 |
| 品目詳細・履歴 | `/item/{itemId}` | 特定の品目の詳細情報と、これまでの在庫変動履歴（購入・消費）を表示します。 |
| 在庫更新 | `/item/{itemId}/update` | 在庫数の追加（購入）や消費を記録し、現在の在庫数を更新します。 |

### Authentication

本アプリは Google アカウントによる SSO（シングルサインオン）認証を採用しています。

- **認証プロバイダー**: Amazon Cognito + Google OAuth 2.0
- **仕組み**:
  1. ユーザーが Google アカウントでログイン。
  2. Cognito が JWT（JSON Web Token）を発行。
  3. フロントエンドは API リクエストの `Authorization` ヘッダーにこのトークンを含めて送信。
  4. バックエンド（API Gateway / Lambda）でトークンの有効性を検証し、ユーザーID（`sub`）を特定。

### Backend API (AWS Lambda)

| 関数名 | パス | メソッド | 説明 |
| :--- | :--- | :--- | :--- |
| createItem | `/items` | POST | 新しい品目を登録する。（管理用） |
| getItems | `/items` | GET | 登録されているすべての品目を取得する。 |
| updateItem | `/items/{itemId}` | PUT | 品目情報を更新する。（管理用） |
| deleteItem | `/items/{itemId}` | DELETE | 品目を削除する。 |
| addStock | `/items/{itemId}/stock` | POST | 品目の在庫を追加する。 |
| consumeStock | `/items/{itemId}/consume` | POST | 品目の在庫を消費する。 |
| getConsumptionHistory | `/items/{itemId}/history` | GET | 品目の消費履歴を取得する。 |
| getEstimatedDepletionDate | `/items/{itemId}/estimate` | GET | 品目の在庫切れ推定日を取得する。 |

### Database (DynamoDB)

#### 1. household-items
家庭用品の品目情報を格納するテーブル。

| 属性名 | 型 | キー | 説明 |
| :--- | :--- | :--- | :--- |
| userId | String | Partition Key | ログインユーザーID (Cognito sub) |
| itemId | String | Sort Key | 品目の一意識別子 (UUID) |
| name | String | - | 品目名 |
| unit | String | - | 単位（例: 個, パック, 本） |
| currentStock | Number | - | 現在の在庫数 |
| createdAt | String | - | 作成日時 (ISO8601) |
| updatedAt | String | - | 更新日時 (ISO8601) |

#### 2. stock-history
品目の購入・消費履歴を格納するテーブル。

| 属性名 | 型 | キー | 説明 |
| :--- | :--- | :--- | :--- |
| itemId | String | Partition Key | 品目ID |
| date | String | Sort Key | 日付 (ISO8601) |
| userId | String | - | ログインユーザーID |
| historyId | String | - | 履歴の一意識別子 (UUID) |
| type | String | - | 履歴の種類（"purchase", "consumption"） |
| quantity | Number | - | 数量 |
| memo | String | - | メモ (任意) |

## CI/CD Pipeline Specification

詳細な CI/CD パイプラインの仕様については、[CI/CD Pipeline Specification](docs/cicd-pipeline-specification.md) を参照してください。

## テスト戦略

詳細なテスト戦略については、[テスト戦略](docs/test-strategy.md) を参照してください。

## リリース

このプロジェクトは `semantic-release` を使用して自動リリース管理を行っています。

### ローカルでのリリース実行

GitHub Actions を介さずにローカル環境からリリースノートの作成とプッシュを行うことができます。

#### 準備
1. GitHub で Personal Access Token (classic) を作成します。
   - スコープ: `repo` が必要です。
2. プロジェクトルートに `.env` ファイルを作成し、トークンを設定します。
   ```env
   GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

#### 実行
1. リリースの内容を事前に確認する（ドライラン）:
   ```bash
   npm run release:local -- --dry-run
   ```
2. 実際にリリースを実行する:
   ```bash
   npm run release:local
   ```
   ※ このコマンドにより、タグの作成、GitHub Release の作成、`CHANGELOG.md` の更新、およびそれらのプッシュが自動的に行われます。

## 運用

### バックアップと復旧

本システムでは、データの保護と可用性向上のため、以下のバックアップ体制をとっています。

- **DynamoDB Point-in-Time Recovery (PITR)**:
  - すべてのテーブル（`household-items`, `stock-history`, `polly-cache`）において PITR を有効化しています。
  - 過去 35 日間の任意の時点にデータを復旧することが可能です。
  - 意図しないデータ削除や更新ミスが発生した際の保険として機能します。

## メンテナンス

定期的なリポジトリの整理とメンテナンスを行っています。

- **2026-01-16**: ローカルブランチの整理を実施。
  - マージ済みのブランチを削除。
  - 最終更新から4日以上経過した未マージの古いブランチを削除。
