# PP2 — Driver mobile app

**React Native + Expo** field driver app connected to the **same Supabase project** as the TigerHawk TMS (reference in `PROYECTO_MUESTRA/`). No separate backend: data and auth via Supabase; privileged operations via the TMS Next.js API when required.

## Guidelines for agents and developers

- **Product name:** PP2 (`pp2-mobile`, Expo slug `pp2`).
- **`PROYECTO_MUESTRA/`:** TMS web reference — **do not modify** (see `AGENTS.md`).
- **UI language:** all user-facing app strings in **English** (`constants/strings.ts`).
- **Daily log:** document functional changes in `REPORTES_DIARIOS.md` (Spanish) and `DAILY_REPORTS.md` (English) — see directive at the top of those files.

## Planning docs

| File | Content |
|------|---------|
| `PP2_DOCUMENTACION.md` | Architecture, estimates, TMS → mobile map |
| `PP2_TAREAS_CLIENTE.md` | Client / mock phase tasks |
| `PP2_TAREAS_DEV.md` | Developer tasks (8 weeks) |
| `PP2_TASKS.md` | Same in English |
| `docs/MVP_SCOPE.md` | v1 scope |
| `docs/UX_SCREENS.md` | Flows and screens |
| `docs/DATA_CONTRACT.md` | Mock → Supabase fields |
| `docs/RLS_MOBILE_REVIEW.md` | Driver RLS review |
| `docs/MOBILE_API.md` | TMS ↔ mobile: Supabase vs Next API (task 1.5) |
| `docs/SUPABASE_LAYER.md` | Supabase client, hooks, security (task 1.7) |
| `docs/SECRETS_AND_BFF.md` | Secrets matrix + TMS BFF routing (task 1.8) |
| `docs/LOADS_DATA_MAP.md` | Supabase tables/columns for driver loads (task 2.1) |
| `docs/GitHub_Setup_Guide.md` | GitHub & CI for this repo (task 1.8) |
| `docs/SUPABASE_AUTH_REDIRECTS.md` | Magic-link redirect URLs |
| `docs/MOBILE_BUILDS.md` | **Android APK / iOS** — EAS env, Realtime, test driver on device |

## Requirements

- **Node.js** 20 LTS or newer  
- **npm** 10+  
- **Android Studio** (emulator) or Android device with [Expo Go](https://expo.dev/go)  
- [expo.dev](https://expo.dev) account for EAS Build (optional)  
- **macOS + Xcode** only if building iOS locally  

## Setup

```bash
cd proyecto_PP2_app_mobile
npm install
```

### Environment variables

Use **`.env.local`** at the repo root (shared with the TMS).

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_TMS_API_URL=http://localhost:3000
```

Template: `.env.example`.

**Never** ship in the mobile app: `SUPABASE_SERVICE_ROLE_KEY`, Port Houston secrets, `RESEND_API_KEY`, etc.

### Supabase redirect URLs (task 1.4)

For magic-link login, register redirect URLs in Supabase — see `docs/SUPABASE_AUTH_REDIRECTS.md`.

## Local development

```bash
npm start          # Expo dev server (QR for Expo Go)
npm run android    # Open Android emulator
npm run lint       # TypeScript check
npm test           # Jest unit tests
npm run ci         # lint + secret guard + tests (same as CI)
npm run check:secrets  # fail if privileged keys in client code
```

**Screens:** Loads, Account; login at `/(auth)/login`; load detail at `/load/[id]`.

### Auth for testing

1. **Test driver:** `driver_test@test.com` / `Driver01*` — create with `npm run db:seed-driver-test`, assign loads with `npm run db:assign-driver-test-loads` (3 loads) or `npm run db:assign-driver-test-loads:pagination` (21 loads for infinite-scroll QA). If too many were assigned earlier: `npm run db:trim-driver-test-loads` (keeps 21). **Live updates from TMS:** ensure `loads` is in Supabase Realtime (`supabase/sql-editor/enable_realtime_loads.sql`).
2. **TMS drivers:** any user with `user_profiles.role = driver` and loads assigned in the TMS.
3. **Magic link:** “Email me a sign-in link” (requires redirect URLs in Supabase).

The app uses **Supabase data only** (no mock loads). Legacy mock login: `EXPO_PUBLIC_ENABLE_MOCK_AUTH=1` in dev only.

### Security logging

Use `safeLog` from `lib/logging/safe-log.ts` in dev only. **Do not** `console.log` passwords, tokens, sessions, or full Supabase error objects.

## Testing on Android

### Expo Go (recommended for UI)

1. Install **Expo Go** from Google Play.  
2. Same Wi‑Fi as PC: `npm start` → scan QR in Expo Go.  
3. Fast Refresh on save.

| Key | Action |
|-----|--------|
| `a` | Android emulator |
| `r` | Reload |
| `?` | Dev menu |

If QR fails: `npx expo start --tunnel`.

### Installed builds (Android now · iOS later)

| Platform | Status | Command |
|----------|--------|---------|
| **Android APK** | Ready | `npm run build:android:preview` |
| **iOS** | On hold (Mac + iPhone + Apple account) | `eas build --platform ios --profile preview` when ready |

**Before building:** set EAS secrets for `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and `EXPO_PUBLIC_TMS_API_URL` (use a **public** TMS URL, not `localhost`). Same Supabase → `driver_test@test.com` and Realtime work on device like local.

Full checklist: **`docs/MOBILE_BUILDS.md`**.

## Project structure

```
app/                    # Expo Router screens
  (auth)/login.tsx
  auth/callback.tsx     # Supabase deep link
  (drawer)/loads.tsx, account.tsx — TMS-style sidebar (`nav_lateral.png`)
  load/[id].tsx
constants/strings.ts    # English UI copy
lib/supabase/           # Client, auth, queries
lib/logging/safe-log.ts # Dev-only safe logging
supabase/
  migrations/           # SQL history (git)
  sql-editor/           # Paste into Supabase SQL Editor
mocks/                  # Dev demo data
PROYECTO_MUESTRA/       # TMS web — read only
```

## CI/CD

GitHub Actions: `.github/workflows/ci.yml` runs `npm run ci` on push/PR (`tsc`, `check:secrets`, Jest).  
See `docs/GitHub_Setup_Guide.md` and `docs/SECRETS_AND_BFF.md`.

## Database migrations

Apply SQL via **Supabase Dashboard → SQL Editor** (team standard).  
Files: `supabase/sql-editor/*.sql` (run) and `supabase/migrations/*.sql` (version control).

Optional CLI: `npm run db:apply-rls` if `SUPABASE_DB_PASSWORD` is set (not required for SQL Editor workflow).

## Current scope (v0.2.x)

- Supabase Auth: password login, magic link + deep link `pp2://auth/callback`
- Driver loads list from Supabase (RLS); test user `driver_test@test.com`
- Load detail, driver status actions (local map; TMS API week 3), POD placeholder
- Jest + GitHub Actions CI + client secrets guard

**Next:** `PP2_TAREAS_DEV.md` — TMS API status PATCH, POD, E2E.

## TMS reference

Driver actions: `PROYECTO_MUESTRA/components/dispatcher/DriverActionPanel.tsx`.

## Progress log

See `REPORTES_DIARIOS.md` (español) or `DAILY_REPORTS.md` (English).
