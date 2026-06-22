# Mobile builds — Android & iOS (PP2)

**Target:** installable app on **Android** (now) and **iOS** (when Mac + iPhone + Apple Developer account are available).

Same **Supabase** and **TMS** as local dev → same `driver_test@test.com`, same loads, same **Realtime** behaviour if configured below.

**Operational (confirmed):** **Expo account is active** on [expo.dev](https://expo.dev). After mobile code changes, rebuild the **Android APK** via EAS (`npm run build:android:preview` or `production`). TMS is **already deployed** on Netlify — see `docs/DEPLOYMENT_STATUS.md` (**WT.19 ✅**).

---

## 1. Environment variables (EAS — required for APK/IPA)

`.env.local` on your PC is **not** bundled into EAS builds. Set these as **EAS secrets** or Expo project env (Dashboard → project → Environment variables):

| Variable | Example | Notes |
|----------|---------|--------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Same project as TMS |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eyJ…` | Anon key only |
| `EXPO_PUBLIC_TMS_API_URL` | `https://tigerhawk.netlify.app` | **Base URL only** (no `/dashboard`). Staging Netlify is OK if mobile patches live there. Must be reachable from the phone — not `localhost`. |

Set on EAS with `npm run eas:push-env` (reads `.env.local`) or Expo Dashboard → project → **Environment variables** (preview + production). Do **not** duplicate them in `eas.json` `env` — that overrides EAS and can bundle empty values into the APK.

```bash
npm run eas:push-env   # from filled .env.local
npx eas-cli env:list --environment preview
```

---

## 2. Supabase (once per project)

| Step | Action |
|------|--------|
| Auth | Redirect `pp2://auth/callback` — see `docs/SUPABASE_AUTH_REDIRECTS.md` |
| Realtime | Run `supabase/sql-editor/enable_realtime_loads.sql` so TMS assign/update/unassign refreshes the list without restarting the app |
| Test user | `npm run db:seed-driver-test` + assign/trim scripts (same DB as TMS) |

---

## 3. Release QA before build (tasks 7.1 → 7.2)

| Step | Command | Doc |
|------|---------|-----|
| **7.1** Automated + manual P0/P1 | `npm run qa:7.1` | `docs/QA_RELEASE_SIGNOFF_7_1.md` |
| **7.2** EAS config check | `npm run build:preflight` | This file + `docs/RELEASE_NOTES_0_1_0.md` |

`qa:7.1` does **not** replace manual sign-off on device (smoke S1–S10, upload D1–D7, documents A–C).

---

## 4. Android APK (current path)

```bash
npm install -g eas-cli   # if needed
npx eas login
npm run build:preflight
# Set projectId in app.json → extra.eas.projectId (create project on expo.dev)
npm run build:android:preview
# or
npm run build:android:production
```

**Release notes:** `docs/RELEASE_NOTES_0_1_0.md` (version **0.1.0**).

- Profile **`preview`**: internal distribution, **APK** (`eas.json`).
- Install the downloaded APK on the device (allow unknown sources if sideloading).

**Verify on device**

1. Login `driver_test@test.com` / `Driver01*`
2. Open **My Loads** — see assigned loads
3. From TMS: assign or change a load → list updates within ~1–2 s (Realtime)
4. Change status on a load → needs `EXPO_PUBLIC_TMS_API_URL` pointing to live TMS

---

## 5. iOS — on hold

Blocked until:

- **macOS** with Xcode (or EAS cloud build only — still need Apple credentials)
- **Apple Developer** account ($99/year) for device/TestFlight
- Physical **iPhone** for field testing

When ready:

```bash
npx eas build --platform ios --profile preview
```

`app.json` already has `ios.bundleIdentifier`: `com.tigerhawk.pp2`. Add iOS credentials in EAS (managed or manual). Same env secrets as Android.

---

## 6. Parity checklist (local vs installed build)

| Capability | Local (Expo Go) | Android APK | iOS (later) |
|------------|-----------------|-------------|-------------|
| Supabase login | Yes | Yes, if env set | Same |
| `driver_test@test.com` | Yes | Yes, same DB | Same |
| Load list + pagination | Yes | Yes | Same |
| Realtime from TMS | Yes, if SQL applied | Yes, same | Same |
| Status PATCH via TMS | Yes, if TMS URL reachable | Yes, **public TMS URL** | Same |
| Magic link | `exp://` + `pp2://` | `pp2://` on APK | Same scheme |

---

## 7. References

- [EAS Build](https://docs.expo.dev/build/introduction/)
- `docs/QUERY_CACHE.md` § Realtime
- `docs/SECRETS_AND_BFF.md`
- `CHANGELOG.md` · `docs/VERSIONING.md`
- `docs/ROLLBACK_PP2.md` · `docs/EAS_CREDENTIALS_HANDOFF_7_5.md`
- `docs/BUG_REPORTING.md`
- `PP2_TAREAS_DEV.md` week 8 (EAS / stores)
