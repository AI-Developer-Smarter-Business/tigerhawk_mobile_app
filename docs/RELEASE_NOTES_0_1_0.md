# Tigerhawk Mobile — release notes v0.1.0

**Build profiles:** `preview` (internal APK) · `production` (release APK)  
**Package:** `com.tigerhawk.pp2` · **Scheme:** `pp2://`

Target: **driver** role — assigned loads, field status, documents, optional driver photos.

---

## Highlights

- **Login** — Supabase email/password; driver-only gate (`user_profiles.role`).
- **My Loads** — Assigned loads from Supabase RLS; pagination; pull-to-refresh; Realtime sync with TMS.
- **Load detail** — Route, customer, container, timeline, holds, notes.
- **Field actions** — Driver-allowed status transitions (TMS `PATCH`; requires Bearer on TMS host).
- **POD / Documents** — View dispatch uploads; **Add driver photo** (type **Driver**); Realtime list updates.
- **Upload quality** — Client validation (image MIME, 50 MB); offline block; light resize/compress before upload.
- **Your location** — Foreground GPS only; **Share location** to WhatsApp/maps (manual; not auto TMS tracking).
- **Offline v1** — Banner, blocked fresh fetches; reconnect recovery without upload queue.
- **Account** — Profile, session, sign out.

---

## Environment (EAS builds)

Set before `npm run build:android:preview` or `production`:

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Same Supabase as TMS |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key only |
| `EXPO_PUBLIC_TMS_API_URL` | Public TMS URL (not `localhost`) |

See `docs/MOBILE_BUILDS.md` and `npm run build:preflight`.

---

## Known limitations (v0.1)

- No background GPS or live map in TMS (Semana 8 / v1.1).
- Load messages UI placeholder.
- Field actions fail with generic auth error if TMS Bearer patch not on deployed host.
- Android **preview/production** = APK sideload; Play Store not in this release.

---

## Supabase (one-time per project)

- `enable_realtime_pp2_driver_sync.sql` — `loads` + `load_documents` in `supabase_realtime`
- Driver RLS + optional direct upload policies (see `supabase/sql-editor/`)

---

**QA:** `docs/QA_RELEASE_SIGNOFF_7_1.md` · **Build:** `docs/MOBILE_BUILDS.md`
