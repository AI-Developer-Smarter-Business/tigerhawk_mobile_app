# QA — Driver actions mobile vs web (task 3.7)

Cross-check **PP2 mobile** (`DriverActionBar`) against **TMS** `DriverActionPanel` (same user, same load).

Automated guard: `lib/loads/__tests__/web-driver-panel-parity.test.ts`.

**Production execution (task 5.6):** use **`docs/QA_PRODUCTION_SIGNOFF_5_6.md`** §F. Rows **1–2** require TMS **`docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`** on live server; without it, mobile PATCH returns **401** (not a single-load bug).

## Prerequisites

| Item | Value |
|------|--------|
| Mobile | Expo / APK with `EXPO_PUBLIC_TMS_API_URL` → running TMS |
| User | `driver_test@test.com` (or driver with assigned loads) |
| Web | TMS dispatcher load detail → **Driver Action Panel** |
| Same load | Note `reference_number` / UUID; open that load on phone and web |

## Cross-test matrix

For each row: perform action on **web panel**, refresh mobile (pull-to-refresh or wait Realtime ~1s), then repeat **only on mobile** and refresh web.

| # | Starting status | Action (driver button) | Pass criteria |
|---|-----------------|------------------------|---------------|
| 1 | `Dispatched` | **In Transit** | Status matches on web + mobile; list badge updates |
| 2 | `In Transit` | **Arrived At Delivery** (or **At Warehouse** if shown) | Same on both clients |
| 3 | Load with **freight hold** | Any driver button | Mobile shows hold banner; PATCH blocked; web also blocked (non-admin) |
| 4 | `Delivered` | **Enroute To Return Empty** | Button visible on both; **Completed** not shown on mobile |
| 5 | `Assigned` | — | Mobile shows no driver actions (dispatcher-only next steps on web) |

## Error parity

| Scenario | How to trigger | Expected mobile UX |
|----------|----------------|---------------------|
| ACTIVE_HOLDS | Active hold on load | Title + hold labels in `ErrorBanner` |
| Invalid transition | (Rare if UI filtered) | Validation message |
| Session expired | Sign out mid-flow / expired JWT | Auth message; no stale optimistic status |
| TMS offline | Stop TMS during PATCH | Network message; status rolls back on mobile |

## Accessibility checklist (mobile)

| Check | Target | Pass |
|-------|--------|------|
| Touch target height | Driver action buttons ≥ 48dp | `PP2Theme.layout.minTouchTarget` |
| Primary action contrast | Orange `#E8700A` on white text | `Button` variant `accent` on load detail |
| Disabled state | Holds block buttons; opacity visible | Buttons disabled when `activeHolds.length > 0` |
| Screen reader | Each action has `accessibilityLabel` | e.g. “Change status to In Transit” |
| Drawer items | Nav rows ≥ 48dp tap area | `AppDrawerContent` `minHeight` |

## Sign-off

| Role | Date | Notes |
|------|------|-------|
| Dev | | `npm run ci` green + parity tests |
| QA / PM | | Cross-test matrix rows 1–5 on staging |
