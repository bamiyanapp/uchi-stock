import { test, expect } from '@playwright/test';

test.describe('Item Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API calls
    await page.route('**/items', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            itemId: 'item-1',
            name: 'トイレットペーパー',
            currentStock: 5,
            unit: 'ロール',
            updatedAt: '2026-01-01T00:00:00Z',
          },
        ]),
      });
    });

    await page.route('**/items/item-1/history', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            historyId: 'hist-1',
            itemId: 'item-1',
            date: '2026-01-01T10:00:00Z',
            type: 'purchase',
            quantity: 12,
            memo: '買い出し',
          },
        ]),
      });
    });

    await page.route('**/items/item-1/estimate', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          estimatedDepletionDate: '2026-01-15T00:00:00Z',
          dailyConsumption: 0.5,
        }),
      });
    });

    // Use relative path to work with baseURL including /uchi-stock/
    await page.goto('item/item-1');
  });

  test('should display item details and history', async ({ page }) => {
    // Wait for the page to load and display the item name
    await expect(page.locator('h1')).toContainText('トイレットペーパー', { timeout: 10000 });
    await expect(page.getByText('5', { exact: true })).toBeVisible();
    await expect(page.getByText('ロール', { exact: true })).toBeVisible();
    
    // Check estimate
    await expect(page.getByText('在庫推定')).toBeVisible();
    await expect(page.getByText('0.5 ロール / 日')).toBeVisible();

    // Check history
    await expect(page.getByText('履歴詳細')).toBeVisible();
    await expect(page.getByText('買い出し')).toBeVisible();
    await expect(page.getByText('12 ロール')).toBeVisible();
    await expect(page.getByText('購入')).toBeVisible();
  });
});
