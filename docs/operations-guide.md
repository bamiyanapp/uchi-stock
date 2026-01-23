# 運用ガイド (Operations Guide)

本システムでは、データの保護と可用性向上のため、以下のバックアップおよび運用体制をとっています。

## バックアップと復旧

- **DynamoDB Point-in-Time Recovery (PITR)**:
  - 主要なテーブル（`household-items`, `stock-history`）において PITR を有効化しています。
  - 過去 35 日間の任意の時点にデータを復旧することが可能です。
  - 意図しないデータ削除や更新ミスが発生した際の保険として機能します。
- **自動バックアップと保護**:
  - CD パイプラインによるデプロイ直前に、DynamoDB データのスナップショットと JSON へのダンプを自動実行しています。
  - デプロイ時にはテーブル構造の破壊的変更を自動検知し、不用意なデータ消失を防止します。詳細は [CI/CD Pipeline Specification](cicd-pipeline-specification.md) を参照してください。
