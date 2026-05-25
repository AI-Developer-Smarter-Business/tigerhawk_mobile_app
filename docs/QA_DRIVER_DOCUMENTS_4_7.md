# QA — Load documents mobile (task 4.7)

Manual checklist for **POD / Documents** on PP2 mobile: TMS → app sync, **View**, offline/reconnect, and (when enabled) driver upload.

**Automated guards (run before manual QA):**

```bash
npm run ci
```

Relevant suites: `document-load-association`, `fetch-load-documents`, `document-upload-request`, `upload-load-document`, `merge-tms-documents`, `document-view-url`, `network-state`.

**Code map:**

| Area | Path |
|------|------|
| List + View UI | `components/loads/LoadDocumentsSection.tsx` |
| Screen route | `app/load/[id].tsx` → `LoadDetailContent` → card **POD / Documents** |
| Documents query | `hooks/useLoadDocumentsQuery.ts` → `fetchDriverLoadDocuments` |
| Association filter | `lib/loads/document-load-association.ts` |
| Open / expired URL | `lib/loads/open-load-document.ts` |
| Upload (when wired) | `components/loads/PodUploadSection.tsx`, `hooks/useLoadDocumentUpload.ts` |
| Realtime | `lib/supabase/realtime/driver-loads-subscription.ts` (`load_documents`) |
| SQL (once) | `supabase/sql-editor/enable_realtime_load_documents.sql` |

---

## Prerequisites

| Item | Notes |
|------|--------|
| App | `npx expo start` or staging APK; `.env.local` with Supabase + `EXPO_PUBLIC_TMS_API_URL` |
| TMS | Running instance with documents API; Bearer patch: `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md` |
| Driver upload (optional rows) | TMS patch 4.1: `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md` deployed |
| User | Driver with an **assigned** load (e.g. `driver_test@test.com`) |
| Test load | Note `reference_number` (header) and UUID; has **Documents** in TMS |
| Realtime | `enable_realtime_load_documents.sql` applied in Supabase SQL Editor |

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

## D — Driver upload (only when `PodUploadSection` is enabled in UI)

**Current build:** upload block may be **disabled** with gray TMS patch text (`strings.loadDetail.driverUploadTmsRequired`). Skip section D until product enables upload (task 4.8).

When enabled:

| # | Scenario | Steps | Pass criteria |
|---|----------|--------|---------------|
| D1 | Happy path POD | **Add driver photo** → camera or gallery → **Upload POD** | Success message; new row in list; visible in TMS Documents |
| D2 | Cancel before upload | Pick photo → **Cancel** / discard | No upload; no new row |
| D3 | Cancel picker | **Add driver photo** → dismiss picker | No preview, no upload |
| D4 | Offline upload | Airplane mode → try upload | Network/offline message; no stuck spinner |
| D5 | Wrong MIME | (If testable) non-image file | Rejected before TMS with clear message |
| D6 | File too large | Image **> 50 MB** (or mock in dev) | *“File exceeds 50MB limit”* before network |
| D7 | Not assigned load | Upload on load not assigned to driver | TMS **403** / permission message on mobile |

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
| Client | | | Upload rows D* when TMS 4.1 + UI 4.8 enabled |

**Related:** `docs/OFFLINE_V1.md`, `docs/QA_DRIVER_ACTIONS_3_7.md`, `PP2_TAREAS_DEV.md` §4.7–4.8.
