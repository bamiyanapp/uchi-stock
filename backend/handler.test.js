import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
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
  });

  describe('consumeStock', () => {
    it('should consume stock successfully for user', async () => {
      const event = {
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ quantity: 2 }),
      };

      ddbMock.on(PutCommand).resolves({});
      ddbMock.on(UpdateCommand).resolves({ Attributes: { userId: TEST_USER, itemId: 'item-1', currentStock: 3 } });

      const result = await consumeStock(event);

      expect(result.statusCode).toBe(200);
      
      const putCall = ddbMock.calls().find(c => c.args[0] instanceof PutCommand);
      expect(putCall.args[0].input.Item.userId).toBe(TEST_USER);
    });
  });

  describe('getConsumptionHistory', () => {
    it('should return history successfully', async () => {
      const mockHistory = [{ historyId: 'h1', itemId: 'item-1', type: 'consumption' }];
      ddbMock.on(QueryCommand).resolves({ Items: mockHistory });

      const result = await getConsumptionHistory({ pathParameters: { itemId: 'item-1' } });

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockHistory);
    });
  });

  describe('getEstimatedDepletionDate', () => {
    it('should estimate depletion date for user', async () => {
      ddbMock.on(GetCommand).resolves({ Item: { userId: TEST_USER, itemId: 'item-1', currentStock: 10 } });
      ddbMock.on(QueryCommand).resolves({ 
        Items: [
          { date: '2023-01-01T12:00:00Z', quantity: 2, type: 'consumption' },
          { date: '2023-01-03T12:00:00Z', quantity: 2, type: 'consumption' }
        ]
      });

      // システム時刻を 2023-01-05 に進める
      vi.setSystemTime(new Date('2023-01-05T12:00:00Z'));

      const result = await getEstimatedDepletionDate({ 
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' } 
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBeDefined();
      
      const getCall = ddbMock.calls().find(c => c.args[0] instanceof GetCommand);
      expect(getCall.args[0].input.Key.userId).toBe(TEST_USER);
    });

    it('should return null estimate when history has invalid dates', async () => {
      ddbMock.on(GetCommand).resolves({ Item: { userId: TEST_USER, itemId: 'item-1', currentStock: 10 } });
      ddbMock.on(QueryCommand).resolves({ 
        Items: [
          { date: 'invalid-date', quantity: 2, type: 'consumption' },
          { date: '2023-01-03T12:00:00Z', quantity: 2, type: 'consumption' }
        ]
      });

      const result = await getEstimatedDepletionDate({ 
        headers: { 'x-user-id': TEST_USER },
        pathParameters: { itemId: 'item-1' } 
      });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBeNull();
      expect(body.message).toContain('Not enough valid history');
    });

    it('should handle NaN in calculations gracefully', async () => {
        ddbMock.on(GetCommand).resolves({ Item: { userId: TEST_USER, itemId: 'item-1', currentStock: 10 } });
        // 同一時刻の記録が複数ある場合など、daysDiffが非常に小さくなるケースのシミュレーション
        ddbMock.on(QueryCommand).resolves({ 
          Items: [
            { date: '2023-01-01T12:00:00Z', quantity: 2, type: 'consumption' },
            { date: '2023-01-01T12:00:00Z', quantity: 2, type: 'consumption' }
          ]
        });
  
        const result = await getEstimatedDepletionDate({ 
          headers: { 'x-user-id': TEST_USER },
          pathParameters: { itemId: 'item-1' } 
        });
  
        expect(result.statusCode).toBe(200);
        const body = JSON.parse(result.body);
        expect(body.dailyConsumption).toBeDefined();
      });
  });
});
