# Port Pro (mobile) — Task list (English)

This document is the **English translation** of:

- `PORTPRO_TAREAS_CLIENTE.md` — client tasks (~1 week)
- `PORTPRO_TAREAS_DEV.md` — developer tasks (8 weeks × 8 tasks)

Spanish originals remain the reference if wording ever diverges.

---

## Part 1 — Client tasks (~1 week)

**Goal of this phase:** have the **“Port Pro” mobile app** (product name) ready to kick off, with **initial design and UI markup** supported by Claude, **without** standing up a new backend or database (the **same Supabase project** as the TigerHawk TMS is reused).

When this list is complete, the client hands off to the developer: a **new repository**, **marked-up code**, **minimal documentation**, and **written product decisions**.

### If something feels too technical

That is completely fine. If at any point environment, Supabase, or API work feels **too technical** or outside your strengths, you may **focus comfortably on designing and marking up screens** (flows, styles, navigation with test data). **Backend wiring**, sensitive environment variables, and fine-tuning against the TMS can be left to the **developer**, who will pick them up gladly using the context you provide in the README and in `HANDOFF_DEV.md`. The important thing is to keep moving: solid design and a clear handoff are already a huge contribution.

---

### Days 1–2: Scope and environment

1. **Confirm mobile MVP scope** (1–2 pages): what the driver does in the first version (e.g. login, list of assigned loads, load detail, **field** status actions aligned with the web TMS **Driver** subset, load messages, photo/POD if the business requires it). Avoid “the whole roadmap” from `docs/driver_app_roadmap.md` in the first drop. **Do not** include in the MVP: customer portal (`/portal`), full dispatch, finance, payroll, or admin (see `PORTPRO_DOCUMENTACION.md` §3.3).
2. **Create a dedicated Git repo** for the app (suggested names: `port-pro-mobile` or `tigerhawk-port-pro`). Add a `README.md` with the product goal and a link to this plan.
3. **Initialize the project** with the stack the technical team recommends: **Expo (React Native) + TypeScript + Expo Router** (aligned with `docs/driver_app_roadmap.md`). Typical command: `npx create-expo-app@latest` with tabs or blank template, as Claude prefers.
4. **Define “Port Pro” identity**: on-screen name, Expo slug, primary/secondary colors, typography (even if provisional). Capture decisions in `DESIGN_TOKENS.md` or a README section.

---

### Days 3–4: Design and markup with Claude

5. **Wireframes or Figma** (optional but strongly recommended): flows login → home → load detail → confirmation. If there is no Figma, add **screenshots or a numbered screen list** in the repo (`docs/UX_SCREENS.md`).
6. **Master prompt for Claude**: include business context (drayage, Houston), stack (Expo, TypeScript), a clear rule **not** to embed `SUPABASE_SERVICE_ROLE_KEY` in the app, and the MVP screen list. You can follow the “Project Context” idea from `docs/Claude_Prompt_Templates.md`, adapted for React Native.
7. **Mark up MVP screens with Claude**: layouts, navigation, visual components, empty and error states — **UI only** (data can be mocks/local JSON). If you mock **POD upload**, label it in the handoff as **“requires TMS API work”** (today server-side document `POST` only allows `admin`/`dispatcher`; the developer will extend the path — see `PORTPRO_DOCUMENTACION.md` §3.4).
8. **Assets**: app icon, splash, Expo favicon; placeholders if final design is not ready.

---

### Day 5: Minimal “fake data” integration and handoff

9. **Mock data layer**: e.g. `src/mocks/` with TypeScript types aligned with what the developer will wire later (loads, statuses, user). Document in `docs/DATA_CONTRACT.md` which fields each screen expects.
10. **Environment variables**: `.env.example` in the mobile repo with **only** intended public keys, for example:
    - `EXPO_PUBLIC_SUPABASE_URL`
    - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
    - (optional later) `EXPO_PUBLIC_TMS_API_URL` if Next.js is used as a BFF.  
    **Do not** commit `.env` with secrets.
11. **Developer handoff checklist** (`HANDOFF_DEV.md`): Node/npm versions, `npm run start`, list of completed screens, known limitations (“Claude left X unfinished”), and fix priority.
12. **Smoke build**: `npx expo start` and, if possible, a preview **EAS Build** or at least an [expo.dev](https://expo.dev) project created (no obligation to publish to stores).

---

### “Ready to hand to the developer” criteria

- The project **runs in Expo Go** or a simulator without build errors.
- MVP screen navigation **works** with mocks.
- README + `.env.example` + `HANDOFF_DEV.md` are **complete**.
- MVP decisions are **scoped** (what is in / out of v1).

---

### References in the TigerHawk monorepo (read-only for the client)

- Driver app technical roadmap: `docs/driver_app_roadmap.md`
- Web TMS and Supabase (domain context): `README_SPANISH.md`, `README_STEPS_NEXTS.md`
- Prompt templates (adapt to RN): `docs/Claude_Prompt_Templates.md`
- **What the TMS does for the driver today (screen reference):** `components/dispatcher/DriverActionPanel.tsx` (status actions on load detail). Do **not** copy web “Dispatcher” buttons into the mobile design.
- **What is not Port Pro mobile:** the **customer portal** (`app/portal/`) is a different role and product; do not mix shipper customer flows into the driver app.

If the client needs legal/brand alignment (“Port Pro” vs internal TigerHawk naming), document it in the mobile repo README.

---

## Part 2 — Developer tasks

**Format rule:** in **each week** (Week 1 … Week 8) there are **exactly 8 tasks**, numbered **N.1** through **N.8**. That is eight distinct deliverables per week, not one generic task per week. Order is suggested; some tasks may overlap in time.

**Premise:** same **Supabase** as the web TMS; no separate backend unless a **BFF** in Next.js is required for secrets or logic that must not live in the mobile client.

---

### Week 1 — Repository, Supabase, and security

| # | Task |
|---|------|
| 1.1 | Clone/open the mobile repo from the client; audit dependencies (`package.json`), strict TypeScript, `app/` structure (Expo Router). |
| 1.2 | Connect `@supabase/supabase-js` with `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`; exercise `getSession` / auth listener on a device. |
| 1.3 | Review **RLS** and roles for the “driver” role (or equivalent) on tables the app will use: read `docs/RLS_SECURITY_REVIEW_T22.md` and compare with `supabase/migrations/`; note gaps. |
| 1.4 | Implement real **login** (email/magic link or OAuth per TMS); Expo **auth** deep linking ([scheme in `app.json`](https://docs.expo.dev/guides/authentication/#supabase)). |
| 1.5 | **TMS ↔ mobile audit (read-only + doc):** review `components/dispatcher/DriverActionPanel.tsx`, `app/api/dispatcher/loads/[id]/status/route.ts`, and `documents/route.ts` (POST today is `admin`/`dispatcher` only). Write findings in `docs/MOBILE_API.md`. |
| 1.6 | Replace mocks on **one pilot screen** with the **first real Supabase query** (user profile or minimal list of the driver’s loads). |
| 1.7 | Define `lib/supabase/client.ts` and hooks (`useAuth`, `useProfile`) aligned with the web monorepo style, with no sensitive logic in the client. |
| 1.8 | **CI and secrets:** workflow running `lint` + `tsc --noEmit` (e.g. GitHub Actions, see `docs/GitHub_Setup_Guide.md`); written matrix that **`SUPABASE_SERVICE_ROLE_KEY` never** ships in the app and which operations would go to the Next.js BFF if RLS is insufficient. |

---

### Week 2 — “Loads” domain and stable navigation

| # | Task |
|---|------|
| 2.1 | Map Supabase tables/views for “loads” / driver assignments (real names in the current schema). |
| 2.2 | Implement assigned-loads list with pagination or sensible limits; loading, error, and retry handling. |
| 2.3 | Load detail screen: master data and status; cross-check `docs/DISPATCHER_API_ROUTES.md` where relevant. |
| 2.4 | Add **pull-to-refresh** and cache invalidation (e.g. TanStack Query, as in `docs/driver_app_roadmap.md`). |
| 2.5 | Fix **vibe coding** debt: fragile components, `any`, inconsistent styles from markup. |
| 2.6 | **Unit tests** for formatting helpers (dates, statuses, labels) and DB → UI mappers. |
| 2.7 | **Hook tests** with mocked Supabase data (MSW or client mock). |
| 2.8 | Finish `docs/MOBILE_API.md`: what the app reads directly from Supabase vs what it calls under `app/api/` on the TMS. |

---

### Week 3 — Driver actions and server-side validation

| # | Task |
|---|------|
| 3.1 | Wire status changes to the web contract: **`PATCH /api/dispatcher/loads/[id]/status`** with body `{ status }` (reference `DriverActionPanel.tsx`). |
| 3.2 | On **mobile UI**, expose **only** transitions from the web panel’s **Driver** subset; do not show dispatch or terminal actions unless the business explicitly decides otherwise. |
| 3.3 | If needed: **harden** `status/route.ts` so `role === "driver"` cannot submit staff-only transitions even if they appear on the default map. |
| 3.4 | Error messages aligned with HTTP/PostgREST; clear UX for **403** and **`ACTIVE_HOLDS`** (see `README_STEPS_NEXTS.md`). |
| 3.5 | **Optimistic UI** only where safe; rollback on failure. Minimal **telemetry** in dev (and Sentry or similar in staging if the project uses it). |
| 3.6 | Unit tests for the action layer (pure functions and validation of payloads sent to the API). |
| 3.7 | Manual cross-testing with the web **Driver Action Panel** (same user and load); short **accessibility** review (touch target size, contrast). |
| 3.8 | Update the client’s `HANDOFF_DEV.md` with changes versus the initial markup. |

---

### Week 4 — Documents / photos and limits

| # | Task |
|---|------|
| 4.1 | **Backend / TMS:** close the POD gap — today `POST` on `app/api/dispatcher/loads/[id]/documents/route.ts` is `admin`/`dispatcher` only. Choose and implement **(A)** extend that POST to the assigned driver, **(B)** Storage + RLS + insert into `load_documents`, or **(C)** a dedicated route; keep size rules (e.g. 50 MB) aligned with the current route. |
| 4.2 | **Mobile:** integrate **expo-image-picker** (or camera) against the path chosen in task 4.1; confirmation and cancel flows. |
| 4.3 | Validate **max size** and MIME types on the client before upload; consistent with bucket and TMS policies. |
| 4.4 | Verify each file is **linked** to the correct `load_id` and the agreed documents table/view. |
| 4.5 | Basic **offline** handling: “no connection” message or a simple queue (do not promise full offline v1). |
| 4.6 | Unit tests for **FormData** / metadata preparation (with mocks). |
| 4.7 | **Manual QA** for documents: successful upload, cancel, network error, oversized file. |
| 4.8 | Review Storage **costs** / Supabase quotas and document policies in `docs/STORAGE_RLS.md`. |

---

### Week 5 — Location (if in MVP)

| # | Task |
|---|------|
| 5.1 | **Go/no-go** with the business: foreground-only location vs background (iOS/Android permissions and legal copy). |
| 5.2 | Integrate `expo-location` for **current position** on the load screen or a “share location” action. |
| 5.3 | If applicable: persist points in an existing table or via the TMS API (no ad-hoc migrations without review). |
| 5.4 | Tests on a **real device**: battery, permission denied, recovery after returning to the app. |
| 5.5 | Unit tests for geospatial helpers (distance, coordinate formatting). |
| 5.6 | If there is a map: geocoding criteria aligned with `README_SPANISH.md` / Nominatim (usage policy). |
| 5.7 | **Limitation** copy and disclaimer for the end user. |
| 5.8 | If location is **not** in MVP: record tasks 5.2–5.7 as deferred in `HANDOFF_DEV.md` or the backlog, with a reason. |

---

### Week 6 — Notifications and realtime (optional v1)

| # | Task |
|---|------|
| 6.1 | Evaluate **Expo Push** and where to register tokens (Supabase or other) without duplicating TMS email logic. |
| 6.2 | Try **Supabase Realtime** on a channel relevant to the driver (if RLS allows). |
| 6.3 | Implement subscription with **cleanup** on unmount and reconnection handling. |
| 6.4 | **Staging** tests with at least two devices or sessions. |
| 6.5 | Light integration tests or **E2E** (Maestro/Detox) for a minimal flow: login + load list. |
| 6.6 | Client-side **rate limiting** hardening (avoid refetch loops). |
| 6.7 | Re-read `README_STEPS_NEXTS.md` on web realtime as **product context** only; do not merge repos. |
| 6.8 | Document **EAS Build**: Expo project, Apple/Google credentials for internal builds. |

---

### Week 7 — Quality, E2E, and performance

| # | Task |
|---|------|
| 7.1 | Increase **unit test** coverage on critical modules (auth, loads, uploads). |
| 7.2 | Expand **E2E** to the happy path agreed with QA (beyond the week 6 minimum). |
| 7.3 | Profile **lists** (`FlatList`: windowSize, stable keys, avoid unnecessary re-renders). |
| 7.4 | **Image** policy: compress/resize before POD upload for memory and bandwidth. |
| 7.5 | Run checklist derived from **`README_PRUEBAS.md`** and the **Testing Plan** (phases applicable to mobile). |
| 7.6 | Formal **QA** session with logged findings (issues or signed checklist). |
| 7.7 | Close **P0** and **P1** items from QA. |
| 7.8 | Produce an **internal build** (TestFlight / Play Internal) with readable release notes for the client. |

---

### Week 8 — Release closure and operations

| # | Task |
|---|------|
| 8.1 | **Semver** version, **changelog**, and Git **tag** for the release. |
| 8.2 | Final **README**: setup, variables, bug-reporting channel. |
| 8.3 | **Rollback** plan and list of **Supabase migrations** touched by the app or TMS for Port Pro. |
| 8.4 | Hand over **keystores / EAS credentials** to the product owner (client) with clear custody. |
| 8.5 | Short **support** doc: escalation for RLS, Storage, Port Houston (only if the app uses it). |
| 8.6 | Brief **post-mortem**: actual hours vs plan, accepted technical debt. |
| 8.7 | Prioritized **v1.1 backlog** (advanced messaging, offline-first, geofencing, etc., per `docs/driver_app_roadmap.md`). |
| 8.8 | **Handoff** to the client: build links, accounts, and this file updated with per-task status (✅ / ⏳). |

---

### Notes (developer)

- The **Word** files at the **repo root** — `TigerHawk_TMS_Technical_Handoff.docx` and `TigerHawk_TMS_Testing_Plan.docx` — are the source of truth for **functional parity** with the TMS; `README_STEPS_NEXTS.md` and `README_PRUEBAS.md` are an index and operational checklist, not a substitute for the full `.docx` content.
- **Web deploy** for the team favors **Netlify** per project rules; the mobile app uses **EAS / stores**, independent of Next.js hosting.
- **Code map → mobile** (exclusions, POD gap, driver panel): see **`PORTPRO_DOCUMENTACION.md` §3** after the TigerHawk monorepo review.
