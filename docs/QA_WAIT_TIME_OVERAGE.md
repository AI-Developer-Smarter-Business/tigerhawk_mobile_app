# QA — Wait time / overtime billing (WT.14)

Manual matrix for **Fase A (mock)** and **Fase B (production API)** across mobile + TMS.

**Spec:** `docs/WAIT_TIME_OVERAGE_SPEC.md`  
**TMS patch:** `docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md`  
**Prerequisites:** TMS deployed with WT.8 Bearer patch; driver assigned to test load; Supabase `waiting_time_events` + trigger `trg_compute_wait_charges`.

---

## Environment

| Layer | Setting |
|-------|---------|
| Mobile Phase A | `EXPO_PUBLIC_WAIT_TIME_MOCK=1` in `.env.local` / EAS env |
| Mobile Phase B | Remove mock flag; `EXPO_PUBLIC_TMS_API_URL` → TMS with WT.8 |
| TMS Phase A demo | Open dispatcher load detail with `?waitMock=1` or `NEXT_PUBLIC_WAIT_TIME_MOCK=1` |
| Realtime (WT.13) | Run `supabase/sql-editor/enable_realtime_waiting_time_events.sql` |

---

## Test matrix

| # | Step | Mobile expected | TMS expected |
|---|------|-----------------|--------------|
| 1 | Open load **not** at delivery | No wait timer card | No wait panel |
| 2 | Change status → **Arrived At Delivery** | Timer starts; phase **Free waiting time**; elapsed ticks each second | Panel **Waiting at delivery**; free countdown |
| 3 | Wait or simulate **59 min** (mock: adjust clock / dev tools) | Still free phase; no billing banner | Same; no billable alert |
| 4 | Cross **61 min** | Banner: *Waiting time exceeded — dispatch has been notified*; phase **Billable** | Billable minutes + link to **Waiting Time Audit**; bell alert ⏳ |
| 5 | Dispatcher bell | — | Notification: load ref + billable minutes; Realtime refresh |
| 6 | Dispatcher toast (WT.12) | — | Floating toast: *Waiting time exceeded — N min billable* |
| 7 | Change status → **Delivered** or tap **End wait time** | Timer **Stopped**; API closes event (Phase B) | Panel shows stopped; event has `end_time` |
| 7b | Stop after **>60 min** billable | — | **Billing** tab shows **Detention** line (refresh tab); also **Waiting Time Audit** |
| 8 | **Waiting Time Audit** (A/R) | — | Event listed; `charge_amount` / `driver_pay_amount` populated when billable |
| 9 | Driver Bearer (Phase B) | POST/PATCH wait-time without TMS cookie session | API 201/200; `logged_by: driver` |

---

## Automated checks (mobile repo)

```bash
npm test -- --testPathPattern="timer-math|wait-time"
npm run lint
```

---

## Sign-off

| Role | Date | Pass / Fail | Notes |
|------|------|-------------|-------|
| Dev | | | |
| QA | | | |
| PM | | | |
