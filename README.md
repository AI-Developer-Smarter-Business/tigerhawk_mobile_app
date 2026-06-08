# Tigerhawk Mobile (PP2)

**Version:** `0.1.0` · **Package:** `pp2-mobile` · **Android:** `com.tigerhawk.pp2`

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
| `CHANGELOG.md` | Semver history ([Keep a Changelog](https://keepachangelog.com/)) |
| `docs/VERSIONING.md` | When to bump MAJOR / MINOR / PATCH |
| `docs/RELEASE_NOTES_0_1_0.md` | User-facing v0.1.0 summary |
| `docs/BUG_REPORTING.md` | Bug report template and severity |
| `docs/ROLLBACK_PP2.md` | App + Supabase rollback plan |
| `docs/EAS_CREDENTIALS_HANDOFF_7_5.md` | EAS / keystore custody checklist |
| `docs/MOBILE_SUPPORT_RUNBOOK_7_6.md` | **Support** — RLS, Storage, TMS errors, escalation |
| `docs/BACKLOG_V1_1_7_7.md` | **v1.1 backlog** — live GPS first (Semana 8), then push/messages |
| `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md` | **Live tracking** — Supabase + Realtime + TMS map (no external tracking API) |
| `docs/TMS_DEV_REPOSITORY.md` | **TMS dev repo path** — where to edit deployed TMS (not `PROYECTO_MUESTRA/`) |
| `docs/QA_RELEASE_SIGNOFF_7_1.md` | Pre-release QA (P0/P1) |

## Requirements

- **Node.js** 20 LTS or newer  
- **npm** 10+  
- **Android Studio** (emulator) or Android device with [Expo Go](https://expo.dev/go)  
- [expo.dev](https://expo.dev) account for EAS Build (APK / IPA)  
- **macOS + Xcode** only if building iOS **locally** — not required when using **EAS Build** (cloud)  

## Installation (developers)

```bash
git clone <repo-url>
cd proyecto_PP2_app_mobile
npm install
cp .env.example .env.local   # then edit values
npm run lint
npm test
```

| Command | Purpose |
|---------|---------|
| `npm start` | Expo dev server (Expo Go / emulator) |
| `npm run ci` | Lint + secret guard + tests (same as GitHub Actions) |
| `npm run qa:7.1` | Release QA preflight (Semanas 5–6) |
| `npm run build:preflight` | Check EAS config before APK/IPA build |
| `npm run eas:push-env` | Push `.env.local` `EXPO_PUBLIC_*` to EAS (preview + production) |
| `npm run build:android:preview` | EAS cloud build → Android APK (internal QA) |

### Environment variables

Copy **`.env.example`** → **`.env.local`** at the repo root (often shared with the TMS repo on your machine).

| Variable | Required | Notes |
|----------|----------|--------|
| `EXPO_PUBLIC_SUPABASE_URL` | Yes | Same Supabase project as TMS |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Yes | **Anon** key only |
| `EXPO_PUBLIC_TMS_API_URL` | Yes | TMS base URL — use **LAN IP** on a physical phone if TMS runs on `localhost:3000` |
| `EXPO_PUBLIC_ENABLE_MOCK_AUTH` | No | Dev only; legacy mock login |

**EAS builds:** `.env.local` is **not** bundled — set [EAS secrets](https://docs.expo.dev/build-reference/variables/) (`docs/EAS_CREDENTIALS_HANDOFF_7_5.md`).

**Never** put in the mobile app or commit: `SUPABASE_SERVICE_ROLE_KEY`, Port Houston secrets, `RESEND_API_KEY`, etc. (`npm run check:secrets`).

### Reporting bugs

Use **`docs/BUG_REPORTING.md`** (version, device, steps, load reference). Do **not** send passwords or tokens.

Severity **P0/P1** examples: cannot login, wrong driver sees another’s loads, upload always fails.

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

### Installed builds (Android · iOS)

| Platform | Status | Command |
|----------|--------|---------|
| **Android APK** | Ready | `npm run build:android:preview` |
| **iOS (IPA)** | Ready via EAS cloud — needs Apple setup (client) | `npx eas-cli build --platform ios --profile preview` |

**Before any EAS build:** `npm run build:preflight`, EAS env vars set (`npm run eas:push-env` from `.env.local`), and a **public** TMS URL (not `localhost`). Custody checklist: `docs/EAS_CREDENTIALS_HANDOFF_7_5.md`.

Full flow: **`docs/MOBILE_BUILDS.md`** · Release notes: **`docs/RELEASE_NOTES_0_1_0.md`** · Rollback: **`docs/ROLLBACK_PP2.md`**.

#### Android APK (step-by-step)

1. **Expo account** — `npx eas-cli login` (once).
2. **Link project** — already linked: `@likaon1606/pp2` (`app.json` → `extra.eas.projectId`).
3. **Environment variables** — copy `.env.example` → `.env.local`, fill values, then `npm run eas:push-env`.  
   - `EXPO_PUBLIC_TMS_API_URL` = **base URL only**, e.g. `https://tigerhawk.netlify.app` (not `/dashboard`). Staging Netlify is fine if mobile TMS patches are deployed there.
4. **Preflight** — `npm run build:preflight` (must pass with no errors).
5. **Build** — `npm run build:android:preview` (first run may create Android keystore on EAS).
6. **Download** — [expo.dev](https://expo.dev) → project **pp2** → **Builds** → download APK → install on device (enable “unknown sources” if sideloading).

#### iOS installable — mini-guide for the client

You **do not need a Mac** on the developer machine to **compile** iOS: **EAS Build** runs on Expo’s cloud (macOS servers). A Mac at the client is useful for Apple portal tasks but is **not** required to trigger `eas build` from Windows.

**What is optional vs required**

| Item | Required? | Notes |
|------|-----------|--------|
| Expo account + EAS project | Yes | Same as Android (`pp2`). |
| EAS env vars (`EXPO_PUBLIC_*`) | Yes | Same three variables as Android (`npm run eas:push-env`). |
| **Apple Developer Program** (~**$99/year**) | **Optional for dev only** · **Required to install on real iPhones** | Apple’s paid membership to **sign** the app and distribute outside Expo Go. Without it you can only test in **Expo Go** (not a store-style installable). |
| Physical **iPhone** | Yes (for field QA) | To validate GPS, camera, installs. |
| **Mac** | Optional | Helpful for App Store Connect / Xcode; EAS can manage signing credentials without a local Mac. |

**Distribution options (after Apple Developer account)**

| Method | Best for | Apple account? |
|--------|----------|----------------|
| **TestFlight** | Client / QA on iPhone | Yes — recommended |
| **Ad hoc / internal** | Few registered devices (UDID list) | Yes |
| **App Store** | Public release | Yes |
| **Expo Go** | Quick UI dev only | No — not an installable IPA |

**iOS steps (client + dev team)**

1. **Enroll in [Apple Developer Program](https://developer.apple.com/programs/)** (paid, annual) — owner should be the **client organization**, not a personal throwaway account.
2. **App Store Connect** — create app (or let EAS create on first build). Bundle ID is already set: `com.tigerhawk.pp2` (`app.json`).
3. **EAS iOS credentials** (one-time, with client Apple ID or App Store Connect API key):
   ```bash
   npx eas-cli credentials -p ios
   ```
   Prefer **EAS-managed** certificates and provisioning profiles unless the client already has their own.
4. **Build IPA** (from Windows or Mac — same command):
   ```bash
   npx eas-cli build --platform ios --profile preview
   ```
5. **Install on iPhone** — download IPA alone is **not** enough on iOS. Typical path:
   - **TestFlight:** `npx eas-cli submit --platform ios` (after build), then invite testers by email in App Store Connect.
   - Or register device UDIDs for ad hoc distribution (more manual).
6. **Verify** — login `driver_test@test.com`, **My Loads**, status change and upload against the **public** TMS URL.

**Summary for the client:** Android APK can be sideloaded immediately after EAS build. iOS needs the **Apple Developer Program** only when you want a **signed installable** on iPhones (TestFlight / App Store). Until then, Android APK + Expo Go on iOS cover most cross-platform dev; production iOS for drivers should plan for Apple enrollment + TestFlight.

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

## Current scope (v0.1.0)

- Supabase Auth: password login, magic link + deep link `pp2://auth/callback`
- **My Loads** + load detail (Supabase RLS); pagination; Realtime on `loads` / `load_documents`
- Field actions via TMS `PATCH …/loads/[id]/status` (driver subset)
- **POD / Documents** + **Add driver photo** (validation, compress, offline rules)
- Foreground GPS + Share location; offline v1
- Jest + `npm run ci` + QA runbooks (`docs/QA_RELEASE_SIGNOFF_7_1.md`)

**Handoff:** `HANDOFF_DEV.md` · **Tasks:** `PP2_TAREAS_DEV.md` · **Changelog:** `CHANGELOG.md`

## TMS reference

Driver actions: `PROYECTO_MUESTRA/components/dispatcher/DriverActionPanel.tsx`.

## Progress log

See `REPORTES_DIARIOS.md` (español) or `DAILY_REPORTS.md` (English).
