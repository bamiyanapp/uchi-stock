const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

const ITEMS_TABLE = "uchi-stock-app-items";
const HISTORY_TABLE = "uchi-stock-app-stock-history";

const items = [
  {
    name: "トイレットペーパー",
    unit: "ロール",
    currentStock: 12,
    consumptionPattern: "consistent", // 2日に1回1ロール
    daysOfHistory: 14
  },
  {
    name: "牛乳",
    unit: "本",
    currentStock: 1,
    consumptionPattern: "fast", // 毎日1本
    daysOfHistory: 7
  },
  {
    name: "ティッシュペーパー",
    unit: "箱",
    currentStock: 3,
    consumptionPattern: "slow", // 5日に1回1箱
    daysOfHistory: 20
  },
  {
    name: "お米",
    unit: "kg",
    currentStock: 2,
    consumptionPattern: "variable", // 3〜4日に1kg
    daysOfHistory: 30
  }
];

async function clearTables() {
  console.log("Clearing existing data...");
  
  // Clear Items
  const itemsData = await docClient.send(new ScanCommand({ TableName: ITEMS_TABLE }));
  for (const item of itemsData.Items || []) {
    await docClient.send(new DeleteCommand({ TableName: ITEMS_TABLE, Key: { itemId: item.itemId } }));
  }

  // Clear History
  const historyData = await docClient.send(new ScanCommand({ TableName: HISTORY_TABLE }));
  for (const item of historyData.Items || []) {
    await docClient.send(new DeleteCommand({ TableName: HISTORY_TABLE, Key: { historyId: item.historyId, itemId: item.itemId } }));
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
        }

        if (purchase) {
          await docClient.send(new PutCommand({
            TableName: HISTORY_TABLE,
            Item: {
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
