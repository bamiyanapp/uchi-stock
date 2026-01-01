const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

const phrases = [
  { id: "1", phrase: "あ、あいすくりーむ、たべたいな" },
  { id: "2", phrase: "い、いちごが、まっかだな" },
  { id: "3", phrase: "う、うさぎが、ぴょんぴょん、はねている" },
  { id: "4", phrase: "え、えんぴつで、じをかこう" },
  { id: "5", phrase: "お、にぎりが、おいしそう" },
];

async function seed() {
  for (const item of phrases) {
    await docClient.send(
      new PutCommand({
        TableName: "karuta-phrases",
        Item: item,
      })
    );
    console.log(`Seeded: ${item.phrase}`);
  }
}

seed().catch(console.error);
