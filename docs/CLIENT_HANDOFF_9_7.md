# Client handoff — Tigerhawk Mobile (task 7.8 / 9.7)

**Product:** **Tigerhawk Mobile** (`com.tigerhawk.pp2`) · npm `pp2-mobile`  
**Version:** `0.1.0` (see `CHANGELOG.md`, `docs/VERSIONING.md`)  
**TMS backend:** shared Supabase + Netlify TMS (`EXPO_PUBLIC_TMS_API_URL`)

---

## 1. What the driver app delivers (v0.1)

| Area | Capability |
|------|------------|
| Auth | Supabase password + magic link · deep link `pp2://auth/callback` |
| Loads | My Loads list (paginated) + detail · Realtime refresh |
| Status | Driver field actions via TMS PATCH · holds / 403 errors |
| Documents | Driver / POD / Photo upload · offline queue (**9.4**) |
| Wait time | Check In / Check Out · sync with TMS wait panel |
| GPS live | Foreground share to Supabase → TMS map (**8.16**) |
| Offline | Status + document upload queued locally (**9.4**) |
| UI | Drawer TMS chrome · English strings · 48dp touch targets |

**Out of v0.1 scope:** push notifications, in-app messaging thread, background GPS, Samsara fleet map on mobile.

---

## 2. Build & install (Android)

```bash
npm install
npm run build:preflight
npm run build:android:preview    # internal QA APK
# or
npm run build:android:production
```

Download from [expo.dev](https://expo.dev) → project **pp2** → Builds.

**EAS secrets (required):** `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_TMS_API_URL` — see `docs/EAS_CREDENTIALS_HANDOFF_7_5.md`.

**iOS:** deferred until Apple Developer account — `docs/MOBILE_BUILDS.md` §5.

---

## 3. Environment (mobile)

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key only |
| `EXPO_PUBLIC_TMS_API_URL` | TMS base URL (no trailing path) |

**Never** ship `SUPABASE_SERVICE_ROLE_KEY` in the mobile app.

Local dev: copy `.env.example` → `.env.local`. Physical device must use LAN/public TMS URL, not `localhost`.

---

## 4. Environment (TMS — server)

| Variable | Purpose |
|----------|---------|
| `SAMSARA_ENABLED` | `true` → accept geofence webhook (**9.5**) |
| `SAMSARA_API_TOKEN` | Samsara REST Bearer token |
| `SAMSARA_WEBHOOK_SECRET` | HMAC verify `x-samsara-signature` |
| `SAMSARA_MOCK_ALLOW_SIMULATE` | Dev only — public simulate endpoint |
| `RESEND_API_KEY` | Detention emails (WT.29–32) |
| `CRON_SECRET` | Wait-time email cron |

Samsara setup: `docs/SAMSARA_GEOFENCE_SPIKE.md`.

---

## 5. Supabase SQL (apply once per project)

Run in SQL Editor (copies in `supabase/sql-editor/`):

| Script | Purpose |
|--------|---------|
| `20260518120000_pp2_driver_scoped_load_messages_documents.sql` | Driver RLS messages/documents |
| `enable_realtime_loads.sql` | List refresh |
| `20260605120000_pp2_driver_live_location_loads.sql` | GPS columns |
| `fix_pp2_driver_location_trigger_updated_at.sql` | GPS trigger fix |
| `enable_realtime_driver_tracking.sql` | TMS map Realtime |
| Detention email seeds | WT.29–31 templates (if not applied) |

Verify: `VERIFY_pp2_driver_live_location.sql`.

---

## 6. QA before client UAT

| Check | Doc / command |
|-------|----------------|
| Release P0/P1 | `npm run qa:7.1` · `docs/QA_RELEASE_SIGNOFF_7_1.md` |
| Driver actions | `docs/QA_DRIVER_ACTIONS_3_7.md` |
| GPS E2E | `docs/QA_DRIVER_LIVE_TRACKING.md` · sign-off `docs/GPS_LIVE_TRACKING_SIGNOFF_8_17.md` |
| Samsara geofence | `docs/QA_SAMSARA_GEOFENCE_MOCK.md` + live section |
| CI | `npm run ci` (mobile) |

Test user: `driver_test@test.com` · scripts `npm run db:seed-driver-test`, `db:assign-driver-test-loads`.

---

## 7. Support & rollback

| Doc | Use |
|-----|-----|
| `docs/MOBILE_SUPPORT_RUNBOOK_7_6.md` | L1/L2/L3 escalation |
| `docs/ROLLBACK_PP2.md` | Revert SQL / Realtime |
| `docs/BUG_REPORTING.md` | Field bug template |

---

## 8. Repository map

| Repo | Path | Edit |
|------|------|------|
| Mobile (this repo) | `proyecto_PP2_app_mobile` | Expo app |
| TMS dev | `docs/TMS_DEV_REPOSITORY.md` | Dispatcher + API |
| TMS reference | `PROYECTO_MUESTRA/` | **Read-only** |

Task tracker: `PP2_TAREAS_DEV.md` · daily log: `REPORTES_DIARIOS.md` / `DAILY_REPORTS.md`.

---

## 9. Handoff meeting checklist

| # | Item | Done |
|---|------|------|
| 1 | Expo org + EAS project access transferred | ☐ |
| 2 | EAS secrets set for preview + production | ☐ |
| 3 | Android keystore custody documented | ☐ |
| 4 | Supabase SQL applied + verify scripts green | ☐ |
| 5 | TMS Netlify env (TMS + Samsara + Resend) | ☐ |
| 6 | QA sign-off GPS G1 (`GPS_LIVE_TRACKING_SIGNOFF_8_17.md`) | ☐ |
| 7 | Internal APK installed on pilot device | ☐ |

---

**Revision:** 27 Jun 2026 · tasks **7.8 / 9.7**
