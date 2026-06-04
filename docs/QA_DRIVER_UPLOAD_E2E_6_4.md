# QA — Driver photo upload E2E (task 6.4)

Manual sign-off for **mobile → TMS** driver evidence upload, **Realtime** sync both ways, **cancel/discard**, and **dispatcher visibility**.

**Automated preflight (run before manual QA):**

```bash
npm run qa:6.4
```

**Related checklists:** `docs/QA_DRIVER_DOCUMENTS_4_7.md` §D (matrix reference), §A (TMS → mobile baseline), `docs/QA_PRODUCTION_SIGNOFF_5_6.md` (production env).

---

## Code map

| Layer | Path |
|-------|------|
| Load detail screen | `app/load/[id].tsx` |
| Documents + upload UI | `components/loads/LoadDocumentsSection.tsx`, `PodUploadSection.tsx` |
| Upload hook | `hooks/useLoadDocumentUpload.ts` (`documentType: 'Driver'`) |
| Client validation (6.3) | `lib/media/validate-driver-upload-file.ts` |
| Offline gate | `lib/network/assert-online.ts` → `assertOnlineForDocumentUpload` |
| TMS POST | `lib/tms/upload-load-document.ts` → `/api/mobile/loads/{id}/documents` |
| Supabase direct (fallback) | `lib/supabase/upload-driver-load-document.ts` |
| Realtime | `lib/supabase/realtime/driver-loads-subscription.ts` (`load_documents`) |
| SQL (once) | `supabase/sql-editor/enable_realtime_pp2_driver_sync.sql` |

**App path (all manual rows):** Login → **My Loads** → assigned load → scroll **POD / Documents** → **Driver photo (optional)** block.

---

## Prerequisites

| Item | Notes |
|------|--------|
| Preflight | `npm run qa:6.4` green |
| App | Expo Go or staging APK; `.env.local` with Supabase + `EXPO_PUBLIC_TMS_API_URL` (production: `https://tigerhawk.netlify.app` or client TMS URL) |
| TMS | Bearer + mobile documents route deployed (`docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`, `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md`) |
| User | Driver assigned to test load (e.g. `driver_test@test.com`) |
| Realtime | `enable_realtime_pp2_driver_sync.sql` applied (`loads` + `load_documents` in `supabase_realtime`) |
| Dispatcher | TMS login to verify **Documents** tab on same load |

---

## D — Upload matrix (6.4 sign-off)

| # | Scenario | Steps | Pass criteria |
|---|----------|--------|---------------|
| D1 | **Happy path** | **Add driver photo** → camera or gallery → preview → **Upload photo** | Success message (`podUploadSuccess`); new row in mobile list (orange **Driver** tint); filename + size + date |
| D2 | **Mobile → TMS (dispatch sees file)** | After D1, open same load in TMS → **Documents** tab (tab open, no F5) | Orange row, type **Driver**, correct filename; dispatcher can open/preview file |
| D3 | **Realtime inverse (TMS delete)** | Dispatcher deletes driver photo in TMS | Row disappears on mobile within **~5–15 s** (or after pull-to-refresh on load detail) |
| D4 | **Cancel before upload** | Pick photo → **Cancel** → confirm **Discard** in alert | No upload; preview cleared; no new row mobile or TMS |
| D5 | **Keep photo (discard aborted)** | Pick photo → **Cancel** → **Keep photo** | Preview remains; no upload until **Upload photo** |
| D6 | **Dismiss picker** | **Add driver photo** → dismiss camera/gallery without selecting | No preview, no upload, no error banner |
| D7 | **Offline upload blocked** | Airplane mode → **Add driver photo** or **Upload photo** | Hint + disabled controls; message *Photo upload needs internet…*; no stuck spinner |
| D8 | **Validation — size** | (Dev/mock) image **> 50 MB** if testable | *This photo exceeds the 50 MB limit…* before network |
| D9 | **Validation — MIME** | (If testable) non-image | *Only JPEG, PNG, HEIC, or WebP…* before network |
| D10 | **Wrong load** | Upload on load **not** assigned to driver (if reachable) | Permission error from TMS; no row for other loads |

---

## Regression (include with 6.4 close)

| # | Steps | Pass criteria |
|---|--------|---------------|
| R1 | After D1, tap **View** on new driver row | File opens (browser/image viewer) |
| R2 | Pull-to-refresh on load detail after upload | List stable; no duplicate rows |
| R3 | Upload second photo on same load | Both rows visible mobile + TMS |

---

## Sign-off

| Role | Date | Build / env | Rows |
|------|------|-------------|------|
| Dev | | `npm run qa:6.4` | Preflight |
| QA / PM | | Staging or production TMS + device | **D1–D7 required**; D2–D3 for full E2E |
| Client | | | D2 dispatcher visibility |

**Required for task 6.4 close:** D1, D2, D4, D6, D7 + `npm run qa:6.4`.

**Related:** `docs/OFFLINE_V1.md`, `PP2_TAREAS_DEV.md` §6.4, `docs/MOBILE_TELEMETRY.md`.
