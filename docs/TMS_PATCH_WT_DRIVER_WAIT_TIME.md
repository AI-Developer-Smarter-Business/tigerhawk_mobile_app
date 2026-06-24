# TMS patch — driver wait time + Bearer (WT.8)

**Apply in:** TMS dev repo (`docs/TMS_DEV_REPOSITORY.md`).

## WT.2 audit (pre-patch)

| Asset | Path | Status |
|-------|------|--------|
| Wait-time API | `app/api/dispatcher/loads/[id]/wait-time/route.ts` | Exists |
| Table | `waiting_time_events` | Exists (shared Supabase) |
| Billing trigger | `trg_compute_wait_charges` | Exists in TMS migrations |
| Bell | `components/notifications/NotificationBell.tsx` | Exists — extended in WT.11 |
| Bearer pattern | `lib/supabase/get-user-from-request.ts` | Used by documents route |

**Gaps fixed in WT.8:**

1. Replace `createClient()` + cookie auth with **`getUserFromRequest(request)`** on GET/POST/PATCH.
2. **`canManageWaitTime`** — staff (`admin`, `dispatcher`) or assigned `driver`.
3. **POST** accepts **`start_time` only** (open event, `end_time` null, `duration_minutes` 0).
4. **PATCH** recomputes `duration_minutes` when `end_time` set; calls **`maybeNotifyWaitExceeded`** when billable threshold crossed.
5. **`logged_by: "driver"`** when role is driver.
6. **RLS bypass for drivers:** GET/POST/PATCH on `waiting_time_events` use **`createAdminClient()`** after auth check (policies are staff-only since `20260302_rls_audit_hardening`).

## Deploy

Deploy TMS dev → Netlify staging; mobile `EXPO_PUBLIC_TMS_API_URL` must point to that host.

## Rollback

Revert `wait-time/route.ts` and `NotificationBell.tsx` changes; no Supabase schema rollback required.

## WT.28 — POD signed/submitted auto-stop (24 Jun 2026)

**Apply in:** TMS dev repo (`docs/TMS_DEV_REPOSITORY.md`).

| Asset | Path |
|-------|------|
| Handler | `lib/wait-time/handle-pod-signed-submitted.ts` |
| Shared close | `lib/wait-time/close-open-delivery-wait.ts` |
| Upload hook | `lib/load-documents/process-load-document-upload.ts` — when `document_type=POD` (incl. mobile form before driver normalization) |
| API | `POST /api/dispatcher/loads/[id]/pod-signed` — Bearer/cookie; staff or assigned driver |
| Audit | `activity_log.action = pod_signed_submitted` on `waiting_time_events` |

**Supabase:** no schema changes — reuses `waiting_time_events` + `activity_log`.

**Deploy:** TMS dev → Netlify staging (same as WT.8).

**Rollback:** Revert handler + route + upload hook; open wait events unaffected.

## WT.29 — Customer email at 45 minutes (24 Jun 2026)

| Asset | Path |
|-------|------|
| Handler | `lib/wait-time/notify-detention-warning-45.ts` |
| Constants | `lib/wait-time/constants.ts` |
| Trigger | `PATCH` (and `POST`) `…/wait-time` after duration sync (~60 s from mobile) |
| Template | `email_templates.template_key = detention_warning_45` |
| Idempotency | `activity_log` on `waiting_time_event`: `detention_warning_45_email_sent` / `_failed` / `_skipped_*` |
| SQL seed | `supabase/sql-editor/seed_detention_warning_45_email_template.sql` |

**Supabase:** apply SQL seed only (no new tables). Idempotency uses existing `activity_log`.

**Limitation:** relies on mobile PATCH or TMS updates while wait is open; **WT.32** cron covers offline gaps.

**Deploy:** TMS dev + run SQL seed in Supabase SQL Editor.
