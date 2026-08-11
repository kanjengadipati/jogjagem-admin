# Plan: Move Business Portal to the Public Site (bilingual)

Status: DONE — business portal lives on the public site (`jogjagem`) at `/[locale]/business/*`;
the legacy copy was removed from this admin app (Phase 3 cleanup).
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
- `business-portal/TeamPanel.tsx` (team members + invite management, incl. pending-invite list/revoke + invite-link copy modal)
- Also shared: `SnapCheckoutButton.tsx` (contains a local `InvoiceEmailModal` — no standalone file), `useToast`/`Toast.tsx`, `useActiveBusiness.ts` hook

### Pages to move — `jogjagem-admin/src/app/business/`
- `/business/page.tsx` (redirect logic — fetches `/api/businesses/me`, → dashboard or settings)
- `/business/layout.tsx`
- `/business/settings/page.tsx`
- `/business/listings/page.tsx`
- `/business/promotions/page.tsx`
- `/business/reviews/page.tsx`
- `/business/subscriptions/page.tsx`
- `/business/team/page.tsx`
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
- `/business/[externalId]/team/page.tsx`

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
- `businesses/me/[id]/members/route.ts`
- `businesses/me/[id]/members/invite/route.ts`
- `businesses/me/[id]/members/[userId]/route.ts`
- `businesses/me/[id]/members/invites/route.ts`
- `businesses/me/[id]/members/invites/[inviteId]/route.ts`
- Plus `auth/login`, `auth/social`, `auth/refresh` etc. as needed for partner auth on the public site

Note: admin-ops business routes (`/businesses` CRUD, `pending`, `check-name`, `[id]/approve|reject|suspend`) stay in the admin app and are NOT ported.

Total: ~20 business proxy routes + auth routes.
Total code to port: ~3,500+ lines + i18n extraction.

### Already on the public site (`jogjagem/src/app/[locale]/business/`) — do NOT port, reconcile instead
- `page.tsx` — "Bisnis / Jogjagem untuk Pelaku Bisnis" landing page
- `claim/page.tsx` — listing ownership claim flow (uses `/listing-claims/*` via `src/lib/api.ts`)
- `invites/[token]/page.tsx` — team-invite accept flow (uses `/businesses/invites/:token` via `businessInvites` in `src/lib/api.ts`)

The invite email URL already points to `NEXT_PUBLIC_FRONTEND_URL` (portal), so invite acceptance already runs on the portal. When adding the management panels under `[locale]/business/*`, keep these existing sub-paths and add sibling routes (e.g. `dashboard`, `listings`, `settings`, `team`, `subscriptions`, ...) without collisions.

## Known issues to preserve/fix during migration
- Invalid/stale JWT → empty `/api/businesses/me` → redirect to settings. `business/page.tsx` should treat 401 as "log in again", not "no business".
- `PromotionsPanel.tsx` `/ads` links → must point to `/[locale]/ads?placement=...` on the public site.
- Admin middleware only base64-decodes JWT (no signature/expiry check) → need proper validation on public site.
- Plan badge in sidebar: already dynamic, reads `/api/businesses/me/{id}/subscription`.
- Payment/webhook: Midtrans webhook can't reach localhost in dev; `PollPendingExpired` scheduler in backend is defined but never started (see `payment/service.go`) — wire it up or plan relies on webhook reaching a public URL.

## Target architecture (public site, port 3001)
- Route group: `jogjagem/src/app/[locale]/business/*` (pages ported from admin) — reconcile with the existing `claim` and `invites/[token]` sub-paths already on the portal
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
- Port `ListingsPanel`, `PromotionsPanel`, `ReviewsPanel`, `SettingsPanel`, `SubscriptionsPanel`, `TeamPanel`
- Move business API proxy routes to frontend
- Wire i18n strings into all panels
- Verify: each panel functional end-to-end (listings, promotions, reviews, settings, upgrade flow, team invites)

### Phase 3 — Switchover + cleanup
- Partner login/redirect on public site → `[locale]/business`
- Deprecate `3002/business/*` in admin app
- Remove ported components, pages, and proxy routes from admin app
- Update AGENTS.md/README with new locations
- Verify: full partner journey on public site; admin portal unaffected for ops

> **DONE (2026-08-11):** admin app cleanup executed —
> deleted `src/app/business/**`, `BusinessSidebar`/`BusinessHeader`,
> `src/components/business-portal/`, `src/hooks/useActiveBusiness.ts`,
> and `src/app/api/businesses/me/**`. Partner/business_owner login is now rejected
> (403) on this admin app; existing partner sessions redirect to the public portal
> (`NEXT_PUBLIC_FRONTEND_URL`). Removed dead `partnerMenuGroups` + unused `Partner`
> type. Admin ops (`(admin)/businesses`, `business-claims`, `ad-campaigns`,
> sales pages) unaffected. `SnapCheckoutButton` kept (still used by ad-campaigns page).

## Verification commands
- Admin: `cd jogjagem-admin && npx tsc --noEmit`
- Frontend: `cd jogjagem && npx tsc --noEmit`
- Backend: `cd jogjagem-api && go build ./... && go vet ./...`
- Manual: partner login → `[locale]/business` → dashboard/listings/promotions/reviews/settings/subscriptions/team (invite → accept via link)

## Refs
- Frontend i18n: `jogjagem/package.json` has `next-intl`; `messages/en.json`, `messages/id.json`
- Frontend locale config: `jogjagem/src/i18n/{navigation,request,routing}.ts`
- Admin portal currently: `jogjagem-admin/src/app/business/*` + `jogjagem-admin/src/components/Business*.tsx`
- Backend business routes: `jogjagem-api/internal/modules/business/*`
- Payment flow: `jogjagem-api/internal/modules/payment/*` + `jogjagem-admin/src/components/SnapCheckoutButton.tsx`
