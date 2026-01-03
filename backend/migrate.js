const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

const OLD_TABLE_NAME = "karuta-phrases";
const NEW_TABLE_NAME = "karuta-phrases";

async function migrate() {
  try {
    console.log("Fetching all items from old table...");
    const scanResult = await docClient.send(new ScanCommand({ TableName: OLD_TABLE_NAME }));
    const items = scanResult.Items || [];
    console.log(`Found ${items.length} items.`);

    // 移行プロセス:
    // 1. メモリ上に全アイテムを保持
    // 2. テーブルを再作成（または手動で削除・再作成）
    // 3. 新しい構造でPutItemを実行

    console.log("WARNING: This script expects the table structure to be already updated in serverless.yml and deployed.");
    console.log("Existing statistics will be preserved.");

    for (const item of items) {
      console.log(`Preserving item: ${item.id} (${item.category})`);
      // 統計情報がDynamoDBにしかないことを考慮し、すべての属性を維持したまま新しい構造のテーブルにPutする
      await docClient.send(new PutCommand({
        TableName: NEW_TABLE_NAME,
        Item: item
      }));
    }

    console.log("Migration (re-insertion) complete.");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

migrate();
