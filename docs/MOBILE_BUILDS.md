# Mobile builds — Android & iOS (PP2)

**Target:** installable app on **Android** (now) and **iOS** (when Mac + iPhone + Apple Developer account are available).

Same **Supabase** and **TMS** as local dev → same `driver_test@test.com`, same loads, same **Realtime** behaviour if configured below.

---

## 1. Environment variables (EAS — required for APK/IPA)

`.env.local` on your PC is **not** bundled into EAS builds. Set these as **EAS secrets** or Expo project env (Dashboard → project → Environment variables):

| Variable | Example | Notes |
|----------|---------|--------|
| `EXPO_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | Same project as TMS |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | `eyJ…` | Anon key only |
| `EXPO_PUBLIC_TMS_API_URL` | `https://tms-staging.example.com` | **Must be reachable from the phone** — not `localhost` |

`eas.json` profiles `preview` and `production` already reference these via `$EXPO_PUBLIC_*`.

```bash
# One-time (Expo account)
npx eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://..."
npx eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "..."
npx eas secret:create --name EXPO_PUBLIC_TMS_API_URL --value "https://your-tms-host"
```

---

## 2. Supabase (once per project)

| Step | Action |
|------|--------|
| Auth | Redirect `pp2://auth/callback` — see `docs/SUPABASE_AUTH_REDIRECTS.md` |
| Realtime | Run `supabase/sql-editor/enable_realtime_loads.sql` so TMS assign/update/unassign refreshes the list without restarting the app |
| Test user | `npm run db:seed-driver-test` + assign/trim scripts (same DB as TMS) |

---

## 3. Android APK (current path)

```bash
npm install -g eas-cli   # if needed
npx eas login
# Set projectId in app.json → extra.eas.projectId (create project on expo.dev)
npm run build:android:preview
```

- Profile **`preview`**: internal distribution, **APK** (`eas.json`).
- Install the downloaded APK on the device (allow unknown sources if sideloading).

**Verify on device**

1. Login `driver_test@test.com` / `Driver01*`
2. Open **My Loads** — see assigned loads
3. From TMS: assign or change a load → list updates within ~1–2 s (Realtime)
4. Change status on a load → needs `EXPO_PUBLIC_TMS_API_URL` pointing to live TMS

---

## 4. iOS — on hold

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

## 5. Parity checklist (local vs installed build)

| Capability | Local (Expo Go) | Android APK | iOS (later) |
|------------|-----------------|-------------|-------------|
| Supabase login | Yes | Yes, if env set | Same |
| `driver_test@test.com` | Yes | Yes, same DB | Same |
| Load list + pagination | Yes | Yes | Same |
| Realtime from TMS | Yes, if SQL applied | Yes, same | Same |
| Status PATCH via TMS | Yes, if TMS URL reachable | Yes, **public TMS URL** | Same |
| Magic link | `exp://` + `pp2://` | `pp2://` on APK | Same scheme |

---

## 6. References

- [EAS Build](https://docs.expo.dev/build/introduction/)
- `docs/QUERY_CACHE.md` § Realtime
- `docs/SECRETS_AND_BFF.md`
- `PP2_TAREAS_DEV.md` week 8 (EAS / stores)
