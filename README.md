# Tigerhawk Mobile (PP2)

**Version:** `0.1.1` · **Package:** `pp2-mobile` · **Android / iOS:** `com.tigerhawk.mobile`

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
| `npm run build:ios:production` | EAS cloud build → iOS IPA (TestFlight / store) |
| `npm run submit:ios` | Upload latest iOS build to App Store Connect / TestFlight |

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
| **Android APK** | Ready | `npm run build:android:preview` or `production` |
| **iOS (IPA → TestFlight)** | Ready (Apple Developer + EAS) | See **[Update iOS on TestFlight](#update-ios-on-testflight-after-app-changes)** below |

Full reference: **`docs/MOBILE_BUILDS.md`** · Release notes: **`docs/RELEASE_NOTES_0_1_0.md`** · Rollback: **`docs/ROLLBACK_PP2.md`**.

---

### How to create the Android APK (Expo EAS) — step by step

The APK is **not built on your PC**. Expo **EAS Build** compiles it in the cloud (~10–20 min). You need Node.js, this repo, and an [expo.dev](https://expo.dev) account.

#### What you need before starting

| Requirement | Notes |
|-------------|--------|
| Node.js 20+ and `npm install` in this repo | Once per machine |
| Expo account | [expo.dev/signup](https://expo.dev/signup) |
| `.env.local` with real values | Copy from `.env.example` — **never commit** |
| Public TMS URL in env | e.g. `https://tigerhawk.netlify.app` — **not** `localhost`, **not** `/dashboard` |
| Same Supabase as TMS | `EXPO_PUBLIC_SUPABASE_URL` + anon key |

**Important:** `.env.local` is used on your PC only. For the APK, the same three variables must exist on **EAS** (step 4 below).

#### Step 1 — Install dependencies

```bash
cd proyecto_PP2_app_mobile
npm install
```

#### Step 2 — Log in to Expo (once per machine)

Use the package name **`eas-cli`** (not `eas` alone):

```bash
npx eas-cli login
```

Browser opens or you enter expo.dev credentials. Verify:

```bash
npx eas-cli whoami
```

#### Step 3 — Link the EAS project (first time only)

This repo is already linked to **`@likaon1606/pp2`**. If you clone on a new machine and `app.json` has no `extra.eas.projectId`, run:

```bash
npx eas-cli init --force
```

That writes the project UUID into `app.json`. Current project: [expo.dev → pp2](https://expo.dev/accounts/likaon1606/projects/pp2).

#### Step 4 — Push environment variables to EAS

1. Create `.env.local` from `.env.example` and fill:

   | Variable | Example |
   |----------|---------|
   | `EXPO_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eyJ…` (anon key only) |
   | `EXPO_PUBLIC_TMS_API_URL` | `https://tigerhawk.netlify.app` |

2. Upload to EAS (preview + production):

   ```bash
   npm run eas:push-env
   ```

3. Confirm:

   ```bash
   npx eas-cli env:list --environment preview
   ```

   You should see all three `EXPO_PUBLIC_*` variables.

**Do not** add duplicate `env` blocks in `eas.json` for these keys — EAS environment variables are enough. Duplicates can bundle empty values and break Supabase login in the APK.

#### Step 5 — Preflight check

```bash
npm run build:preflight
npm run lint
```

Must pass with **no errors**. Fix any warning about missing `projectId` before building.

#### Step 6 — Start the cloud build (APK)

```bash
npm run build:android:preview
```

- **First build:** EAS may ask to create an **Android keystore** — choose **Let EAS manage** (recommended).
- Terminal shows a link like `https://expo.dev/accounts/.../projects/pp2/builds/...`
- You can **close the terminal** after upload; the build continues in the cloud.

Production profile (same APK type, production env):

```bash
npm run build:android:production
```

#### Step 7 — Download and install

1. Open [expo.dev](https://expo.dev) → account **likaon1606** → project **pp2** → **Builds**.
2. Wait until status is **Finished**.
3. Download the **APK** (or scan the QR on an Android device).
4. On the phone: allow **Install unknown apps** for your browser/files app if sideloading.
5. **Uninstall** an older APK before installing a new build with the same package (`com.tigerhawk.mobile`).

#### Step 8 — Smoke test on device

1. Open **Tigerhawk Mobile** → login `driver_test@test.com` / `Driver01*`
2. **My Loads** — assigned loads visible
3. Open a load → change status (needs TMS reachable at `EXPO_PUBLIC_TMS_API_URL`)
4. Upload driver photo / POD if testing documents

#### Quick reference (repeat builds)

After the first setup, each new APK is:

```bash
npm run eas:push-env          # only if .env.local changed
npm run build:preflight
npm run build:android:preview
```

#### Troubleshooting

| Problem | Fix |
|---------|-----|
| `eas-cli` / `eas` not recognized | Run from repo root after `npm install`; use `npx eas-cli` or `npm run build:android:preview` |
| `Invalid supabaseUrl` on APK | Re-run `npm run eas:push-env`; rebuild. Do not put `$EXPO_PUBLIC_*` placeholders in `eas.json` |
| Network error / TMS upload fails | `EXPO_PUBLIC_TMS_API_URL` must be a **public HTTPS** URL the phone can reach |
| Build stuck “in queue” | Normal; check status on expo.dev → Builds |
| Login works in Expo Go but not APK | APK uses EAS env, not `.env.local` — verify step 4 |

Custody (keystore, secrets): **`docs/EAS_CREDENTIALS_HANDOFF_7_5.md`**.

---

### Update iOS on TestFlight (after app changes)

Use this whenever you change the mobile app (UI, logo/icon/splash, env, features) and need the client to get a **new installable build** on iPhone. You do **not** need a Mac: EAS builds and submits from Windows.

**Already configured (do not recreate unless credentials expire)**

| Item | Value |
|------|--------|
| Expo project | `@likaon1606/pp2` |
| Bundle ID | `com.tigerhawk.mobile` |
| App Store Connect app | **Tigerhawk Mobile** · ASC App ID `6788865727` (`eas.json` → `submit.production.ios.ascAppId`) |
| Apple Developer team | Client account (e.g. Ian Vollers / `ian@tenetlgx.com`) |
| Distribution | **TestFlight** (internal group **Team (Expo)**) |
| EAS profile | `production` (store / TestFlight signing) |

**Important**

- Changing code or `assets/images/logo_new.png` in Expo Go does **not** update the home-screen icon or native splash. Those are baked into the IPA at **EAS build** time.
- `.env.local` is **not** inside the IPA. Keep EAS **production** env vars correct (`EXPO_PUBLIC_TMS_API_URL` must be a **public HTTPS** URL, not a LAN IP).
- Bump `expo.version` in `app.json` (and `package.json`) when shipping a meaningful release (see `docs/VERSIONING.md`). EAS manages the iOS **build number** remotely (`eas.json` → `cli.appVersionSource: remote`).

#### Repeat release (every update)

```bash
cd proyecto_PP2_app_mobile
npm install
npm run eas:push-env          # only if EXPO_PUBLIC_* changed in .env.local
npm run build:preflight
npm run ci                    # recommended before shipping
npx eas build --platform ios --profile production
```

Wait until the build is **Finished** on [expo.dev → pp2 → Builds](https://expo.dev/accounts/likaon1606/projects/pp2/builds). Then upload to Apple:

```bash
npx eas submit --platform ios --latest
```

- First submit may ask for Apple login / App Store Connect API Key (EAS can create and store it).
- Apple processes the binary ~**5–15 minutes** (sometimes longer). Status: [App Store Connect → Tigerhawk Mobile → TestFlight](https://appstoreconnect.apple.com/apps/6788865727/testflight/ios).
- When the build is **Ready to Test**, testers with the **TestFlight** app get an update (or a new invite).

#### Invite / refresh a tester (once per person)

1. [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access** → **+**.
2. Invite the email that is the **Apple ID on their iPhone** (may differ from the Developer Program login, e.g. personal Gmail vs `ian@tenetlgx.com`).
3. Role: **Developer** (enough for internal TestFlight) · app access: **Tigerhawk Mobile**.
4. Tester accepts the email invite, then opens **TestFlight** on the iPhone and installs **Tigerhawk Mobile**.

#### First-time setup only (already done for this project)

If credentials are missing on a new machine or a new Apple team:

```bash
npx eas login
npx eas credentials --platform ios   # profile: production — EAS-managed cert + App Store profile
```

Confirm `eas.json` has:

```json
"submit": {
  "production": {
    "ios": { "ascAppId": "6788865727" }
  }
}
```

#### iOS troubleshooting

| Problem | Fix |
|---------|-----|
| Prebuild fails: missing `logo_new.png` / `logo.png` | Ensure PNGs under `assets/images/` are **not** gitignored (see `.gitignore` exceptions) |
| Submit fails / Expo outage | Check [status.expo.dev](https://status.expo.dev/); retry `npx eas submit --platform ios --latest` |
| Build stuck in TestFlight “Processing” | Wait; refresh App Store Connect. Email arrives when ready |
| Tester cannot see the app | Confirm their **iPhone Apple ID** is in Users and Access + TestFlight group **Team (Expo)** |
| Old icon/splash after install | Uninstall app → install new TestFlight build (native assets only update with a new IPA) |
| App talks to wrong TMS | EAS Environment **production** → `EXPO_PUBLIC_TMS_API_URL` = public Netlify URL → rebuild |

**Android after the same code change:** `npm run build:android:production` (sideload APK; uninstall previous build first).

More detail: **`docs/MOBILE_BUILDS.md`**. Credentials custody: **`docs/EAS_CREDENTIALS_HANDOFF_7_5.md`**.

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

### Client repository mirror (`tigerhawk_mobile`)

The project source code is published to the client org repo (excluding `*.png` and internal planning `.md` files):

**https://github.com/AI-Developer-Smarter-Business/tigerhawk_mobile**

| Item | Value |
|------|--------|
| Local mirror folder | `C:\Users\ariel\OneDrive\Escritorio\RECRUITING_SMARTER___BRASIL\SUBIDAS A GITHUB\PP2_MOBILE` |
| Git remote (SSH empresa) | `git@github-empresa:AI-Developer-Smarter-Business/tigerhawk_mobile.git` |
| Sync command | `npm run sync:client-mirror` (from this repo) |
| Excluded from copy | `*.png`, most `*.md` (planning/daily logs), plus `.git`, `node_modules`, `.expo`, `coverage` |
| Included `.md` (CI) | `CHANGELOG.md`, `README.md`, and release handoff docs under `docs/` — required by Jest in GitHub Actions |

**Workflow:** run `npm run sync:client-mirror`, then in `PP2_MOBILE` commit and push with the **empresa** SSH key (`github-empresa` in `~/.ssh/config`).

For future pushes from the mirror folder:

```bash
cd "C:/Users/ariel/OneDrive/Escritorio/RECRUITING_SMARTER___BRASIL/SUBIDAS A GITHUB/PP2_MOBILE"
git push origin main
```

Do **not** commit `.env.local` — it stays gitignored in the mirror repo.

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

**Handoff:** `HANDOFF_DEV.md` · **Client delivery:** `docs/CLIENT_HANDOFF_9_7.md` · **Tasks:** `PP2_TAREAS_DEV.md` · **Changelog:** `CHANGELOG.md`

## TMS reference

Driver actions: `PROYECTO_MUESTRA/components/dispatcher/DriverActionPanel.tsx`.

## Progress log

See `REPORTES_DIARIOS.md` (español) or `DAILY_REPORTS.md` (English).
