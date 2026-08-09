import { request, type FullConfig } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const ADMIN = 'http://localhost:3002';
const BACKEND = 'http://localhost:8081';
const AUTH_DIR = path.join(process.cwd(), '.auth');

export default async function globalSetup(_config: FullConfig) {
  fs.mkdirSync(AUTH_DIR, { recursive: true });

  // ── Admin / superadmin (admin portal :3002) ─────────────────────────────
  const adminEmail = process.env.E2E_ADMIN_EMAIL;
  const adminPass = process.env.E2E_ADMIN_PASSWORD;
  if (adminEmail && adminPass) {
    const ctx = await request.newContext();
    try {
      const res = await ctx.post(`${ADMIN}/api/auth/login`, {
        data: { email: adminEmail, password: adminPass },
      });
      if (res.ok()) {
        await ctx.storageState({ path: path.join(AUTH_DIR, 'admin.json') });
        console.log(`[global-setup] admin auth saved (${adminEmail})`);
      } else {
        console.warn(`[global-setup] admin login failed: ${res.status()}`);
      }
    } catch (e) {
      console.warn('[global-setup] admin login error:', (e as Error).message);
    } finally {
      await ctx.dispose();
    }
  } else {
    console.warn('[global-setup] E2E_ADMIN_EMAIL/PASSWORD not set — admin auth tests will be skipped');
  }

  // ── Sales agent (admin portal :3002) ─────────────────────────────────────
  const salesEmail = process.env.E2E_SALES_EMAIL;
  const salesPass = process.env.E2E_SALES_PASSWORD;
  if (salesEmail && salesPass) {
    // Ensure the sales user exists (idempotent) via the backend admin API.
    if (adminEmail && adminPass) {
      const adminCtx = await request.newContext();
      try {
        const login = await adminCtx.post(`${BACKEND}/auth/login`, {
          data: { email: adminEmail, password: adminPass },
        });
        if (login.ok()) {
          const body = await login.json();
          const token = body?.data?.access_token;
          if (token) {
            await adminCtx
              .post(`${BACKEND}/auth/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
                data: {
                  name: 'E2E Sales Agent',
                  email: salesEmail,
                  password: salesPass,
                  role: 'sales',
                  is_verified: true,
                },
              })
              .catch(() => {});
            console.log(`[global-setup] ensured sales user (${salesEmail})`);
          }
        }
      } catch (e) {
        console.warn('[global-setup] sales user ensure error:', (e as Error).message);
      } finally {
        await adminCtx.dispose();
      }
    }

    const ctx = await request.newContext();
    try {
      const res = await ctx.post(`${ADMIN}/api/auth/login`, {
        data: { email: salesEmail, password: salesPass },
      });
      if (res.ok()) {
        await ctx.storageState({ path: path.join(AUTH_DIR, 'sales.json') });
        console.log(`[global-setup] sales auth saved (${salesEmail})`);
      } else {
        console.warn(`[global-setup] sales login failed: ${res.status()}`);
      }
    } catch (e) {
      console.warn('[global-setup] sales login error:', (e as Error).message);
    } finally {
      await ctx.dispose();
    }
  } else {
    console.warn('[global-setup] E2E_SALES_EMAIL/PASSWORD not set — sales tests will be skipped');
  }
}
