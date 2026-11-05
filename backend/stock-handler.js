const { GetCommand, PutCommand, UpdateCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");
const stockLogic = require("./stock-logic");
const { docClient, ITEMS_TABLE, HISTORY_TABLE } = require("./db-client");
const { jsonResponse, HttpError, requireItemId, parseJsonBody, errorResponse } = require("./http-helpers");
const { getUserId, resolveAuthorizedTargetUserId } = require("./auth");

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
