import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['monocart-reporter', {
      name: 'uchi-stock E2E Report',
      outputFile: './monocart-report/index.html',
      coverage: {
        outputDir: './coverage',
        reports: [
          ['json-summary'],
          ['console-summary'],
        ],
        entryFilter: (entry) => entry.url.includes('/uchi-stock/'),
        sourceFilter: {
          '**/node_modules/**': false,
          'src/**': true,
        },
      },
    }],
  ],
  use: {
    baseURL: 'http://localhost:4173/uchi-stock/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // モックし損ねたAPI呼び出しが本番へ届かないよう、本番APIのホスト名解決を拒否する
        // （E2Eが本番のtest-userデータへ読み書きしていた。issue #779）
        launchOptions: { args: ['--host-resolver-rules=MAP *.execute-api.ap-northeast-1.amazonaws.com ~NOTFOUND'] },
      },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173/uchi-stock/',
    reuseExistingServer: !process.env.CI,
    cwd: './',
  },
});
