import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getCategories } from './handler';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('getCategories', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.TABLE_NAME = 'TestTable';
  });

  it('should return categories', async () => {
    ddbMock.on(ScanCommand).resolves({
      Items: [
        { category: 'Category1' },
        { category: 'Category2' },
        { category: 'Category1' },
      ],
    });

    const response = await getCategories({});
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.categories).toEqual(['Category1', 'Category2']);
  });

  it('should return default category if no items', async () => {
    ddbMock.on(ScanCommand).resolves({
      Items: [],
    });

    const response = await getCategories({});
    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.categories).toEqual(['大ピンチ図鑑']);
  });
});
