# QA — Load documents mobile (task 4.7)

Manual checklist for **POD / Documents** on PP2 mobile: TMS → app sync, **View**, offline/reconnect, and (when enabled) driver upload.

**Automated guards (run before manual QA):**

```bash
npm run qa:5.6
```

Driver **upload** E2E (task 6.4): `npm run qa:6.4` + **`docs/QA_DRIVER_UPLOAD_E2E_6_4.md`**.

(Full CI: `npm run ci`. Production execution checklist: **`docs/QA_PRODUCTION_SIGNOFF_5_6.md`**.)

Relevant suites: `document-load-association`, `fetch-load-documents`, `document-upload-request`, `upload-load-document`, `merge-tms-documents`, `document-view-url`, `network-state`.

**Code map:**

| Area | Path |
|------|------|
| List + View UI | `components/loads/LoadDocumentsSection.tsx` |
| Screen route | `app/load/[id].tsx` → `LoadDetailContent` → card **POD / Documents** |
| Documents query | `hooks/useLoadDocumentsQuery.ts` → `fetchDriverLoadDocuments` |
| Association filter | `lib/loads/document-load-association.ts` |
| Open / expired URL | `lib/loads/open-load-document.ts` |
| Upload | `components/loads/PodUploadSection.tsx`, `hooks/useLoadDocumentUpload.ts` |
| Upload QA (6.4) | `docs/QA_DRIVER_UPLOAD_E2E_6_4.md` |
| Realtime | `lib/supabase/realtime/driver-loads-subscription.ts` (`load_documents`) |
| SQL (once) | `supabase/sql-editor/enable_realtime_pp2_driver_sync.sql` |

---

## Prerequisites

| Item | Notes |
|------|--------|
| App | `npx expo start` or staging APK; `.env.local` with Supabase + `EXPO_PUBLIC_TMS_API_URL` |
| TMS | Running instance with documents API; Bearer patch: `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md` |
| Driver upload (optional rows) | TMS patch 4.1: `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md` deployed |
| User | Driver with an **assigned** load (e.g. `driver_test@test.com`) |
| Test load | Note `reference_number` (header) and UUID; has **Documents** in TMS |
| Realtime | `enable_realtime_pp2_driver_sync.sql` applied in Supabase SQL Editor |

---

## A — TMS → mobile (realtime + pull-to-refresh)

**Path:** Login → **My Loads** → open assigned load → scroll to **POD / Documents**.

| # | Action (TMS) | Action (mobile) | Pass criteria |
|---|----------------|-----------------|---------------|
| A1 | On assigned load in TMS, upload a PDF/image in **Documents** | Keep mobile on load detail (same load) | Within **~5–15 s**, new row appears (filename, type, size, date) **without** leaving the screen |
| A2 | Same as A1, but Realtime slow/off | **Pull down** on load detail | New document appears after refresh |
| A3 | Upload file to **another** load in TMS | Stay on first load detail | **Must not** show the other load’s file |
| A4 | Delete a document in TMS for **this** load | Wait or **pull down** | Row **disappears** from mobile list |
| A5 | Tap **View** on a fresh document | — | File opens (browser/PDF viewer/image); no raw JSON error |

---

## B — View / signed URLs

| # | Scenario | Steps | Pass criteria |
|---|----------|--------|---------------|
| B1 | Fresh link | **View** right after TMS upload | Opens successfully |
| B2 | Expired link | **View** on document older than ~1 h (or forced expiry) | Message *“This download link has expired. Pull down…”*; after **pull down**, **View** works if TMS Bearer GET is deployed |
| B3 | Offline **View** | Airplane mode → **View** | Clear internet-required message; no crash |
| B4 | Reconnect | Restore network → **pull down** → **View** | Opens after refresh |

---

## C — Offline banner (regression, task 4.5)

| # | Steps | Pass criteria |
|---|--------|---------------|
| C1 | Airplane mode on load detail | Yellow **No internet connection** banner |
| C2 | **Pull down** offline | Message that internet is required; **no** infinite top spinner |
| C3 | Restore Wi‑Fi **without** pull | Banner clears; list can refresh in background; **no** stuck refresh spinner at top |

---

## D — Driver upload (enabled — tasks 6.1–6.3)

**Preflight:** `npm run qa:6.4`. **Full sign-off:** `docs/QA_DRIVER_UPLOAD_E2E_6_4.md`.

**UI labels:** **Add driver photo** → preview → **Upload photo** / **Cancel** (discard with confirmation). Document type persisted: **`Driver`**.

| # | Scenario | Steps | Pass criteria |
|---|----------|--------|---------------|
| D1 | Happy path | **Add driver photo** → camera or gallery → **Upload photo** | Success message; new row in mobile list (Driver tint); visible in TMS **Documents** |
| D2 | TMS visibility | After D1, TMS **Documents** on same load (tab open) | Orange row, type **Driver**, dispatcher can open file |
| D3 | Realtime inverse | Dispatcher deletes driver photo in TMS | Row disappears on mobile without app restart |
| D4 | Cancel / discard | Pick photo → **Cancel** → **Discard** | No upload; no new row |
| D5 | Keep photo | Pick → **Cancel** → **Keep photo** | Preview kept; no upload |
| D6 | Dismiss picker | **Add driver photo** → dismiss picker | No preview, no upload |
| D7 | Offline upload | Airplane mode → try add or upload | Offline hint + blocked action; no stuck spinner |
| D8 | File too large | Image **> 50 MB** (or mock in dev) | *This photo exceeds the 50 MB limit…* before network |
| D9 | Wrong MIME | (If testable) non-image | *Only JPEG, PNG, HEIC, or WebP…* before network |
| D10 | Not assigned load | Upload on load not assigned to driver | TMS **403** / permission message on mobile |

---

## E — Association / wrong load (task 4.4)

| # | Steps | Pass criteria |
|---|--------|---------------|
| E1 | Open valid load from **My Loads** | Documents list only for that load |
| E2 | Deep link with empty id | Navigate to invalid `/load/` id | **Load not found** or empty documents; no crash |

---

## Sign-off

| Role | Date | Build / env | Notes |
|------|------|-------------|-------|
| Dev | | `npm run ci` + this checklist prepared | |
| QA / PM | | Staging TMS + Supabase | Rows A1–A5 required for 4.7 sign-off |
| Client | | | Upload rows D* — **`docs/QA_DRIVER_UPLOAD_E2E_6_4.md`** (task 6.4) |

**Related:** `docs/OFFLINE_V1.md`, `docs/QA_DRIVER_ACTIONS_3_7.md`, `docs/QA_DRIVER_UPLOAD_E2E_6_4.md`, `PP2_TAREAS_DEV.md` §4.7–6.4.
