import { expect, test } from '@playwright/test';

test.describe('Suluhu smoke tests', () => {
  test('landing page renders the hero and crisis line', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /You are not alone/i })).toBeVisible();
    await expect(page.getByText(/Befrienders Kenya: 0800 723 253/i)).toBeVisible();
  });

  test('get started leads to registration', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /Get started/i }).first().click();
    await expect(page).toHaveURL(/\/register/);
    await expect(page.getByLabel('Email')).toBeVisible();
  });

  test('login page validates empty submit', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    await page.getByRole('button', { name: /^Sign in$/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });
});
