#!/bin/bash

# .envファイルがあれば読み込む
if [ -f .env ]; then
  export $(cat .env | xargs)
fi

# GITHUB_TOKENの確認
if [ -z "$GITHUB_TOKEN" ]; then
  echo "Error: GITHUB_TOKEN environment variable is not set."
  echo "Please set it in your environment or in a .env file."
  exit 1
fi

# 引数の処理
DRY_RUN=""
if [ "$1" == "--dry-run" ]; then
  DRY_RUN="--dry-run"
  echo "Running in dry-run mode..."
fi

# semantic-releaseの実行
# --no-ci: CI環境でなくても実行可能にする
npx semantic-release --no-ci $DRY_RUN
