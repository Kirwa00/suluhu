import { expect, test } from '@playwright/test';

/**
 * Exercises the EN/SW toggle from the app-shell — the one i18n behavior the
 * static smoke suite doesn't touch, since LanguageSwitcher only renders
 * inside the authenticated dashboard chrome. Uses the seeded patient account
 * from `apps/api/prisma/seed.ts` (no MFA, so a single login form submit is
 * enough to reach the dashboard).
 */
test.describe('locale switching', () => {
  // All three tests log in as the same seeded account; running them in
  // parallel workers races logins against each other (a fresh login can
  // invalidate a sibling worker's session — see the access-token revocation
  // policy in apps/api). Serial execution avoids that race.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('patient@suluhu.co.ke');
    await page.getByLabel('Password').fill('ChangeMe!2026');
    await page.getByRole('button', { name: /^Sign in$/i }).click();
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
