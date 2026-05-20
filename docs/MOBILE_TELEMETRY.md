# Mobile telemetry (task 3.5)

## Dev logging

Driver status changes emit structured events via `safeLog.event` (dev builds only):

| Event | Scope | Fields |
|-------|-------|--------|
| `attempt` | `driver.status` | `loadId`, `from`, `to`, `optimistic` |
| `success` | `driver.status` | + `durationMs` |
| `failure` | `driver.status` | + `rolledBack`, `code` (TMS error code) |

Entry: `driverStatusTelemetry` in `lib/telemetry/driver-status.ts`.

Never log tokens, passwords, or full API bodies. `safe-log.ts` redacts sensitive keys.

## Optimistic UI policy

Optimistic React Query + `LoadsContext` updates run only when `canOptimisticallyUpdateLoadStatus` is true:

- No `active_holds`
- Valid driver transition (`canDriverTransition`)
- Target is a driver-field status (not dispatch/final)

Otherwise `runDriverStatusChange` calls TMS first and invalidates cache on success (no speculative write).

Orchestration: `lib/driver-status/run-driver-status-change.ts`  
Screen hook: `hooks/useDriverStatusChange.ts`

## Staging / production

- **Dev (`__DEV__`)**: console warnings via `safeLog`.
- **Release builds**: telemetry is a no-op unless you add Sentry (or similar) in a separate task — wire `captureException` at the failure site in `driverStatusTelemetry.failure` when `EXPO_PUBLIC_SENTRY_DSN` is available.
