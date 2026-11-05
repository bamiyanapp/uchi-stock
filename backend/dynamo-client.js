const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, DeleteCommand } = require("@aws-sdk/lib-dynamodb");

/**
 * seed/migrationスクリプト用のDynamoDB Document Clientを生成する。
 */
const createDocClient = (region = "ap-northeast-1") => {
  const client = new DynamoDBClient({ region });
  return DynamoDBDocumentClient.from(client);
};

/**
 * `items`の各要素を、キー抽出関数`pickKey`で得たキーを使って順に削除する。
 */
const deleteItems = async (docClient, tableName, items, pickKey) => {
  for (const item of items) {
    await docClient.send(new DeleteCommand({ TableName: tableName, Key: pickKey(item) }));
  }
};

module.exports = { createDocClient, deleteItems };
