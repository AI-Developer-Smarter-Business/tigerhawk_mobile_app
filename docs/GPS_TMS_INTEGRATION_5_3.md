# GPS ↔ TMS integration audit (task 5.3)

**Date:** May 2026 · **Scope:** read-only review of deployed TMS (`PROYECTO_MUESTRA/` reference) · **Mobile:** PP2 v1

---

## Summary

| Question | Answer |
|----------|--------|
| Is there `POST /api/tracking/loads/[id]/locations`? | **No** — only mentioned in `docs/driver_app_roadmap.md` (aspirational). |
| Table for driver GPS points on a load? | **No** dedicated table in migrations reviewed. |
| Can mobile persist lat/lng to TMS in v1 without new backend? | **No** — not without misusing unrelated APIs. |
| **v1 approved path** | **Share sheet** (task 5.2): WhatsApp/SMS with load reference + coordinates. |

---

## Routes reviewed (TMS)

| Route | Driver access | GPS fit | Verdict |
|-------|---------------|---------|---------|
| `POST …/loads/[id]/documents` | Assigned driver (patch 4.1) | Files only | ❌ Not for coordinates |
| `PATCH …/loads/[id]/status` | Assigned driver | Status only | ❌ |
| `PATCH …/loads/[id]` | Assigned driver | Text fields (`pickup_location`, `notes`, …) | ❌ Overwriting load notes/locations is unsafe |
| `POST …/loads/[id]/messages` | Auth + load exists | Could embed coords in `message` text | ⚠️ No mobile messages UI; pollutes chat — **not v1** |
| `POST …/loads/[id]/wait-time` | Auth + load exists | `location` is **free text** for wait event place name | ❌ Wrong domain (detention/wait), not GPS ping |
| `GET /api/organizations/locations` | Staff org address book | Name/address master data | ❌ Not driver position |

**Coordinates in DB today:** `lane_origins.latitude/longitude` (pay/lane config), not per-load driver tracking.

---

## PP2 mobile decision (v1)

1. **Keep** `LoadLocationSection` → Share + Open in Maps (`lib/location/share-load-location.ts`).
2. **Do not** call TMS for GPS until a dedicated route exists (see future patch below).
3. **Code flag:** `lib/location/tms-location-integration.ts` → `canPersistLocationToTms() === false`.
4. **UI copy:** `strings.location.tmsShareOnlyHint` when persistence is unavailable.

---

## Future TMS work (post–v1 / client TMS repo)

Recommended new route (mirrors roadmap):

```http
POST /api/dispatcher/loads/{id}/driver-location
Authorization: Bearer <supabase_jwt>
Content-Type: application/json

{
  "latitude": number,
  "longitude": number,
  "accuracy_meters": number | null,
  "recorded_at": "ISO-8601"
}
```

- Permission: assigned `driver` or staff (same pattern as `documents/route.ts` + `status/route.ts`).
- Storage: new table e.g. `load_driver_locations` **or** append-only rows in `activity_log` with structured `details`.
- TMS UI: pin or last-known row on load detail / Documents sidebar.

Until deployed, mobile should flip `hasTrackingApi` in `tms-location-integration.ts` and wire `postDriverLocationToTms()` (stub today).

---

## References

- `docs/GPS_V1_DECISION.md`
- `docs/MOBILE_API.md` § location
- `lib/location/tms-location-integration.ts`
