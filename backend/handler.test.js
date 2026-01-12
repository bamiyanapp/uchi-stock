import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import {
  createItem,
  getItems,
  updateItem,
  deleteItem
} from './handler';
import crypto from 'crypto';

const ddbMock = mockClient(DynamoDBDocumentClient);

// crypto.randomUUID をモック化
vi.spyOn(crypto, 'randomUUID').mockReturnValue('mock-item-id');
// console.error をモック化してテストログを汚さないようにする
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Household Items API', () => {
  const HOUSEHOLD_ITEMS_TABLE_NAME = 'uchi-stock-app-items';

  beforeEach(() => {
    ddbMock.reset();
    process.env.TABLE_NAME = HOUSEHOLD_ITEMS_TABLE_NAME;
    // 日時を固定
    vi.setSystemTime(new Date('2023-01-01T12:00:00Z'));
  });

  describe('createItem', () => {
    it('should create an item successfully', async () => {
      const event = {
        body: JSON.stringify({ name: 'Test Item', unit: 'pcs' }),
      };

      ddbMock.on(PutCommand).resolves({});

      const result = await createItem(event);

      expect(result.statusCode).toBe(201);
      const body = JSON.parse(result.body);
      expect(body).toEqual({
        itemId: 'mock-item-id',
        name: 'Test Item',
        unit: 'pcs',
        currentStock: 0,
        createdAt: '2023-01-01T12:00:00.000Z',
        updatedAt: '2023-01-01T12:00:00.000Z',
      });

      expect(ddbMock.calls()).toHaveLength(1);
      const args = ddbMock.call(0).args[0];
      expect(args.input).toEqual({
        TableName: HOUSEHOLD_ITEMS_TABLE_NAME,
        Item: {
          itemId: 'mock-item-id',
          name: 'Test Item',
          unit: 'pcs',
          currentStock: 0,
          createdAt: '2023-01-01T12:00:00.000Z',
          updatedAt: '2023-01-01T12:00:00.000Z',
        },
      });
    });

    it('should return 400 if name is missing', async () => {
      const event = {
        body: JSON.stringify({ unit: 'pcs' }),
      };

      const result = await createItem(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({ message: 'Name and unit are required' });
    });

    it('should return 400 if unit is missing', async () => {
      const event = {
        body: JSON.stringify({ name: 'Test Item' }),
      };

      const result = await createItem(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body)).toEqual({ message: 'Name and unit are required' });
    });

    it('should return 500 on DynamoDB error', async () => {
      const event = {
        body: JSON.stringify({ name: 'Test Item', unit: 'pcs' }),
      };

      ddbMock.on(PutCommand).rejects(new Error('DynamoDB Error'));

      const result = await createItem(event);

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body).message).toBe('Internal Server Error');
    });
  });

  describe('getItems', () => {
    it('should return items successfully', async () => {
      const mockItems = [
        { itemId: '1', name: 'Item 1', unit: 'pcs' },
        { itemId: '2', name: 'Item 2', unit: 'kg' },
      ];

      ddbMock.on(ScanCommand).resolves({ Items: mockItems });

      const result = await getItems({});

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockItems);
      expect(ddbMock.calls()).toHaveLength(1);
      expect(ddbMock.call(0).args[0].input).toEqual({
        TableName: HOUSEHOLD_ITEMS_TABLE_NAME,
      });
    });

    it('should return empty array if no items found', async () => {
      ddbMock.on(ScanCommand).resolves({ Items: undefined }); // or []

      const result = await getItems({});

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual([]);
    });

    it('should return 500 on DynamoDB error', async () => {
      ddbMock.on(ScanCommand).rejects(new Error('DynamoDB Error'));

      const result = await getItems({});

      expect(result.statusCode).toBe(500);
    });
  });

  describe('updateItem', () => {
    it('should update an item successfully', async () => {
      const event = {
        pathParameters: { itemId: 'mock-item-id' },
        body: JSON.stringify({ name: 'Updated Name', currentStock: 5 }),
      };

      const mockAttributes = {
        itemId: 'mock-item-id',
        name: 'Updated Name',
        unit: 'pcs',
        currentStock: 5,
        updatedAt: '2023-01-01T12:00:00.000Z',
      };

      ddbMock.on(UpdateCommand).resolves({ Attributes: mockAttributes });

      const result = await updateItem(event);

      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual(mockAttributes);

      expect(ddbMock.calls()).toHaveLength(1);
      const args = ddbMock.call(0).args[0];
      expect(args.input.TableName).toBe(HOUSEHOLD_ITEMS_TABLE_NAME);
      expect(args.input.Key).toEqual({ itemId: 'mock-item-id' });
      expect(args.input.UpdateExpression).toContain('set updatedAt = :updatedAt');
      expect(args.input.UpdateExpression).toContain('#n = :name');
      expect(args.input.UpdateExpression).toContain('currentStock = :currentStock');
      expect(args.input.ExpressionAttributeValues[':name']).toBe('Updated Name');
      expect(args.input.ExpressionAttributeValues[':currentStock']).toBe(5);
    });

    it('should return 400 if no update parameters provided', async () => {
      const event = {
        pathParameters: { itemId: 'mock-item-id' },
        body: JSON.stringify({}),
      };

      const result = await updateItem(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).message).toBe('No update parameters provided');
    });

    it('should return 400 if currentStock is negative', async () => {
      const event = {
        pathParameters: { itemId: 'mock-item-id' },
        body: JSON.stringify({ currentStock: -1 }),
      };

      const result = await updateItem(event);

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).message).toBe('currentStock must be a non-negative number');
    });

    it('should return 404 if item not found', async () => {
      const event = {
        pathParameters: { itemId: 'non-existent-id' },
        body: JSON.stringify({ name: 'New Name' }),
      };

      ddbMock.on(UpdateCommand).resolves({ Attributes: undefined });

      const result = await updateItem(event);

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body).message).toBe('Item not found');
    });

    it('should return 500 on DynamoDB error', async () => {
      const event = {
        pathParameters: { itemId: 'mock-item-id' },
        body: JSON.stringify({ name: 'New Name' }),
      };

      ddbMock.on(UpdateCommand).rejects(new Error('DynamoDB Error'));

      const result = await updateItem(event);

      expect(result.statusCode).toBe(500);
    });
  });

  describe('deleteItem', () => {
    it('should delete an item successfully', async () => {
      const event = {
        pathParameters: { itemId: 'mock-item-id' },
      };

      ddbMock.on(DeleteCommand).resolves({ Attributes: { itemId: 'mock-item-id' } });

      const result = await deleteItem(event);

      expect(result.statusCode).toBe(204);
    });

    it('should return 404 if item not found', async () => {
      const event = {
        pathParameters: { itemId: 'non-existent-id' },
      };

      ddbMock.on(DeleteCommand).resolves({ Attributes: undefined });

      const result = await deleteItem(event);

      expect(result.statusCode).toBe(404);
      expect(JSON.parse(result.body).message).toBe('Item not found');
    });

    it('should return 500 on DynamoDB error', async () => {
      const event = {
        pathParameters: { itemId: 'mock-item-id' },
      };

      ddbMock.on(DeleteCommand).rejects(new Error('DynamoDB Error'));

      const result = await deleteItem(event);

      expect(result.statusCode).toBe(500);
    });
  });
});
