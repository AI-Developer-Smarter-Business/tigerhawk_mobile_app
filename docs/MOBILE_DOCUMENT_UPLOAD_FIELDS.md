# Mobile load document upload — field contract

Same **`load_documents`** row as dispatcher web upload. Different HTTP route for auth.

## HTTP

| Client | Method | Path |
|--------|--------|------|
| Dispatcher (browser) | POST | `/api/dispatcher/loads/{loadId}/documents` |
| Tigerhawk Mobile | POST | `/api/mobile/loads/{loadId}/documents` |

## Multipart form fields

| Field | Dispatcher | Mobile | Required |
|-------|------------|--------|----------|
| `file` | Browser `File` | RN `{ uri, name, type }` | Yes |
| `document_type` | e.g. `Other`, `POD` | `Driver` | Yes |
| `filename` | (inside File) | same as `file.name` | Mobile sends extra copy for RN |
| `access_token` | — | Supabase JWT | Mobile only |

## `load_documents` columns (insert)

| Column | Source |
|--------|--------|
| `load_id` | URL `{loadId}` |
| `filename` | `file.name` |
| `url` | signed Storage URL |
| `storage_path` | `{loadId}/{timestamp}_{sanitizedName}` |
| `document_type` | `Driver` (mobile) |
| `file_size` | `file.size` |
| `uploaded_by` | `auth.users.id` |
| `uploaded_at` | server ISO timestamp |

Storage bucket: **`load-documents`** (same as dispatcher).

## Permissions

- **Not** driver RLS INSERT — TMS uses `SUPABASE_SERVICE_ROLE_KEY`.
- Driver must have `user_profiles.role = 'driver'` and `loads.driver_id = auth.uid()`.

## Errors

| HTTP | `code` | Meaning |
|------|--------|---------|
| 401 | `MISSING_TOKEN` | No Bearer / `access_token` |
| 401 | `MOBILE_JWT_INVALID` | Wrong/expired JWT or different Supabase project |
| 403 | `NOT_ASSIGNED` | Load not assigned to this driver |
| 403 | `PROFILE_NOT_FOUND` | No `user_profiles` row |
| 400 | `MISSING_FILE` | `file` part not parsed |
