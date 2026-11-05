const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

// Lambda実行環境ではリージョン等をSDKが自動解決するため、オプション無しで生成する
// （backend/dynamo-client.jsのcreateDocClientはseed/migrationスクリプト用で既定リージョンを
// 明示指定する必要があり、用途が異なるため分けている）
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const ITEMS_TABLE = () => process.env.TABLE_NAME;
const HISTORY_TABLE = () => process.env.STOCK_HISTORY_TABLE_NAME;
const USERS_TABLE = () => process.env.USERS_TABLE_NAME;
const FAMILIES_TABLE = () => process.env.FAMILIES_TABLE_NAME;
const INVITATIONS_TABLE = () => process.env.INVITATIONS_TABLE_NAME;

module.exports = {
  docClient,
  ITEMS_TABLE,
  HISTORY_TABLE,
  USERS_TABLE,
  FAMILIES_TABLE,
  INVITATIONS_TABLE,
};
