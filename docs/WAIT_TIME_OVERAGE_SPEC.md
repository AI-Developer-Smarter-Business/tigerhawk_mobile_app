# Wait time / overtime billing — product spec (WT.1 · WT.34)

**Feature:** delivery wait timer at customer site → **60 minutes free** → billable detention → alerts (driver + TMS bell) → customer emails (planned).

**Repos:** mobile `proyecto_PP2_app_mobile` · TMS dev `docs/TMS_DEV_REPOSITORY.md`.

**Revision history**

| Date | Task | Change |
|------|------|--------|
| 10 Jun 2026 | WT.1 | Initial spec (auto start on **Arrived At Delivery**, stop on **Delivered**). |
| 18 Jun 2026 | WT.27 | Mobile: manual **Start wait time** / **End wait time** implemented. |
| 18 Jun 2026 | WT.34 | Spec aligned to manual start/stop + client rules. |
| 19 Jun 2026 | WT.20 | Supabase schema + Realtime on `waiting_time_events` applied. |
| 19 Jun 2026 | WT.22 | Driver read-only wait pay panel on load detail. |
| 19 Jun 2026 | WT.25 | Invoice label Q11: **Detention** on customer billing; **Wait time** driver UX. |

**Related docs:** `docs/QA_WAIT_TIME_OVERAGE.md` · `docs/WAIT_TIME_INVOICE_LABEL.md` · `docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md` · `RESPUESTAS_CLIENTE.md` · `PP2_TAREAS_DEV.md`

---

## Scope

| Rule | Value |
|------|--------|
| **Where** | **Customer delivery only** — slow unload at consignee. **Not** port, depot, pickup, or warehouse waits. |
| **How many timers** | **One** open `delivery_wait` event per load at a time. |
| **Free time** | **60 minutes** (`free_time_minutes = 60` on `waiting_time_events`). |
| **Billable** | Minute 61+ — Postgres trigger `trg_compute_wait_charges` sets `charge_amount`; on close, TMS upserts **Detention** line in `load_billing` (idempotent per event id). |
| **Event type** | `delivery_wait` |

---

## Check In / Check Out (semantics)

| Term | Meaning | Mobile action | TMS / API |
|------|---------|---------------|-----------|
| **Check In** | Driver is **present for unloading** at delivery | Tap **Start wait time** (manual). Load should be **`Arrived At Delivery`** (recommended; not auto-started by status change). | `POST …/api/dispatcher/loads/[id]/wait-time` with `event_name: delivery_wait`, `start_time`, `logged_by: driver`. |
| **Check Out** | **End of wait** (primary) | Tap **End wait time** — **does not** change load status. | `PATCH …/wait-time` with `end_time`. |
| **Check Out** (future auto) | e-POD signed and submitted in TMS | — | Closes open `delivery_wait` (**WT.28**, not implemented). |

**Important:** Changing status to **`Delivered`** (or other field statuses) **does not** start or stop the wait timer on mobile (**WT.27**).

---

## Document upload vs wait time (`opciones_driver.png`)

The client image **`opciones_driver.png`** (repo root) shows **document type labels** when uploading a photo (BOL, POD, In-Gate Ticket, Out-Gate Ticket, etc.). It is **not** the wait-time check-in UI.

| Concern | Wait time | Document upload |
|---------|-----------|-----------------|
| Trigger | **Start wait time** button | **Add driver photo** / future type picker (**DOC.1**) |
| Mobile today | `DeliveryWaitSection` | `PodUploadSection` → type **`Driver`** |
| TMS | `DeliveryWaitTimerPanel`, wait-time API | `DocumentsTab` (full type list for dispatch) |

---

## Business rules (current — WT.34)

| # | Rule | Implementation |
|---|------|----------------|
| **A** | **Manual start only** — no auto-start when status changes | ✅ Mobile **WT.27** — `useDeliveryWaitTimer.startTimer()`; eligible at **`Arrived At Delivery`**. |
| **B** | **Manual stop (primary)** — **End wait time** | ✅ Mobile **WT.27** — `stopTimer()`; copy in `strings.waitTime.endWaitTime*`. |
| **C** | **Only auto-stop:** TMS **e-POD signed and submitted** | ⏳ **WT.28** — hook `pod_signed_submitted` → PATCH wait-time `end_time`. |
| **D** | **Customer emails** at 45 min, 60 min (detention start), and close summary | ⏳ **WT.29–WT.31** — Resend + `email_templates`; recipient `customers.email`. |
| **E** | Offline queue for status, notes, POD, photos | ⏳ **OFF.2** — separate phase (`docs/OFFLINE_V1.md`). |

### Billing and notifications (unchanged from WT.1–15)

| Item | Behavior |
|------|----------|
| Driver banner after 60 min | *Waiting time exceeded — dispatch has been notified. Billable time may apply.* |
| TMS bell / toast | Dispatcher alert when billable threshold crossed |
| Driver pay | Summed from closed wait events on load completion (TMS `status/route.ts`) |
| Invoice label | **`Detention`** on `load_billing` (`charge_type`); description **Delivery detention** — see `docs/WAIT_TIME_INVOICE_LABEL.md` (**WT.25** ✅) |

---

## Mobile implementation map

| File | Role |
|------|------|
| `hooks/useDeliveryWaitTimer.ts` | Hydrate from API; manual `startTimer` / `stopTimer`; 60 s PATCH sync while open; **`paySummary`** (WT.22) |
| `components/loads/DeliveryWaitSection.tsx` | **Start wait time** + elapsed + **End wait time** + read-only pay panel |
| `components/loads/DeliveryWaitPaySummary.tsx` | Accrued wait time + estimated driver pay (WT.22) |
| `lib/wait-time/wait-pay-summary.ts` | Sum closed `driver_pay_amount` + live estimate for open timer |
| `lib/wait-time/constants.ts` | `DELIVERY_WAIT_ELIGIBLE_STATUS`, `DEFAULT_FREE_WAIT_MINUTES` |
| `lib/wait-time/hydrate-timer-state.ts` | Reads `waiting_time_events` only (no `actual_delivery` fallback) |
| `lib/tms/wait-time.ts` | Bearer client for wait-time API |
| `app/load/[id].tsx` | Wires hook + detail UI |

**API route (TMS):** `GET|POST|PATCH /api/dispatcher/loads/[id]/wait-time` — see `docs/MOBILE_API.md`.

**Mock (Phase A):** `EXPO_PUBLIC_WAIT_TIME_MOCK=1` — local AsyncStorage timer, no Supabase writes.

---

## Phases

| Phase | Mobile | TMS | Supabase |
|-------|--------|-----|----------|
| **A (WT.3–WT.4)** | Local mock timer | Sidebar demo panel (`?waitMock=1`) | No changes |
| **B (WT.5–WT.15, WT.21, WT.24–25, WT.27, WT.20, WT.22)** | Bearer API + manual start/stop | Live panel, bell, billing sync (Detention label) | `waiting_time_events` + Realtime ✅ (**WT.20**) |
| **C (WT.28–WT.31)** | Optional e-POD hook | Customer email templates + cron | Optional email log columns (**WT.20** / new migration TBD) |

---

## User copy (English — mobile `strings.waitTime`)

| Key | Text |
|-----|------|
| `sectionTitle` | Delivery wait time |
| `startWaitTime` | Start wait time |
| `startWaitTimeHint` | Tap when you are present for unloading. This starts the wait timer and billing clock. |
| `phaseFree` | Free waiting time |
| `phaseBillable` | Billable wait |
| `exceededBanner` | Waiting time exceeded — dispatch has been notified. Billable time may apply. |
| `endWaitTime` | End wait time |
| `endWaitTimeHint` | Stops the timer only. Load status stays the same. |
| `paySummaryTitle` | Your wait pay |
| `accruedTimeLabel` | Accrued wait time |
| `estimatedPayLabel` | Estimated wait pay |

TMS copy: see `DeliveryWaitTimerPanel` and notification templates in TMS dev repo.

---

## TMS gaps (WT.2 / WT.8 summary)

See `docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md` for audit checklist.

| Item | Before WT.8 | After WT.8 |
|------|-------------|------------|
| Bearer on `wait-time` | Cookie only | `getUserFromRequest` |
| Driver POST | Any authenticated user | Assigned driver or staff |
| Open timer (`start_time` only) | Rejected | Allowed |
| Mobile `logged_by` | `"dispatcher"` | `"driver"` when from app |

---

## Pending work (not WT.34)

| Task | Description |
|------|-------------|
| WT.28–WT.32 | e-POD auto-stop + customer emails + server cron |
| **WT.23 API** | Integrar Samsara real (credenciales + backport prod) — stub mock ya en TMS dev |
| DOC.1 | Document type picker on mobile upload |

---

## QA

Manual matrix: **`docs/QA_WAIT_TIME_OVERAGE.md`** (updated for manual start/stop).

Automated (mobile):

```bash
npm test -- --testPathPattern="timer-math|wait-time|wait-pay|DeliveryWaitSection|useDeliveryWaitTimer|hydrate-timer"
npm run lint
```

---

## Supabase / DB

**No schema changes required for WT.34** (documentation only). Runtime continues to use existing table **`waiting_time_events`**, trigger **`trg_compute_wait_charges`**, and TMS **`load_billing`** upsert. Optional SQL for Realtime and email columns: **WT.20** / **WT.29–31** (separate tasks).
