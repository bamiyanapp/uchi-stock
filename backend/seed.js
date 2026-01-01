const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "ap-northeast-1" });
const docClient = DynamoDBDocumentClient.from(client);

const CSV_FILE_PATH = path.join(__dirname, "phrases.csv");

async function seed() {
  try {
    // 1. CSVファイルを読み込む
    const fileContent = fs.readFileSync(CSV_FILE_PATH, "utf-8");

    // 2. CSVをパースする
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    console.log(`Read ${records.length} records from CSV.`);

    // 3. DynamoDBに投入する
    for (const record of records) {
      await docClient.send(
        new PutCommand({
          TableName: "karuta-phrases",
          Item: {
            id: record.id.trim(),
            phrase: record.phrase.trim(),
          },
        })
      );
      console.log(`Seeded: ${record.phrase}`);
    }

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
}

seed();
