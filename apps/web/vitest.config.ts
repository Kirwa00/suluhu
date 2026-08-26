import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Playwright owns `e2e/` (run via `npm run test:e2e`).
    include: ['src/**/*.test.ts'],
  },
});
