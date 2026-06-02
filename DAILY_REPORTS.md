# Daily reports — PP2 mobile

Log of **product-relevant** progress: new features, integrations (login, Supabase, TMS API), automated tests, AI agents, installable builds, etc.

**Do not log here:** renames, documentation-only edits with no code, cosmetic refactors.

**Do not mention `PROYECTO_MUESTRA/`** in this file (or paths under that folder). Refer to the web TMS as **“TMS”**, **“TMS API”**, or HTTP routes (`/api/dispatcher/…`); technical detail lives in `docs/` (`MOBILE_API.md`, `TMS_PATCH_*.md`).

**Format:** one date section per day; under it **Task 1**, **Task 2**, **Task 3**, … in **strict ascending numeric order** (1 before 2, 2 before 3; **never** place Task 7 before Task 4). The new entry for the day is always the **next** free number and goes **right after** the last numbered task for that date—not at the end of the file if that breaks order within the date.

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

*When closing each day, add a `## [date]` section with **Task 1, Task 2, Task 3…** top to bottom (e.g. dev 4.6 → Task 7, dev 4.7 → Task 8). Never Task 8 before Task 7.*
