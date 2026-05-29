import { defineConfig, devices } from '@playwright/test';

const testEnv = {
  NODE_ENV: 'test',
  PORT: '3000',
  VITE_ZITADEL_DOMAIN: 'https://test.zitadel.cloud',
  VITE_ZITADEL_CLIENT_ID: 'test-client-id',
  VITE_ZITADEL_CALLBACK_URL: 'http://localhost:3000/auth/callback',
  VITE_ZITADEL_POST_LOGOUT_URL: 'http://localhost:3000/auth/logout/callback',
};

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  testDir: './test',
  outputDir: './build/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    [
      'junit',
      {
        outputFile: './build/reports/junit.xml',
      },
    ],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: testEnv,
  },
});
