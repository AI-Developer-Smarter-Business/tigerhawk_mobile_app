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

## Progress UI policy (D.2)

Current driver screens use server-derived `GET/POST …/progress` through
`useDriverProgressQuery` and `useDriverProgressAction`. The app does not derive
raw status transitions or apply optimistic status changes.

`runDriverStatusChange` remains isolated only to drain `status_change` items
created by app versions older than D.2; it performs no optimistic update.

## Staging / production

- **Dev (`__DEV__`)**: console warnings via `safeLog`.
- **Release builds**: telemetry is a no-op unless you add Sentry (or similar) in a separate task — wire `captureException` at the failure site in `driverStatusTelemetry.failure` when `EXPO_PUBLIC_SENTRY_DSN` is available.
