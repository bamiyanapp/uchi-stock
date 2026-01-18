import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
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

    await page.route('**/items/item-1/estimate*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          estimatedDepletionDate: '2026-01-10T00:00:00Z',
          confidence: 0.8,
        }),
      });
    });

    await page.goto('./');
  });

  test('should display item list', async ({ page }) => {
    await expect(page.getByText('家庭用品在庫管理')).toBeVisible();
    await expect(page.getByText('トイレットペーパー')).toBeVisible();
    await expect(page.getByText('5', { exact: true })).toBeVisible();
    await expect(page.getByText('ロール', { exact: true })).toBeVisible();
    // Use regex to be flexible with the exact number of days
    await expect(page.getByText(/あと約 \d+ 日/)).toBeVisible();
  });
});
