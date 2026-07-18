# Mobile error UX (task 3.4)

## Mapping

| Source | Mapper | UI |
|--------|--------|-----|
| Supabase PostgREST / RLS | `mapSupabaseError` | List/detail `ErrorBanner` |
| TMS `GET/POST …/progress` | `mapMobileApiError` | `DriverProgressActions` / `ErrorBanner` |
| Unknown | `mapErrorToUserFacing` | Both |

## TMS status codes

| HTTP / `code` | Kind | Driver sees |
|---------------|------|-------------|
| 403 + `ACTIVE_HOLDS` | `active_holds` | Title + message + hold labels (Freight, Customs, …) |
| 403 (other) | `permission` | Not allowed — no permission on this load |
| 401 | `auth` | Session expired |
| 400 + `validNextStates` | `validation` | Invalid transition + allowed statuses |

## Mobile `/api/mobile/*` codes (TASKS A.1)

Canonical list + `appAction`: `lib/tms/mobile-api-error-codes.ts`.  
Parser: `TmsMobileApiError` / `parseMobileApiErrorBody`.  
UX: `mapMobileApiError` via `mapErrorToUserFacing`.  
Doc: `docs/A1_MOBILE_API_ERROR_SMOKE.md`.

| `code` | appAction |
|--------|-----------|
| `UNAUTHORIZED` / `MOBILE_JWT_INVALID` | drop session → login |
| `NOT_AUTHORIZED` | drop session → contact dispatch |
| `NOT_ASSIGNED` | refresh list |
| `CHASSIS_REQUIRED` | prompt chassis |
| `POD_SIGNATURE_REQUIRED` | open signature |
| `REQUIREMENTS_NOT_MET` | show `missing[]` |
| `MOVE_ALREADY_STARTED` | call dispatch |
| `STAMP_PENDING` | success + silent retry |
| `NO_ROUTE` | tell dispatch |

## PostgREST

| Signal | Kind |
|--------|------|
| `42501`, RLS message | `permission` |
| `PGRST301`, JWT expired | `auth` |
| `PGRST116` | `not_found` |

Entry point: `mapErrorToUserFacing(error)` in `lib/errors/`.
