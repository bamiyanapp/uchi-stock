const { DynamoDBClient, CreateBackupCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const fs = require("fs");
const path = require("path");

async function backup() {
  const region = process.env.AWS_REGION || "ap-northeast-1";
  const client = new DynamoDBClient({ region });

  // テーブル名は環境変数または引数から取得
  const tables = process.argv.slice(2);
  if (tables.length === 0) {
    console.error("Usage: node scripts/backup-dynamodb.js <table1> <table2> ...");
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
  }

  for (const tableName of tables) {
    console.log(`Starting backup for table: ${tableName}`);

    try {
      // 1. AWS Native Backup
      const backupName = `${tableName}-backup-${timestamp}`;
      const createBackupResult = await client.send(
        new CreateBackupCommand({
          TableName: tableName,
          BackupName: backupName,
        })
      );
      console.log(`AWS backup created: ${createBackupResult.BackupDetails.BackupArn}`);

      // 2. Data Dump (JSON)
      console.log(`Dumping data to JSON for table: ${tableName}`);
      let items = [];
      let lastEvaluatedKey = null;

      do {
        const scanResult = await client.send(
          new ScanCommand({
            TableName: tableName,
            ExclusiveStartKey: lastEvaluatedKey,
          })
        );
        items = items.concat(scanResult.Items || []);
        lastEvaluatedKey = scanResult.LastEvaluatedKey;
      } while (lastEvaluatedKey);

      const filePath = path.join(backupDir, `${tableName}-${timestamp}.json`);
      fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
      console.log(`Data dump saved to: ${filePath}`);
    } catch (error) {
      console.error(`Failed to backup table ${tableName}:`, error);
      // バックアップ失敗でも続行するか、エラー終了するか
      // デプロイを止めるべきなので、ここでは例外を投げる
      throw error;
    }
  }
}

backup().catch((err) => {
  console.error(err);
  process.exit(1);
});
