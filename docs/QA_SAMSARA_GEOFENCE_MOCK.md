# QA — Samsara geofence mock (WT.23)

**Scope:** TMS dev stub only — **no live Samsara account required**.

**Spec:** `docs/SAMSARA_GEOFENCE_SPIKE.md`

---

## Preconditions

- TMS dev deployed with WT.23 routes.
- Optional Netlify env: `SAMSARA_MOCK_ALLOW_SIMULATE=true` (dev).
- Load at **Arrived At Delivery** with **open** `delivery_wait` (mobile **Start wait time**).

---

## Matrix

| # | Step | Expected |
|---|------|----------|
| 1 | `GET …/api/integrations/samsara/webhook` (staff auth) | JSON `mode: mock_stub`, `pending: Samsara API credentials…` |
| 2 | `POST …/simulate` with valid `loadId` + open wait | `closed: true`, event has `end_time` |
| 3 | TMS wait panel | **Stopped**; Realtime refresh |
| 4 | Mobile detail (focus refresh) | Timer **Stopped**; status unchanged |
| 5 | `POST …/simulate` again (no open wait) | `closed: false`, `reason: no_open_event` |
| 6 | `activity_log` | Row `delivery_wait_geofence_auto_stop` |
| 7 | `POST …/webhook` without `SAMSARA_ENABLED` | **503** disabled message |
| 8 | Billable wait (>60 min) after simulate close | Billing **Detention** line (WT.24–25) |

---

## Automated

TMS repo:

```bash
npm test -- lib/integrations/samsara/__tests__/samsara-geofence.test.ts
```

Mobile repo: no code changes for WT.23.
