
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const ITEMS_TABLE = process.env.TABLE_NAME;
const HISTORY_TABLE = process.env.STOCK_HISTORY_TABLE_NAME;

const getUserId = (event) => {
  // Cognito Authorizerを使用している場合、requestContextからユーザーID(sub)を取得できる
  if (event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.claims) {
    return event.requestContext.authorizer.claims.sub;
  }
  // 従来のx-user-idヘッダーも互換性のために残す（開発・テスト用）
  return event.headers["x-user-id"] || event.headers["X-User-Id"] || "default-user";
};

/**
 * 新しい品目を登録する。
 * @param {object} event - API Gatewayイベント
 * @returns {object} HTTPレスポンス
 */
exports.createItem = async (event) => {
  try {
    const userId = getUserId(event);
    const body = JSON.parse(event.body);
    const { name, unit } = body;

    if (!name || !unit) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ message: "Name and unit are required" }),
      };
    }

    const itemId = crypto.randomUUID();
    const now = new Date().toISOString();

    const item = {
      userId,
      itemId,
      name,
      unit,
      currentStock: 0,
      createdAt: now,
      updatedAt: now,
    };

    await docClient.send(new PutCommand({
      TableName: ITEMS_TABLE,
      Item: item,
    }));

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(item),
    };
  } catch (error) {
    console.error("Error in createItem:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 登録されているすべての品目を取得する。
 */
exports.getItems = async (event) => {
  try {
    const userId = getUserId(event);
    const { Items } = await docClient.send(new QueryCommand({
      TableName: ITEMS_TABLE,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(Items || []),
    };
  } catch (error) {
    console.error("Error in getItems:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 品目情報を更新する。
 */
exports.updateItem = async (event) => {
  try {
    const userId = getUserId(event);
    const { itemId } = event.pathParameters;
    const body = JSON.parse(event.body);
    const { name, unit, currentStock } = body;

    if (!name && !unit && currentStock === undefined) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ message: "No update parameters provided" }),
      };
    }

    const now = new Date().toISOString();
    let UpdateExpression = "set updatedAt = :updatedAt";
    const ExpressionAttributeValues = { ":updatedAt": now };
    const ExpressionAttributeNames = { "#n": "name" };

    if (name !== undefined) {
      UpdateExpression += ", #n = :name";
      ExpressionAttributeValues[":name"] = name;
    }
    if (unit !== undefined) {
      UpdateExpression += ", unit = :unit";
      ExpressionAttributeValues[":unit"] = unit;
    }
    if (currentStock !== undefined) {
      UpdateExpression += ", currentStock = :currentStock";
      ExpressionAttributeValues[":currentStock"] = currentStock;
    }

    const { Attributes } = await docClient.send(new UpdateCommand({
      TableName: ITEMS_TABLE,
      Key: { userId, itemId },
      UpdateExpression,
      ExpressionAttributeValues,
      ExpressionAttributeNames,
      ReturnValues: "ALL_NEW",
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(Attributes),
    };
  } catch (error) {
    console.error("Error in updateItem:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 品目を削除する。
 */
exports.deleteItem = async (event) => {
  try {
    const userId = getUserId(event);
    const { itemId } = event.pathParameters;
    await docClient.send(new DeleteCommand({
      TableName: ITEMS_TABLE,
      Key: { userId, itemId },
    }));
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: "",
    };
  } catch (error) {
    console.error("Error in deleteItem:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 在庫を追加する。
 */
exports.addStock = async (event) => {
  try {
    const userId = getUserId(event);
    const { itemId } = event.pathParameters;
    const { quantity, date, memo } = JSON.parse(event.body);

    if (!quantity || quantity <= 0) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ message: "Positive quantity is required" }),
      };
    }

    const now = new Date().toISOString();
    const historyId = crypto.randomUUID();

    // 在庫履歴の追加
    await docClient.send(new PutCommand({
      TableName: HISTORY_TABLE,
      Item: {
        userId,
        historyId,
        itemId,
        type: "purchase",
        quantity,
        date: date || now,
        memo,
      },
    }));

    // 品目の在庫数更新
    const { Attributes } = await docClient.send(new UpdateCommand({
      TableName: ITEMS_TABLE,
      Key: { userId, itemId },
      UpdateExpression: "set currentStock = currentStock + :q, updatedAt = :now",
      ExpressionAttributeValues: { ":q": quantity, ":now": now },
      ReturnValues: "ALL_NEW",
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(Attributes),
    };
  } catch (error) {
    console.error("Error in addStock:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 平均消費ペースを計算する。
 * 消費履歴から日次平均消費量を算出する。
 * @param {string} userId - ユーザーID
 * @param {string} itemId - アイテムID
 * @returns {number} 日次平均消費量（個/日）、計算できない場合は0
 */
const calculateAverageConsumptionRate = async (userId, itemId) => {
  try {
    // 消費履歴を取得（消費タイプのみ）
    const { Items: historyData } = await docClient.send(new QueryCommand({
      TableName: HISTORY_TABLE,
      KeyConditionExpression: "itemId = :itemId",
      FilterExpression: "#t = :type AND #u = :userId",
      ExpressionAttributeNames: { "#t": "type", "#u": "userId" },
      ExpressionAttributeValues: { ":itemId": itemId, ":type": "consumption", ":userId": userId }
    }));

    const history = historyData || [];

    // 最低2件の履歴が必要
    if (history.length < 2) {
      return 0;
    }

    // 日付順にソートし、有効な日付のみを抽出
    const validHistory = history
      .filter(h => h.date && !isNaN(new Date(h.date).getTime()))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (validHistory.length < 2) {
      return 0;
    }

    // 期間を計算（最初の記録から現在まで）
    const firstDate = new Date(validHistory[0].date);
    const lastDate = new Date(validHistory[validHistory.length - 1].date);
    const now = new Date();

    // 観測期間：最初の記録から現在まで（最低1日）
    const observationPeriodDays = Math.max(1, (now - firstDate) / (1000 * 60 * 60 * 24));

    // 総消費量
    const totalConsumed = validHistory.reduce((sum, h) => sum + h.quantity, 0);

    // 日次平均消費量
    const dailyConsumption = totalConsumed / observationPeriodDays;

    // 無効な値の場合は0を返す
    if (dailyConsumption <= 0 || isNaN(dailyConsumption) || !isFinite(dailyConsumption)) {
      return 0;
    }

    return dailyConsumption;
  } catch (error) {
    console.error("Error in calculateAverageConsumptionRate:", error);
    return 0;
  }
};

/**
 * 在庫を消費する。
 */
exports.consumeStock = async (event) => {
  try {
    const userId = getUserId(event);
    const { itemId } = event.pathParameters;
    const { quantity, date, memo } = JSON.parse(event.body);

    if (!quantity || quantity <= 0) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ message: "Positive quantity is required" }),
      };
    }

    const now = new Date().toISOString();
    const historyId = crypto.randomUUID();

    // 在庫履歴の追加
    await docClient.send(new PutCommand({
      TableName: HISTORY_TABLE,
      Item: {
        userId,
        historyId,
        itemId,
        type: "consumption",
        quantity,
        date: date || now,
        memo,
      },
    }));

    // 平均消費ペースを再計算
    const averageConsumptionRate = await calculateAverageConsumptionRate(userId, itemId);

    // 品目の在庫数と平均消費ペースを更新
    const { Attributes } = await docClient.send(new UpdateCommand({
      TableName: ITEMS_TABLE,
      Key: { userId, itemId },
      UpdateExpression: "set currentStock = currentStock - :q, updatedAt = :now, averageConsumptionRate = :rate",
      ExpressionAttributeValues: {
        ":q": quantity,
        ":now": now,
        ":rate": averageConsumptionRate
      },
      ReturnValues: "ALL_NEW",
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(Attributes),
    };
  } catch (error) {
    console.error("Error in consumeStock:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 消費履歴を取得する。
 */
exports.getConsumptionHistory = async (event) => {
  try {
    const userId = getUserId(event);
    const { itemId } = event.pathParameters;
    const { Items } = await docClient.send(new QueryCommand({
      TableName: HISTORY_TABLE,
      KeyConditionExpression: "itemId = :itemId",
      FilterExpression: "#u = :userId",
      ExpressionAttributeNames: { "#u": "userId" },
      ExpressionAttributeValues: { ":itemId": itemId, ":userId": userId },
      ScanIndexForward: false, // 降順（新しい順）
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(Items || []),
    };
  } catch (error) {
    console.error("Error in getConsumptionHistory:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 在庫切れ推定日を取得する。
 */
exports.getEstimatedDepletionDate = async (event) => {
  try {
    const userId = getUserId(event);
    const { itemId } = event.pathParameters;
    const { date } = event.queryStringParameters || {};
    let referenceDate = new Date();
    if (date) {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        referenceDate = parsedDate;
      }
    }

    // 品目情報を取得
    const { Item: item } = await docClient.send(new GetCommand({
      TableName: ITEMS_TABLE,
      Key: { userId, itemId },
    }));

    if (!item) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ message: "Item not found" }),
      };
    }

    // 平均消費ペースを取得（すでに計算済みの値を使用）
    const dailyConsumption = item.averageConsumptionRate || 0;

    if (dailyConsumption <= 0) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          estimatedDepletionDate: null,
          dailyConsumption: 0,
          message: "No consumption data available"
        }),
      };
    }

    const daysRemaining = Math.max(0, item.currentStock / dailyConsumption);
    const estimatedDate = new Date(referenceDate.getTime() + daysRemaining * 24 * 60 * 60 * 1000);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        estimatedDepletionDate: estimatedDate.toISOString(),
        dailyConsumption: dailyConsumption.toFixed(2),
        currentStock: item.currentStock
      }),
    };
  } catch (error) {
    console.error("Error in getEstimatedDepletionDate:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};
