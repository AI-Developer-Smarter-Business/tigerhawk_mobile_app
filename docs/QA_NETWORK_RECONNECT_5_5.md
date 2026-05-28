# QA — Offline / reconnect hardening (task 5.5)

Regression matrix after task **4.5** fixes. Run on **Android + Expo Go** (or dev client) with TMS reachable.

## Prerequisites

| Item | Value |
|------|--------|
| User | `driver_test@test.com` with assigned loads |
| Path | Login → **My Loads** → open load detail |
| Network | Wi‑Fi or mobile data, then **Airplane mode** toggle |

## Test matrix

| # | Scenario | Steps | Pass criteria |
|---|----------|-------|---------------|
| R1 | Go offline | Airplane mode ON ~10 s on load detail | Yellow **No internet** banner; pull-down does not spin forever |
| R2 | Reconnect (no pull) | Airplane OFF, wait ~5 s, **do not** pull down | Banner clears; route/status/docs refresh; **no** white spinner stuck at top |
| R3 | Profile gate | During R2, open **Account** | Still shows driver name/role — **not** “No profile found” |
| R4 | Manual pull | On **My Loads**, pull down once after R2 | Spinner only while finger gesture; list updates once |
| R5 | Status offline | Offline → tap driver status button | Blocked with offline message; no stuck loading on button |
| R6 | Flaky network | Toggle airplane twice within 30 s | App recovers without duplicate errors or permanent spinners |

## Sign-off

| Role | Date | Device | Notes |
|------|------|--------|-------|
| Dev | | | |
| QA | | | |

**Related:** `docs/OFFLINE_V1.md`, `PP2_TAREAS_DEV.md` §5.5.
