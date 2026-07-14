# Deployment status — Tigerhawk Mobile + TMS

**Purpose:** single reference so agents **do not re-open completed deploy tasks** (especially **WT.19**).  
**Last confirmed:** project owner, May 2026.

---

## TMS on Netlify — ✅ operational (WT.19 done)

| Item | Status |
|------|--------|
| TMS dev repo deployed to **Netlify** | ✅ Success — in daily use |
| Mobile ↔ TMS via **`EXPO_PUBLIC_TMS_API_URL`** | ✅ App talks to deployed TMS (status, documents, wait-time Bearer API) |
| Patches in TMS repo (`wait-time`, documents, billing, etc.) | Deploy by pushing/redeploying **TMS dev repo** — not `PROYECTO_MUESTRA/` |

**Repo path (editable TMS):**  
`C:\Users\ariel\OneDrive\Escritorio\RECRUITING_SMARTER___BRASIL\TMS_fusion`

**Agents:** **Do not list WT.19 as pending.** If a feature fails, check TMS deploy includes the latest commit — do not assume “TMS not deployed yet”.

See also: `docs/TMS_DEV_REPOSITORY.md`, `AGENTS.md` § Entornos desplegados.

---

## Expo / EAS — ✅ account active (Android APK)

| Item | Status |
|------|--------|
| **Expo account** | ✅ Configured on [expo.dev](https://expo.dev) |
| **Android APK** | Rebuilt on EAS after mobile changes (`npm run build:android:preview` or `production`) |
| **Env for device builds** | `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_TMS_API_URL` on **EAS** (`.env.local` is not bundled) |

**Workflow:** code change in `proyecto_PP2_app_mobile` → `npm run build:preflight` → `npm run build:android:preview` (or production) → install/update APK on device.

See: `docs/MOBILE_BUILDS.md`, `docs/EAS_CREDENTIALS_HANDOFF_7_5.md`.

---

## Supabase — shared (mobile + TMS)

Same Supabase project for both apps. **WT.20 ✅** — `waiting_time_events` schema + Realtime applied (`npm run db:apply-wt20`). Other scripts in `supabase/sql-editor/` may still be pending (e.g. GPS **8.4**).

---

## Quick checklist for new agents

1. **WT.19** → ✅ done — skip.
2. **EAS / APK** → ✅ owner updates via Expo when shipping mobile builds.
3. **TMS changes** → edit TMS dev repo → Netlify redeploy.
4. **Mobile API URL** → must match live Netlify base URL in EAS secrets and local `.env.local` for dev.
