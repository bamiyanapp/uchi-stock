import { describe, it, expect } from 'vitest';
const { calculateAverageConsumptionRate, calculateEstimatedDepletion } = require('./stock-logic');

describe('stock-logic', () => {
  const referenceDate = new Date('2026-01-24T00:00:00Z');

  describe('calculateAverageConsumptionRate', () => {
    it('単純消費ケース：10日間で10個消費', () => {
      const history = [
        { type: 'consumption', quantity: 1, date: new Date('2026-01-14T00:00:00Z').toISOString() },
        { type: 'consumption', quantity: 1, date: new Date('2026-01-15T00:00:00Z').toISOString() },
        { type: 'consumption', quantity: 1, date: new Date('2026-01-16T00:00:00Z').toISOString() },
        { type: 'consumption', quantity: 1, date: new Date('2026-01-17T00:00:00Z').toISOString() },
        { type: 'consumption', quantity: 1, date: new Date('2026-01-18T00:00:00Z').toISOString() },
        { type: 'consumption', quantity: 1, date: new Date('2026-01-19T00:00:00Z').toISOString() },
        { type: 'consumption', quantity: 1, date: new Date('2026-01-20T00:00:00Z').toISOString() },
        { type: 'consumption', quantity: 1, date: new Date('2026-01-21T00:00:00Z').toISOString() },
        { type: 'consumption', quantity: 1, date: new Date('2026-01-22T00:00:00Z').toISOString() },
        { type: 'consumption', quantity: 1, date: new Date('2026-01-23T00:00:00Z').toISOString() },
      ];
      // 14日から24日までは10日間。合計10個消費なので、1.0個/日
      const rate = calculateAverageConsumptionRate(history, referenceDate);
      expect(rate).toBeCloseTo(1.0);
    });

    it('履歴が1件以下の場合は0を返す', () => {
      expect(calculateAverageConsumptionRate([], referenceDate)).toBe(0);
      expect(calculateAverageConsumptionRate([{ type: 'consumption', quantity: 1, date: '2026-01-23T00:00:00Z' }], referenceDate)).toBe(0);
    });

    it('消費以外の履歴は無視する', () => {
      const history = [
        { type: 'purchase', quantity: 10, date: new Date('2026-01-14T00:00:00Z').toISOString() },
        { type: 'consumption', quantity: 5, date: new Date('2026-01-14T00:00:00Z').toISOString() },
        { type: 'consumption', quantity: 5, date: new Date('2026-01-19T00:00:00Z').toISOString() },
      ];
      // 14日から24日まで10日間。消費合計10個。
      const rate = calculateAverageConsumptionRate(history, referenceDate);
      expect(rate).toBeCloseTo(1.0);
    });
  });

  describe('calculateEstimatedDepletion', () => {
    it('単純消費ケース：在庫10、消費1/日', () => {
      const item = {
        currentStock: 10,
        averageConsumptionRate: 1.0,
        createdAt: new Date('2026-01-14T00:00:00Z').toISOString()
      };
      const history = [
        { type: 'purchase', quantity: 10, date: new Date('2026-01-24T00:00:00Z').toISOString() }
      ];
      const result = calculateEstimatedDepletion(item, history, referenceDate);
      
      // 基準日が24日で、在庫10、消費1なので、10日後の2月3日が在庫切れ
      expect(result.dailyConsumption).toBe(1.0);
      expect(result.predictedStock).toBe(10);
      expect(new Date(result.estimatedDepletionDate).getTime()).toBe(new Date('2026-02-03T00:00:00Z').getTime());
      expect(result.stockPercentage).toBe(100);
    });

    it('予測在庫の計算：最後の更新から3日経過', () => {
      const item = {
        currentStock: 7, // 21日時点
        averageConsumptionRate: 1.0,
        createdAt: new Date('2026-01-14T00:00:00Z').toISOString()
      };
      const history = [
        { type: 'consumption', quantity: 1, date: new Date('2026-01-21T00:00:00Z').toISOString() }
      ];
      // 基準日24日は21日から3日後。予測在庫は 7 - (1 * 3) = 4
      const result = calculateEstimatedDepletion(item, history, referenceDate);
      expect(result.predictedStock).toBe(4);
      expect(new Date(result.estimatedDepletionDate).getTime()).toBe(new Date('2026-01-28T00:00:00Z').getTime());
    });

    it('在庫切れの場合：予測在庫は0', () => {
      const item = {
        currentStock: 1,
        averageConsumptionRate: 1.0,
        createdAt: new Date('2026-01-14T00:00:00Z').toISOString()
      };
      const history = [
        { type: 'consumption', quantity: 1, date: new Date('2026-01-20T00:00:00Z').toISOString() }
      ];
      // 20日から24日までは4日経過。在庫1なので既に切れているはず。
      const result = calculateEstimatedDepletion(item, history, referenceDate);
      expect(result.predictedStock).toBe(0);
      expect(new Date(result.estimatedDepletionDate).getTime()).toBe(referenceDate.getTime());
    });

    it('消費ペースが0の場合', () => {
      const item = { currentStock: 10, averageConsumptionRate: 0 };
      const result = calculateEstimatedDepletion(item, [], referenceDate);
      expect(result.estimatedDepletionDate).toBeNull();
      expect(result.dailyConsumption).toBe(0);
    });
  });

  describe('複雑なシナリオ (seed-test-stock-prediction より)', () => {
    it('平均消費ケース（変動）：平均1/日', () => {
      const now = referenceDate;
      const history = [
        { daysAgo: 15, type: "purchase", quantity: 15, memo: "初期購入" },
        { daysAgo: 14, type: "consumption", quantity: 0.5 },
        { daysAgo: 13, type: "consumption", quantity: 1.5 },
        { daysAgo: 12, type: "consumption", quantity: 1 },
        { daysAgo: 11, type: "consumption", quantity: 0.5 },
        { daysAgo: 10, type: "consumption", quantity: 1.5 },
        { daysAgo: 9, type: "consumption", quantity: 1 },
        { daysAgo: 8, type: "consumption", quantity: 0.5 },
        { daysAgo: 7, type: "consumption", quantity: 1.5 },
        { daysAgo: 6, type: "consumption", quantity: 1 },
        { daysAgo: 5, type: "consumption", quantity: 0.5 },
        { daysAgo: 4, type: "consumption", quantity: 1.5 },
        { daysAgo: 3, type: "consumption", quantity: 1 },
        { daysAgo: 2, type: "consumption", quantity: 0.5 },
        { daysAgo: 1, type: "consumption", quantity: 1.5 }
      ].map(h => ({
        ...h,
        date: new Date(now.getTime() - h.daysAgo * 24 * 60 * 60 * 1000).toISOString()
      }));

      const rate = calculateAverageConsumptionRate(history, referenceDate);
      // 14日前から基準日まで14日間。消費合計は 0.5+1.5+1... = 1 * 7 = 14 (のはず)
      // 0.5+1.5 = 2.0 が 7ペア = 14.0
      expect(rate).toBeCloseTo(1.0);

      const item = {
        currentStock: 1, // 最後の履歴(1日前)時点での在庫
        averageConsumptionRate: rate,
        createdAt: history[0].date
      };
      const result = calculateEstimatedDepletion(item, history, referenceDate);
      // 1日前から基準日までで1個消費される予測なので、基準日では在庫0
      expect(result.predictedStock).toBe(0);
      expect(new Date(result.estimatedDepletionDate).getTime()).toBe(referenceDate.getTime());
    });
  });
});
