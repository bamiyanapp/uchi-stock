import { test, expect } from '@playwright/test';

test.describe('Stock Update Page', () => {
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

    await page.route('**/items/item-1/consume', async route => {
      await route.fulfill({ status: 200 });
    });

    await page.route('**/items/item-1/stock', async route => {
      await route.fulfill({ status: 200 });
    });

    // Use relative path to work with baseURL including /uchi-stock/
    await page.goto('item/item-1/update');
  });

  test('should allow entering consumption and purchase', async ({ page }) => {
    await expect(page.getByText('在庫を更新する')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('トイレットペーパー')).toBeVisible();

    // Enter consumption
    const consumptionInput = page.locator('input[type="number"]').first();
    await consumptionInput.fill('2');

    // Enter purchase
    const purchaseInput = page.locator('input[type="number"]').last();
    await purchaseInput.fill('12');

    // Enter memo
    await page.getByPlaceholder('例: 特売で購入').fill('テストメモ');

    // Mock navigation after submit
    await page.route('**/items/*/history', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify([]) });
    });
    await page.route('**/items/*/estimate', async route => {
        await route.fulfill({ status: 200, body: JSON.stringify({}) });
    });

    // Submit
    await page.getByRole('button', { name: '更新を保存する' }).click();

    // Should redirect to detail page
    await expect(page).toHaveURL(/.*item\/item-1$/);
  });
});
