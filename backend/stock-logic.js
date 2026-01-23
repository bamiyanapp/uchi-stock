/**
 * 在庫管理と予測に関する純粋な計算ロジック。
 * 外部DB（DynamoDB）や現在時刻に依存せず、純粋に関数として実装する。
 */

/**
 * 消費履歴から日次平均消費量を算出する。
 * @param {Array} history - 履歴データの配列
 * @param {Date} referenceDate - 計算の基準日（通常は現在）
 * @returns {number} 日次平均消費量（個/日）
 */
const calculateAverageConsumptionRate = (history, referenceDate = new Date()) => {
  if (!history || history.length < 2) {
    return 0;
  }

  // 消費履歴のみを抽出
  const consumptionHistory = history
    .filter(h => h.type === "consumption" && h.date && !isNaN(new Date(h.date).getTime()))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (consumptionHistory.length < 2) {
    return 0;
  }

  // 最初の記録から基準日まで
  const firstDate = new Date(consumptionHistory[0].date);
  
  // 観測期間：最初の記録から基準日まで（最低1日）
  const observationPeriodDays = Math.max(1, (referenceDate - firstDate) / (1000 * 60 * 60 * 24));

  // 総消費量
  const totalConsumed = consumptionHistory.reduce((sum, h) => sum + h.quantity, 0);

  // 日次平均消費量
  const dailyConsumption = totalConsumed / observationPeriodDays;

  if (dailyConsumption <= 0 || isNaN(dailyConsumption) || !isFinite(dailyConsumption)) {
    return 0;
  }

  return dailyConsumption;
};

/**
 * 在庫切れ推定日を計算する。
 * @param {object} item - 品目情報（currentStock, averageConsumptionRate, createdAt）
 * @param {Array} history - 履歴データの配列
 * @param {Date} referenceDate - 計算の基準日
 * @returns {object} 予測結果
 */
const calculateEstimatedDepletion = (item, history, referenceDate = new Date()) => {
  const dailyConsumption = item.averageConsumptionRate || 0;

  if (dailyConsumption <= 0) {
    return {
      estimatedDepletionDate: null,
      dailyConsumption: 0,
      predictedStock: item.currentStock,
      stockPercentage: null
    };
  }

  // 最後に在庫が確定した履歴を取得
  const stockAffectingHistory = history
    .filter(h => ["purchase", "update", "creation", "consumption"].includes(h.type))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // 降順

  const lastUpdateDateStr = stockAffectingHistory.length > 0
    ? stockAffectingHistory[0].date
    : item.createdAt;
  const lastUpdateDate = new Date(lastUpdateDateStr);

  // 最後の更新から基準日までの経過日数
  const daysSinceLastUpdate = Math.max(0, (referenceDate - lastUpdateDate) / (1000 * 60 * 60 * 24));
  
  // 基準日時点での予測在庫
  const predictedStock = Math.max(0, item.currentStock - (dailyConsumption * daysSinceLastUpdate));
  
  // 基準日からの残り日数
  const daysRemainingFromReference = predictedStock / dailyConsumption;
  const estimatedDate = new Date(referenceDate.getTime() + daysRemainingFromReference * 24 * 60 * 60 * 1000);

  // 基準在庫（パーセンテージ計算用）の算出
  let baselineQuantity = null;
  const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date)); // 降順
  
  let tempStock = item.currentStock;
  for (const h of sortedHistory) {
    if (h.type === 'purchase') {
      baselineQuantity = h.quantity;
      break;
    } else if (h.type === 'update' || h.type === 'creation') {
      baselineQuantity = tempStock;
      break;
    } else if (h.type === 'consumption') {
      tempStock += h.quantity;
    }
  }

  const stockPercentage = baselineQuantity ? Math.min(100, Math.round((predictedStock / baselineQuantity) * 100)) : null;

  return {
    estimatedDepletionDate: estimatedDate.toISOString(),
    dailyConsumption: Number(dailyConsumption.toFixed(2)),
    predictedStock: Number(predictedStock.toFixed(2)),
    lastPurchaseQuantity: baselineQuantity,
    stockPercentage
  };
};

module.exports = {
  calculateAverageConsumptionRate,
  calculateEstimatedDepletion
};
