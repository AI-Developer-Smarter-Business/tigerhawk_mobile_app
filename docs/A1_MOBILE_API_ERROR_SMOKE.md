# A.1 — Mobile API smoke + handleable error codes

**Task:** `z-feedback_cliente/TASKS.md` → **A.1**  
**Contract:** `z-feedback_cliente/RESPUESTAS_CLIENTE.md` § Error codes  
**Depends on:** A.0 route matrix (`docs/A0_MOBILE_API_PREVIEW_SMOKE.md`)  
**Updated:** 14 July 2026

---

## 1. Done meaning

A.1 is complete when every RESPUESTAS code has a **typed app action** and the A.1 endpoint set is covered by smoke + path builders — even if Netlify still returns `404` for the July-14 surface.

| Layer | File |
|-------|------|
| Codes + `appAction` | `lib/tms/mobile-api-error-codes.ts` |
| Parse / `TmsMobileApiError` | `lib/tms/mobile-api-error.ts` |
| Driver copy | `lib/errors/map-mobile-api-error.ts` + `lib/errors/strings.ts` |
| Entry | `mapErrorToUserFacing` handles `TmsMobileApiError` first |
| Routes | `lib/tms/mobile-api-routes.ts` |
| Live smoke | `npm run smoke:a1` |

---

## 2. Code → app should (handleable)

| code | appAction | UI / next step |
|------|-----------|----------------|
| `UNAUTHORIZED` / `MOBILE_JWT_INVALID` | `drop_session_login` | Clear session → login (wired fully in **A.4**) |
| `NOT_AUTHORIZED` | `drop_session_contact_dispatch` | Clear session → contact dispatch |
| `NOT_ASSIGNED` | `refresh_list` | Refresh Active/Upcoming |
| `CHASSIS_REQUIRED` | `prompt_chassis` | Chassis keyboard |
| `POD_SIGNATURE_REQUIRED` | `open_signature` | POD sign screen |
| `REQUIREMENTS_NOT_MET` | `show_checklist` | `missing[]` bullets |
| `MOVE_ALREADY_STARTED` | `call_dispatch` | “Call dispatch” |
| `STAMP_PENDING` (202) | `treat_as_success_retry_silent` | Success for driver; retry stamp quietly |
| `NO_ROUTE` | `tell_dispatch` | Not a driver fault |

`STAMP_PENDING` is **not** a failure for the driver (`isDriverSuccess`).

---

## 3. Endpoints smoked (A.1)

| Id | Method | Path |
|----|--------|------|
| auth.login | POST | `/api/mobile/auth/login` |
| driver.clock | GET/POST | `/api/mobile/driver/clock` |
| driver.loads | GET | `/api/mobile/driver/loads` |
| loads.progress | GET/POST | `/api/mobile/loads/{id}/progress` |
| loads.documents | POST | `/api/mobile/loads/{id}/documents` |
| loads.pod | GET | `/api/mobile/loads/{id}/pod` |
| loads.pod-signature | POST | `/api/mobile/loads/{id}/pod-signature` |
| loads.accept | POST | `/api/mobile/loads/{id}/accept` |
| loads.reject | POST | `/api/mobile/loads/{id}/reject` |

Unauthenticated live probes only record **status + inferred/parsed `code`** (no bodies logged).

---

## 4. Commands

```bash
npm test -- --testPathPattern="mobile-api-error|mobile-api-routes" --ci
npm run smoke:a1
npm run smoke:a1 -- --base-url=https://<preview> --require-codes
```

---

## 5. Host note (14 Jul 2026)

Against `tigerhawkv2.netlify.app`, July-14 routes remain **missing** (see A.0). A.1 still ships handleable codes in-app so A.2+ can switch on `appAction` when preview/main goes live.
