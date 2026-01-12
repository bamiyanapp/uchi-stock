
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const ITEMS_TABLE = process.env.TABLE_NAME;
const HISTORY_TABLE = process.env.STOCK_HISTORY_TABLE_NAME;

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
 */
exports.getItems = async (event) => {
  try {
    const { Items } = await docClient.send(new ScanCommand({
      TableName: ITEMS_TABLE,
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
      Key: { itemId },
      UpdateExpression,
      ExpressionAttributeValues,
      ExpressionAttributeNames,
      ReturnValues: "ALL_NEW",
    }));

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
 */
exports.deleteItem = async (event) => {
  try {
    const { itemId } = event.pathParameters;
    await docClient.send(new DeleteCommand({
      TableName: ITEMS_TABLE,
      Key: { itemId },
    }));
    return {
      statusCode: 204,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: "",
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

/**
 * 在庫を追加する。
 */
exports.addStock = async (event) => {
  try {
    const { itemId } = event.pathParameters;
    const { quantity, date, memo } = JSON.parse(event.body);

    if (!quantity || quantity <= 0) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Positive quantity is required" }),
      };
    }

    const now = new Date().toISOString();
    const historyId = crypto.randomUUID();

    // 在庫履歴の追加
    await docClient.send(new PutCommand({
      TableName: HISTORY_TABLE,
      Item: {
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
      Key: { itemId },
      UpdateExpression: "set currentStock = currentStock + :q, updatedAt = :now",
      ExpressionAttributeValues: { ":q": quantity, ":now": now },
      ReturnValues: "ALL_NEW",
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(Attributes),
    };
  } catch (error) {
    console.error("Error in addStock:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 在庫を消費する。
 */
exports.consumeStock = async (event) => {
  try {
    const { itemId } = event.pathParameters;
    const { quantity, date, memo } = JSON.parse(event.body);

    if (!quantity || quantity <= 0) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Positive quantity is required" }),
      };
    }

    const now = new Date().toISOString();
    const historyId = crypto.randomUUID();

    // 在庫履歴の追加
    await docClient.send(new PutCommand({
      TableName: HISTORY_TABLE,
      Item: {
        historyId,
        itemId,
        type: "consumption",
        quantity,
        date: date || now,
        memo,
      },
    }));

    // 品目の在庫数更新（マイナスにならないように調整が必要かもしれないが、一旦単純に減らす）
    const { Attributes } = await docClient.send(new UpdateCommand({
      TableName: ITEMS_TABLE,
      Key: { itemId },
      UpdateExpression: "set currentStock = currentStock - :q, updatedAt = :now",
      ExpressionAttributeValues: { ":q": quantity, ":now": now },
      ReturnValues: "ALL_NEW",
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(Attributes),
    };
  } catch (error) {
    console.error("Error in consumeStock:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 消費履歴を取得する。
 */
exports.getConsumptionHistory = async (event) => {
  try {
    const { itemId } = event.pathParameters;
    const { Items } = await docClient.send(new QueryCommand({
      TableName: HISTORY_TABLE,
      IndexName: undefined, // historyId が Partition Key なので、itemIdで引くにはGSIが必要だが、一旦Scanでフィルタする（設計ミスかもしれないが、READMEに合わせる）
      // READMEのキー設計: historyId (PK), itemId (SK) なので、itemIdでQueryするにはGSIが必要。
      // もしくは itemId (PK), date (SK) にすべきだが、現状の serverless.yml は historyId (PK), itemId (SK)。
      // 効率を考えてScanではなく、もしitemIdで引きたいならIndexが必要。
      // 今回は一旦Scanでフィルタする。
      TableName: HISTORY_TABLE,
      FilterExpression: "itemId = :itemId",
      ExpressionAttributeValues: { ":itemId": itemId }
    }));

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify(Items || []),
    };
  } catch (error) {
    console.error("Error in getConsumptionHistory:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};

/**
 * 在庫切れ推定日を取得する。
 */
exports.getEstimatedDepletionDate = async (event) => {
  try {
    const { itemId } = event.pathParameters;

    // 品目情報を取得
    const { Item: item } = await docClient.send(new GetCommand({
      TableName: ITEMS_TABLE,
      Key: { itemId },
    }));

    if (!item) {
      return {
        statusCode: 404,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ message: "Item not found" }),
      };
    }

    // 消費履歴を取得して平均消費速度を計算（簡易版）
    const { Items: history } = await docClient.send(new ScanCommand({
      TableName: HISTORY_TABLE,
      FilterExpression: "itemId = :itemId AND #t = :type",
      ExpressionAttributeNames: { "#t": "type" },
      ExpressionAttributeValues: { ":itemId": itemId, ":type": "consumption" }
    }));

    if (!history || history.length < 2) {
      return {
        statusCode: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ estimatedDepletionDate: null, message: "Not enough history to estimate" }),
      };
    }

    // 日付順にソート
    history.sort((a, b) => new Date(a.date) - new Date(b.date));

    const firstDate = new Date(history[0].date);
    const lastDate = new Date(history[history.length - 1].date);
    const daysDiff = Math.max(1, (lastDate - firstDate) / (1000 * 60 * 60 * 24));
    
    const totalConsumed = history.reduce((sum, h) => sum + h.quantity, 0);
    const dailyConsumption = totalConsumed / daysDiff;

    if (dailyConsumption <= 0) {
        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ estimatedDepletionDate: null, message: "No consumption observed" }),
          };
    }

    const daysRemaining = item.currentStock / dailyConsumption;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + daysRemaining);

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ 
        estimatedDepletionDate: estimatedDate.toISOString(),
        dailyConsumption: dailyConsumption.toFixed(2)
      }),
    };
  } catch (error) {
    console.error("Error in getEstimatedDepletionDate:", error);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ message: "Internal Server Error", error: error.message }),
    };
  }
};
