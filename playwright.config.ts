import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e', fullyParallel: true, timeout: 30000,
  use: { channel: 'chrome', baseURL: 'http://localhost:8081', viewport: { width: 390, height: 844 }, trace: 'retain-on-failure' },
  webServer: { command: 'npx expo start --web --port 8081', url: 'http://localhost:8081', reuseExistingServer: true, timeout: 120000 },
});
