const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

const ITEMS_TABLE = "uchi-stock-app-items-v2";
const HISTORY_TABLE = "uchi-stock-app-stock-history-v4";
const DEFAULT_USER_ID = "test-user";

// テストケース定義（docs/test-strategy-stock-prediction.md に基づく）
const testCases = [
  {
    name: "単純消費ケース：在庫10、消費1/日、補充なし",
    unit: "個",
    expectedDays: 10, // 10日後
    history: [
      // T0 - 10日: 購入 +10
      { daysAgo: 10, type: "purchase", quantity: 10, memo: "初期購入" },
      // T0 - 9 から T0 - 1: 毎日消費1
      ...Array.from({ length: 9 }, (_, i) => ({ daysAgo: 9 - i, type: "consumption", quantity: 1, memo: "消費" }))
    ]
  },
  {
    name: "在庫少ケース：在庫3、消費1/日、補充なし",
    unit: "個",
    expectedDays: 3,
    history: [
      { daysAgo: 3, type: "purchase", quantity: 3, memo: "初期購入" },
      { daysAgo: 2, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 1, type: "consumption", quantity: 1, memo: "消費" }
    ]
  },
  {
    name: "平均消費ケース：在庫10、平均1/日（変動）、許容±1日",
    unit: "個",
    expectedDays: 10, // ±1日許容
    history: [
      { daysAgo: 15, type: "purchase", quantity: 15, memo: "初期購入" },
      // 変動消費: 0.5, 1.5, 1, 0.5, 1.5, ... (平均1)
      { daysAgo: 14, type: "consumption", quantity: 0.5, memo: "消費" },
      { daysAgo: 13, type: "consumption", quantity: 1.5, memo: "消費" },
      { daysAgo: 12, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 11, type: "consumption", quantity: 0.5, memo: "消費" },
      { daysAgo: 10, type: "consumption", quantity: 1.5, memo: "消費" },
      { daysAgo: 9, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 8, type: "consumption", quantity: 0.5, memo: "消費" },
      { daysAgo: 7, type: "consumption", quantity: 1.5, memo: "消費" },
      { daysAgo: 6, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 5, type: "consumption", quantity: 0.5, memo: "消費" },
      { daysAgo: 4, type: "consumption", quantity: 1.5, memo: "消費" },
      { daysAgo: 3, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 2, type: "consumption", quantity: 0.5, memo: "消費" },
      { daysAgo: 1, type: "consumption", quantity: 1.5, memo: "消費" }
    ]
  },
  {
    name: "途中補充ケース：在庫5、消費1/日、3日後+10",
    unit: "個",
    expectedDays: 18, // 補充後から再計算
    history: [
      { daysAgo: 15, type: "purchase", quantity: 8, memo: "初期購入" },
      { daysAgo: 15, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 14, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 13, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 12, type: "purchase", quantity: 10, memo: "途中補充" }, // 初期購入から3日後
      { daysAgo: 12, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 11, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 10, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 9, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 8, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 7, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 6, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 5, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 4, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 3, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 2, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 1, type: "consumption", quantity: 1, memo: "消費" }
    ]
  },
  {
    name: "複数補充ケース：在庫0から複数回補充",
    unit: "個",
    expectedDays: null, // 補充後から再計算
    history: [
      { daysAgo: 20, type: "purchase", quantity: 5, memo: "初期購入" },
      { daysAgo: 19, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 18, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 17, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 16, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 15, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 10, type: "purchase", quantity: 3, memo: "補充1" },
      { daysAgo: 9, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 8, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 7, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 5, type: "purchase", quantity: 4, memo: "補充2" },
      { daysAgo: 4, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 3, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 2, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 1, type: "consumption", quantity: 1, memo: "消費" }
    ]
  },
  {
    name: "初期状態ケース：履歴なし（provisional）",
    unit: "個",
    expectedDays: null, // provisional、低信頼
    history: [] // 履歴なし
  },
  {
    name: "消費ゼロケース：consumption=0",
    unit: "個",
    expectedDays: null, // 無限 or 未定
    history: [
      { daysAgo: 10, type: "purchase", quantity: 10, memo: "購入" }
      // 消費なし
    ]
  },
  {
    name: "入力停止ケース：長期間入力なし",
    unit: "個",
    expectedDays: null, // 信頼度低下
    history: [
      { daysAgo: 30, type: "purchase", quantity: 10, memo: "購入" },
      { daysAgo: 25, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 20, type: "consumption", quantity: 1, memo: "消費" },
      { daysAgo: 15, type: "consumption", quantity: 1, memo: "消費" }
      // 15日前まで入力なし
    ]
  }
];

async function clearTestData() {
  console.log("Clearing existing test data...");

  // Clear test items
  const itemsData = await docClient.send(new ScanCommand({ TableName: ITEMS_TABLE }));
  const testItems = (itemsData.Items || []).filter(item => item.userId === DEFAULT_USER_ID && item.name.startsWith("テスト"));
  for (const item of testItems) {
    await docClient.send(new DeleteCommand({
      TableName: ITEMS_TABLE,
      Key: { userId: item.userId, itemId: item.itemId }
    }));
  }

  // Clear test history
  const historyData = await docClient.send(new ScanCommand({ TableName: HISTORY_TABLE }));
  const testHistory = (historyData.Items || []).filter(item => item.userId === DEFAULT_USER_ID && item.memo && item.memo.includes("テスト"));
  for (const item of testHistory) {
    await docClient.send(new DeleteCommand({
      TableName: HISTORY_TABLE,
      Key: { itemId: item.itemId, date: item.date }
    }));
  }

  console.log("Test data cleared.");
}

async function seedTestData(dryRun = false) {
  try {
    if (!dryRun) {
      await clearTestData();
    } else {
      console.log("Dry run mode: No data will be written to DynamoDB.");
    }

    const now = new Date();

    for (const testCase of testCases) {
      const itemId = crypto.randomUUID();
      const createdAt = now.toISOString();

      // 履歴の計算
      let calculatedStock = 0;
      const historyToInsert = [];

      for (const entry of testCase.history) {
        const date = new Date(now.getTime() - entry.daysAgo * 24 * 60 * 60 * 1000).toISOString();
        
        historyToInsert.push({
          userId: DEFAULT_USER_ID,
          historyId: crypto.randomUUID(),
          itemId,
          type: entry.type,
          quantity: entry.quantity,
          date,
          memo: entry.memo,
        });

        if (entry.type === "purchase") {
          calculatedStock += entry.quantity;
        } else if (entry.type === "consumption") {
          calculatedStock -= entry.quantity;
        }
      }

      // テスト品目の登録（計算された在庫を使用）
      if (!dryRun) {
        await docClient.send(new PutCommand({
          TableName: ITEMS_TABLE,
          Item: {
            userId: DEFAULT_USER_ID,
            itemId,
            name: `テスト: ${testCase.name}`,
            unit: testCase.unit,
            currentStock: Math.max(0, calculatedStock),
            createdAt,
          },
        }));
      }

      console.log(`Test case: ${testCase.name} - Calculated stock: ${calculatedStock}`);

      // 履歴の投入
      let historyCount = 0;
      for (const historyItem of historyToInsert) {
        if (!dryRun) {
          await docClient.send(new PutCommand({
            TableName: HISTORY_TABLE,
            Item: historyItem,
          }));
        }
        historyCount++;
      }
      console.log(`  Added ${historyCount} history records`);
    }

    console.log("Test data seeding process completed.");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

const dryRun = process.argv.includes("--dry-run");
seedTestData(dryRun);
