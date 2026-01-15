const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

const ITEMS_TABLE = "uchi-stock-app-items-v2";
const HISTORY_TABLE = "uchi-stock-app-stock-history-v2";
const DEFAULT_USER_ID = "default-user";

const items = [
  {
    name: "トイレットペーパー (2日に1回消費)",
    unit: "ロール",
    currentStock: 10,
    consumptionPattern: "consistent", // 2日に1回1ロール -> 平均0.5/日
    daysOfHistory: 20
  },
  {
    name: "牛乳 (毎日消費)",
    unit: "本",
    currentStock: 5,
    consumptionPattern: "fast", // 毎日1本 -> 平均1.0/日
    daysOfHistory: 10
  },
  {
    name: "ティッシュペーパー (5日に1回消費)",
    unit: "箱",
    currentStock: 2,
    consumptionPattern: "slow", // 5日に1回1箱 -> 平均0.2/日
    daysOfHistory: 30
  },
  {
    name: "お米 (不定期消費)",
    unit: "kg",
    currentStock: 5,
    consumptionPattern: "variable", // 3〜4日に1kg
    daysOfHistory: 30
  },
  {
    name: "検証用アイテム (毎日2個消費)",
    unit: "個",
    currentStock: 20,
    consumptionPattern: "test-stable", // 毎日2個 -> 平均2.0/日
    daysOfHistory: 10
  }
];

async function clearTables() {
  console.log("Clearing existing data...");
  
  // Clear Items
  const itemsData = await docClient.send(new ScanCommand({ TableName: ITEMS_TABLE }));
  for (const item of itemsData.Items || []) {
    await docClient.send(new DeleteCommand({ 
      TableName: ITEMS_TABLE, 
      Key: { userId: item.userId, itemId: item.itemId } 
    }));
  }

  // Clear History
  const historyData = await docClient.send(new ScanCommand({ TableName: HISTORY_TABLE }));
  for (const item of historyData.Items || []) {
    await docClient.send(new DeleteCommand({ 
      TableName: HISTORY_TABLE, 
      Key: { userId: item.userId, historyId: item.historyId } 
    }));
  }
  
  console.log("Tables cleared.");
}

async function seed() {
  try {
    await clearTables();

    const now = new Date();

    for (const itemDef of items) {
      const itemId = crypto.randomUUID();
      const createdAt = new Date(now.getTime() - itemDef.daysOfHistory * 24 * 60 * 60 * 1000).toISOString();

      // 品目の登録
      await docClient.send(new PutCommand({
        TableName: ITEMS_TABLE,
        Item: {
          userId: DEFAULT_USER_ID,
          itemId,
          name: itemDef.name,
          unit: itemDef.unit,
          currentStock: itemDef.currentStock,
          createdAt,
          updatedAt: now.toISOString(),
        },
      }));

      console.log(`Added item: ${itemDef.name} (${itemId})`);

      // 履歴の生成
      let historyCount = 0;
      let virtualStock = itemDef.currentStock + 10; // 過去の時点での仮想在庫

      for (let i = itemDef.daysOfHistory; i > 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        let consume = false;
        let purchase = false;
        let quantity = 1;

        // 購入イベント（履歴の最初の方で1回購入しておく）
        if (i === itemDef.daysOfHistory) {
          purchase = true;
          quantity = 10;
        }

        // 消費パターンの判定
        if (itemDef.consumptionPattern === "consistent" && i % 2 === 0) {
          consume = true;
        } else if (itemDef.consumptionPattern === "fast") {
          consume = true;
        } else if (itemDef.consumptionPattern === "slow" && i % 5 === 0) {
          consume = true;
        } else if (itemDef.consumptionPattern === "variable" && i % (3 + Math.floor(Math.random() * 2)) === 0) {
          consume = true;
        } else if (itemDef.consumptionPattern === "test-stable") {
          consume = true;
          quantity = 2;
        }

        if (purchase) {
          await docClient.send(new PutCommand({
            TableName: HISTORY_TABLE,
            Item: {
              userId: DEFAULT_USER_ID,
              historyId: crypto.randomUUID(),
              itemId,
              type: "purchase",
              quantity,
              date: date.toISOString(),
              memo: "まとめ買い",
            },
          }));
          historyCount++;
        }

        if (consume && !purchase) {
          await docClient.send(new PutCommand({
            TableName: HISTORY_TABLE,
            Item: {
              userId: DEFAULT_USER_ID,
              historyId: crypto.randomUUID(),
              itemId,
              type: "consumption",
              quantity,
              date: date.toISOString(),
              memo: "定期消費",
            },
          }));
          historyCount++;
        }
      }
      console.log(`  Added ${historyCount} history records for ${itemDef.name}`);
    }

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seed();
