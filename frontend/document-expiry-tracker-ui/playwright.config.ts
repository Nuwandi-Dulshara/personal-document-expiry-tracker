import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    ...devices['Desktop Chrome'],
    channel: 'msedge',
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run start -- --host localhost',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 120000,
  },
});
