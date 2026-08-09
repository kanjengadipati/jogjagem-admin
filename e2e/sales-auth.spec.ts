import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const STATE = '.auth/sales.json';
const enabled =
  !!process.env.E2E_SALES_EMAIL &&
  !!process.env.E2E_SALES_PASSWORD &&
  fs.existsSync(STATE);

const overviewTitle = (page: import('@playwright/test').Page) =>
  page.getByRole('heading', { name: 'Sales Overview', level: 2 });

const commissionsTitle = (page: import('@playwright/test').Page) =>
  page.getByRole('heading', { name: 'Komisi Saya', level: 2 });

test.describe('Sales Portal — Login', () => {
  test.skip(
    !enabled,
    'set E2E_SALES_EMAIL + E2E_SALES_PASSWORD and ensure global-setup ran (requires backend :8081)'
  );

  test('sales user can log in and lands on Sales Overview', async ({ page }) => {
    const email = process.env.E2E_SALES_EMAIL as string;
    const password = process.env.E2E_SALES_PASSWORD as string;

    await page.goto('/login');
    await page.getByPlaceholder('useradmin@email.com').fill(email);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Authenticate Account' }).click();

    await expect(page).toHaveURL(/\/sales\/me/);
    await expect(overviewTitle(page)).toBeVisible();
  });
});

test.describe('Sales Portal — Authenticated (sales)', () => {
  test.skip(
    !enabled,
    'set E2E_SALES_EMAIL + E2E_SALES_PASSWORD and ensure global-setup ran (requires backend :8081)'
  );

  test.use({ storageState: STATE });

  test('sales sees overview with referral code, link, and program info', async ({ page }) => {
    await page.goto('/sales/me');
    await expect(page).toHaveURL(/\/sales\/me/);
    await expect(overviewTitle(page)).toBeVisible();

    // Referral code is generated and displayed.
    await expect(page.getByText('Kode Referral Anda', { exact: true })).toBeVisible();
    const code = page.locator('code').first();
    await expect(code).toBeVisible();
    await expect(code).not.toHaveText('');
    await expect(code).not.toHaveText('…');

    // Shareable link + program info cards render.
    await expect(page.getByText('Link Referral', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ketentuan Komisi Sales' })).toBeVisible();
  });

  test('sales profile menu shows sales links and sales avatar', async ({ page }) => {
    await page.goto('/sales/me');
    await expect(overviewTitle(page)).toBeVisible();

    // Sales dashboard uses a sales coin avatar instead of a generic gravatar.
    await expect(page.locator('header img')).toHaveCount(0);

    await page.getByRole('button', { name: /E2E Sales Agent/ }).click();
    await expect(page.getByRole('link', { name: 'Account Settings' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Kode Referral' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Komisi Saya' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Team Directory' })).toHaveCount(0);
  });

  test('sales sees Komisi page with summary, tabs, and empty states', async ({ page }) => {
    await page.goto('/sales/commissions');
    await expect(page).toHaveURL(/\/sales\/commissions/);
    await expect(commissionsTitle(page)).toBeVisible();

    // Summary cards.
    await expect(page.getByText('Total Pendapatan', { exact: true })).toBeVisible();
    await expect(page.getByText('Pending Payout', { exact: true })).toBeVisible();

    // Komisi tab empty state.
    await expect(page.getByText('Belum ada komisi')).toBeVisible();

    // Bonus tab empty state.
    await page.getByRole('button', { name: /Bonus Onboarding & Milestone/ }).click();
    await expect(page.getByText('Belum ada bonus')).toBeVisible();
  });

  test('sales sidebar only shows My Earnings menu', async ({ page }) => {
    await page.goto('/sales/me');
    await expect(page.locator('aside')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Komisi' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Dashboard' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Bonus Rules' })).toHaveCount(0);
  });

  test('sales cannot access admin pages', async ({ page }) => {
    for (const path of ['/dashboard', '/sales', '/sales/bonuses', '/users', '/analytics', '/settings']) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/sales\/me/);
    }
  });

  test('sales can open Account Settings and change password flow renders', async ({ page }) => {
    await page.goto('/settings/account');
    await expect(page).toHaveURL(/\/settings\/account/);
    await expect(page.getByRole('heading', { name: 'Account Settings', level: 2 })).toBeVisible();

    // Profile info is loaded from the backend (account name + email shown).
    await expect(page.getByLabel('Full Name')).toHaveValue(/E2E Sales Agent/);
    await expect(page.getByText(/e2esales@mail.com/).first()).toBeVisible();

    // Change password form present.
    await expect(page.getByLabel('Current Password')).toBeVisible();
    await expect(page.getByLabel('New Password')).toBeVisible();
    await expect(page.getByLabel('Confirm New Password')).toBeVisible();

    // Wrong current password → backend rejects, nothing changes.
    await page.getByLabel('Current Password').fill('WrongPass123!');
    await page.getByLabel('New Password').fill('NewPass123!');
    await page.getByLabel('Confirm New Password').fill('NewPass123!');
    await page.getByRole('button', { name: 'Change Password' }).click();
    await expect(page.getByText('current password is incorrect')).toBeVisible();
  });

  test('sales can regenerate their referral code', async ({ page }) => {
    await page.goto('/sales/me');
    const code = page.locator('code').first();
    await expect(code).toBeVisible();
    const oldCode = (await code.textContent())?.trim() ?? '';

    await page.getByRole('button', { name: 'Generate Ulang' }).click();
    await expect(page.getByText('Buat Ulang Kode Referral', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Ya, Buat Kode Baru' }).click();

    await expect.poll(async () => (await code.textContent())?.trim()).not.toBe(oldCode);
  });
});
