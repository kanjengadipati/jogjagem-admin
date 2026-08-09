import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const STATE = '.auth/sales.json';
const enabled =
  !!process.env.E2E_SALES_EMAIL &&
  !!process.env.E2E_SALES_PASSWORD &&
  fs.existsSync(STATE);

const earningsTitle = (page: import('@playwright/test').Page) =>
  page.getByRole('heading', { name: 'My Earnings', level: 2 });

test.describe('Sales Portal — Login', () => {
  test.skip(
    !enabled,
    'set E2E_SALES_EMAIL + E2E_SALES_PASSWORD and ensure global-setup ran (requires backend :8081)'
  );

  test('sales user can log in and lands on My Earnings', async ({ page }) => {
    const email = process.env.E2E_SALES_EMAIL as string;
    const password = process.env.E2E_SALES_PASSWORD as string;

    await page.goto('/login');
    await page.getByPlaceholder('useradmin@email.com').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Authenticate Account' }).click();

    await expect(page).toHaveURL(/\/sales\/me/);
    await expect(earningsTitle(page)).toBeVisible();
  });
});

test.describe('Sales Portal — Authenticated (sales)', () => {
  test.skip(
    !enabled,
    'set E2E_SALES_EMAIL + E2E_SALES_PASSWORD and ensure global-setup ran (requires backend :8081)'
  );

  test.use({ storageState: STATE });

  test('sales sees earnings page with referral code', async ({ page }) => {
    await page.goto('/sales/me');
    await expect(page).toHaveURL(/\/sales\/me/);
    await expect(earningsTitle(page)).toBeVisible();

    // Referral code is generated and displayed.
    await expect(page.getByText('Kode Referral Anda')).toBeVisible();
    const code = page.locator('code').first();
    await expect(code).toBeVisible();
    await expect(code).not.toHaveText('');
    await expect(code).not.toHaveText('…');

    // Bonus & commission sections render.
    await expect(page.getByRole('heading', { name: 'Bonus Saya' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Komisi Transaksi' })).toBeVisible();
  });

  test('sales sidebar only shows My Earnings menu', async ({ page }) => {
    await page.goto('/sales/me');
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Bonus & Komisi' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Bonus Rules' })).toHaveCount(0);
  });

  test('sales can regenerate their referral code', async ({ page }) => {
    await page.goto('/sales/me');
    const code = page.locator('code').first();
    await expect(code).toBeVisible();
    const oldCode = (await code.textContent())?.trim() ?? '';

    let dialogHandled = false;
    page.on('dialog', (d) => {
      dialogHandled = true;
      void d.accept();
    });
    await page.getByRole('button', { name: 'Generate Ulang' }).click();

    await expect.poll(async () => (await code.textContent())?.trim()).not.toBe(oldCode);
    expect(dialogHandled).toBe(true);
  });

  test('fresh sales user sees empty bonus/commission states', async ({ page }) => {
    await page.goto('/sales/me');
    await expect(page.getByText('Belum ada bonus')).toBeVisible();
    await expect(page.getByText('Belum ada komisi')).toBeVisible();
  });
});
