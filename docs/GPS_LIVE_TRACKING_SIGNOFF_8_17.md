# GPS live tracking — phase 0 sign-off (task 8.17 / 9.6)

**Scope:** Mobile foreground GPS → Supabase `loads.current_*` → TMS dispatcher map (**8.12–8.16**).  
**Not in scope:** Samsara fleet map (**9.5**), background GPS (**8.10**), mobile map for dispatch.

**QA matrix:** `docs/QA_DRIVER_LIVE_TRACKING.md`  
**Architecture:** `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`

---

## Delivered (phase 0)

| Layer | Status |
|-------|--------|
| Supabase columns + RLS + trigger fix | ✅ `20260605120000_pp2_driver_live_location_loads.sql`, `fix_pp2_driver_location_trigger_updated_at.sql` |
| Mobile send (~45 s, detail open, phone only) | ✅ `useDriverLocationTracking`, `LiveLocationTrackingBanner` |
| TMS map marker + **Driver Last Seen** | ✅ `LoadSidebarMap`, `LoadsTable` (**8.12–8.13**) |
| Automated CI guards | ✅ mobile + TMS `driver-location` tests |
| Manual E2E checklist | ✅ `docs/QA_DRIVER_LIVE_TRACKING.md` G1–G9 |

---

## Sign-off record

Complete after manual G1 on a **physical device** (not mobile web):

| Role | Name | Date | Load ref | Phone OS | TMS URL | G1 ≤ 60 s | Notes |
|------|------|------|----------|----------|---------|-----------|-------|
| Dev | | | | | | ☐ | |
| QA / PM | | | | | | ☐ | |

**Pass criteria (G1):** within **≤ 60 s** of opening load detail with GPS allowed:

- Mobile: *Last sent: Just now*
- Supabase: `loads.last_seen_at` populated
- TMS board: **Driver Last Seen** not `—`
- TMS load map: blue **Driver** marker

---

## Deferred (documented, not blocking handoff)

| ID | Item |
|----|------|
| 8.10 | Background GPS |
| 8.11 | Optional TMS PATCH location from dispatcher |
| 8.14–8.15 | Location history / trail |
| WT.23 | Samsara geofence auto check-out (**9.5**) — separate from Supabase GPS |

---

## How to verify before sign-off

**Mobile repo:**

```bash
npm test -- --testPathPattern="tracking-policy|update-load-live-location|useDriverLocationTracking|LiveLocationTrackingBanner|format-last-sent|driver-location"
npm run ci
```

**TMS dev repo:**

```bash
npm test -- lib/live-tracking/__tests__/driver-location.test.ts
```

**Supabase:** run `supabase/sql-editor/VERIFY_pp2_driver_live_location.sql`.

---

**Revision:** 27 Jun 2026 · task **8.17 / 9.6** · phase 0 complete pending QA sign-off row above.
