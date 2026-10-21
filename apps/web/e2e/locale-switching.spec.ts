import { expect, test } from '@playwright/test';

const PATIENT_EMAIL = 'patient@suluhu.co.ke';
// Matches apps/web/src/lib/api-client.ts's own default — not overridden in CI or local dev.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

/**
 * Exercises the EN/SW toggle from the app-shell — the one i18n behavior the
 * static smoke suite doesn't touch, since LanguageSwitcher only renders
 * inside the authenticated dashboard chrome. Uses the seeded patient account
 * from `apps/api/prisma/seed.ts`. Every role now requires MFA (email OTP) on
 * login; `/auth/test/otp` is a test-env-only endpoint that reads back the
 * code the mock email provider captured, so this can complete the flow
 * without a real inbox.
 */
test.describe('locale switching', () => {
  // All three tests log in as the same seeded account; running them in
  // parallel workers races logins against each other (a fresh login can
  // invalidate a sibling worker's session — see the access-token revocation
  // policy in apps/api). Serial execution avoids that race.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page, request }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(PATIENT_EMAIL);
    await page.getByLabel('Password').fill('ChangeMe!2026');
    await page.getByRole('button', { name: /^Sign in$/i }).click();

    await expect(page.getByLabel('Verification code')).toBeVisible();
    const otpResponse = await request.get(
      `${API_BASE}/api/v1/auth/test/otp?to=${encodeURIComponent(PATIENT_EMAIL)}`,
    );
    const { code } = await otpResponse.json();
    await page.getByLabel('Verification code').fill(code);
    await page.getByRole('button', { name: /^Verify & continue$/i }).click();

    await expect(page).toHaveURL(/\/patient$/);
  });

  test('defaults to English and switches to Swahili on toggle', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'My sessions' })).toBeVisible();

    await page.getByRole('button', { name: 'SW' }).click();

    await expect(page.getByRole('link', { name: 'Vikao vyangu' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'My sessions' })).toHaveCount(0);
  });

  test('persists the chosen locale across a reload', async ({ page }) => {
    await page.getByRole('button', { name: 'SW' }).click();
    await expect(page.getByRole('link', { name: 'Vikao vyangu' })).toBeVisible();

    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('link', { name: 'Vikao vyangu' })).toBeVisible();
  });

  test('switching back to English restores the original nav labels', async ({ page }) => {
    await page.getByRole('button', { name: 'SW' }).click();
    await expect(page.getByRole('link', { name: 'Vikao vyangu' })).toBeVisible();

    await page.getByRole('button', { name: 'EN' }).click();

    await expect(page.getByRole('link', { name: 'My sessions' })).toBeVisible();
  });
});
