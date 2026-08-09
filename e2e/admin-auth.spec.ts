import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const STATE = '.auth/admin.json';
const enabled =
  !!process.env.E2E_ADMIN_EMAIL &&
  !!process.env.E2E_ADMIN_PASSWORD &&
  fs.existsSync(STATE);

test.describe('Admin Portal — Authenticated (superadmin)', () => {
  test.skip(
    !enabled,
    'set E2E_ADMIN_EMAIL + E2E_ADMIN_PASSWORD and ensure global-setup ran (requires backend :8081)'
  );

  test.use({ storageState: STATE });

  test('admin dashboard loads with sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('aside')).toBeVisible();
  });

  test('business claims page loads', async ({ page }) => {
    await page.goto('/business-claims');
    await expect(page).toHaveURL(/\/business-claims/);
    await expect(page.getByRole('heading', { name: 'Business Listing Claims Review' })).toBeVisible();
  });

  test('sales performance page loads', async ({ page }) => {
    await page.goto('/sales');
    await expect(page).toHaveURL(/\/sales/);
    await expect(page.getByRole('heading', { name: 'Sales Performance & Earnings' })).toBeVisible();
  });

  test('bonus rules page loads', async ({ page }) => {
    await page.goto('/sales/bonus-rules');
    await expect(page).toHaveURL(/\/sales\/bonus-rules/);
    await expect(page.getByRole('heading', { name: 'Bonus Rules' })).toBeVisible();
  });
});
