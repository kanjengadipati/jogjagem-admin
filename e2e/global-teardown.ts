import type { FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { Client } from 'pg';

const API_DIR = path.join(process.cwd(), '..', 'jogjagem-api');

function databaseUrl(): string | null {
  const envFile = path.join(API_DIR, '.env');
  if (!fs.existsSync(envFile)) return null;
  const match = fs
    .readFileSync(envFile, 'utf8')
    .split('\n')
    .find((l) => l.startsWith('DATABASE_URL=') && l.includes('postgres'));
  return match ? match.slice('DATABASE_URL='.length).trim().replace(/^"|"$/g, '') : null;
}

export default async function globalTeardown(_config: FullConfig) {
  const email = process.env.E2E_SALES_EMAIL;
  if (!email) {
    console.warn('[global-teardown] E2E_SALES_EMAIL not set — skipping cleanup');
    return;
  }

  const url = databaseUrl();
  if (!url) {
    console.warn('[global-teardown] DATABASE_URL not found in ../jogjagem-api/.env — skipping cleanup');
    return;
  }

  const client = new Client({ connectionString: url });
  try {
    await client.connect();

    const { rows } = await client.query(`SELECT id FROM users WHERE email = $1`, [email]);
    if (rows.length === 0) {
      console.log(`[global-teardown] no E2E sales user to clean up (${email})`);
      return;
    }
    const userId = rows[0].id;

    // Clear bonus/commission rows referencing the sales user, then the user.
    await client.query(`DELETE FROM sales_bonuses WHERE sales_user_id = $1`, [userId]);
    await client.query(`DELETE FROM sales_commissions WHERE sales_user_id = $1`, [userId]);
    await client.query(`DELETE FROM users WHERE id = $1`, [userId]);

    console.log(`[global-teardown] deleted E2E sales user (${email}) + their bonus/commission rows`);
  } catch (e) {
    console.warn('[global-teardown] cleanup error:', (e as Error).message);
  } finally {
    await client.end();
  }
}
