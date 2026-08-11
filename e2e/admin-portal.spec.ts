import { test, expect } from '@playwright/test';

test.describe('Admin Portal', () => {
  test('login page renders the operator console', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('JOGJAGEM', { exact: true })).toBeVisible();
    await expect(page.getByText('Ecosystem Operations Console')).toBeVisible();
    await expect(page.getByText('Authorized Operator Access Only')).toBeVisible();
    await expect(page.getByPlaceholder('useradmin@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Authenticate Account' })).toBeVisible();
  });

  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    for (const path of ['/dashboard', '/sales', '/sales/bonus-rules']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);
    }
  });

  test('invalid credentials show an error and stay on login', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('useradmin@email.com').fill('nobody@test.jogjagem.com');
    await page.getByPlaceholder('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Authenticate Account' }).click();

    await expect(page.locator('main')).toContainText(/login failed|invalid credentials|network error|email|password/i);
    await expect(page).toHaveURL(/\/login$/);
  });
});
