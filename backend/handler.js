
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

/**
 * 新しい品目を登録する。
 * @param {object} event - API Gatewayイベント
 * @returns {object} HTTPレスポンス
 */
exports.createItem = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { name, unit } = body;

    if (!name || !unit) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Name and unit are required" }),
      };
    }

    const itemId = crypto.randomUUID();
    const now = new Date().toISOString();

    const item = {
      itemId,
      name,
      unit,
      currentStock: 0, // 初期在庫は0
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: process.env.TABLE_NAME,
      Item: item,
    }));

    return {
      statusCode: 201,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error("Error in createItem:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 登録されているすべての品目を取得する。
 * @param {object} event - API Gatewayイベント
 * @returns {object} HTTPレスポンス
 */
exports.getItems = async (event) => {
  try {
    const { Items } = await docClient.send(new ScanCommand({
      TableName: process.env.TABLE_NAME,
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(Items || []),
    };
  } catch (error) {
    console.error("Error in getItems:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 品目情報を更新する。
 * @param {object} event - API Gatewayイベント
 * @returns {object} HTTPレスポンス
 */
exports.updateItem = async (event) => {
  try {
    const { itemId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const { name, unit, currentStock } = body;

    if (!name && !unit && currentStock === undefined) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "No update parameters provided" }),
      };
    }

    const now = new Date().toISOString();
    let UpdateExpression = "set updatedAt = :updatedAt";
    const ExpressionAttributeValues = { ":updatedAt": now };

    if (name !== undefined) {
      UpdateExpression += ", #n = :name";
      ExpressionAttributeValues[":name"] = name;
    }
    if (unit !== undefined) {
      UpdateExpression += ", unit = :unit";
      ExpressionAttributeValues[":unit"] = unit;
    }
    if (currentStock !== undefined) {
      if (typeof currentStock !== 'number' || currentStock < 0) {
        return {
          statusCode: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
          body: JSON.stringify({ message: "currentStock must be a non-negative number" }),
        };
      }
      UpdateExpression += ", currentStock = :currentStock";
      ExpressionAttributeValues[":currentStock"] = currentStock;
    }

    const { Attributes } = await docClient.send(new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: { itemId },
      UpdateExpression,
      ExpressionAttributeValues,
      ExpressionAttributeNames: { // 'name' is a reserved keyword in DynamoDB
        "#n": "name",
      },
      ReturnValues: "ALL_NEW",
    }));

    if (!Attributes) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(Attributes),
    };
  } catch (error) {
    console.error("Error in updateItem:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 品目を削除する。
 * @param {object} event - API Gatewayイベント
 * @returns {object} HTTPレスポンス
 */
exports.deleteItem = async (event) => {
  try {
    const { itemId } = event.pathParameters;

    const { Attributes } = await docClient.send(new DeleteCommand({
      TableName: process.env.TABLE_NAME,
      Key: { itemId },
      ReturnValues: "ALL_OLD",
    }));

    if (!Attributes) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Item not found" }),
      };
    }

    return {
      statusCode: 204, // No Content
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Item deleted successfully" }),
    };
  } catch (error) {
    console.error("Error in deleteItem:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

// TODO: addStock, consumeStock, getConsumptionHistory, getEstimatedDepletionDate functions
