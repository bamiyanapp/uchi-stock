const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

const V1_ITEMS_TABLE = "uchi-stock-app-items";
const V1_HISTORY_TABLE = "uchi-stock-app-stock-history";
const V2_ITEMS_TABLE = "uchi-stock-app-items-v2";
const V2_HISTORY_TABLE = "uchi-stock-app-stock-history-v2";

const DEFAULT_USER_ID = "default-user";

async function migrate() {
  try {
    console.log("Starting migration from v1 to v2...");

    // Migrate Items
    console.log(`Scanning ${V1_ITEMS_TABLE}...`);
    const { Items: v1Items } = await docClient.send(new ScanCommand({ TableName: V1_ITEMS_TABLE }));
    console.log(`Found ${v1Items?.length || 0} items in v1.`);

    for (const item of v1Items || []) {
      const userId = item.userId || DEFAULT_USER_ID;
      console.log(`Migrating item: ${item.name} (${item.itemId}) to user: ${userId}`);
      await docClient.send(new PutCommand({
        TableName: V2_ITEMS_TABLE,
        Item: {
          ...item,
          userId
        }
      }));
    }

    // Migrate History
    console.log(`Scanning ${V1_HISTORY_TABLE}...`);
    const { Items: v1History } = await docClient.send(new ScanCommand({ TableName: V1_HISTORY_TABLE }));
    console.log(`Found ${v1History?.length || 0} history records in v1.`);

    for (const record of v1History || []) {
      // 履歴レコードにもuserIdを付与
      // もしitem.itemIdから対応するuserIdを引きたい場合はさらに処理が必要だが、
      // ここではシンプルにレコード内のuserIdかデフォルトを使用
      const userId = record.userId || DEFAULT_USER_ID;
      console.log(`Migrating history: ${record.historyId} for item: ${record.itemId}`);
      await docClient.send(new PutCommand({
        TableName: V2_HISTORY_TABLE,
        Item: {
          ...record,
          userId
        }
      }));
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    if (error.name === "ResourceNotFoundException") {
        console.error("Migration failed: One or more tables not found. Please ensure v1 tables exist.");
    } else {
        console.error("Migration failed:", error);
    }
  }
}

migrate();
