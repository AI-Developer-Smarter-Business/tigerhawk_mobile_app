# Wait time / overtime billing — product spec (WT.1)

**Feature:** delivery wait timer → billing after **1 hour free** → alerts (driver + TMS bell).

**Repos:** mobile `proyecto_PP2_app_mobile` · TMS dev `docs/TMS_DEV_REPOSITORY.md`.

---

## Business rules

| Rule | Value |
|------|--------|
| **Start timer** | Load status → **`Arrived At Delivery`** (automatic on driver field action). |
| **Stop timer** | **`Delivered`**, **`Dropped - Loaded`**, **`Completed`**, **`Cancelled`**, mobile **End wait time** (status unchanged), or dispatcher PATCH in TMS. |
| **Free time** | **60 minutes** (`free_time_minutes = 60` on `waiting_time_events`). |
| **Billable** | After 60 min — trigger `trg_compute_wait_charges` sets `charge_amount`; **`load_billing`** Detention line upserted when event closes (mobile stop or status change), idempotent per event id. |
| **Event type** | `delivery_wait` |
| **Who closes** | Driver (status change) or dispatcher (PATCH wait-time in TMS). |

---

## Phases

| Phase | Mobile | TMS | Supabase |
|-------|--------|-----|----------|
| **A (WT.3–WT.4)** | Local / AsyncStorage timer; no API | Sidebar panel; client-side timer from arrival status | **No changes** |
| **B (WT.5–WT.13)** | `lib/tms/wait-time.ts` + hook | Bearer on `wait-time` route; live panel; bell alerts | Existing `waiting_time_events`; optional Realtime SQL |

---

## User copy (English)

- Driver — free: “Free waiting time”
- Driver — billable: “Waiting time exceeded — dispatch has been notified”
- TMS — “Driver waiting at delivery — {elapsed}”
- Bell — “Waiting time exceeded — {reference} ({billable} min billable)”

---

## TMS gaps (WT.2 summary)

See `docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md` for audit checklist and patches applied.

| Item | Before WT.8 | After WT.8 |
|------|-------------|------------|
| Bearer on `wait-time` | Cookie only | `getUserFromRequest` |
| Driver POST | Any authenticated user | Assigned driver or staff |
| Open timer (`start_time` only) | Rejected | Allowed |
| Mobile `logged_by` | `"dispatcher"` | `"driver"` when from app |

---

## QA

`docs/QA_WAIT_TIME_OVERAGE.md`
