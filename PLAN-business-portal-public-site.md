# Plan: Move Business Portal to the Public Site (bilingual)

Status: PENDING — not started
Created: 2026-08-05

## Goal

Move the business portal (currently inside `jogjagem-admin` at `/business/*`)
into the **public site** (`jogjagem`, port 3001) under `/[locale]/business/*`
so it becomes bilingual (id/en) like the rest of the main portal.

- Business portal = public-facing → needs bilingual (id/en) via existing next-intl
- Admin portal (`jogjagem-admin`, port 3002) = internal ops → stays Indonesian only
- Do NOT build a third dedicated app — reuse the main portal

## Current state (inventory)

### Components to move — `jogjagem-admin/src/components/`
- `BusinessSidebar.tsx` (~316 lines) — logo, business switcher, nav, plan badge (dynamic via `/subscription`)
- `BusinessHeader.tsx` (~140 lines) — breadcrumb, clock, notifications, profile dropdown
- `business-portal/ListingsPanel.tsx`
- `business-portal/PromotionsPanel.tsx` (has `NEXT_PUBLIC_FRONTEND_URL` fix for `/ads` links)
- `business-portal/ReviewsPanel.tsx`
- `business-portal/SettingsPanel.tsx`
- `business-portal/SubscriptionsPanel.tsx` (uses `SnapCheckoutButton`, Midtrans)
- Also shared: `SnapCheckoutButton.tsx`, `InvoiceEmailModal`, `useToast`/`Toast.tsx`, `useActiveBusiness.ts` hook

### Pages to move — `jogjagem-admin/src/app/business/`
- `/business/page.tsx` (redirect logic — fetches `/api/businesses/me`, → dashboard or settings)
- `/business/layout.tsx`
- `/business/settings/page.tsx`
- `/business/listings/page.tsx`
- `/business/promotions/page.tsx`
- `/business/reviews/page.tsx`
- `/business/subscriptions/page.tsx`
- `/business/[externalId]/layout.tsx`
- `/business/[externalId]/page.tsx`
- `/business/[externalId]/dashboard/page.tsx`
- `/business/[externalId]/listings/page.tsx`
- `/business/[externalId]/promotions/page.tsx`
- `/business/[externalId]/marketing/promotions/page.tsx`
- `/business/[externalId]/reviews/page.tsx`
- `/business/[externalId]/claims/page.tsx`
- `/business/[externalId]/settings/page.tsx`
- `/business/[externalId]/subscriptions/page.tsx`

### API proxy routes to move — `jogjagem-admin/src/app/api/`
Under `businesses/`:
- `businesses/me/route.ts`
- `businesses/me/[id]/route.ts`
- `businesses/me/[id]/listings/route.ts`
- `businesses/me/[id]/ad-campaigns/route.ts`
- `businesses/me/[id]/subscription/route.ts`
- `businesses/me/[id]/subscription/upgrade/route.ts`
- `businesses/me/[id]/promotions/route.ts`
- `businesses/me/[id]/claims/route.ts`
- `businesses/me/[id]/reviews/route.ts`
- `businesses/me/[id]/reviews/[rid]/reply/route.ts`
- Plus `auth/login`, `auth/social`, `auth/refresh` etc. as needed for partner auth on the public site

Total: ~15 business proxy routes + auth routes.
Total code to port: ~3,000+ lines + i18n extraction.

## Known issues to preserve/fix during migration
- Invalid/stale JWT → empty `/api/businesses/me` → redirect to settings. `business/page.tsx` should treat 401 as "log in again", not "no business".
- `PromotionsPanel.tsx` `/ads` links → must point to `/[locale]/ads?placement=...` on the public site.
- Admin middleware only base64-decodes JWT (no signature/expiry check) → need proper validation on public site.
- Plan badge in sidebar: already dynamic, reads `/api/businesses/me/{id}/subscription`.
- Payment/webhook: Midtrans webhook can't reach localhost in dev; `PollPendingExpired` scheduler in backend is defined but never started (see `payment/service.go`) — wire it up or plan relies on webhook reaching a public URL.

## Target architecture (public site, port 3001)
- Route group: `jogjagem/src/app/[locale]/business/*` (pages ported from admin)
- Partner middleware: gate `/[locale]/business` to role `partner`/`business_owner`; non-partner → public home/login
- Login flow: partner logs in on public site → lands `/[locale]/business` (cookie shared)
- i18n: extract all hardcoded Indonesian strings → `id.json` + `en.json`; use `useTranslations`
- API: move proxy routes into frontend `api/` OR call backend directly (frontend already proxies)
- Admin app (`jogjagem-admin`): keep until switchover, then remove `/business/*` + business proxy routes + partner redirects

## Phases (each must compile + work standalone)

### Phase 1 — Scaffold + routing
- Create `[locale]/business` route group on frontend
- Port `BusinessSidebar`, `BusinessHeader`, layout, redirect page
- Add partner middleware gate on public site
- Create `en.json`/`id.json` message scaffolding
- Portal renders and lists businesses (uses `/businesses/me`)
- Verify: `tsc --noEmit` + page loads for partner token

### Phase 2 — Panels + API
- Port `ListingsPanel`, `PromotionsPanel`, `ReviewsPanel`, `SettingsPanel`, `SubscriptionsPanel`
- Move business API proxy routes to frontend
- Wire i18n strings into all panels
- Verify: each panel functional end-to-end (listings, promotions, reviews, settings, upgrade flow)

### Phase 3 — Switchover + cleanup
- Partner login/redirect on public site → `[locale]/business`
- Deprecate `3002/business/*` in admin app
- Remove ported components, pages, and proxy routes from admin app
- Update AGENTS.md/README with new locations
- Verify: full partner journey on public site; admin portal unaffected for ops

## Verification commands
- Admin: `cd jogjagem-admin && npx tsc --noEmit`
- Frontend: `cd jogjagem && npx tsc --noEmit`
- Backend: `cd jogjagem-api && go build ./... && go vet ./...`
- Manual: partner login → `[locale]/business` → dashboard/listings/promotions/reviews/settings/subscriptions

## Refs
- Frontend i18n: `jogjagem/package.json` has `next-intl`; `messages/en.json`, `messages/id.json`
- Frontend locale config: `jogjagem/src/i18n/{navigation,request,routing}.ts`
- Admin portal currently: `jogjagem-admin/src/app/business/*` + `jogjagem-admin/src/components/Business*.tsx`
- Backend business routes: `jogjagem-api/internal/modules/business/*`
- Payment flow: `jogjagem-api/internal/modules/payment/*` + `jogjagem-admin/src/components/SnapCheckoutButton.tsx`
