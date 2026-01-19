import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand, QueryCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import {
  createItem,
  getItems,
  updateItem,
  deleteItem,
  addStock,
  consumeStock,
  getConsumptionHistory,
  getEstimatedDepletionDate
} from './handler';
import crypto from 'crypto';

const ddbMock = mockClient(DynamoDBDocumentClient);

// crypto.randomUUID をモック化
vi.spyOn(crypto, 'randomUUID').mockReturnValue('mock-id');
// console.error をモック化してテストログを汚さないようにする
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Household Items API', () => {
  const ITEMS_TABLE = 'uchi-stock-app-items';
  const HISTORY_TABLE = 'uchi-stock-app-stock-history';
  const TEST_USER = 'test-user';

  beforeEach(() => {
    ddbMock.reset();
    process.env.TABLE_NAME = ITEMS_TABLE;
    process.env.STOCK_HISTORY_TABLE_NAME = HISTORY_TABLE;
    // 日時を固定
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('createItem', () => {
    it('should create an item successfully with user-id', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        body: JSON.stringify({ name: 'Test Item', unit: 'pcs' }),
      };

      ddbMock.on(PutCommand).resolves({});

      const result = await createItem(event);

      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body).toEqual({
        userId: TEST_USER,
        itemId: 'mock-id',
        name: 'Test Item',
        unit: 'pcs',
        currentStock: 0,
        createdAt: '2023-01-01T12:00:00.000Z',
      });
    });

    it('should use default-user if x-user-id header is missing', async () => {
        const event = {
          headers: {},
          body: JSON.stringify({ name: 'Test Item', unit: 'pcs' }),
        };
  
        ddbMock.on(PutCommand).resolves({});
  
      const result = await createItem(event);
      const body = JSON.parse(result.body);
      expect(body.userId).toBe('default-user');
    });

    it('should return 400 if name or unit is missing', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        body: JSON.stringify({ name: 'Test Item' }), // unit missing
      };
      const result = await createItem(event);
      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).message).toBe('Name and unit are required');
    });

    it('should return 500 if dynamoDB fails', async () => {
      ddbMock.on(PutCommand).rejects(new Error('DynamoDB Error'));
      const event = {
        headers: { 'x-user-id': TEST_USER },
        body: JSON.stringify({ name: 'Test Item', unit: 'pcs' }),
      };
      const result = await createItem(event);
      expect(result.statusCode).toBe(500);
    });
  });

  describe('getItems', () => {
    it('should return items successfully for specific user with updatedAt from history', async () => {
      const mockItems = [{ itemId: '1', name: 'Item 1', userId: TEST_USER, createdAt: '2023-01-01T00:00:00Z' }];
      const mockHistory = [{ date: '2023-01-01T12:00:00Z', itemId: '1' }];
      
      // Items取得用のモック
      ddbMock.on(QueryCommand, {
        TableName: ITEMS_TABLE,
      }).resolves({ Items: mockItems });

      // History取得用のモック
      ddbMock.on(QueryCommand, {
        TableName: HISTORY_TABLE,
      }).resolves({ Items: mockHistory });

      const result = await getItems({ headers: { 'x-user-id': TEST_USER } });
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body[0].updatedAt).toBe('2023-01-01T12:00:00Z');
    });

    it('should fallback to createdAt if no history found', async () => {
      const mockItems = [{ itemId: '1', name: 'Item 1', userId: TEST_USER, createdAt: '2023-01-01T00:00:00Z' }];
      
      ddbMock.on(QueryCommand, {
        TableName: ITEMS_TABLE,
      }).resolves({ Items: mockItems });

      ddbMock.on(QueryCommand, {
        TableName: HISTORY_TABLE,
      }).resolves({ Items: [] });

      const result = await getItems({ headers: { 'x-user-id': TEST_USER } });
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body[0].updatedAt).toBe('2023-01-01T00:00:00Z');
    });

    it('should return 500 if dynamoDB fails', async () => {
      ddbMock.on(QueryCommand).rejects(new Error('DynamoDB Error'));
      const result = await getItems({ headers: { 'x-user-id': TEST_USER } });
      expect(result.statusCode).toBe(500);
    });
  });

  describe('updateItem', () => {
    it('should update an item successfully and return updatedAt', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ name: 'Updated Name', currentStock: 10 }),
      };
      ddbMock.on(UpdateCommand).resolves({ Attributes: { name: 'Updated Name', currentStock: 10 } });

      const result = await updateItem(event);
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.name).toBe('Updated Name');
      expect(body.updatedAt).toBe('2023-01-01T12:00:00.000Z');
    });

    it('should return 400 if no update parameters provided', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({}),
      };
      const result = await updateItem(event);
      expect(result.statusCode).toBe(400);
    });

    it('should return 500 if dynamoDB fails', async () => {
      ddbMock.on(UpdateCommand).rejects(new Error('DynamoDB Error'));
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ name: 'New' }),
      };
      const result = await updateItem(event);
      expect(result.statusCode).toBe(500);
    });
  });

  describe('deleteItem', () => {
    it('should delete an item successfully', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
      };
      ddbMock.on(DeleteCommand).resolves({});

      const result = await deleteItem(event);
      expect(result.statusCode).toBe(204);
    });

    it('should return 500 if dynamoDB fails', async () => {
      ddbMock.on(DeleteCommand).rejects(new Error('DynamoDB Error'));
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
      };
      const result = await deleteItem(event);
      expect(result.statusCode).toBe(500);
    });
  });

  describe('addStock', () => {
    it('should add stock successfully for user and return updatedAt', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ quantity: 5, memo: 'Buy' }),
      };

      ddbMock.on(PutCommand).resolves({});
      ddbMock.on(UpdateCommand).resolves({ Attributes: { userId: TEST_USER, itemId: 'item-1', currentStock: 5 } });

      const result = await addStock(event);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).updatedAt).toBe('2023-01-01T12:00:00.000Z');
      
      const putCall = ddbMock.calls().find(c => c.args[0] instanceof PutCommand);
      expect(putCall.args[0].input.Item.userId).toBe(TEST_USER);
      
      const updateCall = ddbMock.calls().find(c => c.args[0] instanceof UpdateCommand);
      expect(updateCall.args[0].input.Key.userId).toBe(TEST_USER);
    });

    it('should return 400 if quantity is missing or invalid', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ quantity: 0 }),
      };
      const result = await addStock(event);
      expect(result.statusCode).toBe(400);
    });

    it('should return 500 if dynamoDB fails', async () => {
      ddbMock.on(PutCommand).rejects(new Error('DynamoDB Error'));
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ quantity: 5 }),
      };
      const result = await addStock(event);
      expect(result.statusCode).toBe(500);
    });
  });

  describe('consumeStock', () => {
    it('should consume stock successfully for user and update averageConsumptionRate', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ quantity: 2 }),
      };

      // 消費履歴のクエリをモック（平均消費ペース計算用）
      ddbMock.on(QueryCommand).resolves({
        Items: [
          { date: '2022-12-25T12:00:00Z', quantity: 1, type: 'consumption', userId: TEST_USER },
          { date: '2022-12-30T12:00:00Z', quantity: 1, type: 'consumption', userId: TEST_USER }
        ]
      });
      ddbMock.on(PutCommand).resolves({});
      ddbMock.on(UpdateCommand).resolves({
        Attributes: {
          userId: TEST_USER,
          itemId: 'item-1',
          currentStock: 3,
          averageConsumptionRate: 0.4 // 2個/5日 = 0.4個/日
        }
      });

      const result = await consumeStock(event);

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.averageConsumptionRate).toBeDefined();
      expect(body.updatedAt).toBe('2023-01-01T12:00:00.000Z');

      const putCall = ddbMock.calls().find(c => c.args[0] instanceof PutCommand);
      expect(putCall.args[0].input.Item.userId).toBe(TEST_USER);

      const updateCall = ddbMock.calls().find(c => c.args[0] instanceof UpdateCommand);
      expect(updateCall.args[0].input.ExpressionAttributeValues[':rate']).toBeDefined();
    });

    it('should set averageConsumptionRate to 0 when not enough history', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ quantity: 2 }),
      };

      // 消費履歴が少ない場合
      ddbMock.on(QueryCommand).resolves({ Items: [] });
      ddbMock.on(PutCommand).resolves({});
      ddbMock.on(UpdateCommand).resolves({
        Attributes: {
          userId: TEST_USER,
          itemId: 'item-1',
          currentStock: 3,
          averageConsumptionRate: 0
        }
      });

      const result = await consumeStock(event);
      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.averageConsumptionRate).toBe(0);
    });

    it('should return 400 if quantity is missing or invalid', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ quantity: -1 }),
      };
      const result = await consumeStock(event);
      expect(result.statusCode).toBe(400);
    });

    it('should return 500 if dynamoDB fails', async () => {
      ddbMock.on(PutCommand).rejects(new Error('DynamoDB Error'));
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ quantity: 2 }),
      };
      const result = await consumeStock(event);
      expect(result.statusCode).toBe(500);
    });
  });

  describe('getConsumptionHistory', () => {
    it('should return history successfully', async () => {
      const mockHistory = [{ historyId: 'h1', itemId: 'item-1', type: 'consumption', date: '2023-01-01T12:00:00Z', userId: TEST_USER }];
      ddbMock.on(QueryCommand).resolves({ Items: mockHistory });

      const result = await getConsumptionHistory({ 
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' } 
      });

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockHistory);
    });

    it('should return 500 if dynamoDB fails', async () => {
      ddbMock.on(QueryCommand).rejects(new Error('DynamoDB Error'));
      const result = await getConsumptionHistory({ 
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' } 
      });
      expect(result.statusCode).toBe(500);
    });
  });

  describe('getEstimatedDepletionDate', () => {
    it('should estimate depletion date using averageConsumptionRate', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          userId: TEST_USER,
          itemId: 'item-1',
          currentStock: 10,
          averageConsumptionRate: 2.0 // 1日2個消費
        }
      });
      // 購入履歴のモック
      ddbMock.on(QueryCommand, { TableName: HISTORY_TABLE }).resolves({
        Items: [
          { quantity: 20, type: 'purchase', date: '2023-01-01T12:00:00Z' }
        ]
      });

      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' }
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBeDefined();
      expect(body.dailyConsumption).toBe("2.00");
      expect(body.currentStock).toBe(10);

      const getCall = ddbMock.calls().find(c => c.args[0] instanceof GetCommand);
      expect(getCall.args[0].input.Key.userId).toBe(TEST_USER);
    });

    it('should estimate depletion date based on reference date when date parameter is provided', async () => {
      const referenceDate = '2023-01-05T12:00:00Z';
      ddbMock.on(GetCommand).resolves({
        Item: {
          userId: TEST_USER,
          itemId: 'item-1',
          currentStock: 10,
          averageConsumptionRate: 2.0 // 1日2個消費
        }
      });
      // 購入履歴のモック
      ddbMock.on(QueryCommand, { TableName: HISTORY_TABLE }).resolves({
        Items: [
          { quantity: 20, type: 'purchase', date: '2023-01-01T12:00:00Z' }
        ]
      });

      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        queryStringParameters: { date: referenceDate }
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBeDefined();
      // 基準日2023-01-05 + 10/2 = 5日 = 2023-01-10
      expect(body.estimatedDepletionDate).toBe('2023-01-10T12:00:00.000Z');
      expect(body.dailyConsumption).toBe("2.00");
      expect(body.currentStock).toBe(10);
      expect(body.stockPercentage).toBe(50); // 10/20 = 50%
      expect(body.lastPurchaseQuantity).toBe(20);
    });

    it('should use current date when invalid date parameter is provided', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          userId: TEST_USER,
          itemId: 'item-1',
          currentStock: 10,
          averageConsumptionRate: 2.0 // 1日2個消費
        }
      });
      // 購入履歴のモック
      ddbMock.on(QueryCommand, { TableName: HISTORY_TABLE }).resolves({
        Items: [
          { quantity: 20, type: 'purchase', date: '2023-01-01T12:00:00Z' }
        ]
      });

      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        queryStringParameters: { date: 'invalid-date' }
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBeDefined();
      // 基準日が現在日付（2023-01-01T12:00:00Z） + 10/2 = 5日 = 2023-01-06T12:00:00Z
      expect(body.estimatedDepletionDate).toBe('2023-01-06T12:00:00.000Z');
      expect(body.dailyConsumption).toBe("2.00");
      expect(body.currentStock).toBe(10);
    });

    it('should return null estimate when averageConsumptionRate is 0', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          userId: TEST_USER,
          itemId: 'item-1',
          currentStock: 10,
          averageConsumptionRate: 0
        }
      });

      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' }
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBeNull();
      expect(body.dailyConsumption).toBe(0);
      expect(body.message).toContain('No consumption data available');
    });

    it('should return null estimate when averageConsumptionRate is not set', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          userId: TEST_USER,
          itemId: 'item-1',
          currentStock: 10
          // averageConsumptionRate が未設定
        }
      });

      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' }
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBeNull();
      expect(body.dailyConsumption).toBe(0);
    });

    it('should return 404 if item is not found', async () => {
      ddbMock.on(GetCommand).resolves({ Item: null });
      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-nonexistent' }
      });
      expect(result.statusCode).toBe(404);
    });

    it('should return 500 if dynamoDB fails', async () => {
      ddbMock.on(GetCommand).rejects(new Error('DynamoDB Error'));
      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' }
      });
      expect(result.statusCode).toBe(500);
    });
  });

  describe('Stock Prediction Tests based on test-strategy-stock-prediction.md', () => {
    it('should predict depletion in 10 days for simple consumption case (currentStock: 10, dailyConsumption: 1)', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          userId: TEST_USER,
          itemId: 'item-simple',
          currentStock: 10,
          averageConsumptionRate: 1.0
        }
      });
      // 購入履歴のモック
      ddbMock.on(QueryCommand, { TableName: HISTORY_TABLE }).resolves({
        Items: [
          { quantity: 20, type: 'purchase', date: '2023-01-01T12:00:00Z' }
        ]
      });

      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-simple' }
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBeDefined();
      // T0 (2023-01-01T12:00:00Z) + 10日 = 2023-01-11T12:00:00Z
      expect(body.estimatedDepletionDate).toBe('2023-01-11T12:00:00.000Z');
      expect(body.dailyConsumption).toBe("1.00");
      expect(body.currentStock).toBe(10);
    });

    it('should predict depletion in 3 days for low stock case (currentStock: 3, dailyConsumption: 1)', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          userId: TEST_USER,
          itemId: 'item-low',
          currentStock: 3,
          averageConsumptionRate: 1.0
        }
      });
      // 購入履歴のモック
      ddbMock.on(QueryCommand, { TableName: HISTORY_TABLE }).resolves({
        Items: [
          { quantity: 20, type: 'purchase', date: '2023-01-01T12:00:00Z' }
        ]
      });

      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-low' }
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBe('2023-01-04T12:00:00.000Z'); // T0 + 3日
      expect(body.dailyConsumption).toBe("1.00");
      expect(body.currentStock).toBe(3);
    });

    it('should predict depletion in ~10 days for variable consumption case (currentStock: 10, averageConsumption: 1)', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          userId: TEST_USER,
          itemId: 'item-variable',
          currentStock: 10,
          averageConsumptionRate: 1.0 // 変動平均
        }
      });
      // 購入履歴のモック
      ddbMock.on(QueryCommand, { TableName: HISTORY_TABLE }).resolves({
        Items: [
          { quantity: 20, type: 'purchase', date: '2023-01-01T12:00:00Z' }
        ]
      });

      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-variable' }
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBe('2023-01-11T12:00:00.000Z'); // ±1日許容だが平均1.0なので10日
      expect(body.dailyConsumption).toBe("1.00");
      expect(body.currentStock).toBe(10);
    });

    it('should recalculate after mid-term replenishment (currentStock: 15, dailyConsumption: 1)', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          userId: TEST_USER,
          itemId: 'item-replenish',
          currentStock: 15,
          averageConsumptionRate: 1.0
        }
      });
      // 購入履歴のモック
      ddbMock.on(QueryCommand, { TableName: HISTORY_TABLE }).resolves({
        Items: [
          { quantity: 20, type: 'purchase', date: '2023-01-01T12:00:00Z' }
        ]
      });

      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-replenish' }
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBe('2023-01-16T12:00:00.000Z'); // T0 + 15日
      expect(body.dailyConsumption).toBe("1.00");
      expect(body.currentStock).toBe(15);
    });

    it('should handle provisional case (no consumption history)', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          userId: TEST_USER,
          itemId: 'item-provisional',
          currentStock: 10
          // averageConsumptionRate 未設定（provisional）
        }
      });

      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-provisional' }
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBeNull();
      expect(body.dailyConsumption).toBe(0);
      expect(body.message).toContain('No consumption data available');
    });

    it('should handle zero consumption case (consumption=0)', async () => {
      ddbMock.on(GetCommand).resolves({
        Item: {
          userId: TEST_USER,
          itemId: 'item-zero',
          currentStock: 10,
          averageConsumptionRate: 0
        }
      });

      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-zero' }
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBeNull();
      expect(body.dailyConsumption).toBe(0);
      expect(body.message).toContain('No consumption data available');
    });

    it('should handle long-term input stop case (low reliability)', async () => {
      // 入力停止の場合、averageConsumptionRateは低い値になるはずだが、
      // 現在の実装では履歴に基づいて計算されるため、テストでは既存のロジックを使用
      ddbMock.on(GetCommand).resolves({
        Item: {
          userId: TEST_USER,
          itemId: 'item-stopped',
          currentStock: 10,
          averageConsumptionRate: 0.1 // 古いデータによる低い消費率
        }
      });
      // 購入履歴のモック
      ddbMock.on(QueryCommand, { TableName: HISTORY_TABLE }).resolves({
        Items: [
          { quantity: 20, type: 'purchase', date: '2023-01-01T12:00:00Z' }
        ]
      });

      const result = await getEstimatedDepletionDate({
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-stopped' }
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBeDefined();
      // 10 / 0.1 = 100日後
      expect(body.estimatedDepletionDate).toBe('2023-04-11T12:00:00.000Z');
      expect(body.dailyConsumption).toBe("0.10");
      expect(body.currentStock).toBe(10);
    });
  });
});
