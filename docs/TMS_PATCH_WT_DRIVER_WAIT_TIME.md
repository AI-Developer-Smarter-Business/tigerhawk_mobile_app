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
