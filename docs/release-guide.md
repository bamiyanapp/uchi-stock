# リリースガイド (Release Guide)

本プロジェクトは `semantic-release` を使用して自動リリース管理を行っています。

## 自動リリース (GitHub Actions)
`main` ブランチへのプッシュまたはプルリクエストのマージにより、GitHub Actions 上で自動的にリリースプロセスが実行されます。

## ローカルでのリリース実行
GitHub Actions を介さずにローカル環境からリリースノートの作成とプッシュを行うことも可能です。

### 準備
1. GitHub で Personal Access Token (classic) を作成します。
   - スコープ: `repo` が必要です。
2. プロジェクトルートに `.env` ファイルを作成し、トークンを設定します。
   ```env
   GITHUB_TOKEN=ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

### 実行
1. リリースの内容を事前に確認する（ドライラン）:
   ```bash
   npm run release:local -- --dry-run
   ```
2. 実際にリリースを実行する:
   ```bash
   npm run release:local
   ```
   ※ このコマンドにより、タグの作成、GitHub Release の作成、`CHANGELOG.md` の更新、およびそれらのプッシュが自動的に行われます。
