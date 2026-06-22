# Wait time — customer invoice label (WT.25 · Q11)

**Task:** resolve whether the customer invoice should say **Detention**, **Wait time**, or both for delivery wait overage.

**Decision (WT.25):** **one billable concept**, **one invoice line type** — **Detention**.

---

## Summary

| Audience | Term | Where |
|----------|------|--------|
| **Customer invoice / A/R** | **Detention** | `load_billing.charge_type = 'Detention'` |
| **Invoice line description** | **Delivery detention** | `load_billing.description` (includes billable minutes + id tag) |
| **Driver mobile app** | **Wait time** | `strings.waitTime.*` — unchanged (driver UX) |
| **Driver settlement / A/P** | **Wait time pay** | `driver_pay_amount` on `waiting_time_events` |
| **Internal data** | `delivery_wait` | `waiting_time_events.event_name` |

**Not billed:** port, depot, pickup, or terminal waits (client confirmed).

**Not used on auto-synced lines:** accessorial catalog **ACC-WAIT** (“Wait Time”) — manual dispatcher add-on only. Auto-sync from closed wait events uses **Detention** only (no duplicate Detention + Wait Time on the same event).

---

## Rationale

1. **Industry drayage** — customer-facing delay at consignee is commonly labeled *detention* on invoices and rate confirmations.
2. **TMS already standardized** — `BillingTab`, `schemas.ts`, rate confirmation PDF, and `sync-load-billing.ts` (WT.24) use **Detention**.
3. **Single data path** — `waiting_time_events` → trigger → `syncWaitEventToLoadBilling`; no second invoice line for the same event.
4. **Driver clarity** — mobile keeps *wait time* language (timer, pay panel WT.22); drivers are not the invoice recipient.

---

## TMS implementation

| File | Role |
|------|------|
| `lib/wait-time/invoice-labels.ts` | `DELIVERY_WAIT_INVOICE_CHARGE_TYPE`, `DELIVERY_WAIT_INVOICE_LINE_LABEL` |
| `lib/wait-time/sync-load-billing.ts` | Upsert `load_billing` on wait event close |
| `app/api/dispatcher/loads/[id]/wait-time/route.ts` | Calls sync on POST/PATCH close |
| `app/api/dispatcher/loads/[id]/status/route.ts` | Batch billing on Completed (uses same constants) |

**Example description (new events):**

```text
Delivery detention — 30 min billable (90 min total, 60 min free) [wte:<event-uuid>]
```

**Repo path:** `docs/TMS_DEV_REPOSITORY.md` (editable TMS, deploy Netlify).

---

## If the client prefers “Wait time” on invoices

Change **one constant** in TMS `invoice-labels.ts`:

- `DELIVERY_WAIT_INVOICE_CHARGE_TYPE` → only if `load_billing` enum / BillingTab is extended (today: **Detention** is a valid option).
- `DELIVERY_WAIT_INVOICE_LINE_LABEL` → e.g. `"Delivery wait time"`.

Redeploy TMS dev; existing lines keep old descriptions until re-synced or manually edited.

---

## Mobile repo

No invoice generation in Expo. Mobile references this doc from `docs/WAIT_TIME_OVERAGE_SPEC.md`. Driver strings remain **wait time**.

---

## QA

1. Close a `delivery_wait` event with billable `charge_amount` > 0.
2. TMS load **Billing** tab → line **charge_type** = **Detention**, description starts with **Delivery detention**.
3. `npm test -- --testPathPattern=sync-load-billing` (TMS repo).

---

**Related:** `RESPUESTAS_CLIENTE.md` § Q11 · `docs/QA_WAIT_TIME_OVERAGE.md` § row 7b · **WT.24** · **WT.29–31** (customer email copy may say “detention” — aligned).
