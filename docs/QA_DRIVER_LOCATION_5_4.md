# QA — Driver location on device (task 5.4)

Manual matrix for **Your location** on a **physical phone** (iOS or Android). Web shows `notAvailableOnWeb` only — skip web for GPS.

Policy reference: `docs/GPS_V1_DECISION.md` (foreground only, no background tracking).

## Prerequisites

| Item | Value |
|------|--------|
| Build | Dev client or EAS build with `expo-location` (not Expo Go if permissions differ) |
| User | `driver_test@test.com` (or driver with an assigned load) |
| Path | Login → **My Loads** → open load → card **Your location** |
| Environment | Outdoors or near window for faster GPS fix |

## Test matrix

| # | Scenario | Steps | Pass criteria |
|---|----------|-------|---------------|
| L1 | First share (happy path) | Tap **Share location** → allow **While Using** | Coordinates appear; share sheet opens with `#reference` + lat/lng; no crash |
| L2 | Permission denied | Deny location → tap **Share location** again | Error banner; **Open Settings** visible; no infinite spinner |
| L3 | Recover after Settings | From L2: **Open Settings** → enable location for app → return to app | **Open Settings** hides without extra tap; **Share location** works on next press |
| L4 | Background resume | After L1 success: home button → wait 30s → reopen app on same load detail | Section still shows last coords; **Share location** still works |
| L5 | Location services off | System Settings → disable **Location** (GPS) for device → return → **Share location** | Error banner + **Open Settings**; re-enable GPS → return to app → banner clears; share works without restart |
| L6 | Low power / battery saver | Enable OS battery saver / Low Power Mode → **Share location** | Italic hint about battery saver; may be slower; app does not crash; accuracy may show em dash |
| L7 | Open in Maps | After coords shown → **Open in Maps** | Maps/browser opens near shared coordinates |
| L8 | TMS hint | With share-only policy | Italic hint that dispatch does not see GPS in TMS automatically |

## Regression (quick)

| Check | Pass |
|-------|------|
| Pull-to-refresh on load detail still works | |
| Driver status actions unchanged | |
| Documents card still loads | |

## Sign-off

| Role | Date | Device (OS) | Notes |
|------|------|-------------|-------|
| Dev | | | |
| QA / PM | | | |

**Related:** `docs/GPS_V1_DECISION.md`, `docs/GPS_TMS_INTEGRATION_5_3.md`, `PP2_TAREAS_DEV.md` §5.4.
