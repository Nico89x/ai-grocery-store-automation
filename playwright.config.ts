import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e', testMatch: '**/*.spec.ts', timeout: 120000,
  expect: { timeout: 15000 }, workers: 1, fullyParallel: false,
  forbidOnly: !!process.env.CI, retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4190', trace: 'retain-on-failure',
    channel: 'chromium',
    screenshot: 'only-on-failure',
    launchOptions: { args: ['--enable-unsafe-swiftshader'] },
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'pnpm preview --port 4190 --strictPort',
    url: 'http://127.0.0.1:4190', reuseExistingServer: !process.env.CI,
  },
});
