import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.js',
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 3,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3005',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: ['--disable-ipv6'],
          slowMo: 0,
        },
      },
    },
  ],
  webServer:
    process.env.BASE_URL && !process.env.BASE_URL.includes('localhost')
      ? undefined
      : {
          command: 'PORT=3005 npm start',
          url: 'http://localhost:3005',
          reuseExistingServer: !process.env.CI,
          stdout: 'ignore',
          stderr: 'pipe',
        },
});
