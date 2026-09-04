import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:4173';
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === '1';

export default defineConfig({
  testDir: './apps/web/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['line'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],
  webServer: skipWebServer
    ? undefined
    : {
        command: 'pnpm --filter @luxlink/web preview --host 127.0.0.1 --port 4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        url: baseURL,
      },
});
