# Supabase data map — driver loads (task 2.1)

**Date:** 19 May 2026  
**Verified against:** TMS `PROYECTO_MUESTRA/types/dispatcher.ts`, `app/api/dispatcher/loads/route.ts`, PP2 `fetchLoadsForDriver`.

Code constants: `lib/supabase/schema/driver-loads.ts`.

---

## 1. Core assignment model

| Concept | Supabase object | Notes |
|---------|-----------------|-------|
| Shipment / load | **`public.loads`** | Main entity; TMS UI label “load” |
| Driver assignment | **`loads.driver_id`** | FK → **`public.drivers.id`** (not `auth.users` directly) |
| Driver login | **`auth.users`** + **`user_profiles`** | `user_profiles.role = 'driver'` |
| Driver row for FK | **`public.drivers`** | For mobile: **`drivers.id` = `auth.uid()`** when user has app login |
| Customer | **`public.customers`** | `loads.customer_id` → `customers.id` |
| Container | **`public.containers`** | `loads.container_id` → `containers.id`; **`container_number` lives here** |

There is **no** separate `driver_assignments` view/table in the current schema; assignment is **`loads.driver_id`**.

---

## 2. `loads` — columns by mobile phase

### 2.1 List screen (implemented)

| Column | Type (UI) | Source | Notes |
|--------|-----------|--------|-------|
| `id` | uuid | `loads` | Route param `/load/[id]` |
| `reference_number` | text | `loads` | Display ref (e.g. THWK_M138509) |
| `status` | enum | `loads` | `LoadStatus` — see TMS `types/dispatcher.ts` |
| `pickup_location` | text | `loads` | |
| `delivery_location` | text | `loads` |
| `return_location` | text | `loads` | |
| `pickup_apt_from` / `pickup_apt_to` | timestamptz | `loads` | |
| `delivery_apt_from` / `delivery_apt_to` | timestamptz | `loads` | |
| `is_hot` | boolean | `loads` | |
| `notes` | text | `loads` | |
| `freight_hold`, `customs_hold`, … | text/bool | `loads` | → `active_holds` in app |
| `created_at` | timestamptz | `loads` | Sort desc |
| `container_number` | text | **`containers`** embed | Not on `loads` |
| `customer_name` | text | **`customers`** embed | `customers.name` |

**Query (PP2):**

```sql
-- Conceptual; app uses PostgREST with range pagination (page size 20)
SELECT loads.*, containers.container_number, customers.name
FROM loads
WHERE driver_id = :auth_uid
ORDER BY created_at DESC
LIMIT 20 OFFSET :page * 20;
```

Implementation: `fetchDriverLoadsPage` + `useAssignedLoadsQuery` (task 2.2).

### 2.2 Detail screen (implemented 2.3)

Additional `loads` fields used in TMS detail / status API:

| Group | Columns |
|-------|---------|
| Type / route | `load_type`, `route_type` |
| Timestamps | `scheduled_pickup`, `actual_pickup`, `actual_delivery`, `completed_date` |
| Shipping | `ssl`, `mbol`, `seal_number`, `vessel_name`, `voyage` |
| Equipment | `container_size`, `chassis_number`, flags (`is_hazmat`, …) |
| Pay (read-only caution) | `driver_pay`, `driver_pay_notes` — do not expose pay UI in v1 |

Embeds used in PP2 detail query (`LOAD_DETAIL_SELECT`):

- `customers ( name, phone, address, city, state, zip_code )`
- `containers ( container_number, bol_number, size, type, seal_number )`
- `drivers ( name, phone )`

Implementation: `fetchLoadDetailForDriver`, `useLoadDetailQuery`, `app/load/[id].tsx`. Cross-reference: `docs/DISPATCHER_API_ROUTES.md`.

### 2.3 Not for mobile v1

| Table / columns | Reason |
|-----------------|--------|
| `load_billing`, `load_payments`, `freight_descriptions` | Staff / financial |
| `ap_*`, `ar_*` | Accounting |
| Rate profiles, driver groups | Payroll / dispatch config |

---

## 3. Related tables (driver scope)

| Table | Link | Mobile use | RLS (after 20260518) |
|-------|------|------------|----------------------|
| **`load_messages`** | `load_id` → `loads.id` | Chat (future) | Driver: rows for assigned loads only |
| **`load_documents`** | `load_id` | POD list (future) | Driver: read assigned; write via TMS API |
| **`containers`** | `loads.container_id` | Embed on list/detail | Staff-heavy policies; embed via load SELECT |
| **`customers`** | `loads.customer_id` | Name on list/detail | Authenticated read (no PII export UI) |
| **`drivers`** | `loads.driver_id` | Seed row for test user | Staff manage; driver reads own loads only |

---

## 4. Views

No dedicated Supabase **view** is required for the driver list today; the app queries **`loads`** directly with RLS.

If the TMS adds a view later (e.g. `driver_loads_summary`), document it here before switching the client.

---

## 5. RLS & filters (driver)

| Policy | Table | Rule |
|--------|-------|------|
| `Drivers read own loads` | `loads` | `get_user_role() = 'driver'` AND `driver_id = auth.uid()` |
| Client filter | `loads` | `.eq('driver_id', user.id)` (defense in depth) |

**Important:** `driver_id` in DB is **`drivers.id`**. For app login, that UUID must equal **`auth.uid()`** (see `docs/MOBILE_API.md` §6).

---

## 6. Status values (`LoadStatus`)

Full enum in TMS `PROYECTO_MUESTRA/types/dispatcher.ts`. Common driver-facing values:

`Dispatched`, `In Transit`, `Arrived At Pickup`, `Arrived At Delivery`, `Delivered`, `At Warehouse`, `Dropped - Loaded`, `Dropped - Empty`, `Enroute To Return Empty`, `Arrived At Return Empty`, `Completed`, `Cancelled`.

Transitions: TMS `VALID_LOAD_TRANSITIONS` / `getEffectiveTransitions()` — mobile uses subset in `lib/loads/constants.ts` until API wired (3.1).

---

## 7. TMS API parity (reference)

| Operation | TMS route | Mobile |
|-----------|-----------|--------|
| List (staff) | `GET /api/dispatcher/loads?driver_id=` | Supabase SELECT |
| List (driver) | — | Supabase SELECT + RLS |
| Status change | `PATCH /api/dispatcher/loads/[id]/status` | Week 3 (BFF) |
| Documents | `GET/POST …/documents` | Week 4 |

---

## 8. Test data

| Entity | Example |
|--------|---------|
| User | `driver_test@test.com` → `user_profiles.id` |
| Driver row | `drivers.id` = same UUID |
| Loads | `THWK_M138509`, `THWK_M138508`, `THWK_M138507` (`Dispatched`) |

Scripts: `npm run db:seed-driver-test`, `npm run db:assign-driver-test-loads`.

---

## References

- `lib/supabase/queries/loads.ts` — `LOAD_LIST_SELECT`
- `docs/DATA_CONTRACT.md` — UI field mapping
- `docs/RLS_MOBILE_REVIEW.md` — policies
