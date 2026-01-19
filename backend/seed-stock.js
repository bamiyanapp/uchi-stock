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
    consumptionPattern: "consistent", // 2日に1回1ロール -> 平均0.5/日
    daysOfHistory: 20
  },
  {
    name: "牛乳 (毎日消費)",
    unit: "本",
    consumptionPattern: "fast", // 毎日1本 -> 平均1.0/日
    daysOfHistory: 10
  },
  {
    name: "ティッシュペーパー (5日に1回消費)",
    unit: "箱",
    consumptionPattern: "slow", // 5日に1回1箱 -> 平均0.2/日
    daysOfHistory: 30
  },
  {
    name: "お米 (不定期消費)",
    unit: "kg",
    consumptionPattern: "variable", // 3〜4日に1kg
    daysOfHistory: 30
  },
  {
    name: "検証用アイテム (毎日2個消費)",
    unit: "個",
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
      Key: { itemId: item.itemId, date: item.date } 
    }));
  }
  
  console.log("Tables cleared.");
}

async function seed(dryRun = false) {
  try {
    if (!dryRun) {
      await clearTables();
    } else {
      console.log("Dry run mode: No data will be written to DynamoDB.");
    }

    const now = new Date();

    for (const itemDef of items) {
      const itemId = crypto.randomUUID();
      const createdAt = new Date(now.getTime() - itemDef.daysOfHistory * 24 * 60 * 60 * 1000).toISOString();

      // 履歴の生成と在庫の計算
      let historyCount = 0;
      let calculatedStock = 0;
      const historyItems = [];

      for (let i = itemDef.daysOfHistory; i > 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        let consume = false;
        let purchase = false;
        let purchaseQuantity = 0;
        let consumeQuantity = 0;

        // 購入イベント（履歴の最初の方で1回購入しておく）
        if (i === itemDef.daysOfHistory) {
          purchase = true;
          // 消費量に見合う分だけ初期購入する（少し余裕を持たせる）
          if (itemDef.consumptionPattern === "test-stable") {
            purchaseQuantity = 30;
          } else if (itemDef.consumptionPattern === "fast") {
            purchaseQuantity = 15;
          } else {
            purchaseQuantity = 10;
          }
        }

        // 消費パターンの判定
        if (itemDef.consumptionPattern === "consistent" && i % 2 === 0) {
          consume = true;
          consumeQuantity = 1;
        } else if (itemDef.consumptionPattern === "fast") {
          consume = true;
          consumeQuantity = 1;
        } else if (itemDef.consumptionPattern === "slow" && i % 5 === 0) {
          consume = true;
          consumeQuantity = 1;
        } else if (itemDef.consumptionPattern === "variable" && i % (3 + Math.floor(Math.random() * 2)) === 0) {
          consume = true;
          consumeQuantity = 1;
        } else if (itemDef.consumptionPattern === "test-stable") {
          consume = true;
          consumeQuantity = 2;
        }

        if (purchase) {
          historyItems.push({
            userId: DEFAULT_USER_ID,
            historyId: crypto.randomUUID(),
            itemId,
            type: "purchase",
            quantity: purchaseQuantity,
            date: date.toISOString(),
            memo: "まとめ買い",
          });
          calculatedStock += purchaseQuantity;
          historyCount++;
        }

        if (consume && !purchase) {
          historyItems.push({
            userId: DEFAULT_USER_ID,
            historyId: crypto.randomUUID(),
            itemId,
            type: "consumption",
            quantity: consumeQuantity,
            date: date.toISOString(),
            memo: "定期消費",
          });
          calculatedStock -= consumeQuantity;
          historyCount++;
        }
      }

      // 品目の登録（計算された在庫を使用）
      if (!dryRun) {
        await docClient.send(new PutCommand({
          TableName: ITEMS_TABLE,
          Item: {
            userId: DEFAULT_USER_ID,
            itemId,
            name: itemDef.name,
            unit: itemDef.unit,
            currentStock: Math.max(0, calculatedStock),
            createdAt,
          },
        }));
      }

      console.log(`Item: ${itemDef.name} - Calculated stock: ${calculatedStock}`);

      // 履歴の投入
      for (const historyItem of historyItems) {
        if (!dryRun) {
          await docClient.send(new PutCommand({
            TableName: HISTORY_TABLE,
            Item: historyItem,
          }));
        }
      }
      console.log(`  Added ${historyCount} history records`);
    }

    console.log("Seeding process completed.");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

const dryRun = process.argv.includes("--dry-run");
seed(dryRun);
