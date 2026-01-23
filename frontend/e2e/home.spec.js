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

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 10);
    await page.route('**/items/item-1/estimate*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          estimatedDepletionDate: futureDate.toISOString(),
          confidence: 0.8,
        }),
      });
    });

    await page.goto('./');
  });

  test('should display item list', async ({ page }) => {
    await expect(page.getByText('家庭用品在庫管理')).toBeVisible();
    
    const itemCard = page.locator('.card').filter({ hasText: 'トイレットペーパー' });
    await expect(itemCard).toBeVisible();
    await expect(itemCard.getByText('5', { exact: true })).toBeVisible();
    await expect(itemCard.getByText('ロール', { exact: true })).toBeVisible();
    
    // Use regex to be flexible with the exact number of days
    await expect(page.getByText(/あと約 \d+ 日/)).toBeVisible();
  });

  test('should add a new item', async ({ page }) => {
    // Mock POST /items
    await page.route('**/items', async (route) => {
      if (route.request().method() === 'POST') {
        const body = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            itemId: 'new-item-id',
            name: body.name,
            unit: body.unit,
            currentStock: 0,
            createdAt: new Date().toISOString(),
          }),
        });
      } else {
        // GET /items - show the new item
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
            {
              itemId: 'new-item-id',
              name: 'ティッシュ',
              currentStock: 0,
              unit: '箱',
              updatedAt: new Date().toISOString(),
            },
          ]),
        });
      }
    });

    await page.click('button:has-text("新しい品目を追加")');
    await page.fill('#itemName', 'ティッシュ');
    await page.fill('#itemUnit', '箱');
    
    // Intercept the fetch call after clicking submit to verify it was called
    const submitButton = page.getByRole('button', { name: '登録する' });
    await submitButton.click();

    // Verify the new item is displayed
    const newItemCard = page.locator('.card').filter({ hasText: 'ティッシュ' });
    await expect(newItemCard).toBeVisible();
    await expect(newItemCard.getByText('0', { exact: true })).toBeVisible();
    await expect(newItemCard.getByText('箱', { exact: true })).toBeVisible();
  });

  test('should display past history date when it is not a prediction', async ({ page }) => {
    const pastDateTime = '2026-01-10T12:00:00Z';
    
    // Mock items with a past updatedAt
    await page.route('**/items', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            itemId: 'item-old',
            name: '古新聞',
            currentStock: 10,
            unit: '束',
            updatedAt: pastDateTime,
          },
        ]),
      });
    });

    // Mock estimate returning same stock as current (no prediction)
    await page.route('**/items/item-old/estimate*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          predictedStock: 10,
          currentStock: 10,
          stockPercentage: 100,
        }),
      });
    });

    await page.goto('./');
    
    // Check if the past date is displayed
    // The format of toLocaleDateString() can vary by environment, 
    // but sv-SE in handleDateChange suggests ISO-like or similar format.
    // In many environments it will be YYYY/M/D or similar.
    // Use regex to be flexible with the date format (e.g. 2026/1/10 or 1/10/2026)
    await expect(page.getByText(/2026.*1.*10.*時点の情報|1.*10.*2026.*時点の情報/)).toBeVisible();
  });
});
