@dev-standards/CLAUDE.md

> `dev-standards/` は git submodule。上記インポートが解決できない、または `.clinerules/` ・ `.claude/skills/` ・ `.clineignore` ・ `commitlint.config.cjs` のシンボリックリンク先が空に見える場合は、`git submodule update --init --recursive` を実行してから再度参照すること。

## uchi-stock固有ルール

### 対象パッケージ（「1. 開発プロセス」手順6、「4. 静的チェック」関連）

対象パッケージは `frontend/` と `backend/` の2つ。それぞれのディレクトリで以下を実行する。

- frontend: lint `npm run lint`、test `npm run test`（Vitest実行後にlint・buildも実行される）、build `npm run build`
- backend: lint `npm run lint`、test `npm run test`（Vitest実行後にlint・`serverless package --stage local-test` によるデプロイ検証も実行される）

リポジトリ直下（root）はfrontend/backendのような静的チェック対象ではなく、commitlint・semantic-release等の共通ツール専用。

### テストカバレッジ

frontend/backendともにVitestの `--coverage` を実行する。C0/C1カバレッジ50%以上を目安とし、大きく下回る変更は追加テストで補うこと。

### コード内コメント

このリポジトリでは日本語でコメントを記述する慣習がある（既存コードを参照）。ロジックの背景・ビジネスルール等、非自明な意図がある場合のみ日本語で簡潔に記述する。

### CI・自動マージ（「10. PR（MR）承認・マージ禁止」関連）

本リポジトリは `.github/workflows/ci.yml` から dev-standards の `reusable-ci.yml` を呼び出しており、commitlint・frontend-test・frontend-e2e-test（Playwright）・backend-test がすべて成功した場合にのみ `merge` ジョブがPRをsquashマージし作業ブランチを削除する。この仕組みの有無にかかわらず、共通ルール「10. PR（MR）承認・マージ禁止」を厳守し、PR（MR）の承認・マージは行わないこと。

### CD（`.github/workflows/cd.yml`）

semantic-release は `.releaserc.cjs` の設定により `main` ブランチに対して直接実行される（release ブランチへの切り替えを前提としない）。そのため dev-standards の `reusable-cd.yml`（base_branch→release_branchの同期・release_branch上でのリリースを前提としたreusable workflow）は本リポジトリの実際のリリース運用と一致せず、使用しない。`cd.yml` は本リポジトリ固有のワークフローとしてそのまま維持する。frontend（GitHub Pages）・backend（Serverless Framework経由のAWS Lambda）へのデプロイ手順もプロダクト固有のため、共通化の対象外とする。
