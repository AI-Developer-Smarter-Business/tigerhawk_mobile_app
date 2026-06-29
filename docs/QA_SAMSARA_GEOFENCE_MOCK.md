# QA — Samsara geofence (WT.23 / 9.5)

**Spec:** `docs/SAMSARA_GEOFENCE_SPIKE.md`

---

## A. Mock simulate (no Samsara account)

### Preconditions

- TMS deployed with Samsara routes.
- Optional Netlify env: `SAMSARA_MOCK_ALLOW_SIMULATE=true` (dev).
- Load at **Arrived At Delivery** with **open** `delivery_wait` (mobile **Start wait time**).

### Matrix

| # | Step | Expected |
|---|------|----------|
| M1 | `GET …/api/integrations/samsara/webhook` (staff auth) | JSON `mode: mock_stub` or `live` if env set |
| M2 | `POST …/simulate` with valid `loadId` + open wait | `closed: true`, event has `end_time` |
| M3 | TMS wait panel | **Stopped**; Realtime refresh |
| M4 | Mobile detail (focus refresh) | Timer **Stopped**; load status unchanged |
| M5 | `POST …/simulate` again (no open wait) | `closed: false`, `reason: no_open_event` |
| M6 | `activity_log` | Row `delivery_wait_geofence_auto_stop` |
| M7 | `POST …/webhook` without `SAMSARA_ENABLED` | **503** disabled message |
| M8 | Billable wait (>60 min) after simulate close | Billing **Detention** line (WT.24–25) |

```bash
curl -X POST "$TMS_URL/api/integrations/samsara/simulate" \
  -H "Content-Type: application/json" \
  -d '{"loadId":"LOAD_UUID","eventType":"geofence_exit","geofenceName":"Customer delivery (mock)"}'
```

---

## B. Live Samsara webhook

### Preconditions

| Item | Value |
|------|--------|
| Netlify | `SAMSARA_ENABLED=true`, `SAMSARA_API_TOKEN`, `SAMSARA_WEBHOOK_SECRET` |
| Samsara | Webhook subscription **GeofenceExit** → `{TMS_URL}/api/integrations/samsara/webhook` |
| Load | Open `delivery_wait` (mobile Check In) |
| Mapping | Prefer `externalIds.loadId` on geofence/vehicle **or** driver `truck_number` = vehicle plate |

### Matrix

| # | Step | Expected |
|---|------|----------|
| L1 | `GET …/webhook?ping=1` (staff) | `mode: live`, `apiPing.ok: true` |
| L2 | Trigger real GeofenceExit in Samsara | TMS **200**, `closed: true` |
| L3 | `waiting_time_events` | `end_time` set |
| L4 | `activity_log` | `integration: live`, `pending_samsara_api: false` |
| L5 | Invalid signature | **401** when secret configured |
| L6 | Ambiguous vehicle (2 open waits) | **409** `ambiguous_load` |

### Sample GeofenceExit body (v2)

```json
{
  "eventType": "GeofenceExit",
  "eventTime": "2026-06-27T15:00:00.000Z",
  "data": {
    "address": {
      "name": "Customer delivery",
      "externalIds": { "loadId": "<load-uuid>" }
    },
    "vehicle": {
      "id": "494123",
      "licensePlate": "6SAM123",
      "name": "Fleet Truck #1"
    }
  }
}
```

---

## Automated

TMS repo:

```bash
npm test -- lib/integrations/samsara/__tests__/samsara-geofence.test.ts
```

Mobile repo: no Samsara SDK — geofence is TMS-only.

**Supabase:** no schema changes for 9.5.
