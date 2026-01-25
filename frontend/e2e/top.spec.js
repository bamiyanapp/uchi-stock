import { test, expect } from '@playwright/test';

test.describe('Top Page and Demo Mode', () => {
  test.beforeEach(async ({ page }) => {
    // 常にトップページから開始
    await page.goto('./');
  });

  test('should stay on top page and can navigate back from other pages', async ({ page }) => {
    // 1. トップページに留まることを確認
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('利用開始')).toBeVisible();

    // 2. ユーザーガイド画面へ遷移
    await page.click('button:has-text("使い方")');
    await expect(page).toHaveURL(/\/guide/);

    // 3. ユーザーガイド独自の「戻る」ボタンをクリックしてトップに戻る
    // (UserGuideには共通Headerが含まれていないため)
    const backButton = page.locator('a:has-text("戻る")');
    await backButton.waitFor({ state: 'visible' });
    await backButton.click();
    
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('利用開始')).toBeVisible();
  });

  test('should display demo mode data and can navigate back', async ({ page }) => {
    // 1. デモモードへ遷移
    const demoButton = page.getByRole('button', { name: 'デモモード' });
    await demoButton.waitFor({ state: 'visible' });
    await demoButton.click();
    
    await expect(page).toHaveURL(/\/test-user/);
    
    // 2. デモデータが表示されていることを確認
    // 複数の「トイレットペーパー」が存在する可能性があるため first() を使用
    const demoItem = page.getByText('トイレットペーパー').first();
    await demoItem.waitFor({ state: 'visible', timeout: 10000 });
    await expect(demoItem).toBeVisible();

    // 3. ヘッダーのロゴをクリックしてトップに戻る
    const logoLink = page.locator('header a:has-text("うちストック")');
    await logoLink.waitFor({ state: 'visible' });
    await logoLink.click();
    
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('利用開始')).toBeVisible();
  });
});
