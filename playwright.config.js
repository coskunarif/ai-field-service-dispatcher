import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '*.spec.js',
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
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
