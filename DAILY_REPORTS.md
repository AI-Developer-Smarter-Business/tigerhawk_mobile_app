# Daily reports — PP2 mobile

Log of **product-relevant** progress: new features, integrations (login, Supabase, TMS API), automated tests, AI agents, installable builds, etc.

**Do not log here:** renames, documentation-only edits with no code, cosmetic refactors.

**Do not mention `PROYECTO_MUESTRA/`** in this file (or paths under that folder). Refer to the web TMS as **“TMS”**, **“TMS API”**, or HTTP routes (`/api/dispatcher/…`); technical detail lives in `docs/` (`MOBILE_API.md`, `TMS_PATCH_*.md`).

**Format:** one date section per day; under it **Task 1**, **Task 2**, **Task 3**, … in **strict ascending numeric order** (1 before 2, 2 before 3; **never** place Task 7 before Task 4). The new entry for the day is always the **next** free number and goes **right after** the last numbered task for that date—not at the end of the file if that breaks order within the date.


**One date = one calendar day:** do not nest another date inside `## [date]` (e.g. no “Monday Jun 15” block under “June 18”). Backfill missing days as separate `## June 15`, `## June 16`, etc.

**Date order in the file:** each `## [date]` section must appear in **ascending chronological order** (oldest at top, newest at bottom). **Do not** append entries with an older date at the end. Day-specific annexes belong **inside** that day’s section (e.g. `### Annex`), not as a misplaced `##` dated earlier than sections below it.

**Spanish version:** [`REPORTES_DIARIOS.md`](REPORTES_DIARIOS.md) (same content, maintained in parallel).

---

## Documentation directive (required — do not skip)

**For AI agents and developers:** **never** finish functional work without updating **the same day** `DAILY_REPORTS.md` and `REPORTES_DIARIOS.md`. Reinforced in `.cursor/rules/daily-reports-documentation.mdc`.

Checklist before marking work done:

1. `## [current date]` section (create if missing).
2. **Task N** for that day: **N = last task that day + 1**; insert it **directly below** Task N−1 (read top to bottom: 1, 2, 3 …). If you document dev **4.6** then **4.7**, use **Task 7 (4.6)** then **Task 8 (4.7)** — never reversed. Align with `PP2_TAREAS_DEV.md` when applicable.
3. **What was implemented** and **what is available** (driver-facing).
4. **How to test** (required), including:
   - Command (`npm run ci`, specific tests) when applicable.
   - **Mobile path:** login → menu → screen → control (e.g. **My Loads** → load detail → **POD / Documents** → **View**).
   - **Expected result** (what the driver should see).
5. Mirror the entry in Spanish in `REPORTES_DIARIOS.md`.
6. Do not cite `PROYECTO_MUESTRA/`; use “TMS”, `/api/…`, or `docs/`.
7. Update the row in `PP2_TAREAS_DEV.md` (✅ / ⏸) when applicable.
8. Use the **actual calendar date** in the `##` heading (e.g. **June 18, 2026**).
9. Insert the new day **after** the latest chronological date already in the file. Run `npm run check:daily-reports` (included in CI).

If the change is user-visible or affects QA, **always** document it even for small diffs.

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

- **Read-only** review of the web TMS: driver panel (`DriverActionPanel`), `PATCH …/status`, `POST …/documents` (routes documented in `docs/MOBILE_API.md`).
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

## May 22, 2026

### Task 1 — POD / TMS documents gap (dev 4.1)

**What was implemented**

- **Decision:** option **(A)** — extend `POST /api/dispatcher/loads/[id]/documents` for the assigned driver (same pattern as status `PATCH`), no new route or direct Storage from mobile.
- **TMS patch:** `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md` (`isAssignedDriver` permission, `POD`/`Photo` only for `driver` role, 50 MB / 255 char limits unchanged).
- **Mobile layer:** `lib/tms/upload-load-document.ts`, `document-upload-request.ts`, `document-upload-limits.ts`, `assert-driver-document-type.ts`, `parse-document-error.ts`, `tmsDocumentApiPath` in `client.ts`.
- **Tests:** `document-upload-request.test.ts`, `parse-document-error.test.ts`, `upload-load-document.test.ts`; extended `client.test.ts`.
- **Docs:** `docs/MOBILE_API.md` §5.2 and §4 matrix; `docs/DISPATCHER_API_ROUTES.md`; `PP2_TAREAS_DEV.md` 4.1 marked complete.

**What is available**

- HTTP contract and client ready for POD upload via TMS; UI remains placeholder until **4.2** (`expo-image-picker`).
- TMS team must apply the patch in the Next.js repo and deploy staging before real upload from the app.

**How to test**

- `npm run ci` — `lib/tms/__tests__` green (includes document upload).
- `npm test lib/tms/__tests__/document-upload-request.test.ts` — path, headers, 50 MB validation.
- After TMS patch deploy: `POST` multipart with `driver_test@test.com` JWT, assigned load, `document_type=POD` → **201** (see `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md`).

### Task 2 — POD upload with camera/gallery (dev 4.2)

**What was implemented**

- **`expo-image-picker`** + **`expo-file-system`** (file size); plugin and iOS/Android permissions in `app.json`.
- **`PodUploadSection`:** camera or gallery, preview, **Upload POD** / **Cancel** (discard with confirmation).
- **`useLoadDocumentUpload`** + `app/load/[id].tsx` → `uploadLoadDocument` (TMS `POST …/documents`, type `POD`).
- **`lib/media/`:** `pick-load-photo`, `map-picker-asset`, `resolve-upload-file-size`, allowed MIME types.
- **Errors:** `mapDocumentUploadError` wired into `mapErrorToUserFacing`.
- **Tests:** `map-picker-asset.test.ts`, `map-document-error.test.ts`.
- **Copy:** `constants/strings.ts` (placeholder removed).

**What is available**

- On load detail, the driver can pick a photo, review it, and upload as POD via the TMS API (requires task 4.1 patch on the live TMS).

**How to test**

- `npm run ci` — new tests green.
- `npx expo start` → login `driver_test@test.com` → open assigned load → **POD / Documents** → **Add POD photo** → camera or gallery → preview → **Upload POD** or **Cancel**.
- With `EXPO_PUBLIC_TMS_API_URL` pointing at the live TMS and patch 4.1 applied: upload should show success; without patch, 403 error banner.

### Task 5 — View TMS load documents on mobile (dev 4.2 re-scoped)

**What was implemented**

- **Document list** for the load via Supabase (`load_documents`, driver RLS): `fetchLoadDocumentsForDriver`, `useLoadDocumentsQuery`, `LoadDocumentsSection` (name, type, size, date, **View** via `Linking`).
- **Realtime:** subscription on `load_documents` + `supabase/sql-editor/enable_realtime_load_documents.sql`.
- **Pull-to-refresh** refreshes load detail and documents; list refreshes after driver upload.
- **Optional upload:** `PodUploadSection` under “Driver photo (optional)” (POD/evidence); primary UX is reading dispatch uploads from TMS.

**What is available**

- On load detail (e.g. `#TH-MPEIQ624-8THS`), the driver sees files such as `codigo de barras principal.jpeg` uploaded in the TMS Documents tab and can open them; new files appear after refresh or Realtime when enabled in Supabase.

**How to test**

- `npm run ci` — `map-load-document-row`, `format-document`, realtime documents debounce tests green.
- SQL Editor (once): run `enable_realtime_load_documents.sql` if the list does not auto-update.
- `npx expo start` → driver login → load with a TMS document → **POD / Documents** → file row → **View**.
- From TMS: upload another file to the same load with mobile on detail → should appear (Realtime or pull-to-refresh).

---

## May 25, 2026

### Task 1 — Document ↔ load association (dev 4.4)

**What was implemented**

- **`lib/loads/document-load-association.ts`:** ensures each `load_documents` row belongs to the open load `load_id`; checks `storage_path` prefix (`{load_id}/…`, same as TMS); defensive filter after query; validates TMS upload response `load_id`.
- **`fetchLoadDocumentsForDriver`:** `.eq('load_id', …)` plus client filter for inconsistent rows.
- **`uploadLoadDocument`:** rejects response when JSON `load_id` does not match the request load.
- **`/load/[id]`** and **`useLoadDocumentsQuery`:** `normalizeLoadIdParam` for empty/broken deep links.
- **Tests:** `document-load-association.test.ts`, `fetch-load-documents.test.ts`, extended `upload-load-document.test.ts`.

**What is available**

- On load detail, **POD / Documents** lists only files for **that** load (`load_documents` + RLS + client filter). Prevents showing a document tied to another load or another Storage prefix.

**How to test**

- `npm run ci` — must pass (includes association tests).
- **In the app (UI):**
  1. `npx expo start` → driver login (e.g. `driver_test@test.com`).
  2. **My Loads** → open a load that has at least one file in TMS **Documents** (e.g. `#TH-MPEIQ624-8THS`).
  3. Scroll to the **POD / Documents** card.
  4. **Expected:** only file(s) for **this** load (name, type, size, date); **View** opens the file. Files from other loads must **not** appear here.
  5. In TMS, upload a file to a **different** load: it must **not** show on the first load’s detail screen (only when opening that other load).
  6. **Pull-to-refresh** on detail: list still scoped to the same load.
- **Invalid route:** `/load/` with empty id → “Load not found” or no document list (no crash).

### Task 2 — Expired document links and TMS deletes (4.4 / UX)

**What was implemented**

- **Signed URLs:** on list/refresh, the app tries **TMS GET documents** (fresh ~1h links); falls back to Supabase if TMS is unavailable.
- **View:** probes the link before opening; on expiry (`InvalidJWT` / `exp`), **refreshes the list** and retries; otherwise shows a clear “link expired” message (not raw JSON).
- **TMS delete:** when TMS GET works, the mobile list matches TMS (deleted file disappears); **pull-to-refresh** and **screen focus** also refresh documents; Realtime on `load_documents` still applies.

**How to test**

- `npm run ci` — `document-view-url`, `merge-tms-documents` tests green.
- **Expired link:** open a load whose document was uploaded **over 1h ago** → **View** → expect *“This download link has expired. Pull down…”* (not Supabase JSON). **Pull down** on detail → **View** again (with TMS Bearer patch deployed, file should open).
- **Delete:** on **POD / Documents**, delete the file in TMS → after a few seconds (Realtime) or **pull down**, the row **is gone**.
- **Path:** **My Loads** → load → **POD / Documents** card → **View**.

### Task 3 — Basic offline handling (dev 4.5)

**What was implemented**

- **`@react-native-community/netinfo`**, `NetworkProvider`, global **`OfflineBanner`** (`strings.network`).
- **`assertOnlineForFetch` / `assertOnlineForDriverAction`:** block refresh and field actions offline; clear copy via `OfflineError` + `mapErrorToUserFacing`.
- Wired into loads list/detail/documents queries, TMS status change, and document **View**.
- **No offline upload queue** in v1 (`docs/OFFLINE_V1.md`).
- Cursor rule **`.cursor/rules/daily-reports-documentation.mdc`** for mandatory daily reports.

**What is available**

- Airplane mode / no data: top banner; refresh and field actions show internet-required messages; cached screens may remain until pull-to-refresh.

**How to test**

- `npm run ci` — includes `lib/network/__tests__/network-state.test.ts`.
- **On device or emulator:**
  1. App online → login → **My Loads**.
  2. Enable **airplane mode** (or disable Wi‑Fi/mobile data).
  3. **Expected:** **“No internet connection”** banner at the top.
  4. **Pull down** on **My Loads** or open another load → message like *“No internet connection. Connect to load or update data.”* (no crash).
  5. On a cached load detail, tap **In transit** (or any **Field actions** button) → *“This action needs internet…”*.
  6. **POD / Documents** → **View** → same action-blocked message.
  7. Disable airplane mode → banner clears → **pull down** → list refreshes normally.

### Task 4 — Offline banner CI fix (4.5 closure)

**What was implemented**

- `OfflineBanner` uses existing `PP2Theme` tokens: `hotSurface`, `hotBorder`, `hotText` (replaced non-existent `warningSurface` / `warningBorder`).

**How to test**

- `npm run ci` — lint + 161 tests green.
- Visual: same steps as **Task 3** (2–3); yellow banner renders without TypeScript errors.

### Task 5 — Wi‑Fi/mobile data reconnect without stuck spinner (4.5)

**What was implemented**

- **`ProfileProvider`:** single shared profile state (was duplicated per hook).
- **`applyProfileFetchResult`:** keeps driver profile on transient network fetch failures (avoids false *“No profile found”*).
- **`QueryNetworkRecovery`:** on reconnect, refetches profile + active queries; on offline, **cancels** in-flight requests (fixes infinite pull-to-refresh).
- TanStack Query **`onlineManager`** + NetInfo; **`refetchOnReconnect`** enabled.
- Load hooks only show `refreshing` when the query is **enabled**.

**How to test**

- `npm run ci` — includes `apply-profile-fetch-result.test.ts`.
- **On device/emulator:**
  1. Login → **My Loads** → open a load detail (route/status visible).
  2. **Airplane mode** ~10s → offline banner; optional pull-to-refresh (offline message).
  3. Disable airplane mode (or switch Wi‑Fi ↔ mobile data).
  4. **Expected:** within **~5s** banner clears, **no** stuck refresh spinner, **no** *“No profile found”*, route/documents refresh **without leaving** the screen.
  5. Repeat on **My Loads** list: pull down after reconnect → single refresh.

### Task 6 — Top spinner only on manual pull (4.5)

**What was implemented**

- **`usePullToRefresh`:** **My Loads** and load detail `RefreshControl` no longer bind to React Query `isRefetching` / `isFetching` (background reconnect refetches were keeping the spinner on).
- Offline **`cancelQueries()`** when connectivity is lost.

**How to test**

- `npm run ci`.
- Load detail → disable Wi‑Fi → re-enable **without** pulling down.
- **Expected:** offline banner clears, data updates, **no** stuck white spinner above the scroll content.
- Manual pull down → spinner only for the gesture duration.

### Task 7 — FormData and upload metadata unit tests (dev 4.6)

**What was implemented**

- **`lib/tms/testing/form-data-test-utils.ts`:** captures `FormData.append` calls; helpers for file part and `document_type`.
- Expanded **`document-upload-request.test.ts`:** RN file part (`uri`, `name`, `type`), `document_type` (POD/Photo), default MIME, validation before append.
- **`upload-load-document.test.ts`:** asserts `fetch` sends correct multipart metadata (mocked).
- **`resolve-upload-file-size.test.ts`:** mocks `expo-file-system` when picker omits `fileSize`.
- **`map-picker-asset.test.ts`:** generated `pod_<timestamp>.png` when `fileName` is missing.

**What is available**

- No UI change; automated coverage for TMS `POST /api/dispatcher/loads/[id]/documents`.

**How to test**

- `npm run ci` — **183 tests**; see suites above.
- **App path (when upload is enabled):** login → **My Loads** → load → **POD / Documents** → upload (needs TMS patch 4.1); upload UI may still be disabled — task 4.6 is tests only.

### Task 8 — Manual documents QA (dev 4.7)

**What was implemented**

- **`docs/QA_DRIVER_DOCUMENTS_4_7.md`:** manual matrix TMS → mobile (Realtime, pull-to-refresh, View, expired links, offline, POD upload when UI enabled), prerequisites, app paths, sign-off table.
- **Code consistency (4.4):** restored **`lib/loads/document-load-association.ts`**; wired into `fetch-load-documents`, `upload-load-document`, `useLoadDocumentsQuery`.
- **Tests:** `document-load-association.test.ts`, `fetch-load-documents.test.ts`, extended `upload-load-document` (wrong `load_id` in response).

**What is available**

- QA/PM can run staging checklist with explicit mobile paths.

**How to test**

- `npm run ci` — association and document suites green.
- **Manual QA (required for 4.7 sign-off):** follow **`docs/QA_DRIVER_DOCUMENTS_4_7.md`** section **A** (at least A1–A5):
  1. `npx expo start` → driver login → **My Loads** → assigned load with TMS documents.
  2. Upload a file in TMS **Documents** for that load.
  3. **Expected:** mobile **POD / Documents** shows the row within ~15s or after **pull down**; **View** opens the file.
  4. Delete in TMS → row disappears on mobile (Realtime or pull down).
- Driver upload (section **D**): only when TMS 4.1 and dev task **4.8** (UI) are enabled.

---

## 26 May 2026

### Task 1 — GPS v1 decision (dev 5.1)

**What was implemented**

- **`docs/GPS_V1_DECISION.md`:** v1 go with **foreground-only** location; background deferred to v1.1.
- **`lib/location/gps-v1-policy.ts`** + tests: single policy source (`foreground`, no background tracking).
- **`constants/strings.ts` → `location`:** legal disclaimer, denied-permission copy, share-location strings (for 5.2).
- **`app.json`:** **`expo-location`** plugin (Android background/foreground service **off**), iOS `NSLocationWhenInUseUsageDescription`, Android coarse/fine permissions.
- **`expo-location`** dependency (Expo SDK 54).
- **Route review:** `app/load/[id].tsx` normalizes id via `normalizeLoadIdParam` (same rule as documents); stack title from `strings.loadDetail.screenTitle`; drawer **My Loads** uses `strings.nav.loads`.

**What is available**

- GPS v1 policy documented and native permissions prepared; load-detail location UI follows in **5.2**.

**How to test**

- `npm run ci` — `gps-v1-policy` suite green.
- Read `docs/GPS_V1_DECISION.md` and `strings.location.disclaimer`.
- After native rebuild (`eas build` or dev client): iOS/Android prompt should request **While Using the App** / in-use location, not background.

### Task 2 — Share location on load detail (dev 5.2)

**What was implemented**

- **`LoadLocationSection`** on load detail (**Your location** card): disclaimer, current coordinates, **Share location** (native sheet with load reference + lat/lng + accuracy), **Open in Maps**, **Open Settings** when permission denied.
- **`lib/location/` layer:** `getForegroundPosition`, `format-coordinates`, `share-load-location`, `location-errors`.
- Hook **`useLoadLocationShare`**; wired in **`LoadDetailContent`** (after Route card).
- Tests: `format-coordinates`, `get-foreground-position`, `map-location-error`; `map-api-error` handles `LocationError`.

**What is available**

- On **My Loads** → assigned load detail, the driver can share GPS position with dispatch (SMS/email/system apps) with no background tracking.

**How to test**

- `npm run ci` — location suites green.
- **Physical device (not web):** login → **My Loads** → open load → **Your location** card → **Share location** → grant **While Using** → pick target app; message includes `#reference`, coordinates, and accuracy.
- **Expected:** coordinates shown on screen after share; **Open in Maps** opens map; if permission denied, banner + **Open Settings** button.

### Task 3 — Product rationale: Share location (GPS 5.2)

**What was documented**

Business rationale for **Share location** on load detail (complements dev **5.2**):

> Sharing from the app does not compete with WhatsApp: it uses WhatsApp (or another app) but pre-fills the message with the load and GPS coordinates so dispatch does not have to guess. Open in Maps is convenience; the product differentiator is load + coordinates in one step, and in the future seeing it in the TMS.

**What is available**

- No code change: clarification for the team, QA, and the client on why the flow uses the native share sheet (WhatsApp, SMS, etc.) and does not replace those apps.
- **Open in Maps:** shortcut after reading GPS; not the main value.
- **Future (5.3):** persist or show location in the TMS, not only in chat.

**How to test**

- No build required: read this entry and confirm with the business whether the current flow (message with `#reference` + coordinates) is enough for field ops before investing in a TMS API.

### Task 4 — TMS GPS location audit (dev 5.3)

**What was implemented**

- **`docs/GPS_TMS_INTEGRATION_5_3.md`:** TMS read-only review — **no** `POST /tracking/loads/…/locations` or per-load GPS table.
- **`lib/location/tms-location-integration.ts`:** `hasTrackingApi: false`, **`share_only`** mode; matrix of rejected routes (messages, wait-time, PATCH load notes, etc.).
- **`postDriverLocationToTms`:** stub that rejects until a TMS API exists; no invented Supabase migrations.
- **UI:** `strings.location.tmsShareOnlyHint` on **`LoadLocationSection`** (dispatch is not auto-notified in TMS; use Share).

**What is available**

- Drivers still share location with load context via **Share location** (5.2). TMS panel persistence waits for a dedicated route (proposal in the audit doc).

**How to test**

- `npm run ci` — `tms-location-integration`, `post-driver-location` suites.
- **App:** login → **My Loads** → load → **Your location** → share-only hint + **Share location** button.
- Read **`docs/GPS_TMS_INTEGRATION_5_3.md`** to align with TMS/client on a new API before 9 Jun.

---

## 28 May 2026

### Task 1 — Device QA and geo helpers (dev 5.4)

**What was implemented**

- **`docs/QA_DRIVER_LOCATION_5_4.md`:** manual matrix on a **physical device** (denied permission, Settings recovery, background resume, system GPS off, battery saver, Open in Maps).
- **`lib/location/geo.ts`:** lat/lng validation, `assertValidCoordinates`, `distanceMeters` (Haversine).
- **`lib/location/maps-url.ts`:** centralized `buildGoogleMapsUrl` (used by **`LoadLocationSection`**).
- **`lib/location/location-permission.ts`:** permission snapshot without re-prompt.
- **`getForegroundPosition`:** rejects out-of-range GPS readings.
- **`useLoadLocationShare`:** on screen focus and app `active`, clears denied state if permission was granted in Settings.
- Tests: `geo`, `maps-url`, `location-permission`; invalid-coordinates case in `get-foreground-position`.

**What is available**

- Same **Share location** UX (5.2) with stronger validation and recovery after Settings/background; checklist ready for field sign-off.

**How to test**

- `npm run ci` — location suites green.
- **Physical device:** follow **`docs/QA_DRIVER_LOCATION_5_4.md`** rows L1–L8 (minimum L1–L4 and L7).
- **Expected:** after enabling permission in Settings, **Open Settings** hides without restarting the app; invalid coordinates are not shown or shared.
- **Field sign-off (28 May):** Android + Expo Go — core flow OK (share, coordinates, Open in Maps).

### Task 2 — Reconnect hardening + GPS L5/L6 (dev 5.5)

**What was implemented**

- **Network (post-4.5):** silent profile refetch when cached (`isProfileGateLoading`); no Account error flash on transient network; debounced `QueryNetworkRecovery` (400 ms) with offline reset; query cancellation treated as network; `usePullToRefresh` 45 s watchdog; provider order `Network` → `Profile` → `Query`.
- **GPS L5:** system location off → banner + **Open Settings**; re-enable GPS and return → error clears without app restart.
- **GPS L6:** `expo-battery` + `lowPowerHint` when battery saver is on.
- **`docs/QA_NETWORK_RECONNECT_5_5.md`** (airplane mode matrix R1–R6).

**What is available**

- Wi‑Fi/mobile reconnect should not leave a stuck spinner or “No profile found”; location handles disabled GPS and battery saver with clear copy.

**How to test**

- `npm run ci`.
- **Network:** `docs/QA_NETWORK_RECONNECT_5_5.md`.
- **GPS L5:** Android Settings → turn off system **Location** → **Share location** → turn on → return to app.
- **GPS L6:** enable battery saver → **Share location** → italic hint visible; no crash.

### Task 3 — Client / TMS suggestion: Field actions (Bearer JWT)

**Context (device QA, 28 May)**

- On load detail (**Field actions**: _In transit_, _At pickup_, _Arrived To Hook Container_, etc.) buttons look **enabled**, but tapping shows **Session expired** with a message that TMS did not accept the session.
- Reproduced on multiple loads (e.g. `#TH-MPD2UMPC-K00H`, **Dispatched**); **not a single-load bug**.
- **My Loads**, login, and data reads **work** (direct to Supabase). Only actions that call the **TMS API** fail (`PATCH` status, and future POD upload).

**Technical cause (not fixed on mobile alone)**

- The mobile app already sends `Authorization: Bearer <access_token>` from Supabase on each `PATCH /api/dispatcher/loads/[id]/status`.
- TMS on the server (e.g. `tms.tigerhawklogistics.com`) often builds the Supabase client **from browser cookies only**. Expo does **not** share cookies with the TMS host → the API route returns **401** → no driver can change status from the app until the patch is deployed on the **TMS repo**.

**What must be done on TMS (live server deploy)**

Follow **`docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`** (TMS-ready copy):

1. **`lib/supabase/server.ts` — `createClient(request?)`**  
   When the `Authorization: Bearer …` header is present, forward it to Supabase in `global.headers` (in addition to cookies for the web).

2. **API routes used by mobile** — pass `request` to `createClient(request)`:
   - **`PATCH /api/dispatcher/loads/[id]/status`** (driver field actions) — **blocking today**.
   - **`POST /api/dispatcher/loads/[id]/documents`** (POD / Photo) — same prerequisite; see also `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md`.

3. **Post-deploy verification** (curl or app):
   - Mobile login as a driver on the same Supabase project as TMS.
   - Tap **In transit** (or another valid action) → status must update (**200**), not **401**.
   - Optional: `curl` with Bearer against `…/loads/{LOAD_ID}/status` (steps in the doc).

**Until the patch is in production**

- No driver can change status from Tigerhawk Mobile on **any** load.
- **Add driver photo** upload stays disabled in the UI until TMS **4.1** + Bearer (message already visible in the app).

**Client feedback requested**

> Please confirm whether to **prioritize** deploying the Bearer patch on TMS to enable **Field actions** (and later evidence upload) before close-out, or to **defer** mobile status changes and keep load viewing + Share location only for now.

**How to test (after TMS deploy)**

- Mobile: login → **My Loads** → **Dispatched** load → **Field actions** → **In transit** → no red banner; badge shows _In transit_; same status on TMS web panel.
- If still **401**: check that the build’s `EXPO_PUBLIC_TMS_API_URL` points to the host where the patch was applied.

### Task 4 — Production QA documents + actions (dev 5.6)

**What was implemented**

- **`docs/QA_PRODUCTION_SIGNOFF_5_6.md`:** single runbook for **production** TMS — documents §A–C + §E (association) + driver actions 3.7 §F; sign-off tables; Bearer patch notes (action rows 1–2 blocked until TMS deploy).
- **`npm run qa:5.6`:** preflight (`scripts/qa-preflight-5-6.mjs`) — lint, secret guard, focused Jest (documents, actions, network, routes).
- **`lib/qa/__tests__/load-detail-routes.test.ts`:** guards `app/load/[id].tsx` ↔ `useLoadDocumentsQuery` ↔ `LoadDocumentsSection` / `openLoadDocument`.
- Cross-links from `docs/QA_DRIVER_DOCUMENTS_4_7.md` and `docs/QA_DRIVER_ACTIONS_3_7.md`.

**What is available**

- QA/PM can run production sign-off without rebuilding checklists; dev automated preflight and documented the known **Field actions** Bearer blocker.

**How to test**

- `npm run qa:5.6` — 49 focused tests green.
- **Manual (QA/PM):** follow **`docs/QA_PRODUCTION_SIGNOFF_5_6.md`** on device + live TMS:
  1. Login → **My Loads** → assigned load → **POD / Documents**.
  2. TMS: upload PDF → row on mobile (A1); **View** opens file (A5).
  3. Airplane mode → banner + pull without infinite spinner (C1–C3).
  4. **Field actions:** rows 1–2 = **N/A** until Bearer patch; row 3 (holds) if a held load exists.
- **Expected:** documents rows Pass in doc tables; action rows 1–2 Fail/N/A until TMS.

### Task 5 — E2E smoke + TMS driver audit (dev 5.7)

**What was implemented**

- **`npm run smoke:5.7`:** full CI gate before release.
- **`docs/QA_SMOKE_E2E_5_7.md`:** manual smoke S1–S10 (login → loads → detail → documents → GPS → field actions → account → logout).
- **`docs/DRIVER_TMS_CAPABILITIES_5_7.md`:** TMS read-only audit: driver permissions, mobile v1 coverage, prioritized backlog (Bearer P0, upload P1, tap-to-call P2, itinerary/messages v1.1).
- **Refetch rate limits:** `foreground-refetch-throttle.ts` — foreground invalidate max every **30 s**; document refetch on focus max every **15 s** per load.
- Tests: `app-routes-smoke`, `foreground-refetch-throttle`.

**What is available**

- Week 5 code complete: automated smoke + driver capability guide for client prioritization before 9 Jun.

**How to test**

- `npm run smoke:5.7` — full CI green.
- **Manual (~10 min):** `docs/QA_SMOKE_E2E_5_7.md` on device + production TMS.
- Review **`docs/DRIVER_TMS_CAPABILITIES_5_7.md`** with client for Bearer + Week 6 upload vs P2 enhancements.

---

## June 1, 2026

### Task 1 — Driver upload + TMS Documents UI (dev 6.2)

**What was implemented**

- **Mobile:** `LoadDocumentsSection` enables **Add driver photo** via `PodUploadSection` + `useLoadDocumentUpload` (`document_type=Driver`); **Driver** rows use a soft orange background; no delete in the app; `access_token` in multipart as a fallback when the Bearer header is dropped.
- **TMS (external repo):** same `POST /api/dispatcher/loads/[id]/documents` as dispatch; mobile JWT via `admin.auth.getUser` + form `access_token`; middleware allows that POST; permission checks via service role; **Driver** type; `enrichLoadDocuments`; **Documents** tab orange rows, realtime on `load_documents`; dispatcher delete allowed.
- **Docs/SQL:** `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`, `supabase/sql-editor/DRIVER_DOCUMENT_UPLOAD_NOTES.sql`, `VERIFY_driver_tms_upload_prereqs.sql`.
- **Tests:** updated `document-upload-request`, `load-detail-routes`.

**What is available**

- Driver uploads from load detail; file shows on TMS **Documents** (orange row, Driver type) and on mobile without reload (Realtime + post-upload invalidation).
- Dispatcher deletes in TMS; driver can only view/open.

**How to test**

- `npm test -- --testPathPattern="document-upload|load-detail-routes"`.
- Local TMS: `npm run dev` (port 3000) with `SUPABASE_SERVICE_ROLE_KEY`; app `EXPO_PUBLIC_TMS_API_URL=http://localhost:3000` (physical device: LAN IP, not localhost). Or deploy to Netlify + same Supabase; run `enable_realtime_load_documents.sql` if needed.
- **Mobile:** driver login → **My Loads** → assigned load → **POD / Documents** → **Add driver photo** → upload → success message → new row (orange for Driver).
- **TMS:** same load → **Documents** tab → orange row, **Driver** type; delete via trash → row disappears on mobile without restart.
- **Expected:** upload **201**; no delete on mobile; sync both ways within seconds.

### Task 2 — Supabase Realtime: `loads` + `load_documents` in publication (dev 6.2)

**What was done (Supabase Dashboard → SQL Editor)**

- Ran `supabase/sql-editor/enable_realtime_pp2_driver_sync.sql` on the **Tigerhawk TMS** project (same Supabase as mobile and Netlify).
- Verification: final `SELECT` returned **2 rows** — `load_documents` and `loads` — in the **`supabase_realtime`** publication.

**Why (problem it fixes)**

- Rows **were** saved in `load_documents` (Table Editor), but TMS at [tigerhawk.netlify.app](https://tigerhawk.netlify.app) did **not** refresh the **Documents** tab after a mobile upload until a full page reload.
- **Realtime ≠ rows in the table:** the `supabase_realtime` publication is the WebSocket channel for INSERT/UPDATE/DELETE events. Without the table in that publication, TMS and mobile never get live notifications even when PostgreSQL writes succeed.
- Under **Database → Publications** there is no publication named `load_documents`; the table is **added inside** `supabase_realtime` (e.g. 4 → 5 tables).

**What it enables**

| Table | Live behavior |
|-------|----------------|
| **`load_documents`** | Driver photo → orange **Driver** row on TMS **Documents** without reload; dispatcher delete → row disappears on mobile immediately. |
| **`loads`** | Status/assignment changes on TMS or mobile propagate to lists and detail without manual pull-to-refresh. |

**TMS complement (external repo, commit `b88e523`)**

- Stable `useRealtimeRefresh` (callback ref) + `fetch` with `cache: 'no-store'` on **Documents** so the browser does not serve a stale list after an event.

**How to test**

1. Supabase → SQL Editor → run verification only:
   ```sql
   SELECT tablename FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
     AND tablename IN ('loads', 'load_documents') ORDER BY tablename;
   ```
   **Expected:** 2 rows.
2. **Mobile** (Expo Go, `EXPO_PUBLIC_TMS_API_URL=https://tigerhawk.netlify.app`) → driver → load → **Add driver photo** → upload.
3. **TMS** → same load → **Documents** tab **open** → orange **Driver** row within ~1–3 s without F5.
4. **TMS** → delete document → row disappears on mobile without restarting the app.
5. **Expected:** bidirectional sync within seconds; if TMS only fails, confirm Netlify deploy includes `b88e523`.

---

## June 2, 2026

### Task 1 — MIME/size validation and offline upload block (dev 6.3)

**What was implemented**

- **`lib/media/validate-driver-upload-file.ts`:** single pre-POST gate (image MIME only, 50 MB max, non-empty file); copy in `strings.loadDetail` (`driverUploadInvalidMime`, `driverUploadFileTooLarge`, `driverUploadEmptyFile`).
- **`PodUploadSection`:** validates after file size is resolved on pick; when offline, disables **Add driver photo** / **Upload** and shows `podOfflineHint` plus a network error if the user still tries.
- **`useLoadDocumentUpload`:** `assertOnlineForDocumentUpload()` + `validateDriverUploadFile` before Supabase/TMS.
- **`upload-driver-load-document.ts`:** same validator (no duplicate byte limit).
- **`lib/network/assert-online.ts`:** `assertOnlineForDocumentUpload` with `strings.network.offlineUploadBlocked`.
- **Tests:** `lib/media/__tests__/validate-driver-upload-file.test.ts`.

**What is available**

- Clear driver-facing errors for disallowed MIME, files over 50 MB, or empty files **before** upload starts.
- No photo upload while offline (consistent with offline v1 — no upload queue).

**How to test**

- `npm test -- --testPathPattern="validate-driver-upload-file"`.
- `npm run lint` (or `npm run ci` for the full gate).
- **Mobile:** driver login → **My Loads** → load → **POD / Documents** → **Add driver photo**.
  - **Offline:** airplane mode or no data → disabled control + hint «Connect to the internet…»; tap shows banner «Photo upload needs internet…».
  - **Valid file online:** same success path as 6.2 (row appears in list).
- **Expected:** rejected files never hit the network; offline blocks Supabase/TMS upload attempts.

### Task 2 — Driver upload E2E QA (dev 6.4)

**What was implemented**

- **Runbook:** `docs/QA_DRIVER_UPLOAD_E2E_6_4.md` — matrix D1–D10 (happy path, mobile→TMS, inverse Realtime on dispatcher delete, cancel/discard, offline, validation, permissions) + regression R1–R3.
- **Updates:** `docs/QA_DRIVER_DOCUMENTS_4_7.md` §D (upload enabled, current labels, `enable_realtime_pp2_driver_sync.sql`); `docs/QA_PRODUCTION_SIGNOFF_5_6.md` points to 6.4 instead of “Skip §D”.
- **Automated preflight:** `npm run qa:6.4` (`scripts/qa-preflight-6-4.mjs`) — lint, secret guard, **67 tests** (documents, upload, validation, routes, Realtime, hook + UI).
- **New tests:** `driver-upload-e2e-contract.test.ts`, `useLoadDocumentUpload.test.ts`, `PodUploadSection.test.tsx`; extended `load-detail-routes.test.ts`.

**What is available**

- Automated gate before manual upload QA; checklist ready for QA/PM and dispatcher visibility in TMS **Documents** (orange **Driver** row).

**How to test**

- `npm run qa:6.4` — all green.
- **Manual (~15 min):** `docs/QA_DRIVER_UPLOAD_E2E_6_4.md` — minimum **D1, D2, D4, D6, D7** on staging/production.
  - **D1:** **My Loads** → load → **Add driver photo** → **Upload photo** → success + orange row on mobile.
  - **D2:** TMS same load → **Documents** tab open → **Driver** row without F5.
  - **D3:** dispatcher delete → row disappears on mobile within seconds.
  - **D4/D5:** **Cancel** → **Discard** / **Keep photo** with no accidental upload.
- **Expected:** bidirectional sync; manual sign-off rows D* pending in runbook table.

### Task 3 — Business copy for driver upload (dev 6.5)

**What was implemented**

- **`constants/strings.ts`:** `driverEvidenceHint` covers **delivery**, **seal**, **damage**, **delay**, and **incidents**; `podConfirmHint` asks the driver to verify those cases before upload; `documentsNote` explains dispatch documents plus driver photo below.
- Removed unused **`podNote`**; confirmed no **`driverUploadTmsRequired`** or “TMS patch pending” copy remains.
- **`podPreviewA11y`:** “Preview of selected driver photo” (aligned with 6.1).
- **Tests:** `constants/__tests__/strings-driver-evidence.test.ts`; included in `npm run qa:6.4`.

**What is available**

- Drivers see when to upload (delivery, seal, incidents, delay) without TMS placeholder messaging.

**How to test**

- `npm test -- --testPathPattern="strings-driver-evidence"`.
- **Mobile:** **My Loads** → load → **POD / Documents** → read top note and **Driver photo (optional)** block → pick photo → confirm hint before **Upload photo**.
- **Expected:** clear English copy; no gray “TMS patch pending” text.

### Task 4 — Light resize/compress before driver photo upload (dev 6.6)

**What was implemented**

- **`expo-image-manipulator`** (Expo SDK 54).
- **`lib/media/driver-upload-image-policy.ts`:** max **1920 px** per edge, JPEG **0.82**, skip when ≤1.5 MB and already small.
- **`lib/media/prepare-driver-upload-image.ts`:** after pick, resize/compress (HEIC→JPEG, large photos); **web** and small photos unchanged.
- **`PodUploadSection`:** calls `prepareDriverUploadImage` before validate/preview.
- **Tests:** `prepare-driver-upload-image.test.ts`; contract and `PodUploadSection` updated.

**What is available**

- Lower memory and bandwidth on camera/gallery uploads; same one-file-at-a-time UX.

**How to test**

- `npm test -- --testPathPattern="prepare-driver-upload-image"`.
- `npm run lint`.
- **Mobile:** high-res camera photo → **Add driver photo** → preview → **Upload photo** → success; image still readable in TMS.
- **Expected:** faster upload on slow networks; no errors on already-small photos.

---

## June 3, 2026

### Task 1 — Formal release QA P0/P1 (dev 7.1)

**What was implemented**

- **`docs/QA_RELEASE_SIGNOFF_7_1.md`:** P0 (TMS Bearer) and P1 (driver upload) matrix; links to week 5–6 checklists; master sign-off table.
- **`npm run qa:7.1`:** lint + secrets + focused Jest (documents, upload, network, GPS, routes, release guards).
- **`lib/qa/__tests__/release-qa-preflight.test.ts`**
- Updated **`docs/DRIVER_TMS_CAPABILITIES_5_7.md`** P0/P1 status.

**How to test**

- `npm run qa:7.1` — all green.
- Manual: fill sign-off tables in `docs/QA_RELEASE_SIGNOFF_7_1.md` on device + production TMS.

### Task 2 — EAS Android build + release notes (dev 7.2)

**What was implemented**

- **`docs/RELEASE_NOTES_0_1_0.md`** for v0.1.0.
- **`npm run build:preflight`** — validates EAS config before build.
- **`docs/MOBILE_BUILDS.md`** — 7.1 → 7.2 flow; `preview` / `production` APK profiles.

**How to test**

- `npm run build:preflight`
- After Expo project + secrets: `npm run build:android:preview` → install APK → driver login smoke.

### Task 3 — Semver, changelog, README (dev 7.3)

**What was implemented**

- `CHANGELOG.md`, `docs/VERSIONING.md`, `docs/BUG_REPORTING.md`
- README: installation, env table, bug reporting; version **0.1.0** aligned

**How to test:** `npm test -- --testPathPattern="release-handoff-docs"`

### Task 4 — Rollback plan (dev 7.4)

**What was implemented:** `docs/ROLLBACK_PP2.md` (app, Supabase scripts, Realtime, TMS)

### Task 5 — EAS credentials handoff (dev 7.5)

**What was implemented:** `docs/EAS_CREDENTIALS_HANDOFF_7_5.md` (custody matrix, secrets, keystore checklist)

**How to test:** Fill ownership table with client; `npm run build:preflight` before first EAS build

### Task 6 — Why EAS custody and `projectId` matter (7.5 follow-up, client pending)

**What was documented**

- In this report (and `REPORTES_DIARIOS.md`), the **business rationale** for steps that `docs/EAS_CREDENTIALS_HANDOFF_7_5.md` intentionally leaves **unfilled in git** until the client handoff meeting.
- Dev task **7.5** delivered the template; what remains is **operational** (Expo accounts, owners, first build), not app source code.

**Why it matters — custody matrix (“Ownership matrix”)**

- The APK and, later, **Google Play** depend on assets **not stored in git**: Expo login, Android upload keystore (app signing identity), `EXPO_PUBLIC_*` EAS secrets, and who may run `eas build`.
- **Without a filled matrix**, if someone leaves the team tomorrow, **no one knows for sure** who holds the Expo password, where the keystore backup lives, or who can ship an update to Play Store. Losing the keystore means **you cannot update the same Play listing** (new package identity or a long Google support process).
- Agreed rule in the guide: the **client owns** production credentials; dev gets least privilege until handoff.

**Why it matters — `extra.eas.projectId` in `app.json`**

- EAS requires a **real UUID** from the project created on [expo.dev](https://expo.dev). That ID **links this repo** to the cloud project where APKs are built and where build **secrets** are stored.
- While the placeholder `REEMPLAZAR_TRAS_CREAR_PROYECTO_EN_EXPO_DEV` remains, `npm run build:preflight` warns and the first `eas build` does **not** target the client’s correct Expo project.
- The UUID is **not secret** (commit it after project creation); secrets, passwords, and `.jks` files are.

**Client pending (before first `eas build`)**

1. Create or link **Tigerhawk Mobile** (`pp2`) on expo.dev and set `projectId` in `app.json`.
2. Set EAS secrets (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_TMS_API_URL` with **public** TMS URL, not `localhost`).
3. Fill **Ownership matrix** in `docs/EAS_CREDENTIALS_HANDOFF_7_5.md` (names/roles, keystore backup location, Expo 2FA recovery).
4. Run `npm run build:android:preview` and archive the QA APK per `docs/MOBILE_BUILDS.md`.

**What is available**

- No change in Expo Go; drivers still test with `.env.local`. The **installable field APK** depends on the steps above.

**How to test**

- Review `docs/EAS_CREDENTIALS_HANDOFF_7_5.md` §1 and checklist §6 with PM/client.
- `npm run build:preflight` — confirm `projectId` warning is gone after the real UUID is set.
- After secrets + build: install APK → login → **My Loads** → upload smoke (same Supabase/TMS as QA 7.1).

### Task 7 — Support runbook (dev 7.6)

**What was implemented**

- **`docs/MOBILE_SUPPORT_RUNBOOK_7_6.md`:** L1 field → L2 app support → L3 engineering; **RLS** triage (empty list, `42501`, no policy revert without DBA); **Storage/documents** (expired signed URL, offline, 50 MB, TMS Bearer); TMS HTTP codes; Realtime; P0/P1 incident triggers; contacts table (fill at handoff).
- Linked from `docs/BUG_REPORTING.md` and README.

**What is available**

- No driver UI change; dispatch/QA get a post–v0.1.0 operations guide.

**How to test**

- `npm test -- --testPathPattern="release-handoff-docs"`.
- Walk through runbook with PM: “View expired” → pull-to-refresh; upload 403 → TMS patches section.

### Task 8 — v1.1 backlog (dev 7.7)

**What was implemented**

- **`docs/BACKLOG_V1_1_7_7.md`:** prioritized table (push, messages, wait time, geofencing, Maestro/Detox E2E, P2 tap-to-call/directions, offline-first, dynamic TMS rules); **live tracking** explicitly under **Week 8** (8.1–8.17); suggested v1.1 order + diagram; v0.1.0 code anchors; production P0/P1 called out separately.
- Cross-links to `docs/DRIVER_TMS_CAPABILITIES_5_7.md` and `PP2_TAREAS_DEV.md` Week 8.
- Extended `release-handoff-docs.test.ts` (7.6–7.7).

**Routes / code consistency review**

- `app-routes-smoke` and `load-detail-routes` tests — required routes and shared `normalizeLoadIdParam` on detail + document hooks.
- Load detail messages: `noMessages` placeholder only (no production mock); aligned with v1.1 backlog.

**How to test**

- `npm test -- --testPathPattern="release-handoff-docs|app-routes-smoke|load-detail-routes"`.
- `npm run lint`.
- Open `docs/BACKLOG_V1_1_7_7.md` and confirm Week 8 link in `PP2_TAREAS_DEV.md`.

---

## June 5, 2026

### Task 1 — HOT loads first on My Loads (P2 priority)

**What was implemented**

- **`lib/loads/sort-assigned-loads.ts`:** sort — HOT first, then `created_at` descending.
- **`fetch-driver-loads-page.ts`:** Supabase `.order('is_hot')` + `.order('created_at')` for correct pagination.
- **`useAssignedLoadsQuery`:** re-sort after dedupe (Realtime when dispatch toggles HOT).
- **`map-load-row.ts`:** `created_at` on list rows for tie-break.
- Tests: `sort-assigned-loads.test.ts`.

**What is available**

- On **My Loads**, urgent (TMS **Hot**) assignments appear **at the top**; existing orange badge/border unchanged.

**How to test**

- `npm test -- --testPathPattern="sort-assigned-loads"`.
- `npm run lint`.
- **Mobile:** mark an assigned load **Hot** in TMS → app **My Loads** → pull-to-refresh → HOT load moves to the top.

### Task 2 — Live GPS planning + TMS dev repository

**What was implemented**

- **`docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`**, **`docs/TMS_DEV_REPOSITORY.md`**, **`.cursor/rules/tms-dev-repository.mdc`**, **`AGENTS.md`** TMS dev section — TMS code edits only in `tigerhawk-tms-main`, not `PROYECTO_MUESTRA/`.
- **`PP2_TAREAS_DEV.md`:** condensed Week 8; v1.1 GPS priority; removed task **8.1** (written sign-off); fixed scope active trip + foreground.
- Updated `docs/BACKLOG_V1_1_7_7.md`, `README.md`, `release-handoff-docs` tests.

**What is available**

- No UI change; docs and rules for **8.4–8.13** (Supabase + mobile + TMS map).

**How to test**

- `npm test -- --testPathPattern="release-handoff-docs"`.
- Review `PP2_TAREAS_DEV.md` § Week 8 and `docs/TMS_DEV_REPOSITORY.md`.

### Task 3 — Additive Supabase GPS SQL (dev 8.4 / 8.5 / 8.6 scripts)

**What was implemented**

- **`supabase/sql-editor/20260605120000_pp2_driver_live_location_loads.sql`** (+ `supabase/migrations/` copy): nullable `current_*` / `last_seen_at` on `loads`; `last_seen_at` index; **new** RLS policy (no Staff DROP); trigger blocking non-GPS driver updates.
- **`VERIFY_pp2_driver_live_location.sql`**, **`enable_realtime_driver_tracking.sql`**; updated `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`, `docs/ROLLBACK_PP2.md`, `PP2_TAREAS_DEV.md`.

**What is available**

- **Not in app yet** until SQL is applied in Supabase and mobile **8.7–8.8**. Production TMS **unchanged** (nullable columns).

**How to test**

- Supabase → SQL Editor → run `20260605120000_pp2_driver_live_location_loads.sql` → then `VERIFY_pp2_driver_live_location.sql`.
- TMS smoke: dispatcher login → load list → detail (no GPS UI until 8.12).
- `npm test -- --testPathPattern="release-handoff-docs"`.

---

## June 10, 2026

### Task 1 — Wait time overage: spec + TMS audit (WT.1 / WT.2)

**What was implemented**

- **`docs/WAIT_TIME_OVERAGE_SPEC.md`** — rules: start on **Arrived At Delivery**, 60 min free, `delivery_wait` event, EN copy.
- **`docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md`** — API/table/trigger audit and Bearer driver patch plan.

**What is available**

- Product documentation ready for QA and TMS deploy.

**How to test**

- Review both docs and the WT table in `PP2_TAREAS_DEV.md`.

### Task 2 — Mobile Phase A + B: delivery wait timer (WT.3 / WT.5–WT.7)

**What was implemented**

- **`lib/wait-time/`** — constants, `timer-math`, Phase A mock (`EXPO_PUBLIC_WAIT_TIME_MOCK=1`).
- **`lib/tms/wait-time.ts`** — GET/POST/PATCH wait-time with Bearer.
- **`hooks/useDeliveryWaitTimer`** — auto start/stop on status; 1 s tick; 60 s API sync.
- **`components/loads/DeliveryWaitSection`** wired into **`LoadDetailContent`** / **`app/load/[id].tsx`**.
- **`constants/strings.ts`** → `waitTime.*`; tests `timer-math`, `wait-time`.

**What is available**

- On **load detail**, transitioning to **Arrived At Delivery** shows **Delivery wait time** card with live timer, *Free* / *Billable* / *Stopped* phases, and banner after 1 h.
- Demo mode: `EXPO_PUBLIC_WAIT_TIME_MOCK=1` (no API calls).

**How to test**

- `npm test -- --testPathPattern="timer-math|wait-time"`.
- **Mobile:** login → **My Loads** → detail → **Field actions** → **Arrived At Delivery** → see timer; with mock=1, *Demo mode* hint.
- **Phase B:** remove mock; after status change, verify TMS POST (`logged_by: driver`).

### Task 3 — TMS dev: Bearer API + panel + bell + toasts (WT.4 / WT.8–WT.12)

**What was implemented (TMS dev repo, Netlify deploy)**

- **`wait-time/route.ts`** — `getUserFromRequest`, assigned driver, open POST `start_time`, PATCH + `maybeNotifyWaitExceeded`.
- **`DeliveryWaitTimerPanel`** in **`LoadDetailPanel`** sidebar; demo `?waitMock=1`.
- **`NotificationBell`** — ⏳ billable wait alerts + Realtime on `waiting_time_events`.
- **`useWaitTimeAlerts`** + toasts in **`FloatingToasts`** (WT.12).

**What is available**

- Dispatcher sees sidebar timer on active wait; bell + toast after 1 h; link to **Waiting Time Audit**.

**How to test**

- TMS: **Dispatcher** → open load → sidebar **Delivery wait time**; demo with `?waitMock=1` in URL.
- Simulate **Arrived At Delivery** → timer; after 61 min (or dev adjustment) → bell + toast.
- Deploy TMS dev to Netlify before Phase B testing from APK.

### Task 4 — Realtime SQL + QA + backlog (WT.13–WT.15)

**What was implemented**

- **`supabase/sql-editor/enable_realtime_waiting_time_events.sql`** (idempotent).
- **`docs/QA_WAIT_TIME_OVERAGE.md`** — manual matrix mobile + TMS.
- **`PP2_TAREAS_DEV.md`** WT.1–WT.15 marked; **`docs/BACKLOG_V1_1_7_7.md`** wait time ✅.

**What is available**

- Realtime on panel/bell after SQL is applied in Supabase.

**How to test**

- SQL Editor → run `enable_realtime_waiting_time_events.sql`.
- Follow checklist in `docs/QA_WAIT_TIME_OVERAGE.md`.
- `npm run lint` in mobile repo.

---

## June 11, 2026

### Task 1 — Wait time QA: Supabase schema fixes + timer hardening

**What was implemented**

- **`supabase/sql-editor/fix_waiting_time_events_billing_columns.sql`** — aligns legacy columns (`billable`, `duration_minutes`, etc.), `event_name` CHECK (legacy + API), charge trigger.
- Fix for timer stuck at **0:00** (auto-start, TMS admin client, `actual_delivery` fallback).

**What is available**

- POST/PATCH wait-time persists to shared Supabase after running the SQL script.

**How to test**

- SQL Editor → full script → reload load at **Arrived At Delivery** → timer ticks with no schema cache errors.

### Task 2 — Mobile: End wait time button + double-tap guards

**What was implemented**

- **`DeliveryWaitSection`** — **End wait time** button (closes event without status change).
- **`lib/tms/wait-time.ts`** → `endOpenDeliveryWaitEvent`.
- **`DriverActionBar`** / **`useDriverStatusChange`** — in-flight lock; skip same status; cross-lock timer ↔ field actions.
- **`lib/wait-time/hydrate-timer-state.ts`** — UI prefers `waiting_time_events`; refresh on screen focus.

**What is available**

- Stop timer from mobile; prevents duplicate **Delivered** / **End wait time** from rapid QA taps.

**How to test**

- `npm test -- --testPathPattern="hydrate-timer|wait-time"`.
- Mobile: **Arrived At Delivery** → **End wait time** → **Stopped**; status unchanged; double tap does not duplicate audit rows.

### Task 3 — TMS: Billing tab charge on wait event close

**What was implemented (TMS dev repo)**

- **`lib/wait-time/sync-load-billing.ts`** — idempotent `load_billing` Detention upsert when closed event has `charge_amount > 0`.
- **`wait-time/route.ts`** POST/PATCH and **`status/route.ts`** on Completed — dedupe via `[wte:{id}]` tag.

**What is available**

- After **>60 min** and closing the timer, load **Billing** tab shows **Detention** without waiting for **Completed**.

**How to test**

- Local TMS + schema SQL → simulate **>60 min** wait → **End wait time** or **Delivered** → **Billing** → Detention line; **Waiting Time Audit** matches.

---

## June 15, 2026

### Task 1 — TMS patches: dev branch version update and Netlify deploy (~2 h 30 min)

**What was done**

- Consolidated and applied **TMS patches** in the dev repo (`tigerhawk-tms-main`) so the deployed version matches the mobile app:
  - **`wait-time/route.ts`** — **Bearer JWT** for drivers (`getUserFromRequest`), open POST events, PATCH close, 60 min notifications.
  - **`sync-load-billing.ts`** — idempotent **`load_billing`** upsert (**Detention**) on close with charge; dedupe tag `[wte:{id}]`.
  - **`notify-exceeded.ts`** + **NotificationBell** / **useWaitTimeAlerts** — dispatcher bell and toasts.
  - **`DeliveryWaitTimerPanel`** — sidebar timer in **LoadDetailPanel** + **Waiting Time Audit** link.
- **Netlify deploy** prep: env vars, Next.js build clean on new routes.
- Post-deploy smoke: dispatcher sidebar timer; mobile **Arrived At Delivery** → POST visible in TMS.

**What is available**

- Deployable TMS dev with full **wait time Phase B** (not only `?waitMock=1` demo).
- Automatic **Billing** tab line when a chargeable wait closes.

**How to test**

- TMS dispatcher → active load → sidebar timer; audit after close.
- Mobile (no mock): **Arrived At Delivery** → timer; TMS event within 60 s.

---

### Task 2 — API route security hardening (~2 h)

**What was done**

- **Bearer JWT** pattern per **`docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`**:
  - **`get-user-from-request.ts`**, **`server.ts`** with `Authorization` header.
  - **Middleware** — no premature 401 on `/api/*` when Bearer is present.
- Mobile routes audited: **status PATCH**, **documents POST**, **wait-time GET/POST/PATCH**.
- Assigned-driver checks (`driver_id = auth.uid()`); upload limits unchanged.

**What is available**

- Fewer **401 Unauthorized** errors on Field actions and photo upload from APK.

**How to test**

- APK with public `EXPO_PUBLIC_TMS_API_URL` → login → Field actions + photo upload without “Session expired”.

---

### Task 3 — Supabase SQL and `waiting_time_events` schema (~1 h 30 min)

**What was done**

- QA errors: missing `billable`, `duration_minutes`; `event_name` CHECK vs legacy/`delivery_wait`.
- **`fix_waiting_time_events_billing_columns.sql`** and **`enable_realtime_waiting_time_events.sql`** prepared and documented.
- RLS review: driver writes via TMS API admin client only.

**How to test**

- SQL Editor → full script → **Arrived At Delivery** → no schema cache errors.

---

### Task 4 — Mobile wait timer hardening (~1 h 30 min)

**What was done**

- **`hydrate-timer-state.ts`** — prefer `waiting_time_events` over `actual_delivery` fallback.
- **`useDeliveryWaitTimer`** — auto-start on mount, 60 s API sync, focus refresh.
- **`endOpenDeliveryWaitEvent`** + network error copy.
- Regression tests: hydrate, timer-math, wait-time contract.

**How to test**

- `npm test -- --testPathPattern="hydrate-timer|wait-time|timer-math"`.
- Leave and return to load detail → timer continues from DB.

---

### Task 5 — Technical documentation (~30 min)

- Cross-refs: **`TMS_PATCH_WT_DRIVER_WAIT_TIME.md`**, **`QA_WAIT_TIME_OVERAGE.md`**, **`MOBILE_API.md`**.
- Deploy order: **SQL → TMS Netlify → EAS env**.

---

---

## June 16, 2026

### Task 1 — Real-time mobile ↔ TMS sync: lower latency (~2 h 30 min)

**What was done**

- Improved **mobile ↔ TMS ↔ Supabase** channel so status, documents, and wait time update without manual reload:
  - **`driver-loads-subscription.ts`** — Postgres subscriptions with optimistic React Query patches; 300 ms debounce.
  - **`useDriverLoadsRealtime`** — Realtime + **5 s poll fallback** while app is active.
  - **`foreground-refetch-throttle`** — balance freshness and battery on resume.
  - **`refetch-active-driver-loads`** — cross-invalidate list / detail / documents.
  - **`syncSupabaseRealtimeAuth`** — resubscribe on JWT refresh.
- Wait timer refresh on **focus** of load detail screen.

**What is available**

- TMS status change → mobile updates in **seconds**, not minutes.
- TMS closes wait → mobile shows **Stopped** without mandatory pull-to-refresh.

**How to test**

- Two devices: dispatcher changes status → mobile detail updates ≤ 5–10 s.

---

### Task 2 — Network error on Field actions: root cause and fix (~1 h 30 min)

**What was done**

- **“Network request failed”** on physical devices traced to **`EXPO_PUBLIC_TMS_API_URL`** pointing at LAN `192.168.x.x:3000`.
- Fixed to **`https://tigerhawk.netlify.app`**; documented that TMS `NEXT_PUBLIC_APP_URL` does not replace Expo env in mobile builds.
- **`npm run eas:push-env`** — pushed Supabase + TMS URL to EAS project `@likaon1606/pp2`.

**How to test**

- Correct env → **Arrived At Delivery** → no network error.

---

### Task 3 — EAS Android APK cloud build (~2 h)

**What was done**

- **EAS Build** from Windows: **`eas.json`** preview/production APK profiles, **`build:preflight`**, cloud build, **`app.json`** projectId and scheme.

**What is available**

- Installable Android APK without Expo Go, targeting Supabase + public TMS.

---

### Task 4 — Wait time + anti-double-tap integration QA (~1 h 30 min)

**What was done**

- Regression: cross-lock timer ↔ field actions, **End wait time**, **`QA_WAIT_TIME_OVERAGE.md`** matrix.
- Tests: `npm test -- --testPathPattern="hydrate-timer|wait-time|driver-status"`.

---

### Task 5 — Samsara API architecture prep (initial spike) (~30 min)

**What was done**

- Client Q2: production **Samsara**; geofence auto check-out interest.
- Extension points: **`status/route.ts`**, wait-time close hooks, future **`lib/integrations/samsara/`**.
- **WT.23** scoped in **`PP2_TAREAS_DEV.md`**; aligned with **GPS live tracking** Week 8.

---

## June 17, 2026

### Task 1 — Wait time Q&A analysis + next steps for client (Week 9)

**What was implemented**

- Detailed review of **`PREGUNTAS_CLIENTE.md`** against mobile code and TMS dev (editable repo).
- Internal doc **`RESPUESTAS_CLIENTE.md`** (**RESPUESTAS EN ESPAÑOL** + **ANSWERS IN ENGLISH**).
- Reformatted **`PREGUNTAS_CLIENTE.md`** (readability only; wording unchanged).
- New tasks in **`PP2_TAREAS_DEV.md`** — **Week 9 (WT.16–WT.26, DOC.1–2, UI.1)**.

**What is available**

- No app code change; **documentation and work plan** ready to align with the client before the next iteration.

**How to test**

- Review `RESPUESTAS_CLIENTE.md`, `PREGUNTAS_CLIENTE.md`, and Week 9 table in `PP2_TAREAS_DEV.md`.
- Get client answers on open questions below before implementing WT.17, WT.22, WT.25, and UI.1.

---

### Task 2 — Client-facing document — Next steps Tigerhawk Mobile + TMS

**Suggested subject:** *Tigerhawk Mobile — wait time summary, next steps, and pending confirmations*

Dear team,

Thank you for your answers in **`PREGUNTAS_CLIENTE.md`**. Below is what we aligned on, what we will build next, and **confirmations we need** to avoid rework.

#### What you already confirmed (and how we read it)

| Topic | Your answer | Technical implication |
|-------|-------------|------------------------|
| BOL / POD / In-Gate image | **Photo description when uploading**, not timer trigger | Timer is **not** tied to document type; mobile type picker can follow in a later phase |
| Wait time scope | **Delivery only** (slow customer unload); port/depot **not billable** | Single `delivery_wait` event per load |
| Timers | **One only** (delivery) | No parallel pickup/return timers |
| Free time | **60 minutes** at delivery | Minute 61+ becomes billable (A/R + driver pay via TMS) |
| Check In | Present for **customer unload** | “Arrived and waiting to unload” |
| Check Out | **Service complete** | Ends billable wait |
| Actor | **Driver manual** | In-app buttons; no Samsara automation in v1.1 |
| Stop timer | **End Wait Time** first; also Delivered, Out-Gate, GPS, etc., with **note** if still running | End wait + Delivered done; Out-Gate/GPS + audit notes pending |
| Samsara / geofence | Production uses API; interest in auto check-out | **v1.2+** roadmap; does not block current timer delivery |
| Photo permissions | Agreed to remove frustrating blocks | Clear messages if camera/gallery denied |

**Current product state (~80% of agreed flow):**

- Mobile: timer on load detail, starts on **Arrived At Delivery**, stops with **End wait time** or **Delivered**, alert after 1 h.
- TMS (dev branch): **Delivery wait time** panel, wait-time API, bell + toasts; **Detention** line on Billing when a chargeable event closes.
- **Deploy pending:** TMS patches on Netlify + SQL scripts on shared Supabase (`waiting_time_events`).

#### Proposed next steps

| Phase | Target | Deliverable |
|-------|--------|-------------|
| **1. Infrastructure** | Immediate | Deploy TMS dev (wait-time + billing sync); run Supabase SQL; verify `EXPO_PUBLIC_TMS_API_URL` on APK builds |
| **2. Business rules** | After phase 1 | Update written spec (`WAIT_TIME_OVERAGE_SPEC`) with confirmed rules |
| **3. Closures & audit** | Week 9 | On **Delivered** / **Dropped - Loaded** / **Out-Gate** upload with open timer: close event + **note** in history if still running |
| **4. Driver UX** | Week 9 | **Check In / Check Out** labels (or confirm **Arrived At Delivery** is enough); read-only **accrued time / pay** on mobile |
| **5. Documents** | Week 9 | Upload type picker (BOL, POD, In-Gate…); clear camera permission UX |
| **6. Future** | v1.2+ | **Samsara + geofence** spike for auto check-out and dispatch alert |

#### Confirmations we need from you

Please reply when convenient (a short line per item is enough):

**Q4 — User interface**  
We proposed TigerHawk branding (dark sidebar, orange accent). For drivers on the road we recommend **light background on lists/detail** and dark chrome only on login/account.  
→ **Do you confirm this approach or do you want dark theme across the entire app?**

**Q5 — Wait timer and driver pay**  
We plan timer + TMS billing integration and, optionally, showing **accrued wait time and estimated pay** on mobile to motivate drivers before payday.  
→ **Do you want that pay summary on the driver app? What exactly should they see (wait time only, base pay, total)?**

**Q7 — What action starts wait time?**  
The questionnaire had no explicit answer. From Q12–15 we assume **Check In = start**.  
→ **Which action should start the delivery wait timer?** (see implicit Q7 below)

**Q7 (implicit) — Is “Arrived At Delivery” enough or an explicit “Check In” button?**  
Today the timer starts when status changes to **Arrived At Delivery**.  
→ **Is that sufficient or do you prefer an explicit “Check In” button** (same backend effect, different driver-facing label)?

**Q11 — Detention vs Wait Time on customer invoice**  
In TMS, data lives in `waiting_time_events`; on close with charge, Billing may show **Detention**. The catalog also has “Wait Time” as an accessorial.  
→ **Should the customer invoice say “Detention”, “Wait time”, or are they one concept with a single name?**  
→ We confirm: **port/terminal wait is not billed**; only slow customer delivery.

---

**Internal refs:** `RESPUESTAS_CLIENTE.md`, `PP2_TAREAS_DEV.md` (Week 9), `PREGUNTAS_CLIENTE.md`.

---

### Task 3 — Week 9 planning in `PP2_TAREAS_DEV.md` (~1 h)

**What was done**

- Tasks **WT.16–WT.26**, **DOC.1–2**, **UI.1** with suggested order: deploy/SQL → spec → secondary closures → driver UX → documents → Samsara spike.
- Updated confirmed wait-time business rules.

---

### Task 4 — Mobile + TMS dev prep for Samsara integration (~1 h)

**What was done**

- Future contract design (no prod credentials yet): webhook placeholder, server-only env vars, links to **WT.18** / **WT.23**.
- Mobile unchanged for now; GPS v1 **share_only** coexists with future live tracking.

**What is available**

- Architecture ready; implementation pending credentials and client confirmation.

---

### Task 5 — Administrative close-out (~30 min)

**What was done**

- Verified consistency across **`REPORTES_DIARIOS.md`**, **`DAILY_REPORTS.md`**, **`RESPUESTAS_CLIENTE.md`**, and **`PP2_TAREAS_DEV.md`**.

---

## June 18, 2026

### Task 1 — Light TigerHawk theme (UI.1) (~2 h)

**What was done**

- Client confirmed **light theme** for driver daytime visibility: *“do a light version of our theme please”*.
- `constants/theme.ts`: `PP2Theme.colors.tms` updated from dark chrome to light palette (`#F4F6F8` background, white drawer/headers, `#E8700A` accent).
- Drawer, headers, login, account, `BrandHeader`, and UI primitives aligned to light theme.
- New `components/ui/AppActionSheet.tsx` — light bottom sheet for POD photo picker and discard confirm (replaces `Alert.alert` in `PodUploadSection`).
- Updated `.cursor/rules/pp2-ui-style.mdc` and **UI.1** in `PP2_TAREAS_DEV.md`.

**How to test**

1. `npm start` → login: light background, white card, TigerHawk orange primary button.
2. Drawer: white menu, orange active item; white header with dark title.
3. Load detail → **Add driver photo** → light sheet (Camera / Gallery / Cancel); cancel preview → discard sheet.
4. `npm test -- --testPathPattern=PodUploadSection`

---

### Task 2 — Documents without 1h expiry (DOC.3) (~1 h)

**What was done**

- Removed **1-hour** signed URLs for load documents (`load-documents` bucket).
- **TMS** (`tigerhawk-tms-main`): `lib/load-documents/resolve-document-url.ts`; upload + GET routes use ~10-year TTL from `storage_path`.
- **Mobile:** `lib/loads/resolve-load-document-url.ts` — list/upload resolve long-lived URLs (no stale DB `url`).
- Fixes *“This download link has expired”* when tapping **View** on older loads.

**How to test**

1. Deploy TMS dev Netlify with these changes.
2. Mobile app → load detail with document older than 1 h → **View** opens PDF.
3. Upload driver photo → visible in TMS Documents and vice versa.
4. `npm test -- --testPathPattern=fetch-load-documents`

---

### Task 3 — Manual wait time start/stop (WT.27) (~2 h)

**What was done**

- Wait time **manual start only**; **End wait time** as primary stop; no auto-start on status change or auto-stop on **Delivered**.
- `hooks/useDeliveryWaitTimer.ts`: removed auto-start/stop effects; exposed `startTimer`, `canStart`, `visible`.
- `components/loads/DeliveryWaitSection.tsx`: **Start wait time** button (accent) before the timer; elapsed shown only after manual start.
- `lib/wait-time/hydrate-timer-state.ts`: no longer infers start from `actual_delivery` without an API event.
- `lib/wait-time/constants.ts`: `isDeliveryWaitEligibleStatus`; legacy helpers marked deprecated.
- `constants/strings.ts`: EN copy `startWaitTime`, `startWaitTimeHint`, `startWaitTimeA11y`.
- Tests: `hydrate-timer-state`, `DeliveryWaitSection`, `useDeliveryWaitTimer`.
- **WT.27** marked complete in `PP2_TAREAS_DEV.md`.

**SUPABASE DB REQUIRES NO CHANGES** — uses existing `waiting_time_events` table/API; POST/PATCH via TMS Bearer with no new migrations.

**How to test**

1. `EXPO_PUBLIC_WAIT_TIME_MOCK=1` → load detail at **Arrived At Delivery** → **Delivery wait time** card with **Start wait time** (no timer until tapped).
2. Tap **Start wait time** → timer runs; **End wait time** stops it without changing load status.
3. Change status to **Delivered** while timer active → timer **keeps running** (no auto-stop).
4. `npm test -- --testPathPattern="DeliveryWaitSection|useDeliveryWaitTimer|hydrate-timer"`

---

### Task 4 — Updated wait time spec (WT.34) (~1 h)

**What was done**

- Rewrote **`docs/WAIT_TIME_OVERAGE_SPEC.md`**: delivery-only scope, single timer, 60 min free, Check In/Out semantics, **`opciones_driver.png`** = document types (not timer), rules A–E, mobile/TMS code map, phases and backlog (WT.28–31, DOC.1).
- **`docs/QA_WAIT_TIME_OVERAGE.md`**: matrix aligned to manual start/stop (**WT.27**); rows 2/2b, 7/7a, 10.
- **`lib/wait-time/constants.ts`**: spec cross-reference.
- **WT.34** marked complete in `PP2_TAREAS_DEV.md`.

**SUPABASE DB REQUIRES NO CHANGES** — documentation task; runtime still uses existing `waiting_time_events`.

**How to test**

1. Read `docs/WAIT_TIME_OVERAGE_SPEC.md` and compare with mobile flow at **Arrived At Delivery**.
2. Run **`docs/QA_WAIT_TIME_OVERAGE.md`** matrix rows 2, 2b, 7, 7a.
3. `npm test -- --testPathPattern="wait-time|hydrate-timer|DeliveryWaitSection"`

---

## June 19, 2026

### Task 1 — Supabase wait time schema + Realtime (WT.20) (~45 min)

**What was done**

- Applied on shared Supabase (TigerhawkTMS):
  - `supabase/sql-editor/fix_waiting_time_events_billing_columns.sql` — billing/API columns, `event_name` CHECK (`delivery_wait`), `trg_compute_wait_charges` trigger.
  - `supabase/sql-editor/enable_realtime_waiting_time_events.sql` — Realtime on `waiting_time_events`.
- New `supabase/sql-editor/VERIFY_pp2_waiting_time_events.sql` — post-apply verification.
- New `scripts/apply-wt20-wait-time.mjs` + `npm run db:apply-wt20` (Supabase CLI `--linked` or `--pg` mode).
- **WT.20** marked complete in `PP2_TAREAS_DEV.md`; absorbs **WT.13**.

**How to test**

1. `npm run db:apply-wt20` (idempotent; requires Supabase CLI login + linked project).
2. SQL Editor or CLI: `VERIFY_pp2_waiting_time_events.sql` — key columns + Realtime publication.
3. Mobile → **Start wait time** → TMS dispatcher panel updates without refresh (Phase B).
4. `npm test -- --testPathPattern="wait-time"`

---

### Task 2 — Driver wait pay panel (WT.22) (~1 h 30 min)

**What was done**

- Read-only **Your wait pay** panel inside **Delivery wait time** on load detail.
- `lib/wait-time/wait-pay-summary.ts`: sums closed `delivery_wait` `driver_pay_amount` + live estimate for open timer (Postgres trigger formula: minutes × `driver_rate_per_hour`, default $75/h).
- `components/loads/DeliveryWaitPaySummary.tsx`: accrued time + estimated pay; hint while running / read-only when stopped.
- `hooks/useDeliveryWaitTimer.ts`: `events` from GET wait-time; exposes `paySummary`; refresh after start/stop/sync.
- `constants/strings.ts`: EN copy for pay panel labels and hints.
- Tests: `wait-pay-summary.test.ts`, extended `DeliveryWaitSection.test.tsx`.
- **WT.22** marked complete in `PP2_TAREAS_DEV.md`; `docs/WAIT_TIME_OVERAGE_SPEC.md` updated.

**Supabase DB: no changes required** — uses `driver_pay_amount` / `driver_rate_per_hour` columns from **WT.20**.

**How to test**

1. Load at **Arrived At Delivery** with prior wait events → card shows **Accrued wait time** + **Estimated wait pay**.
2. **Start wait time** → pay updates live (mock: `EXPO_PUBLIC_WAIT_TIME_MOCK=1`).
3. **End wait time** → panel keeps totals; read-only hint.
4. `npm test -- --testPathPattern="wait-pay|DeliveryWaitSection|useDeliveryWaitTimer"`

---

### Task 3 — Invoice label Detention vs Wait time (WT.25) (~45 min)

**What was done**

- Q11 decision documented: **one concept** — customer invoice **Detention**; driver app **Wait time**.
- New `docs/WAIT_TIME_INVOICE_LABEL.md` (rationale, audience table, QA, override path).
- **TMS dev:** `lib/wait-time/invoice-labels.ts`; `sync-load-billing.ts` — **Delivery detention — N min billable…** description; `status/route.ts` aligned; `sync-load-billing.test.ts`.
- Updated `docs/WAIT_TIME_OVERAGE_SPEC.md`, `docs/QA_WAIT_TIME_OVERAGE.md` §7b, `RESPUESTAS_CLIENTE.md` § Q11; **WT.25** complete in `PP2_TAREAS_DEV.md`.

**Supabase DB: no changes required** — `load_billing` copy only for new/chosed events after TMS deploy.

**How to test**

1. Deploy TMS dev → close billable `delivery_wait` → **Billing** tab: **Detention** + **Delivery detention** description.
2. Mobile driver copy remains **Wait time** (unchanged).
3. TMS repo: `npm test -- --testPathPattern=sync-load-billing`

---

### Task 4 — Samsara geofence stub + mock (WT.23) (~1 h 30 min)

**What was done**

- New **`docs/SAMSARA_GEOFENCE_SPIKE.md`** + **`docs/QA_SAMSARA_GEOFENCE_MOCK.md`** — flow, env, mock QA, steps when Samsara credentials arrive.
- **TMS dev (deploy to Netlify):**
  - `lib/wait-time/close-open-delivery-wait.ts` — reusable open `delivery_wait` close.
  - `lib/integrations/samsara/*` — parse, handler, config, optional webhook signature.
  - `POST /api/integrations/samsara/simulate` — mock geofence exit → closes wait + `activity_log`.
  - `POST /api/integrations/samsara/webhook` — placeholder (503 until `SAMSARA_ENABLED=true`).
  - `GET …/webhook` — integration status (`pendingSamsaraApi: true`).
  - Tests `samsara-geofence.test.ts`.
- **WT.23** in `PP2_TAREAS_DEV.md`: stub ✅ · **pending live Samsara API** (prod backport + credentials).
- **Mobile:** no code changes (auto-stop is server-side).

**Supabase DB: no changes required**

**How to test**

1. Deploy TMS dev + optional `SAMSARA_MOCK_ALLOW_SIMULATE=true`.
2. Mobile → **Start wait time** on an open load.
3. TMS staff → `POST …/api/integrations/samsara/simulate` with `loadId` → wait closed.
4. Check TMS panel + `activity_log` `delivery_wait_geofence_auto_stop`.
5. TMS: `npm test -- lib/integrations/samsara/__tests__/samsara-geofence.test.ts`

---

## June 22, 2026

### Task 1 — Supabase live GPS applied + review 8.4 / 8.5 / 8.6 (~45 min)

**What was done**

- **Applied on shared Supabase** (prod TMS + mobile), in order:
  1. `supabase/sql-editor/20260605120000_pp2_driver_live_location_loads.sql` — **8.4 + 8.5**
  2. `supabase/sql-editor/VERIFY_pp2_driver_live_location.sql` — verification
  3. `supabase/sql-editor/enable_realtime_driver_tracking.sql` — **8.6**
- **Best-practice review:** additive script (`IF NOT EXISTS`), new RLS policy (no Staff DROP), `SECURITY DEFINER` trigger + `search_path`, partial index on `last_seen_at`, identical copy in `supabase/migrations/`.
- **Preventive fix:** trigger `pp2_enforce_driver_location_update` also excludes `updated_at` (avoids false reject if DB auto-updates timestamp on UPDATE). Optional patch: `fix_pp2_driver_location_trigger_updated_at.sql`.
- **8.4, 8.5, 8.6** marked ✅ in `PP2_TAREAS_DEV.md`; updated `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`, `docs/TMS_DEV_REPOSITORY.md`, `docs/ROLLBACK_PP2.md`.

**What is available**

- Schema ready for GPS phase 0; `current_*` columns stay **NULL** until mobile **8.7–8.8**. Prod TMS **unchanged visually** (live map = **8.12**).

**Production impact**

- Additive only: does not break current TMS or app. Driver status still via TMS API (no direct `loads` UPDATE except future GPS).

**How to test**

1. SQL Editor → `VERIFY_pp2_driver_live_location.sql`: 4 nullable columns, policy `Drivers update live location on assigned loads`, trigger guard, `loads` in Realtime.
2. Optional: re-run `fix_pp2_driver_location_trigger_updated_at.sql` if trigger was applied before the `updated_at` patch.
3. TMS smoke: dispatcher login → load list → load detail (same behavior as before).
4. `npm test -- --testPathPattern="release-handoff-docs"`.
5. `npm run check:daily-reports`.

**Next code task:** **8.8** — `useDriverLocationTracking` (mobile).

---

### Task 2 — Mobile live GPS policy (8.7) (~45 min)

**What was done**

- New **`lib/location/tracking-policy.ts`**: 30–60 s interval (45 s default), active trip statuses (`Dispatched` + `DRIVER_FIELD_STATUSES`; excludes `Assigned` / `Completed` / `Cancelled`), **25 m** movement threshold to skip redundant pings, 60 s heartbeat, `buildLiveTrackingLoadUpdate` payload → Supabase `loads.current_*` columns.
- TMS surfaces documented: `load_detail` + `dispatcher_board` (implementation **8.12–8.13**).
- Exported from `lib/location/index.ts`; `LOAD_LIVE_LOCATION_COLUMNS` in `lib/supabase/schema/driver-loads.ts`.
- Tests **`lib/location/__tests__/tracking-policy.test.ts`**; **8.7** ✅ in `PP2_TAREAS_DEV.md`.

**What is available**

- No visible UI change yet; rules ready for hook **8.8** and banner **8.9**.

**Supabase DB: no changes required** — uses columns from **8.4–8.6** already applied.

**How to test**

1. `npm test -- --testPathPattern="tracking-policy"`.
2. `npm run lint`.
3. Review `LIVE_TRACKING_ACTIVE_STATUSES` includes **In Transit** / **Arrived At Delivery** and excludes **Assigned**.

**Next:** **8.8** — `useDriverLocationTracking`.

---

### Task 3 — Live GPS hook + Supabase persistence (8.8) (~1 h)

**What was done**

- **`lib/supabase/queries/update-load-live-location.ts`** — `UPDATE` on `loads.current_*` via driver RLS (GPS columns only).
- **`hooks/useDriverLocationTracking.ts`** — 45 s loop on focused load detail; stops on background/offline; retries when back online; uses `tracking-policy` (25 m threshold, active statuses).
- Wired in **`app/load/[id].tsx`** (side effect when detail is open).
- Tests: `update-load-live-location.test.ts`, `useDriverLocationTracking.test.ts`.
- **8.8** ✅ in `PP2_TAREAS_DEV.md`.

**What is available**

- On active trip load (**In Transit**, **Arrived At Delivery**, etc.) with GPS permission, app sends pings to Supabase while load detail is open. No visible banner yet (**8.9**). TMS map marker still pending (**8.12**).

**Supabase DB:** uses columns from **8.4–8.6** (already applied).

**How to test**

1. `npm test -- --testPathPattern="useDriverLocationTracking|update-load-live-location"`.
2. **Mobile:** login → **My Loads** → **In Transit** load → grant location → keep detail open ~1 min → Supabase Table Editor `loads` → `current_latitude` / `last_seen_at` updated.
3. Background the app → pings stop; return → resume.

**Next:** **8.9** — “Sharing location with dispatch” banner.

---

### Task 4 — Detention: explicit Check In / Check Out buttons (client feedback)

**What was done**

- Copy aligned to Lucas/Nico feedback (**Q12–15**): **`Check In`** (starts wait + **detention billing**) and **`Check Out`** (service complete at customer).
- Section renamed **Delivery wait & detention**; billable phase **Billable detention**; banner mentions detention.
- **Placement:** `DeliveryWaitSection` moved to **sticky footer** above **Field actions** (`app/load/[id].tsx`) — flow: **Arrived At Delivery** → **Check In** → work → **Check Out**.
- Updated `docs/WAIT_TIME_OVERAGE_SPEC.md`, tests `DeliveryWaitSection.test.tsx`.

**What is available**

- At **Arrived At Delivery**, driver sees orange **Check In** above field actions; after check-in, timer + **Check Out**. No auto-start on status change (WT.27).

**How to test**

1. `npm test -- --testPathPattern="DeliveryWaitSection"`.
2. **Mobile:** load at **Arrived At Delivery** → footer shows **Check In** → tap → timer runs → **Check Out** stops without status change.
3. TMS: POST wait-time only after **Check In**; Billing **Detention** when billable event closes (WT.24/25).

---

### Task 5 — Live GPS banner (8.9) (~30 min)

**What was done**

- **`components/loads/LiveLocationTrackingBanner.tsx`** — *Sharing location with dispatch* banner + *Last sent* / offline / permission states; top of load detail.
- **`lib/location/format-last-sent-at.ts`** — *Just now* / *N min ago* formatting.
- Copy in **`strings.location.liveTracking*`**; manual share hint updated (`tmsShareOnlyHint`).
- Wired via **`useDriverLocationTracking`** in `LoadDetailContent`.
- Tests: `LiveLocationTrackingBanner.test.tsx`, `format-last-sent-at.test.ts`.
- **8.9** ✅ in `PP2_TAREAS_DEV.md`.

**How to test**

1. `npm test -- --testPathPattern="LiveLocationTrackingBanner|format-last-sent"`.
2. **Mobile:** **In Transit** load → open detail → orange *Sharing location with dispatch* banner → *Last sent: Just now* after ~45 s.
3. Deny GPS → *Location needed for dispatch* banner + **Open Settings**.

**Next:** **8.12** — driver marker on TMS map.

---

### Task 6 — Live GPS marker on TMS map (8.12) (~45 min)

**What was done** (TMS dev repo, not mobile)

- **`lib/live-tracking/driver-location.ts`** — parse `current_*`, `formatLastSeenAt`, active statuses.
- **`hooks/useLoadLiveLocation.ts`** — Realtime `loads` UPDATE subscription filtered by `load_id`.
- **`components/maps/LoadSidebarMap.tsx`** — blue **Driver** marker + *Last seen* tooltip.
- **`components/dispatcher/LoadDetailPanel.tsx`** — wiring + legend under map.
- **`types/dispatcher.ts`** — `current_latitude`, `current_longitude`, `last_seen_at`, `location_accuracy_m` columns.
- Tests: `lib/live-tracking/__tests__/driver-location.test.ts`.
- **8.12** ✅ in `PP2_TAREAS_DEV.md`.

**How to test**

1. TMS dev: `npm test -- lib/live-tracking/__tests__/driver-location.test.ts` + `npm run lint`.
2. **Mobile:** driver on **In Transit** load with detail open (pings ~45 s).
3. **TMS:** dispatcher → open same load → sidebar map → blue **Driver** dot moves; legend shows *Just now* / *N min ago*.
4. Supabase: confirm `loads.current_latitude` / `last_seen_at` updating.

**Next:** **8.13** — last position on dispatcher board.

---

### Task 7 — Driver Last Seen column + TMS build fixes (8.13) (~30 min)

**What was done** (TMS dev repo)

- **8.12 fix:** `LoadSidebarMap` — explicit `dynamic<InnerMapProps>` typing for `boundsPoints` (avoids TS deploy error).
- **Netlify build fix:** `parse-geofence-event.ts` — safe access to `geofence.name` / `vehicle.id`.
- **8.13:** **Driver Last Seen** column in `LoadsTable` + `column-config.ts`; click opens load detail (live map).
- **`getDriverLastSeenLabel`** in `lib/live-tracking/driver-location.ts`.
- **8.13** ✅ in `PP2_TAREAS_DEV.md`.

**How to test**

1. TMS: `npm run build` (full TypeScript must pass).
2. Dispatcher → table → **Driver Last Seen** column on **In Transit** loads with mobile pings.
3. Click *Just now* → detail panel with blue driver marker on map.

**Next:** **8.16** — QA marker &lt; 60 s.

---

### Task 8 — Live GPS QA (8.16) (~30 min)

**What was done**

- **`docs/QA_DRIVER_LIVE_TRACKING.md`** — E2E checklist: phone → Supabase → TMS map + **Driver Last Seen** within **≤ 60 s**; matrix G1–G9, SQL query, regression, sign-off.
- **8.16** ✅ in `PP2_TAREAS_DEV.md`.

**How to test**

1. Follow matrix **G1** in `docs/QA_DRIVER_LIVE_TRACKING.md`.
2. `npm test -- --testPathPattern="tracking-policy|LiveLocationTrackingBanner|driver-location"`.

**Next:** **8.17** — daily report closing GPS phase 0.

---

## June 24, 2026

### Task 1 — e-POD auto-stop wait timer (WT.28) (~45 min)

**What was done** (TMS dev repo)

- **`lib/wait-time/handle-pod-signed-submitted.ts`** — closes open `delivery_wait` via `closeOpenDeliveryWaitEvent`; logs `activity_log` action `pod_signed_submitted` (idempotent per event).
- **Upload hook:** `process-load-document-upload.ts` calls the handler when form `document_type=POD` (includes mobile if it sends POD before driver normalization to `Driver`).
- **API:** `POST /api/dispatcher/loads/[id]/pod-signed` — Bearer/cookie auth; staff or assigned driver (`resolveWaitTimeAccess`).
- Tests **`lib/wait-time/__tests__/handle-pod-signed-submitted.test.ts`** (5 cases).
- Docs: `docs/WAIT_TIME_OVERAGE_SPEC.md` rule **C** ✅, `docs/QA_WAIT_TIME_OVERAGE.md` row **7c**, `docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md` § WT.28, **WT.28** ✅ in `PP2_TAREAS_DEV.md`.

**Supabase:** No changes required

**How to test**

1. TMS dev: `npm test -- lib/wait-time/__tests__/handle-pod-signed-submitted.test.ts`.
2. Mobile or TMS → load with active **Check In** (timer running).
3. TMS dispatcher → **Documents** → upload file with type **POD** → confirm `waiting_time_events.end_time` set and wait panel stopped.
4. Optional: `POST …/api/dispatcher/loads/{id}/pod-signed` with driver Bearer → `{ "closed": true, "event_id": "…" }`.
5. Supabase → `activity_log` row `pod_signed_submitted` on the closed wait event.
6. Regression: mobile **Driver** photo upload must **not** close the timer (POD / pod-signed API only).

**Next:** **WT.29** — 45 min detention warning email.

---

### Task 2 — Customer email at 45 min detention (WT.29) (~45 min)

**What was done** (TMS dev repo)

- **`lib/wait-time/notify-detention-warning-45.ts`** — when open `delivery_wait` ≥ **45 min**, sends **`detention_warning_45`** to `customers.email` via Resend (`sendTemplateEmail`).
- **Idempotency:** `activity_log` on the event (`detention_warning_45_email_sent` / `_failed` / `_skipped_no_recipient` / `_skipped_inactive_template`).
- **Trigger:** `PATCH`/`POST` `…/api/dispatcher/loads/[id]/wait-time` (~60 s mobile sync); duration uses `max(duration_minutes, now − start_time)` for open events.
- **SQL:** `supabase/sql-editor/seed_detention_warning_45_email_template.sql` — seed template in Supabase.
- Tests **`notify-detention-warning-45.test.ts`** (7 cases); **WT.29** ✅ in `PP2_TAREAS_DEV.md`.

**Supabase:** run `seed_detention_warning_45_email_template.sql` in SQL Editor (existing `email_templates` table).

**How to test**

1. SQL Editor → run seed → `SELECT template_key FROM email_templates WHERE template_key = 'detention_warning_45'`.
2. TMS dev deployed with `RESEND_API_KEY`; load with `customers.email` set.
3. Mobile → **Check In** → wait or simulate ≥ 45 min → wait-time PATCH (auto ~60 s).
4. Customer inbox + `activity_log` `detention_warning_45_email_sent`.
5. Second PATCH → no resend (idempotent).
6. `npm test -- lib/wait-time/__tests__/notify-detention-warning-45.test.ts`.

**Next:** **WT.30** — `detention_started` email at 60 min.

---

## June 25, 2026

### Task 1 — Detention emails 60 min + close + cron (WT.30–WT.32) (~2 h)

**What was done** (TMS dev repo)

- **WT.30:** `notify-detention-started.ts` — **`detention_started`** template when **60 min** free time exceeded; idempotent via `activity_log`.
- **WT.31:** `notify-detention-completed.ts` — **`detention_completed`** on wait close (minutes/charge summary + billing validity copy); hooks in `close-open-delivery-wait.ts` and wait-time PATCH.
- **WT.32:** `process-open-delivery-wait-emails.ts` + **`POST /api/cron/wait-time-detention-emails`** (every 5 min in `vercel.json`); syncs `duration_minutes` from server clock when mobile offline.
- Shared module **`detention-email-shared.ts`** + orchestrator **`notify-delivery-wait-customer-emails.ts`**.
- Tests **`detention-emails-wt30-33.test.ts`** (22 wait-time tests total).

**Supabase:** run `supabase/sql-editor/seed_detention_started_completed_email_templates.sql` (existing `email_templates` table).

**How to test**

1. SQL Editor → WT.30–31 seed → verify `detention_started` and `detention_completed`.
2. TMS with `RESEND_API_KEY` + load with `customers.email`.
3. Check In → simulate ≥ 60 min → **detention_started** email + `detention_started_email_sent` log.
4. Check Out → **detention_completed** email + `detention_completed_email_sent` log.
5. Cron: `POST /api/cron/wait-time-detention-emails` with `Authorization: Bearer $CRON_SECRET`.
6. `npm test -- lib/wait-time/__tests__/`

---

### Task 2 — Detention email client config (WT.33) (~30 min)

**What was done**

- TMS env: `DETENTION_EMAIL_TIMEZONE` (default `America/New_York`), `DETENTION_EMAIL_CC`, `DETENTION_FORGOTTEN_TIMER_MAX_MINUTES` (default 480).
- Forgotten-timer alert: `activity_log` `delivery_wait_forgotten_timer_alert` (once per event).
- **`docs/DETENTION_EMAIL_CLIENT_CONFIG.md`** — recipients, timezone, cron, SQL.

**Supabase:** No schema changes required (WT.30–31 template SQL only if not yet applied).

**How to test**

1. Open wait > 8 h (or lower `DETENTION_FORGOTTEN_TIMER_MAX_MINUTES` in dev) → `activity_log` alert row.
2. Optional: `DETENTION_EMAIL_CC=dispatch@example.com` → CC on Resend emails.

---

### Task 3 — Wait time block documentation close (WT.35) (~20 min)

**What was done**

- **WT.30–35** ✅ in `PP2_TAREAS_DEV.md`.
- Updated `docs/WAIT_TIME_OVERAGE_SPEC.md`, `docs/QA_WAIT_TIME_OVERAGE.md`, `docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md`, `CHANGELOG.md`.

**How to test**

1. `npm run check:daily-reports`.
2. Review QA matrix rows **7e–7g** in `docs/QA_WAIT_TIME_OVERAGE.md`.

**Next:** **OFF.2** offline queue · **WT.23** live Samsara · **DOC.1–2**.

---

*When closing each day, add a `## [date]` section **in chronological order** (below the latest date in the file) with **Task 1, Task 2, Task 3…** top to bottom. Never Task 8 before Task 7. Run `npm run check:daily-reports` before commit.*
