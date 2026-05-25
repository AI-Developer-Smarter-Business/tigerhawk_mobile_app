# GPS v1 — product decision (task 5.1)

**Date:** May 2026 · **Deadline:** 9 Jun 2026 · **Status:** approved for v1

## Decision

| Topic | v1 (PP2) | v1.1+ |
|-------|----------|-------|
| Location access | **Foreground only** (`whenInUse`) while Tigerhawk Mobile is open | Background / geofencing |
| Use case | Show or share current coordinates on **load detail** for dispatch | Continuous tracking, auto check-in |
| TMS persistence | **TBD** in task 5.3 (only if existing API/table) | Full tracking pipeline |
| Battery / legal | No background service; disclaimer in app (`strings.location`) | Revisit with legal if background added |

## Rationale

- Field drivers need dispatch to know **where they are now** on an assigned load, not 24/7 tracking in the first release.
- Foreground-only minimizes iOS/Android permission friction and store review risk before the 9 Jun deadline.
- Aligns with `docs/driver_app_roadmap.md` aspirational background tracking deferred to post-v1.

## Implementation map

| Task | Deliverable |
|------|-------------|
| **5.1** ✅ | This doc, `lib/location/gps-v1-policy.ts`, `strings.location`, `app.json` plugin (no background) |
| **5.2** ✅ | `expo-location` on load detail, share location |
| **5.3** | TMS API/table review for persist |
| **5.4** | Device QA (denied permission, resume app) |

## Code references

- Policy: `lib/location/gps-v1-policy.ts`
- User copy: `constants/strings.ts` → `location`
- Native permissions: `app.json` → `expo-location` plugin

## Out of scope v1

- `expo-task-manager` background tasks
- Android foreground service for location
- Map tiles / geocoding (optional 5.6 if product asks later)
