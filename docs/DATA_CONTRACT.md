# Contrato de datos (UI ↔ Supabase)

Campos que cada pantalla consume y su origen en Supabase. Esquema completo: `docs/LOADS_DATA_MAP.md`.

## Login / Cuenta

| Campo | Tipo | Pantalla |
|-------|------|----------|
| `id` | string | Cuenta |
| `email` | string | Login, Cuenta |
| `full_name` | string | Cuenta |
| `role` | `'driver'` | Auth (futuro) |
| `phone` | string \| null | Cuenta |

Fuente mock: `mocks/user.ts` → tabla `profiles` (TMS).

## Lista de cargas

| Campo | Tipo | Pantalla |
|-------|------|----------|
| `id` | string | Lista, detalle |
| `reference_number` | string | Lista, detalle |
| `status` | `LoadStatus` | Lista, detalle, acciones |
| `container_number` | string \| null | Lista (join `containers.container_number`) |
| `pickup_location` | string \| null | Lista, detalle |
| `delivery_location` | string \| null | Lista, detalle |
| `delivery_apt_from` | ISO string \| null | Lista |
| `is_hot` | boolean | Lista, detalle |
| `active_holds` | string[] | Lista, detalle (bloqueo acciones) |

Filtro: `loads.driver_id = auth.uid()` (RLS + query). Requiere fila en `drivers` con `id` = UUID del usuario auth — ver `docs/MOBILE_API.md` §6.

## Detalle de carga (adicionales)

| Campo | Tipo | Pantalla |
|-------|------|----------|
| `pickup_apt_from` / `to` | ISO \| null | Detalle |
| `delivery_apt_to` | ISO \| null | Detalle |
| `return_location` | string \| null | Detalle |
| `customer_name` | string \| null | Detalle (join `customers.name`) |
| `notes` | string \| null | Detalle |

## Mensajes

| Campo | Tipo | Pantalla |
|-------|------|----------|
| `id`, `load_id` | string | Detalle |
| `sender_name`, `sender_role` | string | Detalle |
| `body` | string | Detalle |
| `created_at` | ISO string | Detalle |

API TMS referencia: `app/api/dispatcher/loads/[id]/messages/route.ts` (solo lectura en `PROYECTO_MUESTRA`).

## Acciones de estado

- **PATCH** futuro: `/api/dispatcher/loads/[id]/status` con `{ status }`
- Solo transiciones **Driver**: ver `lib/loads/driver-actions.ts`

## POD

- No implementado en cliente; POST documentos TMS solo `admin`/`dispatcher` hoy.
