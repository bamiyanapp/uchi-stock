const { PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");
const { docClient, ITEMS_TABLE, HISTORY_TABLE } = require("./db-client");
const { jsonResponse, HttpError, requireItemId, parseJsonBody, errorResponse } = require("./http-helpers");
const { getUserId, resolveAuthorizedTargetUserId } = require("./auth");

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
