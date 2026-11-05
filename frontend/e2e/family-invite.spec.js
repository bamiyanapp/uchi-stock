import { test, expect } from './coverageFixture.js';
import { captureScreenshot } from './screenshot.js';

test.describe('Family Invite', () => {
  test('should issue an invitation URL', async ({ page }, testInfo) => {
    await page.route('**/families', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
    await page.route('**/invitations', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ invitationToken: 'test-invitation-token' }),
      });
    });

    await page.goto('./invite/manage');
    await expect(page.getByText('まだ家族は登録されていません。')).toBeVisible();

    await page.getByRole('button', { name: '招待URLを発行する' }).click();

    const urlInput = page.locator('input[readonly]');
    await expect(urlInput).toHaveValue(/\/invite\/test-invitation-token$/);
    await expect(page.getByRole('button', { name: /コピー/ })).toBeVisible();
    await captureScreenshot(page, testInfo, 'family-invite-issued', '招待URL発行後の画面');
  });

  test('should display registered family members', async ({ page }) => {
    await page.route('**/families', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { userId: 'family-user-1', displayName: '家族A', email: 'family-a@example.com', photoURL: '' },
        ]),
      });
    });

    await page.goto('./invite/manage');

    await expect(page.getByText('家族A')).toBeVisible();
    await expect(page.getByText('family-a@example.com')).toBeVisible();
  });

  test('should show an error when issuing an invitation fails', async ({ page }) => {
    await page.route('**/families', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/invitations', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: '招待URLの発行に失敗しました' }),
      });
    });

    await page.goto('./invite/manage');
    await page.getByRole('button', { name: '招待URLを発行する' }).click();

    await expect(page.getByText('招待URLの発行に失敗しました')).toBeVisible();
  });
});

test.describe('Invite Accept', () => {
  // UserProviderはAPIキー未設定（E2E実行環境）の場合userIdを'test-user'に固定する。
  // InviteAcceptはuserId==='test-user'を「未ログイン」として扱い、自動受諾せず
  // ログイン促進画面を表示する（実際のFirebaseログインポップアップはE2Eで再現できない
  // ため、この「未ログイン状態の表示」までを検証範囲とする）
  test('should prompt login before accepting an invitation', async ({ page }, testInfo) => {
    await page.goto('./invite/some-invitation-token');

    await expect(page.getByText('家族への招待が届いています')).toBeVisible();
    await expect(page.getByText('家族登録を完了するにはログインが必要です。')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Googleでログインして受諾する' })).toBeVisible();
    await captureScreenshot(page, testInfo, 'invite-accept-login-prompt', '招待受諾画面（未ログイン状態）');
  });
});
