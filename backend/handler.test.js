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
        updatedAt: '2023-01-01T12:00:00.000Z',
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
    it('should return items successfully for specific user', async () => {
      const mockItems = [{ itemId: '1', name: 'Item 1', userId: TEST_USER }];
      ddbMock.on(QueryCommand).resolves({ Items: mockItems });
      const result = await getItems({ headers: { 'x-user-id': TEST_USER } });
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockItems);
      
      const queryCall = ddbMock.calls().find(c => c.args[0] instanceof QueryCommand);
      expect(queryCall.args[0].input.ExpressionAttributeValues[':userId']).toBe(TEST_USER);
    });

    it('should return 500 if dynamoDB fails', async () => {
      ddbMock.on(QueryCommand).rejects(new Error('DynamoDB Error'));
      const result = await getItems({ headers: { 'x-user-id': TEST_USER } });
      expect(result.statusCode).toBe(500);
    });
  });

  describe('updateItem', () => {
    it('should update an item successfully', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ name: 'Updated Name', currentStock: 10 }),
      };
      ddbMock.on(UpdateCommand).resolves({ Attributes: { name: 'Updated Name', currentStock: 10 } });

      const result = await updateItem(event);
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).name).toBe('Updated Name');
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
    it('should add stock successfully for user', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ quantity: 5, memo: 'Buy' }),
      };

      ddbMock.on(PutCommand).resolves({});
      ddbMock.on(UpdateCommand).resolves({ Attributes: { userId: TEST_USER, itemId: 'item-1', currentStock: 5 } });

      const result = await addStock(event);

      expect(result.statusCode).toBe(200);
      
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
});
