const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");
const firebaseApp = require('firebase-admin/app');
const firebaseAuth = require('firebase-admin/auth');
const stockLogic = require("./stock-logic");
const { buildOpsAlertMessage, sendOpsAlert } = require("./ops-alert-notifier"); // symlink

// Firebase Admin SDKの初期化
if (!firebaseApp.getApps().length) {
  try {
    let saValue = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (saValue && !saValue.trim().startsWith('{')) {
      try {
        const decoded = Buffer.from(saValue, 'base64').toString('utf-8');
        if (decoded.trim().startsWith('{')) {
          saValue = decoded;
          console.log('[FirebaseInit] Service Account decoded from Base64');
        }
      } catch {
        console.warn('[FirebaseInit] Failed to decode potential Base64 Service Account');
      }
    }

    const serviceAccount = saValue ? JSON.parse(saValue) : null;

    if (serviceAccount) {
      firebaseApp.initializeApp({
        credential: firebaseApp.cert(serviceAccount)
      });
      console.log('[FirebaseInit] Firebase Admin initialized successfully');
    } else {
      console.warn('[FirebaseInit] FIREBASE_SERVICE_ACCOUNT environment variable is not set or empty.');
    }
  } catch (error) {
    console.error('[FirebaseInit] Failed to initialize Firebase Admin:', error.message);
  }
}

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const ITEMS_TABLE = () => process.env.TABLE_NAME;
const HISTORY_TABLE = () => process.env.STOCK_HISTORY_TABLE_NAME;
const USERS_TABLE = () => process.env.USERS_TABLE_NAME;
const FAMILIES_TABLE = () => process.env.FAMILIES_TABLE_NAME;
const INVITATIONS_TABLE = () => process.env.INVITATIONS_TABLE_NAME;

// 全レスポンス共通のCORSヘッダー
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

/**
 * CORSヘッダー付きの成功レスポンスを生成する。
 */
const jsonResponse = (statusCode, body) => ({
  statusCode,
  headers: CORS_HEADERS,
  body: typeof body === "string" ? body : JSON.stringify(body),
});

const verifyFirebaseToken = async (token) => {
  if (!firebaseApp.getApps().length) {
    throw new Error('Firebase Admin not initialized');
  }
  try {
    const decodedToken = await firebaseAuth.getAuth().verifyIdToken(token);
    return {
      userId: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture
    };
  } catch (error) {
    console.error('[verifyFirebaseToken] Error:', error.message);
    throw error;
  }
};

class HttpError extends Error {
  constructor(statusCode, message, detail = null) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
    this.detail = detail;
  }
}

/**
 * ユーザー情報を同期する。
 */
const syncUserInfo = async (userInfo) => {
  if (!userInfo || !userInfo.userId) return;

  try {
    const now = new Date().toISOString();
    await docClient.send(new PutCommand({
      TableName: USERS_TABLE(),
      Item: {
        ...userInfo,
        updatedAt: now,
      },
    }));
    console.log(`[syncUserInfo] User synced: ${userInfo.userId} (${userInfo.email || 'N/A'})`);
  } catch (error) {
    console.error(`[syncUserInfo] Failed to sync user info for ${userInfo.userId}:`, error.message);
    // ユーザー同期の失敗はAPI全体の失敗とはしない（可用性優先）
  }
};

const getUserId = async (event) => {
  if (!event || !event.headers) {
    throw new HttpError(401, "Missing headers");
  }

  const normalizedHeaders = Object.keys(event.headers).reduce((acc, key) => {
    acc[key.toLowerCase()] = event.headers[key];
    return acc;
  }, {});

  const authHeader = normalizedHeaders["authorization"];
  const xUserIdHeader = normalizedHeaders["x-user-id"];

  // 1. Authorization header (Bearer token) を確認
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.split(" ")[1];
    if (token && token !== "null" && token !== "undefined") {
      try {
        const userInfo = await verifyFirebaseToken(token);
        if (userInfo && userInfo.userId) {
          await syncUserInfo(userInfo);
          return userInfo.userId;
        }
      } catch (error) {
        if (error.message === 'Firebase Admin not initialized') {
          // サービスアカウントが未設定の場合の特別なエラー
          throw new HttpError(401, "Authentication Error", "Firebase Service Account is not configured on the server. Please set FIREBASE_SERVICE_ACCOUNT environment variable.");
        }
        throw new HttpError(401, "Invalid Token", error.message);
      }
    }
  }

  // 2. テストユーザーの場合は認証なしで許可
  if (xUserIdHeader === 'test-user') {
    return 'test-user';
  }

  // 3. 開発・テスト用: x-user-idヘッダーによるフォールバック
  if (process.env.ALLOW_INSECURE_USER_ID === 'true' || process.env.NODE_ENV === 'test') {
     return xUserIdHeader || "default-user";
  }

  // 認証失敗
  const detail = authHeader ? "Token verification failed and insecure fallback is disabled." : "Authorization header is missing.";
  throw new HttpError(401, "Unauthorized", detail);
};

/**
 * 指定されたユーザーがターゲットユーザーの家族かどうかを検証する。
 */
const checkFamilyPermission = async (userId, targetUserId) => {
  if (userId === targetUserId) return true;
  if (userId === 'test-user') return false;

  try {
    const { Item } = await docClient.send(new GetCommand({
      TableName: FAMILIES_TABLE(),
      Key: { userId, familyUserId: targetUserId }
    }));
    return !!Item;
  } catch (error) {
    console.error(`[checkFamilyPermission] Error:`, error.message);
    return false;
  }
};

/**
 * クエリパラメータの`userId`を対象ユーザーとして解決し、家族権限を検証する。
 * 権限が無い場合はHttpError(403)を投げる。
 */
const resolveAuthorizedTargetUserId = async (event, userId, errorMessage) => {
  const targetUserId = event.queryStringParameters?.userId || userId;
  const hasPermission = await checkFamilyPermission(userId, targetUserId);
  if (!hasPermission) {
    throw new HttpError(403, errorMessage);
  }
  return targetUserId;
};

/**
 * パスパラメータから`itemId`を取得する。無い場合はHttpError(400)を投げる。
 */
const requireItemId = (event) => {
  const { itemId } = event.pathParameters || {};
  if (!itemId) {
    throw new HttpError(400, "itemId is required");
  }
  return itemId;
};

/**
 * リクエストボディをJSONとしてパースする。
 * ボディが無い、またはJSONとして不正な場合はHttpErrorを投げる。
 */
const parseJsonBody = (event) => {
  if (!event.body) {
    throw new HttpError(400, "Request body is missing");
  }
  try {
    return JSON.parse(event.body);
  } catch {
    throw new HttpError(400, "Invalid JSON in request body");
  }
};

/**
 * 共通のエラーレスポンス生成
 */
const errorResponse = (error, context = "") => {
  console.error(`[errorResponse] ${context}:`, error);
  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = error instanceof HttpError ? error.message : "Internal Server Error";
  const detail = error.detail || error.message;

  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      message,
      error: detail,
      context,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    }),
  };
};

/**
 * 新しい品目を登録する。
 */
exports.createItem = async (event) => {
  try {
    const userId = await getUserId(event);
    const body = parseJsonBody(event);
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

    return jsonResponse(201, item);
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
    const targetUserId = await resolveAuthorizedTargetUserId(event, userId, "You do not have permission to access these items.");

    const { Items: items } = await docClient.send(new QueryCommand({
      TableName: ITEMS_TABLE(),
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": targetUserId },
    }));

    const itemsWithUpdatedAt = await Promise.all((items || []).map(async (item) => {
      const latestDate = await getLatestUpdateDate(item.itemId);
      return {
        ...item,
        updatedAt: latestDate || item.createdAt // 履歴がない場合は作成日時を使用
      };
    }));

    return jsonResponse(200, itemsWithUpdatedAt);
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
    const targetUserId = await resolveAuthorizedTargetUserId(event, userId, "You do not have permission to update this item.");
    const itemId = requireItemId(event);
    const body = parseJsonBody(event);
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
      Key: { userId: targetUserId, itemId },
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

    return jsonResponse(200, responseItem);
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
    const itemId = requireItemId(event);

    await docClient.send(new DeleteCommand({
      TableName: ITEMS_TABLE(),
      Key: { userId, itemId },
    }));
    return jsonResponse(204, "");
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
    const targetUserId = await resolveAuthorizedTargetUserId(event, userId, "You do not have permission to add stock.");
    const itemId = requireItemId(event);
    const body = parseJsonBody(event);
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
      Key: { userId: targetUserId, itemId },
      UpdateExpression: "set currentStock = currentStock + :q, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":q": quantity,
        ":updatedAt": now
      },
      ReturnValues: "ALL_NEW",
    }));

    return jsonResponse(200, { ...Attributes, updatedAt: now });
  } catch (error) {
    return errorResponse(error, "addStock");
  }
};

/**
 * 平均消費ペースを計算する。
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
    const targetUserId = await resolveAuthorizedTargetUserId(event, userId, "You do not have permission to consume stock.");
    const itemId = requireItemId(event);
    const body = parseJsonBody(event);
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
    const averageConsumptionRate = await calculateAverageConsumptionRate(targetUserId, itemId);

    // 品目の在庫数と平均消費ペースを更新
    const { Attributes } = await docClient.send(new UpdateCommand({
      TableName: ITEMS_TABLE(),
      Key: { userId: targetUserId, itemId },
      UpdateExpression: "set currentStock = currentStock - :q, averageConsumptionRate = :rate, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":q": quantity,
        ":rate": averageConsumptionRate,
        ":updatedAt": now
      },
      ReturnValues: "ALL_NEW",
    }));

    return jsonResponse(200, { ...Attributes, updatedAt: now });
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
    const targetUserId = await resolveAuthorizedTargetUserId(event, userId, "You do not have permission to access history.");
    const itemId = requireItemId(event);

    const { Items } = await docClient.send(new QueryCommand({
      TableName: HISTORY_TABLE(),
      KeyConditionExpression: "itemId = :itemId",
      FilterExpression: "#u = :userId",
      ExpressionAttributeNames: { "#u": "userId" },
      ExpressionAttributeValues: { ":itemId": itemId, ":userId": targetUserId },
      ScanIndexForward: false, // 降順（新しい順）
    }));

    return jsonResponse(200, Items || []);
  } catch (error) {
    return errorResponse(error, "getConsumptionHistory");
  }
};

/**
 * 消費データが無い場合の共通レスポンスを生成する。
 */
const noConsumptionDataResponse = (item) => jsonResponse(200, {
  estimatedDepletionDate: null,
  dailyConsumption: 0,
  currentStock: item.currentStock,
  message: "No consumption data available"
});

/**
 * 在庫切れ推定日を取得する。
 */
exports.getEstimatedDepletionDate = async (event) => {
  try {
    const userId = await getUserId(event);
    const targetUserId = await resolveAuthorizedTargetUserId(event, userId, "You do not have permission to access this estimate.");
    const itemId = requireItemId(event);

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
      Key: { userId: targetUserId, itemId },
    }));

    if (!item) {
      throw new HttpError(404, "Item not found");
    }

    // 平均消費ペースが0以下の場合は、履歴を取得せずに早期リターン
    if (!item.averageConsumptionRate || item.averageConsumptionRate <= 0) {
      return noConsumptionDataResponse(item);
    }

    // 全履歴を取得
    const { Items: historyData } = await docClient.send(new QueryCommand({
      TableName: HISTORY_TABLE(),
      KeyConditionExpression: "itemId = :itemId",
      FilterExpression: "#u = :userId",
      ExpressionAttributeNames: { "#u": "userId" },
      ExpressionAttributeValues: { ":itemId": itemId, ":userId": targetUserId },
    }));

    const result = stockLogic.calculateEstimatedDepletion(item, historyData || [], referenceDate);

    if (!result.estimatedDepletionDate) {
      return noConsumptionDataResponse(item);
    }

    return jsonResponse(200, {
      ...result,
      dailyConsumption: result.dailyConsumption.toFixed(2),
      currentStock: item.currentStock
    });
  } catch (error) {
    return errorResponse(error, "getEstimatedDepletionDate");
  }
};

/**
 * 招待URL用のトークンを発行する。
 */
exports.createInvitation = async (event) => {
  try {
    const userId = await getUserId(event);
    const invitationToken = crypto.randomUUID();
    const now = new Date();
    const expiresAt = Math.floor(now.getTime() / 1000) + (24 * 60 * 60); // 24時間後

    await docClient.send(new PutCommand({
      TableName: INVITATIONS_TABLE(),
      Item: {
        invitationToken,
        inviterUserId: userId,
        expiresAt,
        createdAt: now.toISOString(),
      },
    }));

    return jsonResponse(201, { invitationToken, expiresAt });
  } catch (error) {
    return errorResponse(error, "createInvitation");
  }
};

/**
 * 招待を受諾し、家族登録を行う。
 */
exports.acceptInvitation = async (event) => {
  try {
    const userId = await getUserId(event);
    const body = parseJsonBody(event);
    const { invitationToken } = body;
    if (!invitationToken) {
      throw new HttpError(400, "invitationToken is required");
    }

    // 招待情報の取得
    const { Item: invitation } = await docClient.send(new GetCommand({
      TableName: INVITATIONS_TABLE(),
      Key: { invitationToken },
    }));

    if (!invitation) {
      throw new HttpError(404, "Invitation not found or expired");
    }

    const inviterUserId = invitation.inviterUserId;
    if (inviterUserId === userId) {
      throw new HttpError(400, "You cannot invite yourself");
    }

    const now = new Date().toISOString();

    // 双方向の家族関係を登録
    // TODO: DynamoDB Transactionsを使用するのが望ましい
    await docClient.send(new PutCommand({
      TableName: FAMILIES_TABLE(),
      Item: {
        userId: userId,
        familyUserId: inviterUserId,
        relationType: "member",
        createdAt: now,
      },
    }));

    await docClient.send(new PutCommand({
      TableName: FAMILIES_TABLE(),
      Item: {
        userId: inviterUserId,
        familyUserId: userId,
        relationType: "member",
        createdAt: now,
      },
    }));

    // 招待情報の削除
    await docClient.send(new DeleteCommand({
      TableName: INVITATIONS_TABLE(),
      Key: { invitationToken },
    }));

    return jsonResponse(200, { message: "Family registration successful", familyUserId: inviterUserId });
  } catch (error) {
    return errorResponse(error, "acceptInvitation");
  }
};

/**
 * 家族一覧を取得する。
 */
exports.getFamilies = async (event) => {
  try {
    const userId = await getUserId(event);

    const { Items: families } = await docClient.send(new QueryCommand({
      TableName: FAMILIES_TABLE(),
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    }));

    // 家族のプロフィール情報を取得
    const familyMembers = await Promise.all((families || []).map(async (family) => {
      const { Item: user } = await docClient.send(new GetCommand({
        TableName: USERS_TABLE(),
        Key: { userId: family.familyUserId },
      }));
      return {
        userId: family.familyUserId,
        displayName: user?.displayName || "Unknown User",
        photoURL: user?.photoURL || null,
        email: user?.email || null,
      };
    }));

    return jsonResponse(200, familyMembers);
  } catch (error) {
    return errorResponse(error, "getFamilies");
  }
};

/**
 * CloudWatch Alarm発報時のSNS通知を受け取り、運用監視専用LINE Botへ通知する
 * （dev-standards/docs/ops-monitoring-pattern.md）。
 * OPS_ALERT_LINE_CHANNEL_ACCESS_TOKEN・OPS_ALERT_LINE_USER_IDが未設定の場合、
 * Secrets未登録でもデプロイ・実行自体が失敗しないよう送信をスキップする。
 */
exports.opsAlert = async (event) => {
  const channelAccessToken = process.env.OPS_ALERT_LINE_CHANNEL_ACCESS_TOKEN;
  const userId = process.env.OPS_ALERT_LINE_USER_ID;

  for (const record of event.Records || []) {
    try {
      const alarm = JSON.parse(record.Sns.Message);
      const message = buildOpsAlertMessage({
        appName: "uchi-stock",
        alarmName: alarm.AlarmName,
        newState: alarm.NewStateValue,
        reason: alarm.NewStateReason,
      });

      if (!channelAccessToken || !userId) {
        console.warn("[opsAlert] OPS_ALERT_LINE_CHANNEL_ACCESS_TOKEN/OPS_ALERT_LINE_USER_IDが未設定のため送信をスキップします:", message);
        continue;
      }

      await sendOpsAlert({ message, channelAccessToken, userId });
    } catch (error) {
      // 1件の通知失敗が他のレコード処理・Lambda全体の失敗に波及しないようにする
      console.error("[opsAlert] 通知処理に失敗しました:", error.message);
    }
  }
};
