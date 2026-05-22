# Dispatcher API routes — PP2 mobile reference

**Date:** 19 May 2026  
**Source of truth (read-only):** `PROYECTO_MUESTRA/docs/DISPATCHER_API_ROUTES.md` and `app/api/dispatcher/` in the TMS repo.

The mobile app **does not call these routes today** for list/detail master data; it reads **`public.loads`** via Supabase PostgREST with driver RLS. Status changes and documents will use TMS HTTP APIs per `docs/MOBILE_API.md` §4.2 (week 3+).

---

## Routes relevant to PP2

| Method | Route | Mobile phase | Notes |
|--------|-------|--------------|-------|
| `GET` | `/api/dispatcher/loads` | — | Staff list; mobile uses Supabase `fetchDriverLoadsPage` |
| `GET` | `/api/dispatcher/loads/[id]` | **2.3 (read via Supabase)** | Full load + embeds; mirrored in `LOAD_DETAIL_SELECT` |
| `PATCH` | `/api/dispatcher/loads/[id]/status` | **Done (3.1)** | `lib/tms/patch-load-status.ts` — `{ status }` + Bearer JWT |
| `GET` | `/api/dispatcher/loads/[id]/messages` | Future | Chat thread |
| `POST` | `/api/dispatcher/loads/[id]/messages` | Future | Send message |
| `GET` | `/api/dispatcher/loads/[id]/documents` | Future | POD list |
| `POST` | `/api/dispatcher/loads/[id]/documents` | Ready (4.1) | Upload POD — TMS patch A in `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md`; mobile `lib/tms/upload-load-document.ts` |

Routes **not** used by drivers: billing, payments, assign-driver, audit, pipeline, problem-containers, street-turns.

---

## GET load detail — field parity

TMS `GET /api/dispatcher/loads/[id]` returns the load row plus:

- `customers` — name, phone, address fields
- `containers` — `container_number`, `bol_number`, `size`, `type`, `seal_number`
- `drivers` — `name`, `phone`

PP2 implementation:

- Query: `fetchLoadDetailForDriver` in `lib/supabase/queries/loads.ts`
- Select constant: `LOAD_DETAIL_SELECT`
- Mapper: `mapLoadDetailRowToDetail` in `lib/supabase/queries/map-load-row.ts`
- UI: `app/load/[id].tsx` + `useLoadDetailQuery`

**Excluded in mobile v1:** pay fields (`driver_pay`, …), billing embeds, vessel embed on container (can be added when product asks).

---

## PATCH status (planned week 3)

```http
PATCH /api/dispatcher/loads/{id}/status
Content-Type: application/json

{ "status": "In Transit" }
```

- Valid transitions: `VALID_LOAD_TRANSITIONS` in TMS `types/dispatcher.ts`
- Driver subset: same as web `DriverActionPanel` (local mock today in `DriverActionBar`)
- Server may return **403** or **`ACTIVE_HOLDS`** — handle in UI (task 3.4)

---

## Auth

TMS API routes expect a **session cookie / Bearer token** from the TMS web app. The Expo app will need either:

1. Supabase JWT accepted by a BFF that proxies to dispatcher routes, or  
2. Dedicated mobile auth contract documented in `docs/SECRETS_AND_BFF.md`

Until then, **read** paths stay on Supabase; **write** paths remain mocked or blocked in the client.
