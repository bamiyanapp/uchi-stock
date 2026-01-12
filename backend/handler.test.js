import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
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
    it('should create an item successfully', async () => {
      const event = {
        body: JSON.stringify({ name: 'Test Item', unit: 'pcs' }),
      };

      ddbMock.on(PutCommand).resolves({});

      const result = await createItem(event);

      expect(result.statusCode).toBe(201);
      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers['Access-Control-Allow-Credentials']).toBe(true);
      const body = JSON.parse(result.body);
      expect(body).toEqual({
        itemId: 'mock-id',
        name: 'Test Item',
        unit: 'pcs',
        currentStock: 0,
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z',
      });
    });
  });

  describe('getItems', () => {
    it('should return items successfully', async () => {
      const mockItems = [{ itemId: '1', name: 'Item 1' }];
      ddbMock.on(ScanCommand).resolves({ Items: mockItems });
      const result = await getItems({});
      expect(result.statusCode).toBe(200);
      expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(result.headers['Access-Control-Allow-Credentials']).toBe(true);
      expect(JSON.parse(result.body)).toEqual(mockItems);
    });
  });

  describe('addStock', () => {
    it('should add stock successfully', async () => {
      const event = {
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ quantity: 5, memo: 'Buy' }),
      };

      ddbMock.on(PutCommand).resolves({});
      ddbMock.on(UpdateCommand).resolves({ Attributes: { itemId: 'item-1', currentStock: 5 } });

      const result = await addStock(event);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).currentStock).toBe(5);
      
      const putCall = ddbMock.calls().find(c => c.args[0] instanceof PutCommand);
      expect(putCall.args[0].input.Item.type).toBe('purchase');
      expect(putCall.args[0].input.Item.quantity).toBe(5);
    });
  });

  describe('consumeStock', () => {
    it('should consume stock successfully', async () => {
      const event = {
        pathParameters: { itemId: 'item-1' },
        body: JSON.stringify({ quantity: 2 }),
      };

      ddbMock.on(PutCommand).resolves({});
      ddbMock.on(UpdateCommand).resolves({ Attributes: { itemId: 'item-1', currentStock: 3 } });

      const result = await consumeStock(event);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body).currentStock).toBe(3);
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
    it('should estimate depletion date', async () => {
      ddbMock.on(GetCommand).resolves({ Item: { itemId: 'item-1', currentStock: 10 } });
      ddbMock.on(ScanCommand).resolves({ 
        Items: [
          { date: '2023-01-01T12:00:00Z', quantity: 2, type: 'consumption' },
          { date: '2023-01-03T12:00:00Z', quantity: 2, type: 'consumption' }
        ]
      });

      const result = await getEstimatedDepletionDate({ pathParameters: { itemId: 'item-1' } });

      expect(result.statusCode).toBe(200);
      const body = JSON.parse(result.body);
      expect(body.estimatedDepletionDate).toBeDefined();
      // 2日間で4個消費 = 1日2個。在庫10個 = 5日後。
      const expectedDate = new Date('2023-01-01T12:00:00Z');
      expectedDate.setDate(expectedDate.getDate() + 5);
      expect(new Date(body.estimatedDepletionDate).toISOString()).toBe(expectedDate.toISOString());
    });
  });
});
