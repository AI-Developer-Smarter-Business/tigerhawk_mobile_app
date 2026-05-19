# TMS patch — task 3.3 (driver status guard)

**Scope:** `PROYECTO_MUESTRA/app/api/dispatcher/loads/[id]/status/route.ts` (apply in the TMS repo, not in PP2 mobile).

**Problem:** A driver JWT can PATCH any status allowed by `getEffectiveTransitions()`, including dispatcher-only targets (e.g. `Dispatched`, `Completed`).

**Fix:** After transition validation, reject non–field statuses when `profile.role === "driver"`.

```typescript
// Same set as DriverActionPanel.tsx → DRIVER_STATUSES
const DRIVER_FIELD_STATUSES = new Set<LoadStatus>([
  "Arrived At Pickup",
  "In Transit",
  "Arrived At Delivery",
  "Delivered",
  "At Warehouse",
  "Arrived To Hook Container",
  "Enroute To Drop Container",
  "Dropped - Loaded",
  "Dropped - Empty",
  "Enroute To Return Empty",
  "Arrived At Return Empty",
])

// Insert after validNextStates check, before holds block:
if (profile?.role === "driver" && !DRIVER_FIELD_STATUSES.has(newStatus)) {
  return NextResponse.json(
    {
      error: "Drivers cannot set this status. Use dispatcher actions in the TMS.",
      code: "DRIVER_STATUS_FORBIDDEN",
    },
    { status: 403 },
  )
}
```

**PP2 mobile:** `lib/tms/assert-driver-status.ts` applies the same rule before calling the API.

**Test:** As `driver_test@test.com`, attempt PATCH with `{ "status": "Completed" }` from a `Delivered` load → **403** + `DRIVER_STATUS_FORBIDDEN`.
