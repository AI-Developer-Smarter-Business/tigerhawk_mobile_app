# Daily reports — PP2 mobile

Log of **product-relevant** progress: new features, integrations (login, Supabase, TMS API), automated tests, AI agents, installable builds, etc.

**Do not log here:** renames, documentation-only edits with no code, cosmetic refactors.

**Format:** one date section per day; under it **Task 1**, **Task 2**, … in **ascending numeric order** (do not repeat the date on each line).

**Spanish version:** [`REPORTES_DIARIOS.md`](REPORTES_DIARIOS.md) (same content, maintained in parallel).

---

## Documentation directive (required)

**For AI agents and developers:** every **functional** app change must be recorded **the same day** in this file (and in `REPORTES_DIARIOS.md` when the team uses Spanish):

1. Use a `## [current date]` section (create it if missing).
2. Add or update **Task N** matching the item in `PP2_TAREAS_DEV.md` (e.g. 1.4 → that day’s login task).
3. Include: **what was implemented**, **what is available to users**, and links to key files when helpful.
4. Add **How to test** (required): short steps to validate the change in the app or in tests; plain language, not long paragraphs.
5. Do not repeat the date in every paragraph; number tasks within the day in ascending order (1, 2, 3, …).

If one day covers several dev tasks, use **Task 7**, **Task 8**, etc. in chronological order.

### “How to test” template

Use short bullets. Examples:

- **Tests only:** `npm test` (or `npm run ci`) — must pass (green).
- **Screen:** login → route → expected action (1–3 steps).
- **No new UI:** state which command or file to verify.

Do not paste a full QA guide; only what is needed to repeat that day’s check.

---

## 18 May 2026

### Task 1 — App foundation (Expo + navigation + Supabase)

**What was implemented**

- **Expo SDK 54** project with TypeScript and Expo Router.
- **Loads** and **Account** tabs; Supabase client; EAS APK config.

**What is available**

- App runs in Expo Go / emulator with hot reload.

### Task 2 — Full client phase (`PP2_TAREAS_CLIENTE.md`) + testing and CI

**What was implemented**

- **MVP screens with mocks:** demo login, load list, detail, Driver actions, POD placeholder.
- `mocks/`, `context/`, `types/`, `lib/loads/`.
- Client documentation in `docs/`.
- **Jest** + **GitHub Actions** (`npm run ci`).

### Task 3 — Supabase Auth: getSession + listener (dev 1.2)

**What was implemented**

- `AuthProvider` + `useAuth`: session persisted in SecureStore.
- Tests in `lib/supabase/__tests__/auth-session.test.ts`.

### Task 4 — `useProfile`, queries, and loads pilot (dev 1.6 / 1.7)

**What was implemented**

- `lib/supabase/queries/`, `useProfile`, `useAssignedLoadsQuery`.
- Real list with driver session; initial `signInWithPassword`.

### Task 5 — Driver RLS review (dev 1.3)

**What was done**

- `docs/RLS_MOBILE_REVIEW.md`; policies documented for TMS API on updates/POD.

### Task 6 — RLS migration applied in Supabase

**What was done**

- SQL Editor: `supabase/sql-editor/20260518120000_pp2_driver_scoped_load_messages_documents.sql` — **Success**.
- Driver: `load_messages` / `load_documents` scoped with `EXISTS` → `loads`.

### Task 7 — Real login + deep linking (dev 1.4) + English UI

**What was implemented**

- **Auth:** `signInWithPassword`, `signInWithMagicLink`, route `app/auth/callback`, `AuthDeepLinkHandler`, scheme `pp2://auth/callback`.
- **Security:** `lib/logging/safe-log.ts` (no tokens/passwords in logs); mock only in `__DEV__` (`EXPO_PUBLIC_ENABLE_MOCK_AUTH=0` to disable).
- **UI:** user-facing copy in English in `constants/strings.ts`; login, loads, account, and detail screens updated.
- **Docs:** English `README.md`; `docs/SUPABASE_AUTH_REDIRECTS.md` for Supabase redirect URLs.

**What is available**

- Login with TMS user (email/password) or magic link (after configuring redirect in Supabase).
- Deep link completes session and redirects to Loads.
- Mock disabled by default; use `driver_test@test.com` or a real TMS user.

**Supabase setup (manual)**

- Add redirect URL: `pp2://auth/callback` and the `exp://…` URL shown on the login screen in dev (see `docs/SUPABASE_AUTH_REDIRECTS.md`).

### Task 8 — LogBox fix on demo login (1.4)

**What was fixed**

- Demo credentials (`driver@tigerhawk.demo`) no longer call Supabase (dev mock only).
- `safeLog.authFailure`: expected auth errors do not open the red LogBox.
- Real TMS login still uses `signInWithPassword` against Supabase.

### Task 9 — “No assigned loads” flicker fix (1.6)

**What was fixed**

- Removed loop `syncLoads([])` → `mockLoads` → `refetch`; context syncs only when there are real loads.
- Empty list hidden while `loading`; no flicker when a driver with no assigned loads opens the app.

### Task 10 — Loads query fix: `container_number` on `containers` (1.6)

**What was fixed**

- `fetchLoadsForDriver` no longer requests `loads.container_number` (column does not exist).
- PostgREST join: `containers(container_number)`, `customers(name)` as in the TMS.

### Task 11 — Real data + loads for `driver_test@test.com` (1.6)

**What was implemented**

- App without mocks by default: list/detail from Supabase; TMS-only login (`driver_test@test.com` pre-filled).
- Scripts: `npm run db:seed-driver-test` (auth + `user_profiles` + `drivers` row with **same id** as auth) and `npm run db:assign-driver-test-loads` (up to 3 loads → `Dispatched`).
- SQL Editor: `supabase/sql-editor/seed_driver_test_user.sql`, `assign_loads_driver_test.sql`.

**What is available**

- Test driver with **3 real assigned loads:** `THWK_M138509`, `THWK_M138508`, `THWK_M138507` (status `Dispatched`).
- Login: `driver_test@test.com` / `Driver01*` → Loads tab shows TMS loads.
- Legacy mock only if `EXPO_PUBLIC_ENABLE_MOCK_AUTH=1` in dev.

**Technical note**

- `loads.driver_id` references `drivers.id` (TMS FK). Mobile RLS uses `driver_id = auth.uid()`; the driver with login must have a `drivers` row with **id = auth UUID**.

### Task 12 — TMS ↔ mobile audit (dev 1.5)

**What was done**

- **Read-only** review in `PROYECTO_MUESTRA/`: `DriverActionPanel.tsx`, `PATCH …/status/route.ts`, `…/documents/route.ts`.
- Document **`docs/MOBILE_API.md`:** Supabase vs Next API matrix, PATCH status contract, POD gap (POST admin/dispatcher only), Driver status subset, error catalog (`ACTIVE_HOLDS`, 403, 400), `driver_id` model (FK `drivers.id` vs RLS `auth.uid()`).
- Consistency updates: `docs/DATA_CONTRACT.md` §load list; comment in `lib/loads/constants.ts` pointing to the doc.

**What is available**

- Single reference for week 3 (status via TMS) and week 4 (POD); no TMS code changes from this repo.

**Key findings**

- Status changes: **TMS API** with Supabase JWT, not direct `UPDATE` on `loads`.
- POD: **blocked** for `driver` role on current POST; requires TMS extension (task 4.1).
- Security: status API does not yet limit transitions to the Driver subset (task 3.3 recommended).

### Task 13 — Formal close of dev 1.6 (real Supabase pilot)

**Verification**

- Criterion 1.6: at least one pilot screen with a real Supabase query (profile **or** load list).
- **Met and exceeded:** Loads (`useAssignedLoadsQuery` → `fetchLoadsForDriver`) and Account (`useProfile` → `fetchUserProfile`); Loads screen without mocks; list with RLS + 3 real loads for `driver_test@test.com`.

**Status**

- Marked ✅ in `PP2_TAREAS_DEV.md` (1.6). Week 2 improvements (pagination, expanded detail) are out of 1.6 scope.

---

## 19 May 2026

### Task 1 — Supabase layer + hooks (dev 1.7)

**What was implemented**

- **`lib/supabase/`:** `client.ts` (singleton + SecureStore), `assert-anon-key.ts`, barrel `index.ts`, `hooks/useAuth` + `hooks/useProfile` (cancel on unmount, like TMS `useUserRole`).
- **Security:** reject `service_role` JWT on client; `env.ts` blocks `EXPO_PUBLIC_*` service role keys.
- **Docs:** `docs/SUPABASE_LAYER.md`; tests `lib/supabase/__tests__/assert-anon-key.test.ts`.
- Re-exports at `@/hooks/useAuth` and `@/hooks/useProfile` for compatibility.

**What is available**

- Documented API: `getSupabase`, pure queries, session and profile hooks; no service role or admin in the app.

### Task 2 — CI and secrets / BFF matrix (dev 1.8)

**What was implemented**

- **CI:** `.github/workflows/ci.yml` — `npm run check:secrets` step between lint and tests; `npm run ci` updated.
- **Guard:** `scripts/check-client-secrets.mjs` — fails if client code references service role, `createAdminClient`, Resend, or Port Houston secrets.
- **Docs:** `docs/SECRETS_AND_BFF.md`, `docs/GitHub_Setup_Guide.md`.

**What is available**

- Every push/PR runs TypeScript, client secret scan, and unit tests.

### Task 3 — TMS-style drawer + loads data map (dev 2.1)

**What was implemented**

- **Navigation:** tabs replaced by **drawer** `app/(drawer)/` per `nav_lateral.png` with TMS colors (`#111827`, active `#E8700A`); `AppDrawerContent` — My Loads, Account, Log Out.
- **Directive:** `AGENTS.md` § sidebar; tokens `PP2Theme.colors.tms`.
- **Data 2.1:** `docs/LOADS_DATA_MAP.md`, `lib/supabase/schema/driver-loads.ts`.

**What is available**

- Hamburger menu (header) opens drawer ~72% width; post-login routes via `/(drawer)/loads` and `/(drawer)/account`.

### Task 4 — Paginated load list + loading/error/retry (dev 2.2)

**What was implemented**

- **`fetchDriverLoadsPage`:** PostgREST `.range()` + `count: 'exact'`, 20 rows per page (`LOAD_LIST_PAGE_SIZE`).
- **`useAssignedLoadsQuery`:** `loading`, `refreshing`, `loadingMore`, `hasMore`, `totalCount`; `loadMore`, `retry`, `refetch`.
- **UI `/(drawer)/loads`:** initial spinner, pull-to-refresh, infinite scroll, error banner with “Try again”, footer “Loading more…”.
- **Tests:** `lib/supabase/queries/__tests__/map-load-row.test.ts` (mapper + `hasMoreDriverLoads`).

**What is available**

- Driver sees loads in pages without loading full history at once; can retry on network failure.

### Task 5 — Load detail with Supabase master data (dev 2.3)

**What was implemented**

- **`fetchLoadDetailForDriver`** + `LOAD_DETAIL_SELECT` (embeds `customers`, `containers`, `drivers`); mapper `mapLoadDetailRowToDetail`.
- **`useLoadDetailQuery`:** loading, error + retry, `notFound`; list cache via `LoadsContext` while refreshing.
- **`app/load/[id].tsx`:** route, customer, shipment, container, timeline, active holds, flags; messages/POD placeholders unchanged.
- **Docs:** `docs/DISPATCHER_API_ROUTES.md` (PP2 ↔ TMS reference); `docs/LOADS_DATA_MAP.md` §2.2 updated.
- **Tests:** `mapLoadDetailRowToDetail` in `map-load-row.test.ts`.

**What is available**

- Opening a load from the list (or deep link `/load/[id]`) shows real master data from Supabase even if the row is not already in memory; retry on network failure.

### Task 6 — Pull-to-refresh and TanStack Query cache (dev 2.4)

**What was implemented**

- **`@tanstack/react-query`:** `QueryProvider` in `app/_layout.tsx`, `lib/query/query-keys.ts`, `invalidate-loads.ts`, cache cleared on sign-out.
- **`useAssignedLoadsQuery`:** migrated to `useInfiniteQuery`; `refetch` invalidates list + driver detail queries.
- **`useLoadDetailQuery`:** `useQuery` with `placeholderData` from `LoadsContext`; pull-to-refresh on detail.
- **Docs:** `docs/QUERY_CACHE.md`; `docs/SUPABASE_LAYER.md` updated.

**What is available**

- Pull to refresh on list and detail reloads Supabase data and syncs cache across screens; sign-out clears in-memory loads.

### Task 7 — Vibe-coding cleanup and UI consistency (dev 2.5)

**What was implemented**

- **Detail screen:** split into `LoadDetailContent`, `LoadDetailRow`, `ScreenState`; `app/load/[id].tsx` reduced to orchestration.
- **Routes:** `resolveRouteParam` for Expo params (`string | string[]`); tests in `lib/router/__tests__/route-params.test.ts`.
- **Hooks:** driver gate logic unified in `lib/query/driver-query-gate.ts`.
- **Theme:** semantic colors (`onPrimary`, `errorSurface`, `hotSurface`, `overlay`); UI components without hardcoded hex.
- **Mocks:** English copy aligned with `constants/strings.ts`.

**What is available**

- Same UX; more maintainable, strictly typed mobile code (no `any` in `app/`, `components/`, `hooks/`, `lib/`).

**How to test**

- Reload the app: list and detail should look the same; no visible product change.

### Task 8 — Unit tests for formatters and mappers (dev 2.6)

**What was implemented**

- **`lib/loads/__tests__/format.test.ts`:** statuses, appointments, date ranges, invalid ISO.
- **`lib/loads/__tests__/active-holds.test.ts`:** holds + `formatHoldLabel`.
- **`lib/loads/__tests__/load-detail-helpers.test.ts`:** detail section helpers.
- **`lib/supabase/queries/__tests__/map-load-row.test.ts`:** list/detail mapper, PostgREST arrays, pagination; fixture `fixtures/load-list-row.ts`.
- **Directive:** in `REPORTES_DIARIOS.md`, `DAILY_REPORTS.md`, and `AGENTS.md` — every functional task includes brief **How to test**.

**What is available**

- Automated regression for labels/dates and Supabase → `LoadDetail` mapping without opening the app.

**How to test**

- At repo root: `npm test` (or `npm run ci` before a PR).
- All tests should pass (suites `lib/loads` and `lib/supabase/queries`).

### Task 9 — Hook tests with mocked Supabase (dev 2.7)

**What was implemented**

- **`hooks/__tests__/useAssignedLoadsQuery.test.tsx`:** happy path list, PostgREST error, non-driver gate, `loadMore` pagination.
- **`hooks/__tests__/useLoadDetailQuery.test.tsx`:** detail, `notFound`, placeholder from `LoadsContext`, error with cache, non-driver gate.
- **`hooks/testing/hooks-test-utils.tsx`:** `QueryClient` + `LoadsProvider` wrapper; mocks for `useAuth` / `useProfile`.
- **Queries mocked** (`fetchDriverLoadsPage`, `fetchLoadDetailForDriver`) — no MSW; Supabase client stubbed.
- **`LoadsProvider`:** optional `initialLoads` prop for tests.

**What is available**

- Automated regression for React Query + load hooks without a device.

**How to test**

- `npm test hooks/__tests__` or `npm run ci`.
- Tests for `useAssignedLoadsQuery` and `useLoadDetailQuery` must pass.

### Task 10 — MOBILE_API doc: Supabase vs TMS (dev 2.8)

**What was implemented**

- **`docs/MOBILE_API.md` §4** expanded: design rules, Supabase read table (queries/hooks/screens), future TMS routes table, client-only behavior (status demo), mermaid diagram.
- Cross-links to `LOADS_DATA_MAP`, `DISPATCHER_API_ROUTES`, `QUERY_CACHE`, `SECRETS_AND_BFF`.
- Clarification: list and detail **do not** call `GET /api/dispatcher/loads`; status change will use `PATCH …/status` in week 3.

**What is available**

- Single dev/ops reference: what goes through PostgREST vs what will go through the TMS BFF.

**How to test**

- Open `docs/MOBILE_API.md` §4 and compare with code: `lib/supabase/queries/loads.ts` (Supabase) — there should be no `fetch` to `env.tmsApiUrl` in `app/` or `hooks/` yet.
- `EXPO_PUBLIC_TMS_API_URL` in `.env.local` may be set but is not used until task 3.1.

---

## 20 May 2026

### Task 4 — Loads realtime + task 3.3 guard (dev 3.3)

**What was implemented**

- **Realtime:** `useDriverLoadsRealtime` subscribes to `loads` and invalidates React Query when TMS assigns/updates loads.
- **Fallback:** refetch when app returns to foreground.
- **Security:** `assertDriverFieldStatusTarget` before PATCH; TMS patch doc `docs/TMS_PATCH_3_3_DRIVER_STATUS.md`.

**How to test**

- Assign a load to `driver_test@test.com` in TMS — list updates without restarting the app.

### Task 2 — Driver-only actions in UI (dev 3.2)

**What was implemented**

- **`FINAL_LOAD_STATUSES`**, **`filterDriverFieldActions`:** action bar no longer shows `Completed`, `Cancelled`, or dispatcher-only transitions.
- Expanded tests in `lib/loads/__tests__/driver-actions.test.ts`.

**How to test**

- Open a `Delivered` load: only **Enroute To Return Empty**, no **Completed** button.

### Task 3 — Pagination test data for `driver_test@test.com`

**What was done**

- `assign-loads-driver-test.mjs` supports `--max=N` and `--all` (up to 200 unassigned loads).
- `npm run db:assign-driver-test-loads:pagination` — **203 loads** assigned in Supabase.

**How to test**

- Login → **My Loads** → scroll past 20 rows (footer “Loading more…”).

### Task 1 — Status PATCH via TMS BFF (dev 3.1)

**What was implemented**

- **`lib/tms/`:** `patchLoadStatus`, `parseStatusPatchError`, `TmsStatusChangeError` (`ACTIVE_HOLDS`, 403, 400, 401, network).
- **`app/load/[id].tsx`:** JWT `session.access_token`, optimistic UI + rollback, invalidate list/detail on success.
- **`DriverActionBar`:** async `onStatusChange`; server errors in banner.

**What is available**

- Driver status changes persist through the TMS (same route as web `DriverActionPanel`), not cache-only.

**How to test**

- `.env.local`: set `EXPO_PUBLIC_TMS_API_URL` to a running TMS (e.g. `http://localhost:3000` or staging).
- Login `driver_test@test.com` → open `Dispatched` load → tap **In transit** → status should stick after pull-to-refresh.
- `npm run ci` passes.

### Task 5 — Safe optimistic UI + dev telemetry (dev 3.5)

**What was implemented**

- **`canOptimisticallyUpdateLoadStatus`:** React Query cache and `LoadsContext` update before PATCH only when there are no holds, the transition is valid for the driver, and the target is a field status.
- **`runDriverStatusChange`:** orchestrates optimistic apply → `patchLoadStatus` → invalidation; rolls back cache and context if TMS fails.
- **`hooks/useDriverStatusChange.ts`:** `app/load/[id].tsx` delegates status changes to the hook (`load/[id]` route unchanged).
- **Telemetry:** `driverStatusTelemetry` + `safeLog.event` (`attempt` / `success` / `failure` with `optimistic`, `rolledBack`, `code`) in `__DEV__` only.
- **Docs:** `docs/MOBILE_TELEMETRY.md`; cross-links in `docs/QUERY_CACHE.md` and `docs/MOBILE_API.md`.

**What is available**

- Immediate UI on safe transitions; if the server rejects (403, holds, network), status reverts without a stale UI.
- Structured Metro logs for debugging status changes without leaking tokens.

**How to test**

- `npm run ci` — 96 tests green (includes `optimistic-status.test.ts` and `run-driver-status-change.test.ts`).
- Driver login → open `Dispatched` load → **In Transit** → dev console: `[driver.status:attempt]` with `optimistic: true`; on success: `[driver.status:success]`.
- Stop TMS or force 403 → status badge should revert and `[driver.status:failure]` with `rolledBack: true`.
- Full policy: `docs/MOBILE_TELEMETRY.md`.

### Task 6 — Driver action layer unit tests (dev 3.6)

**What was implemented**

- **`lib/tms/status-patch-request.ts`:** pure builders for path, headers, body, and fetch init (`PATCH …/status` + `{ status }`).
- **`patchLoadStatus`** refactored to use those builders (same URL/payload the tests assert).
- Tests: `status-patch-request.test.ts`, expanded `patch-load-status.test.ts` (encoded id, network, 401, 400, `enforceDriverFieldOnly`), `driver-status-action.test.ts` (orchestration + payload alignment).

**What is available**

- Automated regression that the mobile app sends the agreed TMS route and JSON without a physical device.

**How to test**

- `npm run ci` — `lib/tms/__tests__` and `lib/driver-status/__tests__` green.
- `npm test lib/tms/__tests__/status-patch-request.test.ts` to validate payloads only.

### Task 7 — Cross-web QA + accessibility (dev 3.7)

**What was implemented**

- **`docs/QA_DRIVER_ACTIONS_3_7.md`:** manual matrix mobile vs TMS `DriverActionPanel` (same user/load), holds, errors, and a11y checklist.
- **Automated parity:** `web-panel-reference.ts` + `web-driver-panel-parity.test.ts` (same driver status sets/filters as TMS).
- **Accessibility:** 48dp `minTouchTarget` in theme; `Button` `accessibilityLabel` / `accessibilityState`; load actions use `accent` (TMS orange contrast); drawer rows `minHeight` 48; `ErrorBanner` retry touch area.

**What is available**

- Repeatable guide to confirm mobile and web show the same driver actions and status after PATCH.
- More usable field UI (larger targets, screen reader labels).

**How to test**

- `npm run ci` — includes `web-driver-panel-parity.test.ts`.
- Follow `docs/QA_DRIVER_ACTIONS_3_7.md`: login `driver_test@test.com` → same load on TMS and phone → row 1 (`Dispatched` → **In Transit**) on both; confirm sync.
- On device: tall action buttons; with active holds, disabled buttons and hold message.

### Task 8 — Developer / client handoff doc (dev 3.8)

**What was implemented**

- **`HANDOFF_DEV.md` rewritten:** table *initial mockup vs current state* (Supabase auth, real list/detail, TMS PATCH, Realtime, errors, PP2 Driver UI, tests).
- Routes, `driver_test` credentials, `.env.local` vars, week-3 action layer file map, known limits (POD, messages, magic link), and week 4+ priorities.
- Updated delivery checklist; link from `README.md` (v0.2 scope).

**What is available**

- Single onboarding doc: what the client delivered with mocks vs what dev completed through week 3.

**How to test**

- Read `HANDOFF_DEV.md` and compare to the running app: real login → loads → detail → status change should match the “Driver action layer” section.
- Confirm outdated lines (“mock auth”, “local-only status”) are gone.

---

*When closing each day, add a `## [date]` section with tasks numbered in ascending order.*
