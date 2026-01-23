const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");
const admin = require('firebase-admin');
const stockLogic = require("./stock-logic");

// Firebase Admin SDKの初期化
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : null;
    
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized successfully');
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is not set. Token verification will fail unless in test mode.');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
}

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const ITEMS_TABLE = () => process.env.TABLE_NAME;
const HISTORY_TABLE = () => process.env.STOCK_HISTORY_TABLE_NAME;

const verifyFirebaseToken = async (token) => {
  if (!admin.apps.length) {
    // 開発/テスト用: Firebase Adminが初期化されていない場合、特定のテストヘッダーを許可するかエラーにする
    // ここではエラーにするが、getUserIdでfallbackする
    throw new Error('Firebase Admin not initialized');
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    throw error;
  }
};

class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
}

const getUserId = async (event) => {
  if (!event.headers) {
    throw new HttpError(401, "Missing headers");
  }

  // 1. Authorization header (Bearer token) を確認
  const authHeader = event.headers["Authorization"] || event.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token && token !== "null" && token !== "undefined") {
      try {
        const uid = await verifyFirebaseToken(token);
        return uid;
      } catch (error) {
        console.warn("Token verification failed:", error.message);
        // トークンが提供されているが検証に失敗した場合は、401を投げても良いが
        // 既存の挙動（x-user-idへのフォールバック）を維持しつつ、
        // 明確なトークンエラーがある場合はここで止める選択肢もある。
        // ここではフォールバックを許容する。
      }
    }
  }

  // 2. 開発・テスト用: x-user-idヘッダー
  // 注意: 本番環境ではAPI Gateway等でこのヘッダーを削除するか、環境変数でこのfallbackを無効化すべき
  if (process.env.ALLOW_INSECURE_USER_ID === 'true' || process.env.NODE_ENV === 'test') {
     const userId = event.headers["x-user-id"] || event.headers["X-User-Id"] || "default-user";
     return userId;
  }

  // 認証失敗
  throw new HttpError(401, "Unauthorized");
};

/**
 * 共通のエラーレスポンス生成
 */
const errorResponse = (error, context = "") => {
  console.error(`Error in ${context}:`, error);
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = statusCode === 500 ? "Internal Server Error" : error.message;
  
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: JSON.stringify({ 
      message, 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }),
  };
};

/**
 * 新しい品目を登録する。
 * @param {object} event - API Gatewayイベント
 * @returns {object} HTTPレスポンス
 */
exports.createItem = async (event) => {
  try {
    const userId = await getUserId(event);
    if (!event.body) {
      throw new HttpError(400, "Request body is missing");
    }
    
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      throw new HttpError(400, "Invalid JSON in request body");
    }

    const { name, unit } = body;

    if (!name || !unit) {
      throw new HttpError(400, "Name and unit are required");
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
      TableName: ITEMS_TABLE(),
      Item: item,
    }));

    // 履歴に追加
    await docClient.send(new PutCommand({
      TableName: HISTORY_TABLE(),
      Item: {
        userId,
        historyId: crypto.randomUUID(),
        itemId,
        type: "creation",
        quantity: 0,
        date: now,
        memo: "Initial creation",
      },
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
    return errorResponse(error, "createItem");
  }
};

/**
 * 各アイテムの最新の履歴日時を取得する。
 */
const getLatestUpdateDate = async (itemId) => {
  try {
    const { Items } = await docClient.send(new QueryCommand({
      TableName: HISTORY_TABLE(),
      KeyConditionExpression: "itemId = :itemId",
      ScanIndexForward: false,
      Limit: 1,
      ExpressionAttributeValues: { ":itemId": itemId },
    }));
    return Items && Items.length > 0 ? Items[0].date : null;
  } catch (error) {
    console.error(`Error fetching latest update date for item ${itemId}:`, error);
    return null;
  }
};

/**
 * 登録されているすべての品目を取得する。
 */
exports.getItems = async (event) => {
  try {
    const userId = await getUserId(event);
    const { Items: items } = await docClient.send(new QueryCommand({
      TableName: ITEMS_TABLE(),
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    }));

    const itemsWithUpdatedAt = await Promise.all((items || []).map(async (item) => {
      const latestDate = await getLatestUpdateDate(item.itemId);
      return {
        ...item,
        updatedAt: latestDate || item.createdAt // 履歴がない場合は作成日時を使用
      };
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(itemsWithUpdatedAt),
    };
  } catch (error) {
    return errorResponse(error, "getItems");
  }
};

/**
 * 品目情報を更新する。
 */
exports.updateItem = async (event) => {
  try {
    const userId = await getUserId(event);
    const { itemId } = event.pathParameters || {};
    if (!itemId) {
      throw new HttpError(400, "itemId is required");
    }

    if (!event.body) {
      throw new HttpError(400, "Request body is missing");
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      throw new HttpError(400, "Invalid JSON in request body");
    }

    const { name, unit, currentStock } = body;

    const now = new Date().toISOString();
    const ExpressionAttributeValues = {};
    const ExpressionAttributeNames = {};
    let updates = [];

    if (name !== undefined) {
      updates.push("#n = :name");
      ExpressionAttributeValues[":name"] = name;
      ExpressionAttributeNames["#n"] = "name";
    }
    if (unit !== undefined) {
      updates.push("unit = :unit");
      ExpressionAttributeValues[":unit"] = unit;
    }
    if (currentStock !== undefined) {
      updates.push("currentStock = :currentStock");
      ExpressionAttributeValues[":currentStock"] = currentStock;
    }

    if (updates.length === 0) {
      throw new HttpError(400, "No update parameters provided");
    }

    updates.push("updatedAt = :updatedAt");
    ExpressionAttributeValues[":updatedAt"] = now;

    const UpdateExpression = "set " + updates.join(", ");

    const { Attributes } = await docClient.send(new UpdateCommand({
      TableName: ITEMS_TABLE(),
      Key: { userId, itemId },
      UpdateExpression,
      ExpressionAttributeValues,
      ExpressionAttributeNames: Object.keys(ExpressionAttributeNames).length > 0 ? ExpressionAttributeNames : undefined,
      ReturnValues: "ALL_NEW",
    }));

    // 履歴に追加
    await docClient.send(new PutCommand({
      TableName: HISTORY_TABLE(),
      Item: {
        userId,
        historyId: crypto.randomUUID(),
        itemId,
        type: "update",
        quantity: 0,
        date: now,
        memo: "Item information updated",
      },
    }));

    // updatedAtを付与して返す
    const responseItem = {
      ...Attributes,
      updatedAt: now
    };

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(responseItem),
    };
  } catch (error) {
    return errorResponse(error, "updateItem");
  }
};

/**
 * 品目を削除する。
 */
exports.deleteItem = async (event) => {
  try {
    const userId = await getUserId(event);
    const { itemId } = event.pathParameters || {};
    if (!itemId) {
      throw new HttpError(400, "itemId is required");
    }

    await docClient.send(new DeleteCommand({
      TableName: ITEMS_TABLE(),
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
    return errorResponse(error, "deleteItem");
  }
};

/**
 * 在庫を追加する。
 */
exports.addStock = async (event) => {
  try {
    const userId = await getUserId(event);
    const { itemId } = event.pathParameters || {};
    if (!itemId) {
      throw new HttpError(400, "itemId is required");
    }

    if (!event.body) {
      throw new HttpError(400, "Request body is missing");
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      throw new HttpError(400, "Invalid JSON in request body");
    }

    const { quantity, date, memo } = body;

    if (!quantity || quantity <= 0) {
      throw new HttpError(400, "Positive quantity is required");
    }

    const now = new Date().toISOString();
    const historyId = crypto.randomUUID();

    // 在庫履歴の追加
    await docClient.send(new PutCommand({
      TableName: HISTORY_TABLE(),
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
      TableName: ITEMS_TABLE(),
      Key: { userId, itemId },
      UpdateExpression: "set currentStock = currentStock + :q, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":q": quantity,
        ":updatedAt": now
      },
      ReturnValues: "ALL_NEW",
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ ...Attributes, updatedAt: now }),
    };
  } catch (error) {
    return errorResponse(error, "addStock");
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
    // 全履歴を取得
    const { Items: historyData } = await docClient.send(new QueryCommand({
      TableName: HISTORY_TABLE(),
      KeyConditionExpression: "itemId = :itemId",
      FilterExpression: "#u = :userId",
      ExpressionAttributeNames: { "#u": "userId" },
      ExpressionAttributeValues: { ":itemId": itemId, ":userId": userId }
    }));

    return stockLogic.calculateAverageConsumptionRate(historyData || [], new Date());
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
    const userId = await getUserId(event);
    const { itemId } = event.pathParameters || {};
    if (!itemId) {
      throw new HttpError(400, "itemId is required");
    }

    if (!event.body) {
      throw new HttpError(400, "Request body is missing");
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      throw new HttpError(400, "Invalid JSON in request body");
    }

    const { quantity, date, memo } = body;

    if (!quantity || quantity <= 0) {
      throw new HttpError(400, "Positive quantity is required");
    }

    const now = new Date().toISOString();
    const historyId = crypto.randomUUID();

    // 在庫履歴の追加
    await docClient.send(new PutCommand({
      TableName: HISTORY_TABLE(),
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
      TableName: ITEMS_TABLE(),
      Key: { userId, itemId },
      UpdateExpression: "set currentStock = currentStock - :q, averageConsumptionRate = :rate, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":q": quantity,
        ":rate": averageConsumptionRate,
        ":updatedAt": now
      },
      ReturnValues: "ALL_NEW",
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({ ...Attributes, updatedAt: now }),
    };
  } catch (error) {
    return errorResponse(error, "consumeStock");
  }
};

/**
 * 消費履歴を取得する。
 */
exports.getConsumptionHistory = async (event) => {
  try {
    const userId = await getUserId(event);
    const { itemId } = event.pathParameters || {};
    if (!itemId) {
      throw new HttpError(400, "itemId is required");
    }

    const { Items } = await docClient.send(new QueryCommand({
      TableName: HISTORY_TABLE(),
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
    return errorResponse(error, "getConsumptionHistory");
  }
};

/**
 * 在庫切れ推定日を取得する。
 */
exports.getEstimatedDepletionDate = async (event) => {
  try {
    const userId = await getUserId(event);
    const { itemId } = event.pathParameters || {};
    if (!itemId) {
      throw new HttpError(400, "itemId is required");
    }

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
      TableName: ITEMS_TABLE(),
      Key: { userId, itemId },
    }));

    if (!item) {
      throw new HttpError(404, "Item not found");
    }

    // 平均消費ペースが0以下の場合は、履歴を取得せずに早期リターン（最適化・テスト互換性）
    if (!item.averageConsumptionRate || item.averageConsumptionRate <= 0) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          estimatedDepletionDate: null,
          dailyConsumption: 0,
          currentStock: item.currentStock,
          message: "No consumption data available"
        }),
      };
    }

    // 全履歴を取得
    const { Items: historyData } = await docClient.send(new QueryCommand({
      TableName: HISTORY_TABLE(),
      KeyConditionExpression: "itemId = :itemId",
      FilterExpression: "#u = :userId",
      ExpressionAttributeNames: { "#u": "userId" },
      ExpressionAttributeValues: { ":itemId": itemId, ":userId": userId },
    }));

    const result = stockLogic.calculateEstimatedDepletion(item, historyData || [], referenceDate);

    if (!result.estimatedDepletionDate) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          estimatedDepletionDate: null,
          dailyConsumption: 0,
          currentStock: item.currentStock,
          message: "No consumption data available"
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        ...result,
        dailyConsumption: result.dailyConsumption.toFixed(2),
        currentStock: item.currentStock
      }),
    };
  } catch (error) {
    return errorResponse(error, "getEstimatedDepletionDate");
  }
};
