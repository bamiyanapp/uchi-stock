
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const crypto = require("crypto");

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const ITEMS_TABLE = () => process.env.TABLE_NAME;
const HISTORY_TABLE = () => process.env.STOCK_HISTORY_TABLE_NAME;

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
 * 各アイテムの最新の履歴日時を取得する。
 */
const getLatestUpdateDate = async (itemId) => {
  const { Items } = await docClient.send(new QueryCommand({
    TableName: HISTORY_TABLE(),
    KeyConditionExpression: "itemId = :itemId",
    ScanIndexForward: false,
    Limit: 1,
    ExpressionAttributeValues: { ":itemId": itemId },
  }));
  return Items && Items.length > 0 ? Items[0].date : null;
};

/**
 * 登録されているすべての品目を取得する。
 */
exports.getItems = async (event) => {
  try {
    const userId = getUserId(event);
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

    const now = new Date().toISOString();
    let UpdateExpression = "set";
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
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ message: "No update parameters provided" }),
      };
    }

    UpdateExpression += " " + updates.join(", ");

    if (updates.length > 0) {
      updates.push("updatedAt = :updatedAt");
      ExpressionAttributeValues[":updatedAt"] = now;
    }

    UpdateExpression = "set " + updates.join(", ");

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
      TableName: HISTORY_TABLE(),
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
    const now = new Date();

    // 観測期間：最初の記録から現在まで（最低1日）
    const observationPeriodDays = Math.max(1, (now - firstDate) / (1000 * 60 * 60 * 24));

    // 総消費量（最後の消費記録は含めない。期間の最後が「現在」であるため、最後の消費から現在までの期間も考慮した平均を出すため、全消費量を期間で割る）
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
      TableName: ITEMS_TABLE(),
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

    // 最後に在庫が確定した履歴（作成、購入、更新、消費）を取得
    let latestHistory = [];
    try {
      const result = await docClient.send(new QueryCommand({
        TableName: HISTORY_TABLE(),
        KeyConditionExpression: "itemId = :itemId",
        FilterExpression: "#u = :userId AND (#t = :purchase OR #t = :update OR #t = :creation OR #t = :consumption)",
        ExpressionAttributeNames: { "#u": "userId", "#t": "type" },
        ExpressionAttributeValues: {
          ":itemId": itemId,
          ":userId": userId,
          ":purchase": "purchase",
          ":update": "update",
          ":creation": "creation",
          ":consumption": "consumption"
        },
        ScanIndexForward: false, // 降順（新しい順）
        Limit: 1
      }));
      latestHistory = result.Items || [];
    } catch (e) {
      console.error("Error fetching latest history:", e);
      // フォールバック
    }

    const lastUpdateDateStr = latestHistory.length > 0
      ? latestHistory[0].date
      : item.createdAt;
    const lastUpdateDate = new Date(lastUpdateDateStr);

    const daysSinceLastUpdate = Math.max(0, (referenceDate - lastUpdateDate) / (1000 * 60 * 60 * 24));
    const predictedStock = Math.max(0, item.currentStock - (dailyConsumption * daysSinceLastUpdate));
    
    const daysRemainingFromCurrent = predictedStock / dailyConsumption;
    const estimatedDate = new Date(referenceDate.getTime() + daysRemainingFromCurrent * 24 * 60 * 60 * 1000);

    // 最後に購入した際の数量を取得
    const { Items: purchaseHistory } = await docClient.send(new QueryCommand({
      TableName: HISTORY_TABLE(),
      KeyConditionExpression: "itemId = :itemId",
      FilterExpression: "#t = :type AND #u = :userId",
      ExpressionAttributeNames: { "#t": "type", "#u": "userId" },
      ExpressionAttributeValues: { ":itemId": itemId, ":type": "purchase", ":userId": userId },
      ScanIndexForward: false, // 降順（新しい順）
      Limit: 1
    }));

    let baselineQuantity = purchaseHistory && purchaseHistory.length > 0 ? purchaseHistory[0].quantity : null;

    // 購入履歴がない場合は、直近の更新（Update/Creation）を基準にする
    if (!baselineQuantity) {
      try {
        const { Items: historyItems } = await docClient.send(new QueryCommand({
          TableName: HISTORY_TABLE(),
          KeyConditionExpression: "itemId = :itemId",
          FilterExpression: "#u = :userId",
          ExpressionAttributeNames: { "#u": "userId" },
          ExpressionAttributeValues: { ":itemId": itemId, ":userId": userId },
          ScanIndexForward: false, // 降順（新しい順）
          Limit: 50 // 直近50件まで遡る
        }));
        
        if (historyItems && historyItems.length > 0) {
          let tempStock = item.currentStock;
          
          for (const h of historyItems) {
            // 将来的な拡張や並列更新を考慮し、処理済みより未来の日付の履歴はスキップすべきだが、
            // ここでは簡易的に降順で処理する
            
            if (h.type === 'purchase') {
              baselineQuantity = h.quantity;
              break;
            } else if (h.type === 'update' || h.type === 'creation') {
              // Update/Creationはその時点での在庫数を「設定」するイベントなので
              // 計算上の tempStock がその時点の在庫数（基準値）となる
              baselineQuantity = tempStock;
              break;
            } else if (h.type === 'consumption') {
              // 消費イベントの場合、消費前の在庫数に戻す
              tempStock += h.quantity;
            }
          }
        }
      } catch (e) {
        console.error("Error calculating baseline stock:", e);
      }
    }

    const stockPercentage = baselineQuantity ? Math.min(100, Math.round((predictedStock / baselineQuantity) * 100)) : null;

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        estimatedDepletionDate: estimatedDate.toISOString(),
        dailyConsumption: dailyConsumption.toFixed(2),
        currentStock: item.currentStock,
        predictedStock: Number(predictedStock.toFixed(2)),
        lastPurchaseQuantity: baselineQuantity,
        stockPercentage
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
