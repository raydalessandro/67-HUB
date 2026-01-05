import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  
  // Run tests sequentially to avoid auth state conflicts
  fullyParallel: false,
  workers: 1,
  
  // CI settings
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  
  // Reporter settings
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  
  // Timeouts
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    locale: 'it-IT',
    timezoneId: 'Europe/Rome',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
      testMatch: /mobile\.spec\.ts/,
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      testMatch: /mobile\.spec\.ts/,
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
