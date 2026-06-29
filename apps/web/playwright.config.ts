import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E config (SDLC §6 Phase 4). Assumes the web app is running on
 * :3000 (reuses an existing dev server). First run locally:
 *   npx playwright install chromium
 *   npm run -w @suluhu/web test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
