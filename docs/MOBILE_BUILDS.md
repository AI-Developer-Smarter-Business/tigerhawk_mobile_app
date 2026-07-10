# Mobile builds — Android & iOS (PP2)

**Target:** installable app on **Android** (APK) and **iOS** (IPA → **TestFlight**).

Same **Supabase** and **TMS** as local dev → same `driver_test@test.com`, same loads, same **Realtime** behaviour if configured below.

**Operational (confirmed):** **Expo account is active** on [expo.dev](https://expo.dev). After mobile code changes, rebuild via EAS. TMS is **already deployed** on Netlify — see `docs/DEPLOYMENT_STATUS.md` (**WT.19 ✅**).

**iOS package:** `com.tigerhawk.mobile` · **ASC App ID:** `6788865727` · Full re-release steps: **`README.md`** → section **Update iOS on TestFlight (after app changes)**.

---

## 1. Environment variables (EAS — required for APK/IPA)

`.env.local` on your PC is **not** bundled into EAS builds. Set these as **EAS secrets** or Expo project env (Dashboard → project → Environment variables):

| Variable | Example | Notes |
|----------|---------|--------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Same project as TMS |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eyJ…` | Anon key only |
| `EXPO_PUBLIC_TMS_API_URL` | `https://tigerhawkv2.netlify.app` | **Base URL only** (no `/dashboard`). Must be reachable from the phone — **not** `localhost` or LAN IP in production builds. |

Set on EAS with `npm run eas:push-env` (reads `.env.local`) or Expo Dashboard → project → **Environment variables** (preview + production). Do **not** duplicate them in `eas.json` `env` — that overrides EAS and can bundle empty values into the APK.

```bash
npm run eas:push-env   # from filled .env.local
npx eas env:list --environment production
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
npx eas login
npm run build:preflight
npm run build:android:preview
# or
npm run build:android:production
```

**Release notes:** `docs/RELEASE_NOTES_0_1_0.md` (bump version in `app.json` / `package.json` when shipping).

- Profile **`preview`**: internal distribution, **APK** (`eas.json`).
- Install the downloaded APK on the device (allow unknown sources if sideloading). **Uninstall** the previous APK first if the icon/splash did not update.

**Verify on device**

1. Login `driver_test@test.com` / `Driver01*`
2. Open **My Loads** — see assigned loads
3. From TMS: assign or change a load → list updates within ~1–2 s (Realtime)
4. Change status on a load → needs `EXPO_PUBLIC_TMS_API_URL` pointing to live TMS

---

## 5. iOS → TestFlight (active)

**No Mac required** for build/submit (EAS cloud). Apple Developer Program + App Store Connect are required.

### Every code / asset change (repeat)

```bash
npm run eas:push-env          # if EXPO_PUBLIC_* changed
npm run build:preflight
npx eas build --platform ios --profile production
npx eas submit --platform ios --latest
```

Then wait for Apple processing in [TestFlight](https://appstoreconnect.apple.com/apps/6788865727/testflight/ios) (~5–15 min). Testers update via the **TestFlight** app.

Full checklist (testers, credentials, troubleshooting): **`README.md`** section **Update iOS on TestFlight (after app changes)**.

### One-time (already done for Tigerhawk Mobile)

| Step | Status |
|------|--------|
| Bundle ID `com.tigerhawk.mobile` | ✅ `app.json` |
| ASC app + `ascAppId` `6788865727` | ✅ `eas.json` |
| EAS-managed distribution cert + App Store profile | ✅ `eas credentials --platform ios` |
| App Store Connect API Key for submit | ✅ stored on EAS |
| Internal TestFlight group **Team (Expo)** | ✅ |

Icon / splash / logo: use `assets/images/logo_new.png` (referenced from `app.json`). Native icon only updates after a **new IPA**.

---

## 6. Parity checklist (local vs installed build)

| Capability | Local (Expo Go) | Android APK | iOS (TestFlight) |
|------------|-----------------|-------------|------------------|
| Supabase login | Yes | Yes, if env set | Same |
| `driver_test@test.com` | Yes | Yes, same DB | Same |
| Load list + pagination | Yes | Yes | Same |
| Realtime from TMS | Yes, if SQL applied | Yes, same | Same |
| Status PATCH via TMS | Yes, if TMS URL reachable | Yes, **public TMS URL** | Same |
| Magic link | `exp://` + `pp2://` | `pp2://` on APK | Same scheme |
| App icon / splash | Expo Go cache | Baked at EAS build | Baked at EAS build |

---

## 7. References

- [EAS Build](https://docs.expo.dev/build/introduction/) · [EAS Submit](https://docs.expo.dev/submit/introduction/)
- `README.md` — Android APK steps + **Update iOS on TestFlight**
- `docs/QUERY_CACHE.md` § Realtime
- `docs/SECRETS_AND_BFF.md`
- `CHANGELOG.md` · `docs/VERSIONING.md`
- `docs/ROLLBACK_PP2.md` · `docs/EAS_CREDENTIALS_HANDOFF_7_5.md`
- `docs/BUG_REPORTING.md`
- `PP2_TAREAS_DEV.md` week 8 (EAS / stores)
