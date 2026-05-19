# Mobile error UX (task 3.4)

## Mapping

| Source | Mapper | UI |
|--------|--------|-----|
| Supabase PostgREST / RLS | `mapSupabaseError` | List/detail `ErrorBanner` |
| TMS `PATCH …/status` | `mapStatusChangeError` | `DriverActionBar` |
| Unknown | `mapErrorToUserFacing` | Both |

## TMS status codes

| HTTP / `code` | Kind | Driver sees |
|---------------|------|-------------|
| 403 + `ACTIVE_HOLDS` | `active_holds` | Title + message + hold labels (Freight, Customs, …) |
| 403 (other) | `permission` | Not allowed — no permission on this load |
| 401 | `auth` | Session expired |
| 400 + `validNextStates` | `validation` | Invalid transition + allowed statuses |

## PostgREST

| Signal | Kind |
|--------|------|
| `42501`, RLS message | `permission` |
| `PGRST301`, JWT expired | `auth` |
| `PGRST116` | `not_found` |

Entry point: `mapErrorToUserFacing(error)` in `lib/errors/`.
