# TMS ↔ Tigerhawk Mobile — API contract (K.2)

**Updated:** 21 July 2026  
**Sources of truth:** `z-feedback_cliente/RESPUESTAS_CLIENTE.md` · `lib/tms/mobile-api-routes.ts` · live TMS (`EXPO_PUBLIC_TMS_API_URL`)  
**Base URL:** `EXPO_PUBLIC_TMS_API_URL` (no trailing slash). All mobile traffic is under `/api/mobile/*`.

> Historical May 2026 audit (dispatcher PATCH / Supabase-first) is obsolete for driver progress. Prefer this document.

---

## 1. Identity & auth

| Rule | Detail |
|------|--------|
| Truck drivers | **No** `user_profiles` row. Gate = mobile login + JWT + `drivers.mobile_enabled` |
| Login | `POST /api/mobile/auth/login` `{ "username", "password" }` → Supabase session |
| Calls | `Authorization: Bearer <access_token>` |
| Revocation | Every route re-checks `mobile_enabled`; treat `UNAUTHORIZED` / `MOBILE_JWT_INVALID` / `NOT_AUTHORIZED` as drop session → login |
| Forgot password | **No** in-app reset (J.5). Contact dispatch |

Path constant: `MOBILE_AUTH_LOGIN_PATH`.

---

## 2. Canonical routes (path builders)

| Constant / helper | Method | Path |
|-------------------|--------|------|
| `MOBILE_AUTH_LOGIN_PATH` | POST | `/api/mobile/auth/login` |
| `MOBILE_DRIVER_CLOCK_PATH` | GET, POST | `/api/mobile/driver/clock` |
| `MOBILE_DRIVER_LOADS_PATH` | GET | `/api/mobile/driver/loads` |
| `MOBILE_DRIVER_LOAD_HISTORY_PATH` | GET | `/api/mobile/driver/loads/history` |
| `mobileLoadProgressPath(id)` | GET, POST | `/api/mobile/loads/{id}/progress` |
| `mobileLoadDocumentsPath(id)` | GET, POST | `/api/mobile/loads/{id}/documents` |
| `mobileLoadPodPath(id)` | GET | `/api/mobile/loads/{id}/pod` |
| `mobileLoadPodSignaturePath(id)` | POST | `/api/mobile/loads/{id}/pod-signature` |
| `mobileLoadAcceptPath(id)` | POST | `/api/mobile/loads/{id}/accept` |
| `mobileLoadRejectPath(id)` | POST | `/api/mobile/loads/{id}/reject` |

**Do not** call `PATCH /api/dispatcher/loads/{id}/status` from the driver app (deprecated for conductors).

---

## 3. Loads list — Active / Upcoming

```http
GET /api/mobile/driver/loads
→ { active: […cards], upcoming: […cards] }
```

- Cards are **moves**, not loads.
- Active = started move on unfinished load; Upcoming = assigned, not started.
- UI: Loads tab buckets; labels from `progress.label` (TABLE vocabulary lives on the server).

---

## 4. Accept / Reject (per move)

```http
POST /api/mobile/loads/{id}/accept
{ "move_id": "…", "start": true | false }

POST /api/mobile/loads/{id}/reject
{ "move_id": "…", "reason": "…" }
```

- Accept & Start = **one** request (`start: true`).
- Reject after start → `409 MOVE_ALREADY_STARTED` → call dispatch.

---

## 5. Progress (only driver state machine)

```http
GET  /api/mobile/loads/{id}/progress
POST /api/mobile/loads/{id}/progress
{ "action": "start_move" | "enroute" | "arrived" | "complete",
  "move_id": "…",              // optional
  "chassis_number": "…",       // required on arrive at pick (≤50)
  "container_number": "…",     // when server asks
  "seal_number": "…",
  "note": "…" }
```

- Phone **never** sends a raw load status string.
- Buttons: Enroute / Arrived / Complete Load / Start Move — labels from GET progress.
- Complete gated by `REQUIREMENTS_NOT_MET` + `missing[]` (HTTP **422** or **409**).

---

## 6. Documents & TIR

```http
POST /api/mobile/loads/{id}/documents
Content-Type: multipart/form-data
file + document_type: "Driver" | "Photo" | "POD" | "TIR Out" | "TIR In"
```

- Driver-uploaded “POD” photo is stored as **Driver** for legal reasons.
- Legal POD PDF is minted only via pod-signature (below).

---

## 7. Legal POD stamp

```http
GET  /api/mobile/loads/{id}/pod
→ { pod: {…}, state: "unsigned" | "pending" | "signed", signature: … }

POST /api/mobile/loads/{id}/pod-signature
{ "client_signature_id": "<uuid, stable across retries>",
  "signer_name": "…",
  "signed_at": "<ISO, device time>",
  "signature_png": "<base64>",
  "latitude": …, "longitude": …,   // optional
  "move_id": "…" }                 // optional
```

| HTTP | Meaning |
|------|---------|
| 201 / 200 | Signed; POD filed (retry returns same doc) |
| 202 | `STAMP_PENDING` — **success for the driver**; re-POST same id later |

**Gate:** leaving delivery without signature → `422 POD_SIGNATURE_REQUIRED` → open signature UI.  
**Offline:** flush `pod-signature` **before** enroute/arrived that departs delivery.

---

## 8. Clock (≠ Wait Check In/Out)

```http
GET  /api/mobile/driver/clock
POST /api/mobile/driver/clock
{ "event": "in" | "out", "note": "optional" }
```

- Clock Out does **not** unassign loads. Copy: “You're off duty. Your loads stay assigned to you.”
- Wait Check In/Out remains on load detail (detention).

---

## 9. Error codes (app actions)

| code | Typical HTTP | App should |
|------|--------------|------------|
| `UNAUTHORIZED` / `MOBILE_JWT_INVALID` | 401 | Drop session → login |
| `NOT_AUTHORIZED` | 403 | Drop session → contact dispatch |
| `NOT_ASSIGNED` | 403 | Refresh list |
| `CHASSIS_REQUIRED` | 422 | Prompt chassis |
| `POD_SIGNATURE_REQUIRED` | 422 | Open signature |
| `REQUIREMENTS_NOT_MET` | 422 / 409 | Show `missing[]` checklist |
| `MOVE_ALREADY_STARTED` | 409 | Call dispatch |
| `STAMP_PENDING` | 202 | Treat as success |
| `NO_ROUTE` | 4xx | Tell dispatch |

Implementation: `lib/tms/mobile-api-error-codes.ts`, `lib/errors/map-api-error.ts`.

---

## 10. Environment

```
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY
EXPO_PUBLIC_TMS_API_URL          # e.g. https://tigerhawkv2.netlify.app
EXPO_PUBLIC_DISPATCH_PHONE       # optional — Account Call dispatch (J.5)
EXPO_PUBLIC_DISPATCH_EMAIL       # optional — Account Email dispatch (J.5)
```

Same Supabase project as TMS. EAS: `npm run eas:push-env` (see `docs/MOBILE_BUILDS.md`).

---

## 11. Out of oleada 1 (Wave 2)

Pay · Messages · My Equipment — required before full release; not part of this contract surface yet.

---

## 12. Related

- QA matrix: `docs/QA_OLEADA1_MATRIX_K1.md`
- Smoke: `npm run smoke:a0` · `npm run smoke:a1` · `npm run qa:k1`
- Builds: `docs/MOBILE_BUILDS.md` · `CHANGELOG.md` (local) · `docs/RELEASE_NOTES_0_1_2.md`
