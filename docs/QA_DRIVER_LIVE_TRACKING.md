# QA — Live GPS mobile → TMS (task 8.16)

End-to-end check: **driver phone** sends foreground GPS to Supabase; **TMS dispatcher** sees **Driver Last Seen** and blue **Driver** marker on the load detail map within **60 seconds**.

**Not in scope:** Samsara fleet map (→ **WT.23**), background GPS, mobile map for dispatch.

Architecture: `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`.

Automated guards (CI):

```bash
npm test -- --testPathPattern="tracking-policy|update-load-live-location|useDriverLocationTracking|LiveLocationTrackingBanner|format-last-sent|driver-location"
```

TMS dev repo:

```bash
npm test -- lib/live-tracking/__tests__/driver-location.test.ts
```

## Prerequisites

| Item | Value |
|------|--------|
| Supabase | `20260605120000_pp2_driver_live_location_loads.sql` + **`fix_pp2_driver_location_trigger_updated_at.sql`** + `enable_realtime_driver_tracking.sql` |
| Mobile | **Physical phone** or emulator with GPS ( **not** mobile web — banner hidden on web ) |
| User | Driver assigned to test load (e.g. `driver_test@test.com`) |
| Load | Status **Dispatched**, **In Transit**, **Arrived At Delivery**, etc. (not *Assigned* only / *Completed*) |
| TMS | Deploy with **8.12–8.13** (map marker + **Driver Last Seen** column) |
| Mobile env | `EXPO_PUBLIC_SUPABASE_*` + same project as TMS |

## Primary pass criterion (8.16)

With load detail **open on phone** and location **allowed**, within **≤ 60 s** of first ping:

| Surface | Pass |
|---------|------|
| Mobile banner | *Last sent: Just now* (no red trigger error) |
| Supabase `loads.last_seen_at` | Non-null, within last minute |
| TMS board | **Driver Last Seen** = *Just now* (not —) |
| TMS load detail map | Blue **Driver** marker + legend *Driver (Just now)* |

Default ping interval: **~45 s** (`lib/location/tracking-policy.ts`).

## Test matrix

| # | Scenario | Steps | Pass criteria |
|---|----------|-------|---------------|
| G1 | Happy path E2E | Phone: login → My Loads → open assigned load → allow GPS → keep detail open **60 s**. TMS: dispatcher, same load. | G1 table above; marker near real position |
| G2 | SQL proof | After G1, run verify query (below) | `current_latitude`, `current_longitude`, `last_seen_at` populated |
| G3 | Board → detail | TMS: click **Driver Last Seen** on row | Load detail opens; map shows Driver marker |
| G4 | Realtime refresh | Keep mobile detail open; move ~100 m (or emulator location); wait **≤ 60 s** | TMS *Last seen* / marker updates without full page reload (may lag ~1–2 s debounce) |
| G5 | Detail closed | Open load → wait for *Just now* → back to list **30 s** → reopen TMS | Last seen age increases; no new pings while detail closed |
| G6 | Permission denied | Deny GPS → open load detail | Banner *Location needed for dispatch* + **Open Settings**; no crash |
| G7 | Trigger fix | If banner shows PP2 Semana 8 trigger error | Apply `fix_pp2_driver_location_trigger_updated_at.sql`; retry G1 |
| G8 | Status vs GPS | Tap **In transit** (or other field action) | Status updates via TMS API; GPS independent — still need detail open for pings |
| G9 | Manual share still works | **Your location** → Share location | WhatsApp/manual share works; complementary to live tracking (`docs/QA_DRIVER_LOCATION_5_4.md`) |

## Supabase verify query

```sql
SELECT reference_number, status, driver_id,
       current_latitude, current_longitude, last_seen_at
FROM loads
WHERE reference_number = '<LOAD_REF>';
```

## Out of scope (phase 0)

| Item | Notes |
|------|--------|
| Samsara live map | Separate track **WT.23** |
| GPS with app in background | Foreground only (**8.10** N/A) |
| Driver map in mobile app | Banner only on phone |
| Sub-60 s continuous animation | Pings every ~45 s max |

## Regression (quick)

| Check | Pass |
|-------|------|
| Driver status actions (`docs/QA_DRIVER_ACTIONS_3_7.md`) | |
| Wait time Check In/Out | |
| Document upload | |
| `npm run ci` (mobile repo) | |

## Sign-off

| Role | Date | Load ref | Phone OS | TMS env | G1 ≤ 60 s |
|------|------|----------|----------|---------|-----------|
| Dev | | | | | |
| QA / PM | | | | | |

**Related:** `docs/TMS_DEV_REPOSITORY.md`, `docs/GPS_LIVE_TRACKING_SIGNOFF_8_17.md`, `supabase/sql-editor/VERIFY_pp2_driver_live_location.sql`, `PP2_TAREAS_DEV.md` §8.16 / **9.6**.
