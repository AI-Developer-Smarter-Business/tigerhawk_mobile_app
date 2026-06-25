# QA — Wait time / overtime billing (WT.14 · aligned WT.34)

Manual matrix for **Fase A (mock)** and **Fase B (production API)** across mobile + TMS.

**Spec:** `docs/WAIT_TIME_OVERAGE_SPEC.md` (WT.34 — manual start/stop)  
**TMS patch:** `docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md`  
**Prerequisites:** TMS deployed with WT.8 Bearer patch; driver assigned to test load; Supabase `waiting_time_events` + trigger `trg_compute_wait_charges`.

---

## Environment

| Layer | Setting |
|-------|---------|
| Mobile Phase A | `EXPO_PUBLIC_WAIT_TIME_MOCK=1` in `.env.local` / EAS env |
| Mobile Phase B | Remove mock flag; `EXPO_PUBLIC_TMS_API_URL` → TMS with WT.8 |
| TMS Phase A demo | Open dispatcher load detail with `?waitMock=1` or `NEXT_PUBLIC_WAIT_TIME_MOCK=1` |
| Realtime (WT.20 ✅) | Applied via `npm run db:apply-wt20` — verify `VERIFY_pp2_waiting_time_events.sql` |

---

## Test matrix

| # | Step | Mobile expected | TMS expected |
|---|------|-----------------|--------------|
| 1 | Open load **not** at delivery | No wait timer card | No wait panel |
| 2 | Change status → **Arrived At Delivery** | Card **Delivery wait time** with **Start wait time**; **no** elapsed timer until tap (**WT.27**) | Panel may show arrival; wait event only after driver/API start |
| 2b | Tap **Start wait time** | Phase **Free waiting time**; elapsed ticks each second | Panel **Waiting at delivery**; free countdown; `delivery_wait` row with `start_time` |
| 3 | Wait or simulate **59 min** (mock: adjust clock / dev tools) | Still free phase; no billing banner | Same; no billable alert |
| 4 | Cross **61 min** | Banner: *Waiting time exceeded — dispatch has been notified*; phase **Billable** | Billable minutes + link to **Waiting Time Audit**; bell alert ⏳ |
| 5 | Dispatcher bell | — | Notification: load ref + billable minutes; Realtime refresh |
| 6 | Dispatcher toast (WT.12) | — | Floating toast: *Waiting time exceeded — N min billable* |
| 7 | Tap **End wait time** | Timer **Stopped**; load status **unchanged**; API closes event (Phase B) | Panel shows stopped; event has `end_time` |
| 7a | Change status → **Delivered** while timer **running** (do not tap End) | Timer **keeps running** — no auto-stop (**WT.27**) | Open event remains until PATCH / POD submit (**WT.28**) |
| 7c | Upload **POD** document (TMS Documents tab) while timer **running** | — (mobile Driver photo does **not** auto-stop) | Open `delivery_wait` closes; `activity_log` `pod_signed_submitted` (**WT.28**) |
| 7d | Open wait ≥ **45 min** (Phase B; mobile PATCH ~60 s) | — | Customer receives **`detention_warning_45`** email once; `activity_log` `detention_warning_45_email_sent` (**WT.29**) |
| 7e | Open wait ≥ **60 min** billable | — | Customer receives **`detention_started`** once (**WT.30**) |
| 7f | **Check Out** or e-POD closes wait | Timer stopped | Customer receives **`detention_completed`** summary (**WT.31**) |
| 7g | Mobile offline ≥ 45/60 min | — | Cron `POST /api/cron/wait-time-detention-emails` still sends emails (**WT.32**) |
| 7b | Stop after **>60 min** billable | — | **Billing** tab: **charge_type** = **Detention**, description **Delivery detention — N min billable…** (**WT.25**); **Waiting Time Audit** |
| 8 | **Waiting Time Audit** (A/R) | — | Event listed; `charge_amount` / `driver_pay_amount` populated when billable |
| 9 | Driver Bearer (Phase B) | POST/PATCH wait-time without TMS cookie session | API 201/200; `logged_by: driver` |
| 10 | Document upload (BOL/POD picker) | **Add driver photo** — **not** wait check-in (`opciones_driver.png` = **DOC.1**, not timer) | Full type list in **Documents** tab |

---

## Automated checks (mobile repo)

```bash
npm test -- --testPathPattern="timer-math|wait-time|DeliveryWaitSection|useDeliveryWaitTimer|hydrate-timer"
npm run lint
```

---

## Sign-off

| Role | Date | Pass / Fail | Notes |
|------|------|-------------|-------|
| Dev | | | |
| QA | | | |
| PM | | | |
