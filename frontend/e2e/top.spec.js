import { test, expect } from '@playwright/test';

test.describe('Top Page Redirection', () => {
  test('should stay on top page even when logged in', async ({ page }) => {
    // ログイン状態をシミュレートするために localStorage などを使いたいが、
    // アプリケーションの実装に依存するため、
    // ここではページロード後に userId がセットされるのを待つような挙動を考える。
    // しかし、E2Eテスト環境ではデフォルトで 'test-user' になってしまう。
    
    // アプリケーションコードを変更する前に、現在の挙動を確認するためのテスト
    // E2Eテスト環境ではデフォルトで userId='test-user' となるため、自動リダイレクトは発生しない。
    // 今回の修正で、たとえログイン済みであってもトップページURLにアクセスした際は
    // 自動リダイレクトされず、トップページが表示され続けることを目指している。

    await page.goto('./');
    
    // トップページに留まることを確認
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('利用開始')).toBeVisible();

    // デモモードに入ってから、ヘッダーのロゴをクリックしてトップに戻れるか確認
    await page.getByRole('button', { name: 'デモモード' }).click();
    await expect(page).toHaveURL(/\/test-user/);

    await page.click('h1:has-text("うちストック")');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('利用開始')).toBeVisible();
  });
});
