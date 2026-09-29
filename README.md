# Jogjagem Admin 🛡️

Internal operations console for the **Jogjagem** tourism ecosystem. This is the staff-only backoffice for managing destinations, events, content, businesses, advertising, payments, users, roles, and the sales/bonus program. It is **not** the public site or the business owner portal — those live in the [`jogjagem`](../jogjagem) frontend.

The app is served in Indonesian and talks exclusively to the [`jogjagem-api`](../jogjagem-api) Go backend.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 3, Inter + Manrope (`next/font`) |
| Auth | Custom JWT session cookie (NextAuth is present but unused) |
| Rich text | TipTap |
| Media | Cloudinary (signed uploads) |
| Payments | Midtrans Snap |
| Testing | Playwright |

---

## Getting Started

### Prerequisites

- Node.js 20+ (CI uses Node 20)
- The [`jogjagem-api`](../jogjagem-api) backend running on `http://localhost:8081`
- A Cloudinary account if you need image uploads

### Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

The admin runs on **http://localhost:3002**.

Login requires an account with the `admin`, `superadmin`, or `sales` role. `partner` / `business_owner` accounts are rejected and redirected to the public site.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server on port 3002 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build on port 3002 |
| `npm run test:e2e` | Run the Playwright suite |
| `npm run test:e2e:headed` | Playwright in headed mode |
| `npm run test:e2e:auth` | Auth-only Playwright specs |
| `npm run test:e2e:install` | Install the Chromium browser + OS deps |

> **Lint / typecheck:** `npm run lint` runs `next lint`, which was removed in Next 16, so it currently fails. Use `npx eslint .` for linting and `npx tsc --noEmit` for type checking.

---

## Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | public | Backend base URL (default `http://localhost:8081`) |
| `NEXT_PUBLIC_APP_URL` | public | This app's public URL |
| `NEXT_PUBLIC_FRONTEND_URL` | public | Public site URL, used for links back to `jogjagem` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | public | Enables the Google sign-in button |
| `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` | public | Midtrans Snap checkout |
| `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` | public | Midtrans environment switch |
| `NEXT_PUBLIC_COOKIE_DOMAIN` | public | Session cookie domain in production (e.g. `.jogjagem.com`) |
| `NEXTAUTH_SECRET` | server | Secret for the legacy NextAuth config |
| `GOOGLE_CLIENT_ID` | server | Reports Google as an enabled social provider |
| `FACEBOOK_CLIENT_ID` | server | Reports Facebook as an enabled social provider |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | server | Cloudinary signing for `/api/upload` and `/api/og-from-url` |
| `PLAYWRIGHT_BASE_URL`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_SALES_EMAIL`, `E2E_SALES_PASSWORD` | test | Playwright E2E setup |

Never commit `.env.local`.

---

## Architecture

- **Client components** call same-origin `/api/*` route handlers. Those handlers read the session cookie server-side and proxy the request to `NEXT_PUBLIC_API_BASE`, so the access token never reaches the browser (`src/lib/api.ts`).
- **Auth:** `POST /api/auth/login` forwards to the backend, decodes the returned access token to read the role, allow-lists `admin` / `superadmin` / `sales`, and sets the `jogjagem_session` HttpOnly cookie (24h). `src/middleware.ts` protects every non-public route and further restricts the `sales` role to the sales module.
- **Roles:** `admin`, `superadmin`, and `sales` may sign in. `superadmin` rows cannot be deleted from the users screen.
- **Uploads:** `POST /api/upload` returns Cloudinary signed params; the browser uploads directly to Cloudinary (10 MB limit).

```text
src/
├── app/
│   ├── page.tsx            # redirects into the console
│   ├── login/              # login screen
│   ├── (admin)/            # all protected pages (route group, not in URL)
│   └── api/                # 80+ server-side proxy route handlers
├── components/             # Header, Sidebar, Toast, editors, uploaders, checkout
├── contexts/               # RoleContext, SidebarContext
├── lib/                    # api client, jwt decode, constants, image loader
├── auth.ts                 # legacy NextAuth options (unused)
└── middleware.ts           # route protection + sales-role scoping
```

---

## Features

- **Dashboard** — entity counts, recent activity, top destinations, upcoming events.
- **Destinations & Events** — list with search/filter/pagination, bulk delete, CSV export; full editor with bilingual (ID/EN) fields, gallery, SEO/OG images, maps, and per-field AI generation.
- **Directory content** — Hotels, Restaurants, Rentals, Guides, Souvenirs (list/delete; creation is not wired in the UI yet).
- **Articles** — TipTap rich-text editor with cover/OG images and publish state.
- **Content queue & quality** — review scraped content (`generate`, `approve`, `reject`, `regenerate`) and inspect quality scores.
- **Reviews & image reports** — moderation with approve/reject/resolve/dismiss.
- **Scraper** — run scrapers, browse run history and staging tabs.
- **Businesses & claims** — approve/reject pending businesses and listing claims, with bulk actions.
- **Users, Roles & Permissions** — user CRUD + CSV export, role CRUD, permission toggles.
- **Advertising** — ad campaigns (with placement/listing targeting), house ads, and placement pricing + volume rules.
- **Payments** — payment list and Midtrans Snap checkout.
- **Analytics & Reports** — summary/destination analytics and CSV report export.
- **AI recommendations** — simulator for weighted recommendation prompts.
- **Sales module** — commissions, bonuses, bonus rules, referral codes, and performance (restricted to the `sales` role).
- **Settings** — SEO defaults, landing content, account profile and password change.

---

## Testing

Playwright suites live in `e2e/` and require a running backend on `:8081` plus E2E credentials:

```bash
npm run test:e2e:install
npm run test:e2e
```

`e2e/global-setup.ts` logs in the admin and sales users and stores state under `.auth/`. `e2e/global-teardown.ts` connects to the API's Postgres database (parsed from `../jogjagem-api/.env`) and removes the E2E fixtures. Both `.auth/` and generated reports are gitignored.

There is no unit-test runner.

---

## Deployment

The repository contains no Dockerfile, `vercel.json`, or CI workflow, so the hosting target is currently undocumented. The only hard requirements are:

- Serve the app on port **3002**.
- Expose `NEXT_PUBLIC_API_BASE` to both the server and the browser.
- Configure Cloudinary and Midtrans keys where those features are used.

---

## Related Repositories

| Repo | Port | Role |
|---|---|---|
| [`jogjagem-api`](../jogjagem-api) | 8081 | Go backend — the single source of all data |
| [`jogjagem`](../jogjagem) | 3001 | Public tourism site + business owner portal |
| `jogjagem-admin` | 3002 | This internal ops console |

The business portal was migrated out of this repo into `jogjagem` (`src/app/[locale]/business/*`); see [`PLAN-business-portal-public-site.md`](./PLAN-business-portal-public-site.md).
