# Revisión RLS — app móvil PP2 (conductor)

**Tarea dev 1.3** · Fecha: 18 mayo 2026  
**Fuente:** migraciones en `PROYECTO_MUESTRA/supabase/migrations/` (solo lectura) y `PROYECTO_MUESTRA/docs/RLS_SECURITY_REVIEW_T22.md`.  
**Instancia:** mismo Supabase que el TMS (anon key en `.env.local`).

**Resultado (18 mayo 2026):** migración `supabase/migrations/20260518120000_pp2_driver_scoped_load_messages_documents.sql`. **Aplicación recomendada:** Supabase Dashboard → **SQL Editor** (copia en `supabase/sql-editor/`). Verificación: `supabase/sql-editor/VERIFY_pp2_driver_rls_policies.sql`. Políticas de conductor acotadas con `EXISTS` hacia `loads`.

---

## Rol móvil

La app asume usuario con `user_profiles.role = 'driver'` y `loads.driver_id = auth.uid()`.

`get_user_role()` en políticas lee el rol desde `user_profiles` (patrón del TMS).

---

## Tablas que la app consume o consumirá

| Tabla / recurso | Operación móvil | Política relevante | ¿OK para MVP? |
|-----------------|-----------------|-------------------|---------------|
| `user_profiles` | SELECT propio | `Users read own profile` — `id = auth.uid()` | Sí |
| `loads` | SELECT asignadas | `Drivers read own loads` — `role = driver` AND `driver_id = auth.uid()` | Sí (listado piloto 1.6) |
| `loads` | UPDATE estado | Solo `Staff update shipments` (admin/dispatcher/accounting) | **No directo** — usar TMS API |
| `load_messages` | SELECT (futuro) | `Staff read` + `Drivers read messages on assigned loads` (EXISTS → `loads`) | Sí (tras migración 20260518) |
| `load_documents` | SELECT / INSERT POD (futuro) | `Staff read` + `Drivers read documents on assigned loads` + política customer existente; INSERT: solo staff | Sí lectura; POD vía API |
| `load_billing`, `load_payments`, `freight_descriptions` | No en MVP | `Authenticated read …` incluye `driver` sin scope por load | No consultar desde móvil |
| `ap_*`, `ar_*` | No | Staff / financial | Ignorar |
| `customers`, `terminals`, rate profiles, etc. | No | Staff / authenticated amplio | Ignorar |

---

## Detalle por capacidad MVP

### 1. Perfil (`useProfile` → `user_profiles`)

- Política actual permite **solo SELECT** de la fila del usuario autenticado.
- Columnas usadas en app: `id, role, full_name, email` (sin `phone` en esquema TMS).
- **Sin cambio Supabase necesario.**

### 2. Listado de cargas (`fetchLoadsForDriver` → `loads`)

- Política `Drivers read own loads` acota por `driver_id`.
- La query del cliente añade `.eq('driver_id', userId)` (defensa en profundidad; RLS ya filtra).
- Staff sigue leyendo todo vía `Staff read all shipments`.
- **Sin cambio Supabase necesario** para listar.

### 3. Cambio de estado (semana 3)

- Conductor **no** tiene política UPDATE en `loads`.
- Contrato correcto: `PATCH {TMS}/api/dispatcher/loads/[id]/status` con JWT de Supabase (tarea 3.1).
- **No intentar UPDATE directo** desde el cliente.

### 4. Mensajes y documentos (detalle de carga)

Migración `20260225_optimize_rls_performance.sql` reemplazó políticas scoped (“Drivers read their load data…”) por:

```sql
USING ((select get_user_role()) IN ('admin', 'dispatcher', 'accounting', 'driver'));
```

**Resuelto** con migración `20260518120000_pp2_driver_scoped_load_messages_documents.sql`:

- Se eliminó `Authenticated read load_messages` / `load_documents`.
- Staff (`admin`, `dispatcher`, `accounting`) lee todo vía `Staff read *`.
- Conductor solo filas cuya `load_id` pertenece a `loads.driver_id = auth.uid()`.
- INSERT/UPDATE/DELETE de documentos y mensajes siguen siendo solo staff; POD vía API TMS.

### 5. Holds

- Columnas `*_hold` en `loads` vienen en el SELECT del conductor (misma fila asignada).
- Lógica de bloqueo en cliente: `lib/loads/active-holds.ts` (alineado TMS).
- **Sin cambio Supabase.**

### 6. Tablas financieras y maestros

- Varias tablas `ap_*` / `ar_*` tuvieron políticas amplias en migraciones intermedias; `20260302_rls_audit_hardening.txt` endureció muchas a staff/financial.
- La app móvil **no** debe exponer pantallas que las consulten.

---

## Matriz de decisión app ↔ Supabase

| Necesidad | Canal |
|-----------|--------|
| Login / sesión | Supabase Auth (`signInWithPassword`) |
| Perfil | Supabase `user_profiles` SELECT |
| Lista / detalle campos de `loads` | Supabase SELECT (driver scope) |
| Transiciones de estado | TMS API + JWT |
| Subir POD | TMS API (extender permiso `driver` en route) — no INSERT directo |
| Mensajes / docs | API o Supabase **después** de endurecer RLS |

---

## Checklist antes de consultar nuevas tablas

1. Buscar políticas en `PROYECTO_MUESTRA/supabase/migrations/` para la tabla.
2. Confirmar si el rol `driver` aparece sin `EXISTS` hacia `loads`.
3. Si hay gap, **documentar** y pedir migración; no ampliar queries en cliente “porque funciona en dev”.

---

## Referencias en repo TMS (solo lectura)

- `20260227_fix_loads_rls_insert_delete.sql` — INSERT/DELETE staff + driver SELECT en `loads`
- `20260225_optimize_rls_performance.sql` — perfiles y sub-tablas de load
- `20260302_rls_audit_hardening.txt` — sección 6 driver loads + endurecimiento AR/AP
- `docs/RLS_SECURITY_REVIEW_T22.md` — auditoría previa del monorepo web
