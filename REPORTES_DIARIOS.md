# Reportes diarios — PP2 móvil

**Versión en inglés:** [`DAILY_REPORTS.md`](DAILY_REPORTS.md) (mismo contenido).

Registro de avances **relevantes para el producto**: nuevas funcionalidades, integraciones (login, Supabase, API TMS), pruebas automatizadas, agentes de IA, builds instalables, etc.

**No documentar aquí:** renombres, ajustes de documentación sin código, refactors cosméticos.

**No mencionar `PROYECTO_MUESTRA/`** en este archivo (ni rutas bajo esa carpeta). Referir el TMS web como **«TMS»**, **«API TMS»** o rutas HTTP (`/api/dispatcher/…`); detalle técnico en `docs/` (`MOBILE_API.md`, parches `TMS_PATCH_*.md`).

**Formato:** una fecha por día; bajo ella **Tarea 1**, **Tarea 2**, **Tarea 3**, … en **orden numérico ascendente estricto** (1 antes que 2, 2 antes que 3; **nunca** insertar Tarea 7 antes de Tarea 4). La nueva entrada del día es siempre la **siguiente** número libre e va **después** de la última tarea ya numerada, no al final del archivo si eso rompe el orden dentro de la fecha.


**Una fecha = un solo día:** prohibido anidar secciones con otra fecha dentro de `## [fecha]` (p. ej. no poner “Lunes 15” dentro de “18 de junio”). Reportes retroactivos: crear `## 15 de junio`, `## 16 de junio`, etc., cada uno con sus tareas.

**Orden de fechas en el archivo:** cada sección `## [fecha]` debe ir en **orden cronológico ascendente** (día más antiguo arriba, más reciente abajo). **Prohibido** añadir entradas con fecha pasada al final del archivo. Anexos de un día van **dentro** de esa fecha (p. ej. `### Anexo`), no como `##` con fecha anterior insertada después de días posteriores.

---

## Directiva de documentación (obligatoria — no omitir)

**Para agentes de IA y desarrolladores:** **nunca** cerrar una tarea funcional sin actualizar **el mismo día** `REPORTES_DIARIOS.md` y `DAILY_REPORTS.md`. Regla reforzada en `.cursor/rules/daily-reports-documentation.mdc`.

Checklist antes de dar por terminado el trabajo:

1. Sección `## [fecha actual]` (crearla si no existe).
2. **Tarea N** del día: **N = última del día + 1**; insertarla **justo debajo** de Tarea N−1 (orden de lectura: 1, 2, 3 … de arriba abajo). Si documentas dev **4.6** y luego **4.7**, deben quedar **Tarea 7 (4.6)** y después **Tarea 8 (4.7)** — nunca al revés. Alineada a `PP2_TAREAS_DEV.md` cuando aplique.
3. **Qué se implementó** y **funcionalidad disponible** (usuario / conductor).
4. **Cómo probar** (obligatorio), con:
   - Comando (`npm run ci`, tests concretos) si aplica.
   - **Ruta en la app móvil:** login → menú → pantalla → botón (ej. **My Loads** → detalle de carga → **POD / Documents** → **View**).
   - **Resultado esperado** (qué debe verse; qué error es aceptable).
5. Misma entrada en inglés en `DAILY_REPORTS.md`.
6. No citar `PROYECTO_MUESTRA/`; usar «TMS», `/api/…` o `docs/`.
7. Marcar la fila en `PP2_TAREAS_DEV.md` (✅ / ⏸) si corresponde.
8. **Fecha del día real** en el encabezado `##` (ej. **18 de junio de 2026**); nunca usar una fecha distinta a la jornada en curso.
9. Insertar la sección del día **después** de la última fecha cronológica ya existente (no al final si hay fechas posteriores mezcladas). `npm run check:daily-reports` debe pasar en CI.

Si el cambio es visible en UI o afecta QA, **siempre** documentar aunque el diff sea pequeño.

---

## 18 de mayo de 2026

### Tarea 1 — Base de la app (Expo + navegación + Supabase)

**Qué se implementó**

- Proyecto **Expo SDK 54** con TypeScript y Expo Router.
- Tabs **Loads** y **Account**; Supabase client; EAS APK config.

**Funcionalidad disponible**

- App en Expo Go / emulador con recarga en caliente.

### Tarea 2 — Fase cliente completa (`PP2_TAREAS_CLIENTE.md`) + testing y CI

**Qué se implementó**

- **Pantallas MVP con mocks:** login demo, lista de cargas, detalle, acciones Driver, POD placeholder.
- `mocks/`, `context/`, `types/`, `lib/loads/`.
- Documentación cliente en `docs/`.
- **Jest** + **GitHub Actions** (`npm run ci`).

### Tarea 3 — Supabase Auth: getSession + listener (dev 1.2)

**Qué se implementó**

- `AuthProvider` + `useAuth`: sesión persistida en SecureStore.
- Tests en `lib/supabase/__tests__/auth-session.test.ts`.

### Tarea 4 — `useProfile`, queries y piloto cargas (dev 1.6 / 1.7)

**Qué se implementó**

- `lib/supabase/queries/`, `useProfile`, `useAssignedLoadsQuery`.
- Listado real con sesión conductor; `signInWithPassword` inicial.

### Tarea 5 — Revisión RLS conductor (dev 1.3)

**Qué se hizo**

- `docs/RLS_MOBILE_REVIEW.md`; políticas documentadas para TMS API en updates/POD.

### Tarea 6 — Migración RLS aplicada en Supabase

**Qué se hizo**

- SQL Editor: `supabase/sql-editor/20260518120000_pp2_driver_scoped_load_messages_documents.sql` — **Success**.
- Conductor: `load_messages` / `load_documents` acotados con `EXISTS` → `loads`.

### Tarea 7 — Login real + deep linking (dev 1.4) + UI en inglés

**Qué se implementó**

- **Auth:** `signInWithPassword`, `signInWithMagicLink`, ruta `app/auth/callback`, `AuthDeepLinkHandler`, scheme `pp2://auth/callback`.
- **Seguridad:** `lib/logging/safe-log.ts` (sin volcar tokens/contraseñas); mock solo en `__DEV__` (`EXPO_PUBLIC_ENABLE_MOCK_AUTH=0` para desactivar).
- **UI:** textos en inglés centralizados en `constants/strings.ts`; pantallas login, loads, account, detalle actualizadas.
- **Docs:** `README.md` en inglés; `docs/SUPABASE_AUTH_REDIRECTS.md` para redirect URLs en Supabase.

**Funcionalidad disponible**

- Login con usuario TMS (email/contraseña) o magic link (tras configurar redirect en Supabase).
- Deep link completa la sesión y redirige a Loads.
- Mock desactivado por defecto; usar `driver_test@test.com` o usuario TMS real.

**Configuración Supabase (manual)**

- Añadir redirect URL: `pp2://auth/callback` y la URL `exp://…` que muestra el login en dev (ver `docs/SUPABASE_AUTH_REDIRECTS.md`).

### Tarea 8 — Fix LogBox en login demo (1.4)

**Qué se corrigió**

- Credenciales demo (`driver@tigerhawk.demo`) ya no llaman a Supabase (solo mock en dev).
- `safeLog.authFailure`: errores esperados de auth no abren LogBox rojo.
- TMS real sigue usando `signInWithPassword` contra Supabase.

### Tarea 9 — Fix parpadeo “No assigned loads” (1.6)

**Qué se corrigió**

- Bucle `syncLoads([])` → `mockLoads` → `refetch` eliminado; solo se sincroniza contexto si hay cargas reales.
- Lista vacía oculta mientras `loading`; sin parpadeo al entrar con conductor sin cargas asignadas.

### Tarea 10 — Fix query loads: `container_number` en `containers` (1.6)

**Qué se corrigió**

- `fetchLoadsForDriver` ya no pide `loads.container_number` (no existe en BD).
- Join PostgREST: `containers(container_number)`, `customers(name)` como en el TMS.

### Tarea 11 — Datos reales + cargas para `driver_test@test.com` (1.6)

**Qué se implementó**

- App sin mocks por defecto: lista/detalle desde Supabase; login solo TMS (`driver_test@test.com` prellenado).
- Scripts: `npm run db:seed-driver-test` (auth + `user_profiles` + fila `drivers` con **mismo id** que auth) y `npm run db:assign-driver-test-loads` (hasta 3 cargas → `Dispatched`).
- SQL Editor: `supabase/sql-editor/seed_driver_test_user.sql`, `assign_loads_driver_test.sql`.

**Funcionalidad disponible**

- Conductor de prueba con **3 cargas reales** asignadas: `THWK_M138509`, `THWK_M138508`, `THWK_M138507` (estado `Dispatched`).
- Login: `driver_test@test.com` / `Driver01*` → pestaña Loads muestra cargas del TMS.
- Mock legacy solo si `EXPO_PUBLIC_ENABLE_MOCK_AUTH=1` en dev.

**Nota técnica**

- `loads.driver_id` referencia `drivers.id` (FK TMS). RLS móvil usa `driver_id = auth.uid()`; por eso el conductor con login debe tener fila en `drivers` con **id = UUID de auth**.

### Tarea 12 — Auditoría TMS ↔ móvil (dev 1.5)

**Qué se hizo**

- Revisión **solo lectura** del TMS web: panel conductor (`DriverActionPanel`), `PATCH …/status`, `POST …/documents` (rutas documentadas en `docs/MOBILE_API.md`).
- Documento **`docs/MOBILE_API.md`**: matriz Supabase vs API Next, contrato PATCH status, gap POD (POST solo admin/dispatcher), subconjunto de estados Driver, catálogo de errores (`ACTIVE_HOLDS`, 403, 400), modelo `driver_id` (FK `drivers.id` vs RLS `auth.uid()`).
- Ajustes de consistencia: `docs/DATA_CONTRACT.md` §lista de cargas; comentario en `lib/loads/constants.ts` apuntando al doc.

**Funcionalidad disponible**

- Referencia única para implementar semana 3 (estados vía TMS) y semana 4 (POD); sin cambios en código TMS desde este repo.

**Hallazgos clave**

- Cambios de estado: **TMS API** con JWT Supabase, no UPDATE directo en `loads`.
- POD: **bloqueado** para rol `driver` en el POST actual; requiere extensión TMS (tarea 4.1).
- Seguridad: la API de status no limita aún transiciones al subconjunto Driver (tarea 3.3 recomendada).

### Tarea 13 — Cierre formal dev 1.6 (piloto Supabase real)

**Verificación**

- Criterio 1.6: al menos una pantalla piloto con query real a Supabase (perfil **o** listado de cargas).
- **Cumplido y superado:** Loads (`useAssignedLoadsQuery` → `fetchLoadsForDriver`) y Account (`useProfile` → `fetchUserProfile`); pantalla Loads sin mocks; listado con RLS + 3 cargas reales para `driver_test@test.com`.

**Estado**

- Marcada ✅ en `PP2_TAREAS_DEV.md` (1.6). Mejoras de semana 2 (paginación, detalle ampliado) quedan fuera del alcance de 1.6.

---

## 19 de mayo de 2026

### Tarea 1 — Capa Supabase + hooks (dev 1.7)

**Qué se implementó**

- **`lib/supabase/`:** `client.ts` (singleton + SecureStore), `assert-anon-key.ts`, barrel `index.ts`, `hooks/useAuth` + `hooks/useProfile` (cancelación al desmontar, como TMS `useUserRole`).
- **Seguridad:** rechazo de JWT `service_role` en cliente; `env.ts` bloquea `EXPO_PUBLIC_*` sobre service role.
- **Docs:** `docs/SUPABASE_LAYER.md`; tests `lib/supabase/__tests__/assert-anon-key.test.ts`.
- Re-exports en `@/hooks/useAuth` y `@/hooks/useProfile` para compatibilidad.

**Funcionalidad disponible**

- API única documentada: `getSupabase`, queries puras, hooks de sesión y perfil; sin service role ni admin en la app.

### Tarea 2 — CI y matriz de secretos / BFF (dev 1.8)

**Qué se implementó**

- **CI:** `.github/workflows/ci.yml` — paso `npm run check:secrets` entre lint y tests; `npm run ci` actualizado.
- **Guard:** `scripts/check-client-secrets.mjs` — falla si el código cliente referencia service role, `createAdminClient`, Resend o Port Houston secrets.
- **Docs:** `docs/SECRETS_AND_BFF.md`, `docs/GitHub_Setup_Guide.md`.

**Funcionalidad disponible**

- Cada push/PR valida TypeScript, ausencia de secretos en código cliente y tests unitarios.

### Tarea 3 — Drawer lateral estilo TMS + mapeo datos cargas (dev 2.1)

**Qué se implementó**

- **Navegación:** tabs sustituidos por **drawer** `app/(drawer)/` según `nav_lateral.png` con colores TMS (`#111827`, activo `#E8700A`); `AppDrawerContent` — My Loads, Account, Log Out.
- **Directiva:** `AGENTS.md` § barra lateral; tokens `PP2Theme.colors.tms`.
- **Datos 2.1:** `docs/LOADS_DATA_MAP.md`, `lib/supabase/schema/driver-loads.ts`.

**Funcionalidad disponible**

- Menú hamburguesa (header) abre drawer ~72% ancho; rutas post-login vía `/(drawer)/loads` y `/(drawer)/account`.

### Tarea 4 — Listado paginado de cargas + loading/error/retry (dev 2.2)

**Qué se implementó**

- **`fetchDriverLoadsPage`:** PostgREST `.range()` + `count: 'exact'`, página de 20 filas (`LOAD_LIST_PAGE_SIZE`).
- **`useAssignedLoadsQuery`:** estados `loading`, `refreshing`, `loadingMore`, `hasMore`, `totalCount`; `loadMore`, `retry`, `refetch`.
- **UI `/(drawer)/loads`:** spinner inicial, pull-to-refresh, scroll infinito, banner de error con “Try again”, pie “Loading more…”.
- **Tests:** `lib/supabase/queries/__tests__/map-load-row.test.ts` (mapper + `hasMoreDriverLoads`).

**Funcionalidad disponible**

- Conductor ve cargas por páginas sin cargar todo el historial de una vez; puede reintentar si falla la red.

### Tarea 5 — Detalle de carga con datos maestros Supabase (dev 2.3)

**Qué se implementó**

- **`fetchLoadDetailForDriver`** + `LOAD_DETAIL_SELECT` (embeds `customers`, `containers`, `drivers`); mapper `mapLoadDetailRowToDetail`.
- **`useLoadDetailQuery`:** loading, error + retry, `notFound`; cache de lista vía `LoadsContext` mientras refresca.
- **`app/load/[id].tsx`:** ruta, cliente, envío, contenedor, timeline, holds activos, flags; mensajes/POD placeholder sin cambios.
- **Docs:** `docs/DISPATCHER_API_ROUTES.md` (referencia PP2 ↔ TMS); `docs/LOADS_DATA_MAP.md` §2.2 actualizado.
- **Tests:** `mapLoadDetailRowToDetail` en `map-load-row.test.ts`.

**Funcionalidad disponible**

- Al abrir una carga desde el listado (o por deep link `/load/[id]`), el conductor ve datos maestros reales desde Supabase aunque la fila no esté ya en memoria; reintento si falla la red.

### Tarea 6 — Pull-to-refresh y caché TanStack Query (dev 2.4)

**Qué se implementó**

- **`@tanstack/react-query`:** `QueryProvider` en `app/_layout.tsx`, `lib/query/query-keys.ts`, `invalidate-loads.ts`, limpieza de caché al cerrar sesión.
- **`useAssignedLoadsQuery`:** migrado a `useInfiniteQuery`; `refetch` invalida listado + detalles del conductor.
- **`useLoadDetailQuery`:** `useQuery` con `placeholderData` desde `LoadsContext`; pull-to-refresh en detalle.
- **Docs:** `docs/QUERY_CACHE.md`; `docs/SUPABASE_LAYER.md` actualizado.

**Funcionalidad disponible**

- Arrastrar para refrescar en lista y detalle recarga datos de Supabase y sincroniza caché entre pantallas; al salir de la sesión no quedan cargas en memoria.

### Tarea 7 — Limpieza vibe coding y consistencia UI (dev 2.5)

**Qué se implementó**

- **Pantalla detalle:** dividida en `LoadDetailContent`, `LoadDetailRow`, `ScreenState`; `app/load/[id].tsx` reducida a orquestación.
- **Rutas:** `resolveRouteParam` para params Expo (`string | string[]`); tests en `lib/router/__tests__/route-params.test.ts`.
- **Hooks:** lógica de gate conductor unificada en `lib/query/driver-query-gate.ts`.
- **Tema:** colores semánticos (`onPrimary`, `errorSurface`, `hotSurface`, `overlay`); componentes UI sin hex hardcodeados.
- **Mocks:** textos en inglés alineados a `constants/strings.ts`.

**Funcionalidad disponible**

- Misma UX; código más mantenible y tipado estricto en la app móvil (sin `any` en `app/`, `components/`, `hooks/`, `lib/`).

**Cómo probar**

- Recargar la app: listado y detalle se ven igual; no hay cambio de producto visible.

### Tarea 8 — Tests unitarios formato y mappers (dev 2.6)

**Qué se implementó**

- **`lib/loads/__tests__/format.test.ts`:** estados, citas, rangos de fecha e ISO inválido.
- **`lib/loads/__tests__/active-holds.test.ts`:** holds + `formatHoldLabel`.
- **`lib/loads/__tests__/load-detail-helpers.test.ts`:** helpers de secciones del detalle.
- **`lib/supabase/queries/__tests__/map-load-row.test.ts`:** list/detail mapper, arrays PostgREST, paginación; fixture `fixtures/load-list-row.ts`.
- **Directiva:** en `REPORTES_DIARIOS.md` y `AGENTS.md` — cada tarea funcional incluye **Cómo probar** (breve).

**Funcionalidad disponible**

- Regresión automática de etiquetas/fechas y del mapeo Supabase → `LoadDetail` sin abrir la app.

**Cómo probar**

- En la raíz del repo: `npm test` (o `npm run ci` antes de un PR).
- Debe terminar con todos los tests en verde (suite `lib/loads` y `lib/supabase/queries`).

### Tarea 9 — Tests de hooks con Supabase mockeado (dev 2.7)

**Qué se implementó**

- **`hooks/__tests__/useAssignedLoadsQuery.test.tsx`:** listado feliz, error PostgREST, gate no-conductor, paginación `loadMore`.
- **`hooks/__tests__/useLoadDetailQuery.test.tsx`:** detalle, `notFound`, placeholder desde `LoadsContext`, error con cache, gate no-conductor.
- **`hooks/testing/hooks-test-utils.tsx`:** wrapper `QueryClient` + `LoadsProvider`; mocks de `useAuth` / `useProfile`.
- **Queries mockeadas** (`fetchDriverLoadsPage`, `fetchLoadDetailForDriver`) — sin MSW; cliente Supabase stub.
- **`LoadsProvider`:** prop opcional `initialLoads` para tests.

**Funcionalidad disponible**

- Regresión automática de la capa React Query + hooks de cargas sin dispositivo.

**Cómo probar**

- `npm test hooks/__tests__` o `npm run ci`.
- Deben pasar los tests de `useAssignedLoadsQuery` y `useLoadDetailQuery`.

### Tarea 10 — Documento MOBILE_API: Supabase vs TMS (dev 2.8)

**Qué se implementó**

- **`docs/MOBILE_API.md` §4** ampliado: reglas de diseño, tabla de lecturas Supabase (queries/hooks/pantallas), tabla de rutas TMS futuras, comportamiento solo-cliente (demo de estado), diagrama mermaid.
- Enlaces cruzados con `LOADS_DATA_MAP`, `DISPATCHER_API_ROUTES`, `QUERY_CACHE`, `SECRETS_AND_BFF`.
- Aclaración: listado y detalle **no** llaman a `GET /api/dispatcher/loads`; el cambio de estado irá a `PATCH …/status` en semana 3.

**Funcionalidad disponible**

- Una sola referencia para dev/ops: qué va por PostgREST y qué irá por el BFF TMS.

**Cómo probar**

- Abrir `docs/MOBILE_API.md` §4 y contrastar con el código: `lib/supabase/queries/loads.ts` (Supabase) — no debe haber `fetch` a `env.tmsApiUrl` en `app/` ni `hooks/` aún.
- En `.env.local`, `EXPO_PUBLIC_TMS_API_URL` puede estar definido pero no se usa hasta la tarea 3.1.

---

## 20 de mayo de 2026

### Tarea 4 — Realtime cargas + guard servidor 3.3 (dev 3.3)

**Qué se implementó**

- **Realtime:** `useDriverLoadsRealtime` en drawer; suscripción `loads` → invalidación React Query (asignaciones/estado desde TMS sin reiniciar app).
- **Fallback:** refetch al volver la app a primer plano.
- **Seguridad:** `assertDriverFieldStatusTarget` antes del PATCH; doc TMS `docs/TMS_PATCH_3_3_DRIVER_STATUS.md`.
- **SQL:** `supabase/sql-editor/enable_realtime_loads.sql`.

**Cómo probar**

- Ejecutar SQL Realtime si hace falta; login conductor; en TMS asignar otra carga al mismo driver → debe aparecer en la lista en ~1 s sin cerrar la app.
- `npm run ci` en verde.

### Tarea 2 — Solo acciones Driver en UI (dev 3.2)

**Qué se implementó**

- **`FINAL_LOAD_STATUSES`**, **`filterDriverFieldActions`**: la barra de acciones ya no muestra `Completed`, `Cancelled` ni transiciones de despacho (`Dispatched` desde `Assigned`, etc.).
- Tests ampliados en `lib/loads/__tests__/driver-actions.test.ts`.

**Funcionalidad disponible**

- Mismo subconjunto que el grupo **Driver** del `DriverActionPanel` web.

**Cómo probar**

- Detalle de carga `Delivered`: solo **Enroute To Return Empty**, sin botón **Completed**.
- `npm test lib/loads/__tests__/driver-actions.test.ts`

### Tarea 3 — Datos de paginación para `driver_test@test.com`

**Qué se hizo**

- Script `assign-loads-driver-test.mjs` con `--max=N` y `--all` (hasta 200 cargas sin conductor).
- `npm run db:assign-driver-test-loads:pagination` y SQL `assign_loads_driver_test_pagination.sql`.
- Ejecutado en Supabase: **203 cargas** asignadas al conductor de prueba.

**Cómo probar**

- Login → **My Loads** → scroll: cargar más de 20 filas (pie “Loading more…”).

### Tarea 1 — PATCH estado vía TMS BFF (dev 3.1)

**Qué se implementó**

- **`lib/tms/`:** `patchLoadStatus`, `parseStatusPatchError`, `TmsStatusChangeError` (`ACTIVE_HOLDS`, 403, 400, 401, red).
- **`app/load/[id].tsx`:** JWT `session.access_token`, UI optimista + rollback, invalidación listado/detalle tras éxito.
- **`DriverActionBar`:** `onStatusChange` async; errores del servidor en banner.

**Funcionalidad disponible**

- El conductor persiste cambios de estado en el TMS (misma ruta que `DriverActionPanel` web), no solo en caché local.

**Cómo probar**

- `.env.local`: `EXPO_PUBLIC_TMS_API_URL` apuntando al TMS en marcha (p. ej. `http://localhost:3000` o URL de staging).
- Login `driver_test@test.com` → abrir carga `Dispatched` → **In transit** → debe persistir tras pull-to-refresh.
- `npm run ci` en verde.

### Tarea 5 — UI optimista segura + telemetría dev (dev 3.5)

**Qué se implementó**

- **`canOptimisticallyUpdateLoadStatus`:** la caché React Query y `LoadsContext` solo se actualizan antes del PATCH si no hay holds, la transición es válida para conductor y el destino es estado de campo.
- **`runDriverStatusChange`:** orquesta apply optimista → `patchLoadStatus` → invalidación; rollback de caché y contexto si el TMS falla.
- **`hooks/useDriverStatusChange.ts`:** la pantalla `app/load/[id].tsx` delega el cambio de estado al hook (ruta `load/[id]` sin cambios).
- **Telemetría:** `driverStatusTelemetry` + `safeLog.event` (`attempt` / `success` / `failure` con `optimistic`, `rolledBack`, `code`) solo en `__DEV__`.
- **Docs:** `docs/MOBILE_TELEMETRY.md`; referencia en `docs/QUERY_CACHE.md` y `docs/MOBILE_API.md`.

**Funcionalidad disponible**

- Respuesta visual inmediata en transiciones seguras; si el servidor rechaza (403, holds, red), el estado vuelve al anterior sin dejar la UI inconsistente.
- En Metro, eventos estructurados para depurar cambios de estado sin volcar tokens.

**Cómo probar**

- `npm run ci` — 96 tests en verde (incluye `optimistic-status.test.ts` y `run-driver-status-change.test.ts`).
- Login conductor → detalle carga `Dispatched` → **In Transit** → en consola dev: `[driver.status:attempt]` con `optimistic: true`; tras éxito: `[driver.status:success]`.
- Detener el TMS o forzar error 403 → el badge de estado debe volver al anterior y aparecer `[driver.status:failure]` con `rolledBack: true`.
- Ver política completa en `docs/MOBILE_TELEMETRY.md`.

### Tarea 6 — Tests capa de acciones conductor (dev 3.6)

**Qué se implementó**

- **`lib/tms/status-patch-request.ts`:** funciones puras `buildStatusPatchPath`, `buildStatusPatchBody`, `buildStatusPatchHeaders`, `buildStatusPatchRequestInit` (contrato `PATCH …/status` + `{ status }`).
- **`patchLoadStatus`** refactorizado para usar esos builders (misma URL y payload que validan los tests).
- Tests: `status-patch-request.test.ts`, `patch-load-status.test.ts` ampliado (encode id, red, 401, 400, `enforceDriverFieldOnly`), `driver-status-action.test.ts` (orquestación + alineación payload).

**Funcionalidad disponible**

- Regresión automática de que el móvil envía al TMS exactamente la ruta y el JSON acordados, sin depender del dispositivo.

**Cómo probar**

- `npm run ci` — suites `lib/tms/__tests__` y `lib/driver-status/__tests__` en verde.
- `npm test lib/tms/__tests__/status-patch-request.test.ts` para validar solo payloads.

### Tarea 7 — QA cruzado web + accesibilidad (dev 3.7)

**Qué se implementó**

- **`docs/QA_DRIVER_ACTIONS_3_7.md`:** matriz manual móvil vs `DriverActionPanel` (mismo usuario/carga), holds, errores y checklist a11y.
- **Paridad automática:** `web-panel-reference.ts` + `web-driver-panel-parity.test.ts` (mismos `DRIVER_STATUSES` / filtros que TMS).
- **Accesibilidad:** `minTouchTarget` 48dp en tema, `Button` con `accessibilityLabel`/`accessibilityState`, acciones de carga en `accent` (contraste naranja TMS), drawer con `minHeight` 48, `ErrorBanner` con área táctil en retry.

**Funcionalidad disponible**

- Guía reproducible para validar que móvil y web muestran las mismas acciones de conductor y el mismo estado tras PATCH.
- UI de acciones más usable en campo (botones grandes, labels para lector de pantalla).

**Cómo probar**

- `npm run ci` — incluye `web-driver-panel-parity.test.ts`.
- Seguir `docs/QA_DRIVER_ACTIONS_3_7.md`: login `driver_test@test.com` → misma carga en TMS y móvil → fila 1 (`Dispatched` → **In Transit**) en web y app; confirmar sync.
- Revisar en dispositivo: botones de acciones altos y legibles; con holds activos, botones deshabilitados y mensaje de hold.

### Tarea 8 — Handoff desarrollador / cliente (dev 3.8)

**Qué se implementó**

- **`HANDOFF_DEV.md` reescrito:** tabla _maquetado inicial vs estado actual_ (auth Supabase, lista/detalle reales, PATCH TMS, Realtime, errores, UI PP2 Driver, tests).
- Rutas, credenciales `driver_test`, variables `.env.local`, mapa de archivos de la capa de acciones (semana 3), limitaciones (POD, mensajes, magic link) y prioridad semana 4+.
- Checklist de entrega actualizado; enlace desde `README.md` (scope v0.2).

**Funcionalidad disponible**

- Documento único para onboarding: qué entregó el cliente con mocks y qué hizo el dev hasta cerrar la semana 3.

**Cómo probar**

- Leer `HANDOFF_DEV.md` y contrastar con la app: login real → loads → detalle → cambio de estado debe coincidir con la sección “Capa de acciones”.
- Verificar que ya no indica “mock auth” ni “estado solo local” (texto obsoleto eliminado).

---

## 22 de mayo de 2026

### Tarea 1 — Brecha POD / documentos TMS (dev 4.1)

**Qué se implementó**

- **Decisión:** opción **(A)** — ampliar `POST /api/dispatcher/loads/[id]/documents` al conductor asignado (mismo patrón que `PATCH …/status`), sin ruta nueva ni Storage directo desde móvil.
- **Parche TMS:** `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md` (permiso `isAssignedDriver`, restricción `POD`/`Photo` para rol `driver`, límites 50 MB / 255 caracteres sin cambios).
- **Capa móvil:** `lib/tms/upload-load-document.ts`, `document-upload-request.ts`, `document-upload-limits.ts`, `assert-driver-document-type.ts`, `parse-document-error.ts`, `tmsDocumentApiPath` en `client.ts`.
- **Tests:** `document-upload-request.test.ts`, `parse-document-error.test.ts`, `upload-load-document.test.ts`; `client.test.ts` ampliado.
- **Docs:** `docs/MOBILE_API.md` §5.2 y matriz §4; `docs/DISPATCHER_API_ROUTES.md`; `PP2_TAREAS_DEV.md` 4.1 marcada completada.

**Funcionalidad disponible**

- Contrato y cliente HTTP listos para subida POD vía TMS; la UI sigue en placeholder hasta **4.2** (`expo-image-picker`).
- El equipo TMS debe aplicar el parche en el repo Next.js y desplegar staging antes de probar subida real desde la app.

**Cómo probar**

- `npm run ci` — suites `lib/tms/__tests__` en verde (incluye document upload).
- `npm test lib/tms/__tests__/document-upload-request.test.ts` — path, headers, validación 50 MB.
- Tras desplegar parche TMS: `curl` o Postman `POST` multipart con JWT de `driver_test@test.com`, carga asignada, `document_type=POD` → **201** (ver checklist en `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md`).

### Tarea 2 — Subida POD con cámara/galería (dev 4.2)

**Qué se implementó**

- **`expo-image-picker`** + **`expo-file-system`** (tamaño de archivo); plugin y permisos iOS/Android en `app.json`.
- **`PodUploadSection`:** elegir cámara o galería, vista previa, **Upload POD** / **Cancel** (descartar con confirmación).
- **`useLoadDocumentUpload`** + ruta `app/load/[id].tsx` → `uploadLoadDocument` (TMS `POST …/documents`, tipo `POD`).
- **`lib/media/`:** `pick-load-photo`, `map-picker-asset`, `resolve-upload-file-size`, MIME permitidos.
- **Errores:** `mapDocumentUploadError` integrado en `mapErrorToUserFacing`.
- **Tests:** `map-picker-asset.test.ts`, `map-document-error.test.ts`.
- **Textos:** `constants/strings.ts` (sin placeholder).

**Funcionalidad disponible**

- En detalle de carga, el conductor puede seleccionar una foto, revisarla y subirla como POD vía API TMS (requiere parche 4.1 desplegado en el TMS en línea).

**Cómo probar**

- `npm run ci` — tests nuevos en verde.
- `npx expo start` → login `driver_test@test.com` → abrir carga asignada → **POD / Documents** → **Add POD photo** → cámara o galería → vista previa → **Upload POD** o **Cancel**.
- Con `EXPO_PUBLIC_TMS_API_URL` apuntando al TMS en línea y parche 4.1 aplicado: subida debe terminar en mensaje de éxito; sin parche, banner de error 403.

### Tarea 3 — Corrección POD: red + Realtime (post 4.2)

**Qué se corrigió**

- **“Network error” al subir POD:** en dispositivo, `EXPO_PUBLIC_TMS_API_URL=http://localhost:3000` apunta al teléfono, no al TMS. Actualizado a `https://tms.tigerhawklogistics.com` en `.env.local` y validación `assertTmsUrlReachableFromDevice` con mensaje claro.
- **`RangeError: Maximum call stack size exceeded`:** bucle en `subscribeDriverLoadsRealtime` al llamar `removeChannel` dentro del callback `subscribe` cuando el canal pasaba a `CLOSED` (p. ej. tras actividad en TMS/Supabase). Ya solo se reconecta sin `removeChannel` en ese callback; test `subscribe-driver-loads-realtime.test.ts`.

**Cómo probar**

- Reiniciar Metro (`npm start` con caché limpia si hace falta: `npx expo start -c`).
- Móvil: subir POD de nuevo; si TMS sin parche 4.1 → 403 legible; si URL mal → mensaje de configuración, no “Network error” genérico.
- Subir documento desde TMS web con la app abierta en detalle de la misma carga → no debe aparecer el error rojo de stack en Expo.

### Tarea 4 — 401 POD: JWT Bearer en TMS (no es RLS Supabase)

**Diagnóstico**

- Lista/detalle de cargas funcionan → sesión Supabase y RLS del conductor están bien.
- `POST …/documents` en TMS usa `createClient()` solo con **cookies**; la app móvil envía **Bearer** → `getUser()` vacío → **401** (no es política de `load_documents`).

**Qué se añadió**

- **`docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`:** `createClient(request)` + pasar `request` en POST/PATCH.
- Móvil: `resolveSupabaseAccessToken()` (refresh antes de TMS) y mensaje claro si TMS devuelve 401.

**Cómo probar**

- Tras desplegar parche Bearer + 4.1 en TMS: subir POD desde la app → **201** o **403** (permiso), no “Session expired”.
- `npm test lib/tms/__tests__/resolve-access-token.test.ts`

### Tarea 5 — Ver documentos TMS en móvil (dev 4.2 reorientada)

**Qué se implementó**

- **Lista de documentos** de la carga vía Supabase (`load_documents`, RLS conductor asignado): `fetchLoadDocumentsForDriver`, `useLoadDocumentsQuery`, `LoadDocumentsSection` (nombre, tipo, tamaño, fecha, botón **View** con `Linking`).
- **Tiempo real:** suscripción Realtime a `load_documents` + script `supabase/sql-editor/enable_realtime_load_documents.sql`.
- **Pull-to-refresh** invalida detalle y documentos; tras subida del conductor, refresco de lista.
- **Subida opcional:** `PodUploadSection` bajo “Driver photo (optional)” (evidencia POD/foto); prioridad UX = consultar lo que sube dispatch en TMS.

**Funcionalidad disponible**

- En detalle de carga `#TH-…`, el conductor ve p. ej. `codigo de barras principal.jpeg` subido en pestaña Documents del TMS y puede abrirlo; nuevos archivos aparecen al refrescar o con Realtime si está habilitado en Supabase.

**Cómo probar**

- `npm run ci` — tests `map-load-document-row`, `format-document`, realtime documents debounce.
- SQL Editor (una vez): ejecutar `enable_realtime_load_documents.sql` si la lista no se actualiza sola.
- `npx expo start` → login conductor → carga con documento en TMS → **POD / Documents** → fila del archivo → **View**.
- Desde TMS: subir otro archivo a la misma carga con la app en detalle → debe aparecer (Realtime o pull-to-refresh).

---

## 25 de mayo de 2026

### Tarea 1 — Asociación documento ↔ carga (dev 4.4)

**Qué se implementó**

- **`lib/loads/document-load-association.ts`:** validación de que cada fila de `load_documents` pertenece al `load_id` de la pantalla abierta; comprobación de prefijo `storage_path` (`{load_id}/…`, igual que el TMS); filtro defensivo tras la query; validación de la respuesta de subida TMS.
- **`fetchLoadDocumentsForDriver`:** `.eq('load_id', …)` + filtro de filas inconsistentes (no se muestran al conductor).
- **`uploadLoadDocument`:** rechaza respuesta si `load_id` del JSON no coincide con la carga.
- **Ruta `/load/[id]`** y **`useLoadDocumentsQuery`:** `normalizeLoadIdParam` para ignorar ids vacíos en deep links rotos.
- **Tests:** `document-load-association.test.ts`, `fetch-load-documents.test.ts`, ampliación `upload-load-document.test.ts`.

**Funcionalidad disponible**

- En detalle de carga, la lista **POD / Documents** solo muestra archivos de **esa** carga (tabla `load_documents` + RLS + filtro cliente). Evita mostrar un documento ligado por error a otra carga o con ruta Storage de otro `load_id`.

**Cómo probar**

- `npm run ci` — debe pasar en verde (incluye tests de asociación).
- **En la app (visual):**
  1. `npx expo start` → login conductor (`driver_test@test.com` o usuario con cargas asignadas).
  2. Menú **My Loads** → abrir una carga que en el TMS tenga al menos un documento en **Documents** (ej. `#TH-MPEIQ624-8THS`).
  3. Bajar hasta la tarjeta **POD / Documents**.
  4. **Resultado esperado:** aparece(n) solo archivo(s) de **esa** carga (nombre, tipo, tamaño, fecha); botón **View** abre el archivo. No deben aparecer documentos de otras cargas del mismo usuario.
  5. En el TMS, subir un PDF/imagen a **otra** carga distinta: en el detalle de la primera carga **no** debe listarse ese archivo nuevo (solo tras abrir la otra carga).
  6. **Pull-to-refresh** en el detalle: la lista se mantiene acotada a la misma carga.
- **Regresión ruta inválida:** abrir `/load/` con id vacío o inválido → pantalla “Load not found” o sin lista de documentos (no crash).

### Tarea 2 — Enlaces de documentos expirados y borrados en TMS (4.4 / UX)

**Qué se implementó**

- **URLs firmadas:** al listar/refrescar, la app intenta **GET documentos en el TMS** (enlaces nuevos ~1 h); si el TMS no responde, sigue usando Supabase.
- **View:** antes de abrir, comprueba el enlace; si expiró (`InvalidJWT` / `exp`), **refresca la lista** y reintenta; si falla, mensaje claro de enlace caducado (no JSON crudo).
- **Borrado en TMS:** con GET TMS activo, la lista en móvil coincide con TMS (el archivo borrado desaparece); **pull-to-refresh** y al **volver a la pantalla** también refrescan documentos; Realtime en `load_documents` sigue aplicando.

**Cómo probar**

- `npm run ci` — tests `document-view-url`, `merge-tms-documents` en verde.
- **Enlace expirado:** abrir detalle de carga con documento subido hace **más de 1 h** → **View** → si falla, debe mostrarse _“This download link has expired. Pull down…”_ (no el error JSON de Supabase). **Pull down** en el detalle → **View** otra vez (con parche Bearer en TMS, debe abrir).
- **Borrado:** con la app en **POD / Documents**, borrar el archivo en el TMS → tras unos segundos (Realtime) o **pull down**, la fila **desaparece**.
- **Ruta:** **My Loads** → carga → tarjeta **POD / Documents** → **View**.

### Tarea 3 — Sin conexión básico (dev 4.5)

**Qué se implementó**

- **`@react-native-community/netinfo`**, `NetworkProvider`, banner global **`OfflineBanner`** (mensaje en inglés en `strings.network`).
- **`assertOnlineForFetch` / `assertOnlineForDriverAction`:** bloquean refrescos y acciones de campo sin red; mensajes claros vía `OfflineError` + `mapErrorToUserFacing`.
- Integrado en listado/detalle/documentos Supabase, cambio de estado TMS y **View** de documentos.
- **Sin cola offline** en v1 (documentado en `docs/OFFLINE_V1.md`).
- Regla Cursor **`.cursor/rules/daily-reports-documentation.mdc`** para no olvidar reportes diarios.

**Funcionalidad disponible**

- Con avión/modo sin datos: banner amarillo arriba; al intentar refrescar o cambiar estado, mensaje de que hace falta internet; pantallas ya cargadas pueden seguir visibles hasta pull-to-refresh.

**Cómo probar**

- `npm run ci` — incluye `lib/network/__tests__/network-state.test.ts`.
- **En dispositivo o emulador:**
  1. Abrir la app con red normal → login → **My Loads** (lista visible).
  2. Activar **modo avión** (o apagar Wi‑Fi/datos).
  3. **Resultado esperado:** banner **“No internet connection”** en la parte superior.
  4. **Pull down** en **My Loads** o abrir otra carga → mensaje tipo _“No internet connection. Connect to load or update data.”_ (no crash).
  5. Abrir un detalle ya cargado (si estaba en caché) → pulsar **In transit** u otro botón de **Field actions** → _“This action needs internet…”_.
  6. En **POD / Documents**, **View** → mismo mensaje de acción sin red.
  7. Desactivar modo avión → banner desaparece → **pull down** → lista actualiza con normalidad.

### Tarea 4 — Corrección CI banner offline (cierre 4.5)

**Qué se implementó**

- `OfflineBanner` usa tokens existentes de `PP2Theme`: `hotSurface`, `hotBorder`, `hotText` (antes referenciaba `warningSurface` / `warningBorder`, inexistentes en `theme.ts`).

**Cómo probar**

- `npm run ci` — lint + 161 tests en verde.
- Visual: mismo flujo de **Tarea 3** paso 2–3; banner amarillo sin error de compilación.

### Tarea 5 — Reconexión Wi‑Fi/datos sin spinner colgado (4.5)

**Qué se implementó**

- **`ProfileProvider`:** perfil único compartido (antes cada hook tenía estado propio).
- **`applyProfileFetchResult`:** no borra el perfil del conductor si el refetch falla por red (evita falso _“No profile found”_).
- **`QueryNetworkRecovery`:** al volver online, refresca perfil + queries activas; al ir offline, **cancela** peticiones en curso (evita `RefreshControl` infinito).
- **`onlineManager`** de TanStack Query enlazado a NetInfo + **`refetchOnReconnect`**.
- `refreshing` en hooks de cargas solo cuando la query está **enabled**.

**Cómo probar**

- `npm run ci` — incluye `lib/profile/__tests__/apply-profile-fetch-result.test.ts`.
- **En dispositivo/emulador:**
  1. Login → **My Loads** → abrir detalle de carga (datos visibles: ruta, estado).
  2. Activar **modo avión** ~10 s → banner offline; opcional **pull down** (mensaje sin red).
  3. Desactivar modo avión (o cambiar de Wi‑Fi a datos móviles).
  4. **Resultado esperado:** en **≤5 s** desaparece el banner, **no** queda spinner de recarga arriba, **no** aparece _“No profile found”_, la ruta y documentos se actualizan sin salir de la pantalla.
  5. Repetir en **My Loads** (lista): pull down tras reconectar → lista refresca una vez.

### Tarea 6 — Spinner superior solo en pull manual (4.5)

**Qué se implementó**

- **`usePullToRefresh`:** el `RefreshControl` de **My Loads** y detalle de carga ya no usa `isRefetching` / `isFetching` de React Query (eso encendía el spinner al reconectar Wi‑Fi en segundo plano).
- Cancelación offline con **`cancelQueries()`** al perder red.

**Cómo probar**

- `npm run ci`.
- Detalle de carga → quitar Wi‑Fi → volver Wi‑Fi **sin hacer pull down**.
- **Resultado esperado:** banner offline desaparece, datos se actualizan, **sin** spinner blanco arriba del scroll.
- Pull down manual → spinner solo mientras dura el gesto y termina al acabar.

### Tarea 7 — Tests FormData y metadatos de subida (dev 4.6)

**Qué se implementó**

- **`lib/tms/testing/form-data-test-utils.ts`:** captura de `FormData.append` y helpers `getCapturedFilePart` / `getCapturedDocumentType`.
- Tests ampliados en **`document-upload-request.test.ts`:** parte `file` (uri, name, type), campo `document_type` (POD/Photo), MIME por defecto `application/octet-stream`, validación antes de append.
- **`upload-load-document.test.ts`:** verifica que `fetch` recibe multipart con metadatos correctos (mock).
- **`resolve-upload-file-size.test.ts`:** mock de `expo-file-system` cuando el picker no envía `fileSize`.
- **`map-picker-asset.test.ts`:** nombre `pod_<timestamp>.png` si falta `fileName`.

**Funcionalidad disponible**

- Sin cambio de UI; cobertura automatizada del contrato TMS `POST /api/dispatcher/loads/[id]/documents` (multipart `file` + `document_type`).

**Cómo probar**

- `npm run ci` — **183 tests**; suites: `document-upload-request`, `upload-load-document`, `resolve-upload-file-size`, `map-picker-asset`.
- **Ruta en app (cuando subida esté habilitada):** login → **My Loads** → carga → **POD / Documents** → subir foto (requiere parche TMS 4.1); hoy la subida puede seguir deshabilitada en UI — la tarea 4.6 es solo tests.

### Tarea 8 — QA manual documentos (dev 4.7)

**Qué se implementó**

- **`docs/QA_DRIVER_DOCUMENTS_4_7.md`:** matriz manual TMS → móvil (Realtime, pull-to-refresh, View, enlaces caducados, offline, subida POD cuando UI activa), prerequisitos, rutas en app y tabla de sign-off.
- **Consistencia código 4.4:** restaurado **`lib/loads/document-load-association.ts`** (filtro `load_id` / `storage_path`, `normalizeLoadIdParam`, validación respuesta upload); cableado en `fetch-load-documents`, `upload-load-document`, `useLoadDocumentsQuery`.
- **Tests:** `document-load-association.test.ts`, `fetch-load-documents.test.ts`, ampliación `upload-load-document` (respuesta `load_id` incorrecta).

**Funcionalidad disponible**

- QA/PM pueden ejecutar el checklist en staging sin adivinar rutas; desarrollo mantiene paridad documentada con `QA_DRIVER_ACTIONS_3_7.md`.

**Cómo probar**

- `npm run ci` — suites de asociación y documentos en verde.
- **QA manual (obligatorio para sign-off 4.7):** seguir **`docs/QA_DRIVER_DOCUMENTS_4_7.md`** sección **A** (mínimo A1–A5):
  1. `npx expo start` → login conductor → **My Loads** → carga asignada con documentos en TMS.
  2. Subir archivo en TMS **Documents** para esa carga.
  3. **Resultado esperado:** en móvil, tarjeta **POD / Documents** muestra el archivo en ~15 s o tras **pull down**; **View** abre el archivo.
  4. Borrar en TMS → fila desaparece en móvil (Realtime o pull down).
- Subida conductor (sección **D** del doc): solo cuando TMS 4.1 y tarea dev **4.8** (UI) estén activos.

---

## 26 de mayo de 2026

### Tarea 1 — Decisión GPS v1 (dev 5.1)

**Qué se implementó**

- **`docs/GPS_V1_DECISION.md`:** go v1 con ubicación **solo en primer plano**; background pospuesto a v1.1.
- **`lib/location/gps-v1-policy.ts`** + tests: política única (`foreground`, sin tracking en background).
- **`constants/strings.ts` → `location`:** disclaimer legal, textos de permiso denegado y acciones (share location — para 5.2).
- **`app.json`:** plugin **`expo-location`** (Android background/foreground service **off**), `NSLocationWhenInUseUsageDescription` iOS, permisos Android coarse/fine.
- Dependencia **`expo-location`** (Expo SDK 54).
- **Revisión rutas:** `app/load/[id].tsx` normaliza id con `normalizeLoadIdParam` (misma regla que documentos); título stack `load/[id]` desde `strings.loadDetail.screenTitle`; drawer **My Loads** usa `strings.nav.loads`.

**Funcionalidad disponible**

- Política GPS v1 documentada y permisos nativos preparados; UI de ubicación en detalle de carga llega en **5.2**.

**Cómo probar**

- `npm run ci` — suite `gps-v1-policy` en verde.
- Revisar `docs/GPS_V1_DECISION.md` y `strings.location.disclaimer`.
- Tras rebuild nativo (`eas build` o dev client): diálogo iOS/Android debe pedir **While Using the App** / ubicación en uso, no background.

### Tarea 2 — Share location en detalle de carga (dev 5.2)

**Qué se implementó**

- **`LoadLocationSection`** en detalle de carga (tarjeta **Your location**): disclaimer, coordenadas actuales, **Share location** (sheet nativo con referencia de carga + lat/lng + precisión), **Open in Maps**, **Open Settings** si permiso denegado.
- Capa **`lib/location/`:** `getForegroundPosition`, `format-coordinates`, `share-load-location`, `location-errors`.
- Hook **`useLoadLocationShare`**; integración en **`LoadDetailContent`** (tras tarjeta Route).
- Tests: `format-coordinates`, `get-foreground-position`, `map-location-error`; `map-api-error` reconoce `LocationError`.

**Funcionalidad disponible**

- En **My Loads** → detalle de carga asignada, el conductor puede compartir su posición GPS con dispatch (SMS/email/apps del sistema) sin tracking en background.

**Cómo probar**

- `npm run ci` — suites de ubicación en verde.
- **Dispositivo físico (no web):** login → **My Loads** → abrir carga → tarjeta **Your location** → **Share location** → aceptar permiso **While Using** → elegir app destino; mensaje incluye `#referencia`, coordenadas y precisión.
- **Resultado esperado:** coordenadas visibles en pantalla tras compartir; **Open in Maps** abre mapa; si deniegas permiso, banner + botón **Open Settings**.

### Tarea 3 — Criterio de producto: Share location (GPS 5.2)

**Qué se documentó**

Criterio de negocio para **Share location** en detalle de carga (complementa dev **5.2**):

> Compartir desde la app no compite con WhatsApp: usa WhatsApp (u otra app) pero pre-rellena el mensaje con la carga y coordenadas GPS para que dispatch no tenga que adivinar. Open in Maps es comodidad; el diferencial de producto es carga + coordenadas en un solo paso, y verlo en el TMS.

**Funcionalidad disponible**

- Sin cambio de código: aclaración para equipo, QA y cliente sobre por qué el flujo pasa por el sheet nativo de compartir (WhatsApp, SMS, etc.) y no sustituye esas apps.
- **Open in Maps:** atajo tras leer GPS; no es el valor principal.
- **Futuro (5.3):** persistir o mostrar ubicación en el TMS, no solo en chat.

**Cómo probar**

- No aplica build: leer esta entrada y validar con negocio si el flujo actual (mensaje con `#referencia` + coordenadas) cubre operación en campo antes de invertir en **5.3**.

### Tarea 4 — Auditoría TMS ubicación GPS (dev 5.3)

**Qué se implementó**

- **`docs/GPS_TMS_INTEGRATION_5_3.md`:** revisión TMS (solo lectura) — **no** hay `POST /tracking/loads/…/locations` ni tabla de pings GPS por carga.
- **`lib/location/tms-location-integration.ts`:** `hasTrackingApi: false`, modo **`share_only`**; matriz de rutas descartadas (messages, wait-time, PATCH load notes, etc.).
- **`postDriverLocationToTms`:** stub que rechaza hasta que exista API TMS; sin migraciones Supabase inventadas.
- **UI:** `strings.location.tmsShareOnlyHint` en **`LoadLocationSection`** (dispatch no ve GPS automático en TMS; usar Share).

**Funcionalidad disponible**

- El conductor sigue compartiendo ubicación con contexto de carga vía **Share location** (5.2). Persistencia en panel TMS queda para cuando el cliente despliegue una ruta dedicada (propuesta documentada en el audit).

**Cómo probar**

- `npm run ci` — suites `tms-location-integration`, `post-driver-location`.
- **App:** login → **My Loads** → carga → **Your location** → debe verse el hint de share-only + botón **Share location**.
- Leer **`docs/GPS_TMS_INTEGRATION_5_3.md`** para validar con TMS/cliente si priorizan nueva API antes del 9 jun.

---

## 28 de mayo de 2026

### Tarea 1 — QA dispositivo y helpers GPS (dev 5.4)

**Qué se implementó**

- **`docs/QA_DRIVER_LOCATION_5_4.md`:** matriz manual en dispositivo real (permiso denegado, Settings, background, GPS del sistema apagado, batería, Open in Maps).
- **`lib/location/geo.ts`:** validación lat/lng, `assertValidCoordinates`, `distanceMeters` (Haversine).
- **`lib/location/maps-url.ts`:** `buildGoogleMapsUrl` centralizado (usado en **`LoadLocationSection`**).
- **`lib/location/location-permission.ts`:** snapshot de permiso sin re-prompt.
- **`getForegroundPosition`:** rechaza lecturas GPS fuera de rango.
- **`useLoadLocationShare`:** al volver a la pantalla o a la app (`useFocusEffect` + `AppState`), limpia estado de permiso denegado si el usuario ya concedió en Ajustes.
- Tests: `geo`, `maps-url`, `location-permission`; caso coords inválidas en `get-foreground-position`.

**Funcionalidad disponible**

- Misma UX de **Share location** (5.2) con validación y recuperación más robusta tras Ajustes/background; checklist listo para sign-off en campo.

**Cómo probar**

- `npm run ci` — suites de ubicación en verde.
- **Dispositivo físico:** seguir **`docs/QA_DRIVER_LOCATION_5_4.md`** filas L1–L8 (mínimo L1–L4 y L7).
- **Resultado esperado:** tras habilitar permiso en Ajustes, desaparece **Open Settings** sin reiniciar la app; coordenadas inválidas no se muestran ni comparten.
- **Sign-off campo (28 may):** Android + Expo Go — flujo principal OK (share, coordenadas, Open in Maps).

### Tarea 2 — Hardening desconexión/reconexión + GPS L5/L6 (dev 5.5)

**Qué se implementó**

- **Red (post-4.5):** refetch de perfil en segundo plano sin bloquear cargas (`isProfileGateLoading`); sin error visible en Account tras fallo de red; `QueryNetworkRecovery` con debounce 400 ms y reset al ir offline; cancelación de queries = red transitoria; `usePullToRefresh` con tope 45 s; providers `Network` → `Profile` → `Query`.
- **GPS L5:** si el GPS del sistema está apagado → banner + **Open Settings**; al reactivar GPS y volver a la app, el error se limpia sin reiniciar.
- **GPS L6:** `expo-battery` + hint `lowPowerHint` cuando el ahorro de batería está activo.
- **`docs/QA_NETWORK_RECONNECT_5_5.md`** (matriz modo avión R1–R6).

**Funcionalidad disponible**

- Reconectar Wi‑Fi/datos no debe dejar spinner colgado ni “No profile found” en Account; ubicación tolera GPS apagado y modo ahorro de batería con mensajes claros.

**Cómo probar**

- `npm run ci`.
- **Red:** `docs/QA_NETWORK_RECONNECT_5_5.md` (modo avión en detalle de carga, reconectar sin pull).
- **GPS L5:** Ajustes Android → desactivar **Ubicación** del sistema → **Share location** → reactivar → volver a la app.
- **GPS L6:** activar ahorro de batería → **Share location** → debe verse hint en cursiva; la app no crashea.

### Tarea 3 — Sugerencia al cliente / equipo TMS: Field actions (Bearer JWT)

**Contexto (QA en dispositivo, 28 may)**

- En detalle de carga (**Field actions**: _In transit_, _At pickup_, _Arrived To Hook Container_, etc.) los botones **sí aparecen activos**, pero al pulsarlos la app muestra **Session expired** con mensaje de que el TMS no aceptó la sesión.
- Reproducido en varias cargas (ej. `#TH-MPD2UMPC-K00H`, estado **Dispatched**); **no es un bug de una carga concreta**.
- **My Loads**, login y lectura de datos **sí funcionan** (van directo a Supabase). Solo fallan las acciones que llaman al **API del TMS** (`PATCH` estado, y en el futuro subida POD).

**Causa técnica (no se arregla solo en el móvil)**

- La app móvil ya envía `Authorization: Bearer <access_token>` de Supabase en cada `PATCH /api/dispatcher/loads/[id]/status`.
- El TMS en servidor (p. ej. `tms.tigerhawklogistics.com`) suele crear el cliente Supabase **solo con cookies** del navegador. Expo **no** comparte cookies con el host del TMS → la ruta API devuelve **401** → ningún conductor puede cambiar estado desde la app hasta desplegar el parche en el **repo TMS**.

**Qué debe hacerse en el TMS (despliegue en servidor live)**

Seguir **`docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`** (copia lista TMS):

1. **`lib/supabase/server.ts` — `createClient(request?)`**  
   Si llega el header `Authorization: Bearer …`, reenviarlo a Supabase en `global.headers` (además de cookies para la web).

2. **Rutas API usadas por el móvil** — pasar `request` a `createClient(request)`:
   - **`PATCH /api/dispatcher/loads/[id]/status`** (Field actions del conductor) — **bloqueante hoy**.
   - **`POST /api/dispatcher/loads/[id]/documents`** (POD / Photo) — mismo prerequisito; ver también `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md`.

3. **Verificación post-despliegue** (curl o app):
   - Login móvil como conductor del mismo proyecto Supabase que el TMS.
   - Pulsar **In transit** (u otra acción válida) → debe actualizar estado (**200**), no **401**.
   - Opcional: `curl` con Bearer contra `…/loads/{LOAD_ID}/status` (pasos en el doc).

**Hasta que el parche esté en producción**

- Ningún conductor podrá cambiar estado desde Tigerhawk Mobile en **ninguna** carga.
- La subida **Add driver photo** seguirá deshabilitada en UI hasta TMS **4.1** + Bearer (mensaje ya visible en app).

**Solicitud de feedback al cliente**

> Confirmar si desean **priorizar el despliegue** del parche Bearer en el TMS para habilitar **Field actions** (y luego subida de evidencia) antes del cierre, o si prefieren **posponer** cambios de estado desde móvil y mantener solo consulta de cargas + Share location por ahora.

**Cómo probar (después del deploy TMS)**

- Móvil: login → **My Loads** → carga **Dispatched** → **Field actions** → **In transit** → sin banner rojo; badge pasa a _In transit_; mismo estado en panel TMS web.
- Si sigue **401**: revisar que `EXPO_PUBLIC_TMS_API_URL` del build apunte al host donde se aplicó el parche.

### Tarea 4 — QA producción documentos + acciones (dev 5.6)

**Qué se implementó**

- **`docs/QA_PRODUCTION_SIGNOFF_5_6.md`:** runbook único para TMS **producción** — documentos §A–C + §E (asociación) + regresión acciones 3.7 §F; tablas de sign-off; notas sobre parche Bearer (acciones 1–2 bloqueadas hasta deploy TMS).
- **`npm run qa:5.6`:** preflight (`scripts/qa-preflight-5-6.mjs`) — lint, secret guard, Jest focalizado (documentos, acciones, red, rutas).
- **`lib/qa/__tests__/load-detail-routes.test.ts`:** coherencia `app/load/[id].tsx` ↔ `useLoadDocumentsQuery` ↔ `LoadDocumentsSection` / `openLoadDocument`.
- Enlaces desde `docs/QA_DRIVER_DOCUMENTS_4_7.md` y `docs/QA_DRIVER_ACTIONS_3_7.md`.

**Funcionalidad disponible**

- Equipo QA/PM puede ejecutar sign-off en producción sin rearmar checklists; desarrollo dejó automatizado el preflight y documentado el bloqueo conocido de **Field actions** (Bearer).

**Cómo probar**

- `npm run qa:5.6` — 49 tests focalizados en verde.
- **Manual (QA/PM):** seguir **`docs/QA_PRODUCTION_SIGNOFF_5_6.md`** en dispositivo + TMS live:
  1. Login → **My Loads** → carga asignada → **POD / Documents**.
  2. TMS: subir PDF → fila en móvil (A1); **View** abre archivo (A5).
  3. Modo avión → banner + pull sin spinner infinito (C1–C3).
  4. **Field actions:** filas 1–2 = **N/A** hasta parche Bearer; fila 3 (holds) si hay carga con hold.
- **Resultado esperado documentos:** A1–A5, B1–B4, C1–C3, E1–E2 en Pass en tabla del doc; acciones 1–2 Fail/N/A hasta TMS.

### Tarea 5 — Smoke E2E + auditoría TMS conductor (dev 5.7)

**Qué se implementó**

- **`npm run smoke:5.7`:** CI completo (lint + secret guard + Jest) antes de release.
- **`docs/QA_SMOKE_E2E_5_7.md`:** recorrido manual S1–S10 (login → loads → detalle → documentos → GPS → field actions → account → logout).
- **`docs/DRIVER_TMS_CAPABILITIES_5_7.md`:** auditoría TMS (solo lectura): permisos conductor, qué está en móvil v1, backlog priorizado (Bearer P0, upload P1, llamada al cliente P2, itinerario/mensajes v1.1).
- **Rate-limit refetch:** `lib/query/foreground-refetch-throttle.ts` — invalidación al volver a la app máx. cada **30 s**; refetch documentos al enfocar detalle máx. cada **15 s** por carga.
- Tests: `app-routes-smoke`, `foreground-refetch-throttle`.

**Funcionalidad disponible**

- Semana 5 cerrada en código: smoke automatizado + guía de capacidades del conductor para decidir qué activar antes del 9 jun.

**Cómo probar**

- `npm run smoke:5.7` — todo el CI en verde.
- **Manual (~10 min):** `docs/QA_SMOKE_E2E_5_7.md` en dispositivo + TMS producción.
- Leer **`docs/DRIVER_TMS_CAPABILITIES_5_7.md`** con cliente para priorizar Bearer + subida Semana 6 vs mejoras P2 (llamar cliente, filtros).

---

## 1 de junio de 2026

### Tarea 1 — Subida conductor + Documents TMS (dev 6.2)

**Qué se implementó**

- **Móvil:** `LoadDocumentsSection` habilita **Add driver photo** con `PodUploadSection` + `useLoadDocumentUpload` (`document_type=Driver`); filas tipo **Driver** con fondo naranja suave; sin borrado desde la app; `access_token` en multipart como respaldo del header Bearer.
- **TMS (repo externo):** mismo `POST /api/dispatcher/loads/[id]/documents` que dispatch; JWT móvil vía `admin.auth.getUser` + campo `access_token`; middleware deja pasar ese POST; permisos con service role (`user_profiles` + `loads.driver_id`); tipo **Driver**; `enrichLoadDocuments`; pestaña **Documents** fila naranja, realtime `load_documents`; dispatcher puede eliminar.
- **Docs/SQL:** `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`, `supabase/sql-editor/DRIVER_DOCUMENT_UPLOAD_NOTES.sql`, `VERIFY_driver_tms_upload_prereqs.sql`.
- **Tests:** `document-upload-request`, `load-detail-routes` actualizados.

**Funcionalidad disponible**

- El conductor sube foto desde detalle de carga; aparece en TMS **Dispatcher → Load board → carga → Documents** (fila naranja, tipo Driver) y en la lista móvil sin recargar (Realtime + invalidación tras subida).
- El dispatcher elimina desde TMS; el conductor solo ve y abre (**View**).

**Cómo probar**

- `npm test -- --testPathPattern="document-upload|load-detail-routes"`.
- TMS local: `npm run dev` (puerto 3000) con `SUPABASE_SERVICE_ROLE_KEY`; app con `EXPO_PUBLIC_TMS_API_URL=http://localhost:3000` (en teléfono: IP LAN, no localhost). O deploy Netlify + mismo Supabase; SQL `enable_realtime_load_documents.sql` si hace falta.
- **Móvil:** login conductor → **My Loads** → carga asignada → **POD / Documents** → **Add driver photo** → subir → mensaje de éxito → nueva fila (naranja si tipo Driver).
- **TMS:** misma carga → pestaña **Documents** → fila naranja, tipo **Driver**, nombre de archivo; eliminar con icono papelera → desaparece en móvil sin reiniciar.
- **Resultado esperado:** subida **201**; sin botón eliminar en móvil; sincronización bidireccional en segundos.

### Tarea 2 — Realtime Supabase: `loads` + `load_documents` en publicación (dev 6.2)

**Qué se hizo (Supabase Dashboard → SQL Editor)**

- Ejecutado `supabase/sql-editor/enable_realtime_pp2_driver_sync.sql` en el proyecto **Tigerhawk TMS** (mismo Supabase que móvil y Netlify).
- Verificación: el `SELECT` final devolvió **2 filas** — `load_documents` y `loads` — dentro de la publicación **`supabase_realtime`**.

**Por qué (problema que resolvía)**

- Los datos **sí** se guardaban en la tabla `load_documents` (Table Editor), pero el TMS en [tigerhawk.netlify.app](https://tigerhawk.netlify.app) **no refrescaba** la pestaña **Documents** al subir desde el móvil hasta hacer F5.
- **Realtime ≠ tener filas en la tabla:** la publicación `supabase_realtime` es el “canal” que emite eventos INSERT/UPDATE/DELETE por WebSocket. Sin incluir la tabla ahí, TMS y móvil no reciben avisos en vivo aunque el INSERT en PostgreSQL funcione.
- En **Database → Publications** no aparece una publicación llamada `load_documents`; la tabla se **añade dentro** de `supabase_realtime` (p. ej. de 4 a 5 tablas).

**Para qué sirve**

| Tabla                | Uso en vivo                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **`load_documents`** | Foto del conductor → fila naranja en TMS **Documents** sin recargar; borrado del dispatcher → desaparece en la app móvil al instante. |
| **`loads`**          | Cambios de estado/asignación en TMS o móvil se reflejan en listados y detalle sin pull-to-refresh manual.                             |

**Complemento TMS (repo externo, commit `b88e523`)**

- `useRealtimeRefresh` estable (ref del callback) + `fetch` con `cache: 'no-store'` en **Documents** para que, al recibir el evento, la lista no use caché del navegador.

**Cómo probar**

1. Supabase → SQL Editor → repetir solo la verificación:
   ```sql
   SELECT tablename FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
     AND tablename IN ('loads', 'load_documents') ORDER BY tablename;
   ```
   **Esperado:** 2 filas.
2. **Móvil** (Expo Go, `EXPO_PUBLIC_TMS_API_URL=https://tigerhawk.netlify.app`) → conductor → carga → **Add driver photo** → subir.
3. **TMS** → misma carga → pestaña **Documents** **abierta** → en ~1–3 s fila naranja **Driver** sin F5.
4. **TMS** → eliminar documento → en móvil desaparece sin reiniciar la app.
5. **Resultado esperado:** sync bidireccional en segundos; si falla solo en TMS, confirmar deploy Netlify con `b88e523`.

---

## 2 de junio de 2026

### Tarea 1 — Validación MIME/tamaño y bloqueo offline en subida (dev 6.3)

**Qué se implementó**

- **`lib/media/validate-driver-upload-file.ts`:** validación central antes de cualquier POST (solo JPEG/PNG/HEIC/HEIF/WebP, máx. 50 MB, archivo no vacío); mensajes en `strings.loadDetail` (`driverUploadInvalidMime`, `driverUploadFileTooLarge`, `driverUploadEmptyFile`).
- **`PodUploadSection`:** valida tras resolver tamaño al elegir foto; sin red deshabilita **Add driver photo** / **Upload** y muestra `podOfflineHint` + error de red si el usuario intenta igual.
- **`useLoadDocumentUpload`:** `assertOnlineForDocumentUpload()` + `validateDriverUploadFile` antes de Supabase/TMS.
- **`upload-driver-load-document.ts`:** reutiliza el mismo validador (sin duplicar límite de bytes).
- **`lib/network/assert-online.ts`:** `assertOnlineForDocumentUpload` con `strings.network.offlineUploadBlocked`.
- **Tests:** `lib/media/__tests__/validate-driver-upload-file.test.ts`.

**Funcionalidad disponible**

- El conductor ve un mensaje claro si el archivo no es imagen permitida, supera 50 MB o está vacío **antes** de subir.
- Sin internet no puede iniciar ni confirmar subida de foto (coherente con offline v1 sin cola).

**Cómo probar**

- `npm test -- --testPathPattern="validate-driver-upload-file"`.
- `npm run lint` (o `npm run ci` si se quiere el gate completo).
- **Móvil:** login conductor → **My Loads** → carga → **POD / Documents** → **Add driver photo**.
  - **Offline:** modo avión o sin Wi‑datos → botón deshabilitado + texto «Connect to the internet…»; al tocar, banner «Photo upload needs internet…».
  - **MIME inválido** (solo si se puede simular; en producción el picker suele devolver imagen): mensaje «Only JPEG, PNG, HEIC, or WebP…».
  - **Archivo válido online:** flujo normal de 6.2 (éxito y fila en lista).
- **Resultado esperado:** ningún POST con archivo rechazado; offline sin intento de red hacia Supabase/TMS.

### Tarea 2 — QA E2E subida conductor (dev 6.4)

**Qué se implementó**

- **Runbook:** `docs/QA_DRIVER_UPLOAD_E2E_6_4.md` — matriz D1–D10 (happy path, móvil→TMS, Realtime inverso al borrar en dispatch, cancel/discard, offline, validación, permisos) + regresión R1–R3.
- **Actualización:** `docs/QA_DRIVER_DOCUMENTS_4_7.md` §D (subida habilitada, labels actuales, Realtime `enable_realtime_pp2_driver_sync.sql`); `docs/QA_PRODUCTION_SIGNOFF_5_6.md` enlaza 6.4 en lugar de «Skip §D».
- **Preflight automatizado:** `npm run qa:6.4` (`scripts/qa-preflight-6-4.mjs`) — lint, secret guard, **67 tests** (documentos, upload, validación, rutas, Realtime, hook y UI).
- **Tests nuevos:** `driver-upload-e2e-contract.test.ts`, `useLoadDocumentUpload.test.ts`, `PodUploadSection.test.tsx`; ampliación `load-detail-routes.test.ts`.

**Funcionalidad disponible**

- Gate automatizado antes del QA manual de subida; checklist listo para QA/PM y verificación de que dispatch ve la foto en TMS **Documents** (fila naranja **Driver**).

**Cómo probar**

- `npm run qa:6.4` — todo en verde.
- **Manual (~15 min):** `docs/QA_DRIVER_UPLOAD_E2E_6_4.md` — mínimo **D1, D2, D4, D6, D7** en staging/producción.
  - **D1:** **My Loads** → carga → **Add driver photo** → **Upload photo** → mensaje de éxito + fila naranja en móvil.
  - **D2:** TMS misma carga → **Documents** (pestaña abierta) → fila **Driver** sin F5.
  - **D3:** dispatcher elimina → desaparece en móvil en segundos.
  - **D4/D5:** **Cancel** → **Discard** / **Keep photo** sin subida involuntaria.
- **Resultado esperado:** sync bidireccional; sign-off manual pendiente filas D\* en tabla del runbook.

### Tarea 3 — Textos de negocio en subida (dev 6.5)

**Qué se implementó**

- **`constants/strings.ts`:** `driverEvidenceHint` menciona **delivery**, **seal**, **damage**, **delay** e **incidents**; `podConfirmHint` pide verificar esos casos antes de subir; `documentsNote` aclara documentos de dispatch + foto del conductor abajo.
- Eliminado **`podNote`** (sin uso) y confirmado que no queda **`driverUploadTmsRequired`** ni copy «TMS patch pending».
- **`podPreviewA11y`:** «Preview of selected driver photo» (consistente con 6.1).
- **Tests:** `constants/__tests__/strings-driver-evidence.test.ts`; incluido en `npm run qa:6.4`.

**Funcionalidad disponible**

- El conductor entiende cuándo subir foto (entrega, sello, percances/retraso) sin mensajes de placeholder TMS.

**Cómo probar**

- `npm test -- --testPathPattern="strings-driver-evidence"`.
- **Móvil:** **My Loads** → carga → **POD / Documents** → leer nota superior y bloque **Driver photo (optional)** → elegir foto → texto de confirmación antes de **Upload photo**.
- **Resultado esperado:** copy en inglés claro; sin texto gris de «TMS patch pending».

### Tarea 4 — Compresión/redimensionado antes de subir foto (dev 6.6)

**Qué se implementó**

- Dependencia **`expo-image-manipulator`** (Expo SDK 54).
- **`lib/media/driver-upload-image-policy.ts`:** máx. **1920 px** por lado, JPEG **0.82**, omitir si ≤1.5 MB y dimensiones ya pequeñas.
- **`lib/media/prepare-driver-upload-image.ts`:** tras elegir foto, redimensiona/comprime (HEIC→JPEG, fotos grandes); **web** y fotos pequeñas sin cambio.
- **`PodUploadSection`:** usa `prepareDriverUploadImage` antes de validar y mostrar vista previa.
- **Tests:** `prepare-driver-upload-image.test.ts`; contrato y `PodUploadSection` actualizados.

**Funcionalidad disponible**

- Menos memoria y ancho de banda en subidas desde cámara/galería; misma UX (una foto por vez).

**Cómo probar**

- `npm test -- --testPathPattern="prepare-driver-upload-image"`.
- `npm run lint`.
- **Móvil:** foto de cámara de alta resolución → **Add driver photo** → vista previa → **Upload photo** → éxito; archivo en TMS sigue siendo imagen legible.
- **Resultado esperado:** subida más rápida en red lenta; sin error en fotos ya pequeñas.

---

### Anexo — Preguntas de feedback del cliente (post-demo)

Tras la demo. Respuestas breves para alinear expectativas (v1 móvil + roadmap Semana 8).

#### 1. ¿Hace falta “expiración” de documentos? ¿Es por seguridad?

**Pregunta (cliente):** No ve un caso de negocio para que un documento tenga vida útil temporal, salvo que sea para reducir vulnerabilidad. Si no mitigan un riesgo, ¿hace falta preocuparse por la expiración?

**Respuesta (2 jun):** No es que el **archivo** caduque en la carga. Lo que expiraba (~1 h) era el **enlace firmado** de Supabase Storage para **descargar/ver** el PDF o la imagen (patrón del TMS). El documento seguía en `load_documents`; al refrescar la lista se pedía enlace nuevo.

**Actualización (18 jun — DOC.3):** Eliminada la caducidad de 1 h: URLs desde `storage_path` con TTL ~10 años (TMS + móvil). **View** ya no debe mostrar *link expired* en documentos antiguos.

---

#### 2. ¿WhatsApp es respaldo del GPS en vivo que alimenta el TMS automáticamente?

**Pregunta (cliente):** Le gusta enviar datos por WhatsApp; ¿confirma que es respaldo del GPS en vivo que entra al TMS solo?

**Respuesta:** **Hoy en v1, sí es un respaldo manual**, no el canal principal de tracking. **Share location** abre WhatsApp (u otra app) con texto: carga, conductor, coordenadas y enlace a mapas; **no escribe GPS en el TMS** automáticamente (`strings.location.tmsShareOnlyHint`). El GPS **automático y persistente en TMS/mapa en vivo** está planificado en **Semana 8 / v1.1** (Supabase + Realtime), pendiente de confirmar reglas con el cliente (solo viaje activo vs jornada completa).

---

#### 3. GPS: ¿permiso siempre, solo con la app abierta, o también en segundo plano? Batería vs “casi siempre” ubicación

**Pregunta (cliente):** ¿El tracking requiere ubicación siempre permitida, solo con la app abierta, o funciona en background? No quieren agotar batería, pero sí necesitan saber dónde están casi todo el tiempo.

**Respuesta:**

| Alcance                          | Comportamiento                                                                                                                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **v1 (app actual, hasta 9 jun)** | Solo **mientras la app está abierta** (permiso _When in use_ / “al usar la app”). **Sin** tracking en background ni con la app cerrada (`docs/GPS_V1_DECISION.md`, `gps-v1-policy.ts`).                   |
| **“Casi todo el tiempo”**        | **No** lo cubre v1. Requiere decisión de negocio + **Semana 8**: (A) solo carga/viaje en estados “en curso”, o (B) jornada completa con background (más batería, permisos _Always_, más QA y copy legal). |

**Recomendación PP2:** empezar por **(A) viaje activo + app abierta o servicio mínimo en primer plano**; escalar a (B) solo si el cliente lo exige por escrito.

---

#### 4. ¿Los botones de Field actions leen las opciones en vivo desde el TMS?

**Pregunta (cliente):** En el teléfono de la demo vio los botones de field actions; ¿vienen en vivo del TMS?

**Respuesta:** **No en tiempo real desde una API de “menú de acciones”.** La app usa reglas **definidas en el código móvil**, alineadas al panel conductor del TMS (`lib/loads/constants.ts`, `driver-actions.ts`): según el **estado actual de la carga** (dato sí viene de Supabase/TMS al cargar detalle) se muestran solo transiciones permitidas al conductor. Al pulsar un botón, el cambio de estado va al TMS vía **`PATCH` API** (con sesión Bearer cuando el TMS lo tiene desplegado). Si en el TMS cambian las reglas de estados, hay que **actualizar la app** (o en el futuro exponer reglas dinámicas desde el TMS — no está en v1).

---

## 3 de junio de 2026

### Tarea 1 — QA release formal P0/P1 (dev 7.1)

**Qué se implementó**

- **`docs/QA_RELEASE_SIGNOFF_7_1.md`:** matriz P0 (Bearer TMS) y P1 (subida conductor); enlaces a smoke 5.7, producción 5.6, upload 6.4, red, GPS, acciones; tabla maestra de firma.
- **`npm run qa:7.1`:** lint + secret guard + Jest focalizado (documentos, upload, red, GPS, rutas, `release-qa-preflight`).
- **`lib/qa/__tests__/release-qa-preflight.test.ts`:** guardas de scripts y documentos 7.1.
- Actualizado **`docs/DRIVER_TMS_CAPABILITIES_5_7.md`** (estado P0/P1).

**Funcionalidad disponible**

- Gate automatizado previo a sesión QA con cliente/PM; criterios claros para cerrar semanas 5–6.

**Cómo probar**

- `npm run qa:7.1` — todo en verde.
- **Manual:** completar tablas en `docs/QA_RELEASE_SIGNOFF_7_1.md` en dispositivo + TMS producción (mín. S1–S10, D1–D7, A1–A5, P0 acciones si Bearer desplegado).

### Tarea 2 — EAS Build Android + notas de versión (dev 7.2)

**Qué se implementó**

- **`docs/RELEASE_NOTES_0_1_0.md`:** notas v0.1.0 (alcance conductor, env, limitaciones v1).
- **`npm run build:preflight`:** valida `app.json` / `eas.json` / scripts de build / release notes; avisa si falta `extra.eas.projectId`.
- **`docs/MOBILE_BUILDS.md`:** sección 7.1 → 7.2 antes del APK; perfiles `preview` y `production` documentados.
- Scripts existentes: `npm run build:android:preview`, `npm run build:android:production`.

**Funcionalidad disponible**

- Checklist para generar APK interno o producción en EAS con mismas variables que Expo Go (vía secrets).

**Cómo probar**

- `npm run build:preflight` — OK (warning esperado si `projectId` aún placeholder).
- Tras configurar Expo: `npx eas login`, secrets `EXPO_PUBLIC_*`, `projectId` en `app.json` → `npm run build:android:preview`.
- Instalar APK → login conductor → **My Loads** → subida foto → misma Supabase/TMS que en QA 7.1.

### Tarea 3 — Semver, changelog y README (dev 7.3)

**Qué se implementó**

- **`CHANGELOG.md`** (Keep a Changelog + semver) — sección **[0.1.0]**.
- **`docs/VERSIONING.md`**, **`docs/BUG_REPORTING.md`** (plantilla y severidades).
- **`README.md`:** instalación, tabla env, reporte de bugs, enlaces release/rollback/EAS; versión **0.1.0** alineada con `app.json`.
- Tests **`release-handoff-docs.test.ts`**; incluido en `npm run qa:7.1`.

**Cómo probar**

- `npm test -- --testPathPattern="release-handoff-docs"`.
- Revisar README → secciones Installation, Environment, Reporting bugs.

### Tarea 4 — Plan rollback Supabase (dev 7.4)

**Qué se implementó**

- **`docs/ROLLBACK_PP2.md`:** rollback APK, políticas RLS (con advertencia), Realtime `DROP TABLE` publication, datos Storage, TMS externo; inventario scripts PP2.

**Cómo probar**

- Revisar doc con DBA/cliente; validar rutas `supabase/sql-editor/*.sql` listadas existen en el repo.

### Tarea 5 — Handoff credenciales EAS (dev 7.5)

**Qué se implementó**

- **`docs/EAS_CREDENTIALS_HANDOFF_7_5.md`:** matriz de custodia, comandos `eas secret`, keystore, checklist reunión (sin commitear `.jks` ni passwords).

**Cómo probar**

- Completar tabla “Ownership matrix” en reunión con cliente; verificar `npm run build:preflight` antes del primer `eas build`.

### Tarea 6 — Por qué importa la custodia EAS y el `projectId` (seguimiento 7.5, pendiente cliente)

**Qué se documentó**

- En este reporte (y en `DAILY_REPORTS.md`) el **motivo de negocio** de los pasos que la guía `docs/EAS_CREDENTIALS_HANDOFF_7_5.md` deja **sin rellenar en el repo** hasta la reunión de entrega con el cliente.
- La tarea dev **7.5** ya entregó la plantilla; lo que sigue abierto es **operativo** (cuentas Expo, dueños, primer build), no código de la app.

**Por qué es importante — matriz de custodia (“Ownership matrix”)**

- El APK y, más adelante, **Google Play**, dependen de activos que **no viven en git**: login de Expo, keystore Android (firma de la app), secrets `EXPO_PUBLIC_*`, y quién puede ejecutar `eas build`.
- **Sin la matriz rellenada**, si mañana alguien del equipo se va, **nadie sabe con certeza** quién tiene la contraseña de Expo, dónde está el backup del keystore ni quién puede publicar una actualización en Play Store. Perder el keystore implica **no poder actualizar la misma app** en Play (solo nueva identidad de paquete o proceso largo con Google).
- La regla acordada en la guía: el **cliente es dueño** de credenciales de producción; el equipo dev solo privilegio mínimo hasta el handoff.

**Por qué es importante — `extra.eas.projectId` en `app.json`**

- EAS necesita un **UUID real** del proyecto creado en [expo.dev](https://expo.dev). Ese ID **enlaza este repositorio** con el proyecto en la nube donde se compilan los APK y donde viven los **secrets** del build.
- Mientras figure el placeholder `REEMPLAZAR_TRAS_CREAR_PROYECTO_EN_EXPO_DEV`, `npm run build:preflight` avisa (warning) y el primer `eas build` **no apunta** al proyecto correcto del cliente.
- El UUID **no es secreto** (sí commitearlo tras crear el proyecto); lo secreto son keys, contraseñas y el `.jks`.

**Pendiente con el cliente (antes del primer `eas build`)**

1. Crear o vincular proyecto **Tigerhawk Mobile** (`pp2`) en expo.dev e insertar el `projectId` en `app.json`.
2. Configurar secrets EAS (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_TMS_API_URL` con URL **pública** del TMS, no `localhost`).
3. Rellenar la tabla **Ownership matrix** en `docs/EAS_CREDENTIALS_HANDOFF_7_5.md` (nombres/roles, ubicación del backup del keystore, 2FA Expo).
4. Ejecutar `npm run build:android:preview` y guardar el APK de QA según `docs/MOBILE_BUILDS.md`.

**Funcionalidad disponible**

- Sin cambio en la app en Expo Go; el conductor sigue probando con `.env.local`. El **APK instalable** para campo depende de los pasos anteriores.

**Cómo probar**

- Leer `docs/EAS_CREDENTIALS_HANDOFF_7_5.md` §1 y checklist §6 con PM/cliente.
- `npm run build:preflight` — confirmar que desaparece el warning de `projectId` tras pegar el UUID real.
- Tras secrets + build: instalar APK → login → **My Loads** → smoke de subida (misma Supabase/TMS que QA 7.1).

### Tarea 7 — Runbook de soporte (dev 7.6)

**Qué se implementó**

- **`docs/MOBILE_SUPPORT_RUNBOOK_7_6.md`:** escalado L1 (campo) → L2 (soporte app) → L3 (ingeniería); triage **RLS** (lista vacía, `42501`, no revertir sin DBA); **Storage/documentos** (enlace expirado, offline, 50 MB, Bearer TMS); códigos HTTP TMS; Realtime; cuándo abrir incidente P0/P1; tabla de contactos (rellenar en handoff).
- Enlaces desde `docs/BUG_REPORTING.md` y README.

**Funcionalidad disponible**

- El conductor no ve cambios en UI; dispatch/QA tienen guía operativa post–v0.1.0.

**Cómo probar**

- `npm test -- --testPathPattern="release-handoff-docs"`.
- Revisar runbook con PM: simular “View expirado” → pull-to-refresh; simular upload 403 → sección TMS + parches.

### Tarea 8 — Backlog v1.1 (dev 7.7)

**Qué se implementó**

- **`docs/BACKLOG_V1_1_7_7.md`:** tabla priorizada (push, mensajes, wait time, geofencing, E2E Maestro/Detox, P2 tap-to-call/direcciones, offline-first, reglas dinámicas); **rastreo en vivo** explícitamente en **Semana 8** (8.1–8.17), no duplicado; orden sugerido v1.1 + diagrama; anclas de código v0.1.0; P0/P1 de cierre separados del backlog.
- Cruce con `docs/DRIVER_TMS_CAPABILITIES_5_7.md` y `PP2_TAREAS_DEV.md` § Semana 8.
- Tests ampliados en `release-handoff-docs.test.ts` (7.6–7.7).

**Revisión rutas/código (consistencia)**

- `lib/qa/__tests__/app-routes-smoke.test.ts` y `load-detail-routes.test.ts` — rutas obligatorias y `normalizeLoadIdParam` en detalle + hooks de documentos.
- Mensajes en detalle: placeholder `noMessages` (sin mock en producción); coherente con backlog v1.1.

**Cómo probar**

- `npm test -- --testPathPattern="release-handoff-docs|app-routes-smoke|load-detail-routes"`.
- `npm run lint`.
- Abrir `docs/BACKLOG_V1_1_7_7.md` y confirmar enlace a Semana 8 en `PP2_TAREAS_DEV.md`.

---

## 5 de junio de 2026

### Tarea 1 — Cargas HOT primero en My Loads (prioridad P2)

**Qué se implementó**

- **`lib/loads/sort-assigned-loads.ts`:** orden — `is_hot` primero, luego `created_at` descendente.
- **`fetch-driver-loads-page.ts`:** query Supabase `.order('is_hot')` + `.order('created_at')` para paginación correcta.
- **`useAssignedLoadsQuery`:** reorden tras dedupe (Realtime si dispatch marca/desmarca HOT).
- **`map-load-row.ts`:** `created_at` en filas de listado para desempate.
- Tests: `sort-assigned-loads.test.ts`.

**Funcionalidad disponible**

- En **My Loads**, las cargas urgentes (HOT del TMS) aparecen **al inicio**; el badge/borde naranja existente se mantiene.

**Cómo probar**

- `npm test -- --testPathPattern="sort-assigned-loads"`.
- `npm run lint`.
- **Mobile:** en TMS marcar una carga asignada al conductor como **Hot** → app **My Loads** → pull-to-refresh → la carga HOT queda arriba del resto.

### Tarea 2 — Planificación GPS en vivo + repo TMS dev

**Qué se implementó**

- **`docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`**, **`docs/TMS_DEV_REPOSITORY.md`**, **`.cursor/rules/tms-dev-repository.mdc`**, **`AGENTS.md`** § TMS desarrollo — cambios TMS solo en `tigerhawk-tms-main`, no en `PROYECTO_MUESTRA/`.
- **`PP2_TAREAS_DEV.md`:** Semana 8 resumida; prioridad v1.1 GPS; eliminada tarea **8.1** (confirmación escrita); alcance fijo viaje activo + primer plano.
- Actualizados `docs/BACKLOG_V1_1_7_7.md`, `README.md`, tests `release-handoff-docs`.

**Funcionalidad disponible**

- Sin cambio de UI; documentación y reglas para implementar **8.4–8.13** (Supabase + móvil + mapa TMS).

**Cómo probar**

- `npm test -- --testPathPattern="release-handoff-docs"`.
- Revisar `PP2_TAREAS_DEV.md` § Semana 8 y `docs/TMS_DEV_REPOSITORY.md`.

### Tarea 3 — SQL GPS aditivo Supabase (dev 8.4 / 8.5 / 8.6 scripts)

**Qué se implementó**

- **`supabase/sql-editor/20260605120000_pp2_driver_live_location_loads.sql`** (+ copia en `supabase/migrations/`): columnas nullable `current_latitude`, `current_longitude`, `last_seen_at`, `location_accuracy_m`; índice `last_seen_at`; política RLS **nueva** (sin DROP de Staff); trigger que impide al conductor cambiar columnas distintas al GPS.
- **`VERIFY_pp2_driver_live_location.sql`**, **`enable_realtime_driver_tracking.sql`**; actualizados `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`, `docs/ROLLBACK_PP2.md`, `PP2_TAREAS_DEV.md`.

**Funcionalidad disponible**

- **Aún no en app** hasta aplicar SQL en Supabase y tareas **8.7–8.8** móvil. TMS producción **no se rompe** si el script es aditivo (columnas NULL).

**Cómo probar**

- Supabase → SQL Editor → pegar y ejecutar `20260605120000_pp2_driver_live_location_loads.sql` → luego `VERIFY_pp2_driver_live_location.sql` (4 columnas + política + trigger + Realtime).
- Smoke TMS: login dispatcher → listar cargas → abrir detalle (sin cambios visibles hasta mapa 8.12).
- `npm test -- --testPathPattern="release-handoff-docs"`.

---

## 10 de junio de 2026

### Tarea 1 — Cobro tiempo excedido: spec + auditoría TMS (WT.1 / WT.2)

**Qué se implementó**

- **`docs/WAIT_TIME_OVERAGE_SPEC.md`** — reglas: inicio en **Arrived At Delivery**, 60 min gratis, evento `delivery_wait`, copy EN.
- **`docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md`** — auditoría API/tabla/trigger y plan Bearer driver.

**Funcionalidad disponible**

- Documentación de producto lista para QA y despliegue TMS.

**Cómo probar**

- Revisar los dos docs anteriores y la tabla WT en `PP2_TAREAS_DEV.md`.

### Tarea 2 — Fase A + B móvil: cronómetro de espera en entrega (WT.3 / WT.5–WT.7)

**Qué se implementó**

- **`lib/wait-time/`** — constantes, `timer-math`, mock Phase A (`EXPO_PUBLIC_WAIT_TIME_MOCK=1`).
- **`lib/tms/wait-time.ts`** — GET/POST/PATCH wait-time con Bearer.
- **`hooks/useDeliveryWaitTimer`** — auto start/stop por estado; tick 1 s; sync API 60 s.
- **`components/loads/DeliveryWaitSection`** integrado en **`LoadDetailContent`** / **`app/load/[id].tsx`**.
- **`constants/strings.ts`** → `waitTime.*`; tests `timer-math`, `wait-time`.

**Funcionalidad disponible**

- En **detalle de carga**, al pasar a **Arrived At Delivery** aparece tarjeta **Delivery wait time** con cronómetro, fase _Free_ / _Billable_ / _Stopped_ y banner al superar 1 h.
- Modo demo: `EXPO_PUBLIC_WAIT_TIME_MOCK=1` (sin llamadas API).

**Cómo probar**

- `npm test -- --testPathPattern="timer-math|wait-time"`.
- **Mobile:** login → **My Loads** → detalle → **Field actions** → **Arrived At Delivery** → ver cronómetro; con mock=1, texto _Demo mode_.
- **Phase B:** quitar mock; tras cambio de estado, verificar POST en TMS (`logged_by: driver`).

### Tarea 3 — TMS dev: API Bearer + panel + campana + toasts (WT.4 / WT.8–WT.12)

**Qué se implementó (repo TMS dev, despliegue Netlify)**

- **`wait-time/route.ts`** — `getUserFromRequest`, driver asignado, POST `start_time` abierto, PATCH + `maybeNotifyWaitExceeded`.
- **`DeliveryWaitTimerPanel`** en sidebar **`LoadDetailPanel`**; demo `?waitMock=1`.
- **`NotificationBell`** — alertas ⏳ wait time billable + Realtime `waiting_time_events`.
- **`useWaitTimeAlerts`** + toasts en **`FloatingToasts`** (WT.12).

**Funcionalidad disponible**

- Dispatcher ve cronómetro en sidebar al abrir carga con espera activa; campana y toast al superar 1 h; enlace a **Waiting Time Audit**.

**Cómo probar**

- TMS: **Dispatcher** → abrir carga → sidebar **Delivery wait time**; demo `?waitMock=1` en URL.
- Simular **Arrived At Delivery** → cronómetro; tras 61 min (o ajuste dev) → campana + toast.
- Desplegar TMS dev a Netlify antes de probar Phase B desde APK.

### Tarea 4 — Realtime SQL + QA + backlog (WT.13–WT.15)

**Qué se implementó**

- **`supabase/sql-editor/enable_realtime_waiting_time_events.sql`** (idempotente).
- **`docs/QA_WAIT_TIME_OVERAGE.md`** — matriz manual mobile + TMS.
- **`PP2_TAREAS_DEV.md`** WT.1–WT.15 marcadas; **`docs/BACKLOG_V1_1_7_7.md`** wait time ✅.

**Funcionalidad disponible**

- Realtime en panel/campana tras aplicar SQL en Supabase.

**Cómo probar**

- SQL Editor → ejecutar `enable_realtime_waiting_time_events.sql`.
- Seguir checklist en `docs/QA_WAIT_TIME_OVERAGE.md`.
- `npm run lint` en repo móvil.

---

## 11 de junio de 2026

### Tarea 1 — QA wait time: fixes schema Supabase + hardening

**Qué se implementó**

- **`supabase/sql-editor/fix_waiting_time_events_billing_columns.sql`** — alinea columnas legacy (`billable`, `duration_minutes`, etc.), CHECK `event_name` (legacy + API), trigger cargos.
- Corrección timer atascado en **0:00** (auto-start, admin client TMS, fallback `actual_delivery`).

**Funcionalidad disponible**

- POST/PATCH wait-time persiste en Supabase compartido tras ejecutar el SQL.

**Cómo probar**

- SQL Editor → script completo → recargar load en **Arrived At Delivery** → cronómetro avanza y sin error de schema.

### Tarea 2 — Móvil: botón End wait time + anti-doble tap

**Qué se implementó**

- **`DeliveryWaitSection`** — botón **End wait time** (cierra evento sin cambiar status).
- **`lib/tms/wait-time.ts`** → `endOpenDeliveryWaitEvent`.
- **`DriverActionBar`** / **`useDriverStatusChange`** — lock in-flight; ignora mismo status; bloqueo cruzado timer ↔ field actions.
- **`lib/wait-time/hydrate-timer-state.ts`** — UI prioriza `waiting_time_events`; refresh al focus.

**Funcionalidad disponible**

- Parar timer desde móvil; evita dobles **Delivered** / **End wait time** por taps rápidos en QA.

**Cómo probar**

- `npm test -- --testPathPattern="hydrate-timer|wait-time"`.
- Móvil: **Arrived At Delivery** → **End wait time** → **Stopped**; status sin cambio; doble tap no duplica audit.

### Tarea 3 — TMS: cargo en Billing al cerrar wait event

**Qué se implementó (repo TMS dev)**

- **`lib/wait-time/sync-load-billing.ts`** — upsert idempotente en `load_billing` (Detention) al cerrar evento con `charge_amount > 0`.
- **`wait-time/route.ts`** POST/PATCH y **`status/route.ts`** Completed — dedupe por tag `[wte:{id}]`.

**Funcionalidad disponible**

- Tras **>60 min** y cerrar timer, pestaña **Billing** del load muestra línea **Detention** sin esperar **Completed**.

**Cómo probar**

- TMS local + SQL schema fix → simular wait **>60 min** → **End wait time** o **Delivered** → **Billing** → Detention; **Waiting Time Audit** coherente.

---

## 15 de junio de 2026

### Tarea 1 — Parches TMS: actualización de versión en rama dev y despliegue Netlify (~2 h 30 min)

**Qué se hizo**

- Consolidación y aplicación de **parches TMS** en el repositorio de desarrollo (`tigerhawk-tms-main`) para alinear la versión desplegada con lo que consume la app móvil:
  - **`app/api/dispatcher/loads/[id]/wait-time/route.ts`** — autenticación **Bearer JWT** para conductores (`getUserFromRequest`), POST de eventos abiertos (`start_time` sin `end_time`), PATCH de cierre, notificaciones al superar 60 min.
  - **`lib/wait-time/sync-load-billing.ts`** — upsert idempotente en **`load_billing`** (línea **Detention**) al cerrar evento con `charge_amount > 0`; deduplicación por tag `[wte:{id}]`.
  - **`lib/wait-time/notify-exceeded.ts`** + integración en **`NotificationBell`** y **`useWaitTimeAlerts`** — alertas dispatcher en campana y toasts.
  - **`components/dispatcher/DeliveryWaitTimerPanel.tsx`** — panel sidebar en **`LoadDetailPanel`** con cronómetro live y enlace a **Waiting Time Audit**.
- Preparación del **despliegue a Netlify** (producción/staging compartido): verificación de variables de entorno (`NEXT_PUBLIC_SUPABASE_*`, service role), build Next.js sin errores de tipos en rutas nuevas.
- Smoke test post-deploy: dispatcher abre carga → sidebar **Delivery wait time**; conductor en móvil cambia a **Arrived At Delivery** → POST wait-time visible en TMS.

**Funcionalidad disponible**

- TMS dev desplegable con **wait time Phase B** completo (no solo demo `?waitMock=1`).
- Billing automático en pestaña **Billing** al cerrar espera facturable.

**Cómo probar**

- TMS: login dispatcher → carga activa → sidebar timer; **Waiting Time Audit** coherente tras cerrar evento.
- Móvil (sin mock): **Arrived At Delivery** → cronómetro; TMS refleja evento en menos de 60 s.

---

### Tarea 2 — Seguridad y endurecimiento de rutas API TMS (~2 h)

**Qué se hizo**

- Revisión y refuerzo del patrón **Bearer JWT** documentado en **`docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`**:
  - **`lib/supabase/get-user-from-request.ts`** — extracción de token y `getUser(jwt)` (obligatorio para Expo; cookies del navegador no aplican).
  - **`lib/supabase/server.ts`** — `createClient(request)` con header `Authorization` propagado.
  - **Middleware** — no devolver 401 prematuro en `/api/*` cuando llega `Authorization: Bearer`; dejar que el handler autentique.
- Rutas móvil auditadas y alineadas: **`PATCH …/status`**, **`POST …/documents`**, **`GET/POST/PATCH …/wait-time`**.
- Validación de permisos **conductor asignado** (`driver_id = auth.uid()`) en wait-time y documentos; rechazo 403 para cargas de otro conductor.
- Revisión de límites de subida (50 MB, 255 caracteres nombre, MIME imagen) sin relajar seguridad.

**Funcionalidad disponible**

- La app móvil deja de recibir **401 Unauthorized** intermitente en Field actions y subida de fotos cuando el TMS desplegado incluye estos parches.

**Cómo probar**

- APK o Expo con `EXPO_PUBLIC_TMS_API_URL` apuntando al TMS desplegado → login conductor → **Field actions** + **Add driver photo** sin “Session expired”.

---

### Tarea 3 — Supabase: scripts SQL y alineación schema `waiting_time_events` (~1 h 30 min)

**Qué se hizo**

- Revisión de errores en QA (columnas faltantes `billable`, `duration_minutes`; violación CHECK `event_name` con valores legacy vs `delivery_wait`).
- Preparación y documentación de **`supabase/sql-editor/fix_waiting_time_events_billing_columns.sql`** — columnas nullable, CHECK ampliado (legacy + API), trigger `trg_compute_wait_charges`.
- Preparación de **`enable_realtime_waiting_time_events.sql`** (idempotente) para panel TMS y campana sin recargar página.
- Verificación de políticas RLS existentes: conductor solo lee/escribe eventos de cargas asignadas vía API TMS (admin client), no exposición directa indebida.

**Funcionalidad disponible**

- Tras ejecutar SQL en el proyecto Supabase compartido, POST/PATCH wait-time desde móvil persiste sin errores de schema cache.

**Cómo probar**

- SQL Editor → script completo → recargar carga en **Arrived At Delivery** → sin error `billable` / `event_name_check`.

---

### Tarea 4 — Móvil: hardening wait timer post-11 jun (~1 h 30 min)

**Qué se hizo**

- Continuación de estabilización iniciada el 11 jun:
  - **`lib/wait-time/hydrate-timer-state.ts`** — prioridad `waiting_time_events` sobre fallback `actual_delivery`.
  - **`hooks/useDeliveryWaitTimer`** — auto-start al montar si status ya es **Arrived At Delivery**; sync API cada 60 s; refresh al focus de pantalla.
  - **`lib/tms/wait-time.ts`** — `endOpenDeliveryWaitEvent`, manejo de errores de red con mensajes al conductor.
- Tests de regresión: **`hydrate-timer-state.test.ts`**, **`timer-math.test.ts`**, contrato API wait-time.

**Funcionalidad disponible**

- Cronómetro no se queda en **0:00** tras recargar detalle; estado coherente con TMS tras background/foreground.

**Cómo probar**

- `npm test -- --testPathPattern="hydrate-timer|wait-time|timer-math"`.
- Móvil: **Arrived At Delivery** → salir y volver al detalle → timer continúa desde DB.

---

### Tarea 5 — Documentación técnica y handoff interno (~30 min)

**Qué se hizo**

- Actualización de referencias cruzadas: **`docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md`**, **`docs/QA_WAIT_TIME_OVERAGE.md`**, **`docs/MOBILE_API.md`** (rutas wait-time).
- Notas de despliegue para equipo: orden **SQL → TMS Netlify → EAS env**.

---

## 16 de junio de 2026

### Tarea 1 — Sincronización tiempo real móvil ↔ TMS: reducción de demoras (~2 h 30 min)

**Qué se hizo**

- Mejora del canal **móvil ↔ TMS ↔ Supabase** para que cambios de estado, documentos y wait time se reflejen sin recargar manualmente:
  - **`lib/supabase/realtime/driver-loads-subscription.ts`** — suscripción Postgres a `loads` y `load_documents` con parches optimistas en cache React Query (`apply-realtime-load-patch`, `apply-realtime-document-patch`); debounce 300 ms en ráfagas de asignación.
  - **`hooks/useDriverLoadsRealtime.ts`** — Realtime + **polling de respaldo cada 5 s** mientras la app está activa (patrón **NotificationBell** TMS cuando Realtime se desconecta).
  - **`lib/query/foreground-refetch-throttle.ts`** — throttle al volver de background (30 s listado / 15 s documentos) para equilibrar frescura y batería.
  - **`lib/query/refetch-active-driver-loads.ts`** — invalidación cruzada listado ↔ detalle ↔ documentos tras evento Realtime.
  - **`syncSupabaseRealtimeAuth`** — re-suscribir canal al renovar JWT Supabase.
- Wait timer: refresh explícito al **focus** de `app/load/[id].tsx` para alinear UI con eventos cerrados desde TMS dispatcher.

**Funcionalidad disponible**

- Dispatcher cambia estado en TMS → conductor ve actualización en móvil en **segundos** (Realtime o poll), no minutos.
- Cierre de wait time en TMS → móvil muestra **Stopped** sin pull-to-refresh obligatorio.

**Cómo probar**

- Dos dispositivos: TMS dispatcher cambia status → móvil en detalle de la misma carga → UI actualizada ≤ 5–10 s.
- TMS cierra wait event → móvil en **Delivery wait time** → fase _Stopped_.

---

### Tarea 2 — Diagnóstico y corrección error de red en Field actions (~1 h 30 min)

**Qué se hizo**

- Investigación de **“Network request failed”** en builds de dispositivo físico al usar Field actions.
- **Causa raíz:** `EXPO_PUBLIC_TMS_API_URL` en `.env.local` / EAS apuntaba a **`http://192.168.x.x:3000`** (LAN dev); el teléfono fuera de esa red no alcanza el host.
- Corrección: **`EXPO_PUBLIC_TMS_API_URL=https://tigerhawk.netlify.app`** (URL pública TMS); documentado que **`NEXT_PUBLIC_APP_URL`** del TMS **no** sustituye la variable Expo en builds móviles.
- Script **`npm run eas:push-env`** (`scripts/eas-push-env-from-local.mjs`) — push de `EXPO_PUBLIC_SUPABASE_*` y `EXPO_PUBLIC_TMS_API_URL` a secrets EAS proyecto `@likaon1606/pp2`.
- Verificación post-cambio: `PATCH …/status` y `POST …/wait-time` responden 200 desde APK.

**Funcionalidad disponible**

- Field actions y wait time operativos en **dispositivo real** contra TMS en la nube.

**Cómo probar**

- Rebuild o restart Expo con env corregido → login → **My Loads** → **Arrived At Delivery** → sin error de red.

---

### Tarea 3 — Build EAS Android APK en la nube (~2 h)

**Qué se hizo**

- Ejecución de pipeline **EAS Build** desde Windows (sin Mac):
  - Perfil **`preview`** / **`production`** en **`eas.json`** (APK internal distribution).
  - **`npm run build:preflight`** — validación `projectId`, dependencias, env requeridas.
  - **`eas build --platform android --profile preview`** — build cloud Expo (ID registrado en sesión de trabajo).
  - Configuración **`app.json`**: `projectId` EAS, scheme `pp2`, slug alineado.
- Resolución de bloqueos: env vars en EAS vs locales; confirmación de que builds empaquetan `EXPO_PUBLIC_*` en compile time.

**Funcionalidad disponible**

- APK instalable en Android de prueba sin Expo Go, apuntando a Supabase + TMS producción/Netlify.

**Cómo probar**

- Descargar artefacto desde expo.dev → instalar APK → login conductor → flujo completo loads + wait time.

---

### Tarea 4 — QA integración wait time + anti-doble tap (~1 h 30 min)

**Qué se hizo**

- Regresión manual y automatizada tras sync y env fixes:
  - **`DriverActionBar`** / **`useDriverStatusChange`** — lock in-flight; ignorar mismo status; **bloqueo cruzado** timer ↔ field actions (no **Delivered** mientras para timer, ni doble tap).
  - **`DeliveryWaitSection`** — botón **End wait time** + estados _Free_ / _Billable_ / _Stopped_.
  - Matriz **`docs/QA_WAIT_TIME_OVERAGE.md`**: inicio, 60 min, cierre, billing, campana TMS.
- Tests: `npm test -- --testPathPattern="hydrate-timer|wait-time|driver-status"`.

**Funcionalidad disponible**

- QA estable para demo cliente; sin duplicar filas en `waiting_time_events` por taps rápidos.

**Cómo probar**

- Doble tap **End wait time** → un solo evento cerrado en TMS audit.

---

### Tarea 5 — Preparación arquitectura Samsara API (spike inicial) (~30 min)

**Qué se hizo**

- Investigación en TMS producción/referencia y feedback cliente (Q2): producción usa **Samsara API**; interés en **geofence auto check-out** y alerta dispatch.
- Auditoría repo TMS dev: sin integración viva aún; punto de extensión identificado en **`status/route.ts`**, wait-time close hooks y futuro **`lib/integrations/samsara/`** (stub).
- Borrador de alcance **WT.23** en **`PP2_TAREAS_DEV.md`**: webhook geofence → cierre wait event + `activity_log` + notificación dispatch.
- Alineación con **`docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`**: fase 0 Supabase GPS; Samsara como capa v1.2+ sin bloquear wait time manual v1.1.

**Funcionalidad disponible**

- Roadmap técnico listo para cuando el cliente comparta credenciales/API Samsara de producción.

---

---

## 17 de junio de 2026

### Tarea 1 — Análisis Q&A wait time + próximos pasos para el cliente (Semana 9)

**Qué se hizo**

- Análisis detallado de **`PREGUNTAS_CLIENTE.md`** contra el código móvil y el TMS dev (repo editable).
- Documento interno **`RESPUESTAS_CLIENTE.md`** (secciones **RESPUESTAS EN ESPAÑOL** y **ANSWERS IN ENGLISH**).
- Reformato de **`PREGUNTAS_CLIENTE.md`** (solo legibilidad; textos intactos).
- Nuevas tareas en **`PP2_TAREAS_DEV.md`** — **Semana 9 (WT.16–WT.26, DOC.1–2, UI.1)**.

**Funcionalidad disponible**

- No hay cambio de código en app; es **documentación y plan de trabajo** listos para alinear con el cliente antes de la siguiente iteración.

**Cómo probar**

- Revisar `RESPUESTAS_CLIENTE.md`, `PREGUNTAS_CLIENTE.md` y tabla Semana 9 en `PP2_TAREAS_DEV.md`.
- Validar con el cliente las preguntas abiertas de la sección siguiente antes de implementar WT.17, WT.22, WT.25 y UI.1.

---

### Tarea 2 — Documento para enviar al cliente — Próximos pasos Tigerhawk Mobile + TMS

**Asunto sugerido:** *Tigerhawk Mobile — resumen wait time, próximos pasos y confirmaciones pendientes*

Estimado equipo,

Gracias por las respuestas en **`PREGUNTAS_CLIENTE.md`**. A continuación resumimos lo que ya quedó alineado, lo que implementaremos a continuación y las **confirmaciones que necesitamos** para seguir sin retrabajo.

#### Lo que ya confirmaron (y cómo lo interpretamos)

| Tema | Su respuesta | Implicación técnica |
|------|--------------|---------------------|
| Imagen BOL / POD / In-Gate | Es para **describir la foto al subirla**, no para iniciar el timer | El cronómetro **no** depende del tipo de documento; podemos añadir ese selector en móvil en una fase posterior |
| Alcance del wait time | Solo **Delivery** (cliente descarga lento); puerto/depósito **no facturable** | Un solo evento `delivery_wait` por carga |
| Timer | **Uno solo** (delivery) | Sin timers paralelos en pickup o return |
| Tiempo gratis | **60 minutos** en delivery | Minuto 61+ pasa a cobro (A/R y driver pay vía TMS) |
| Check In | Presente para **descarga en cliente** | Equivale a “llegué y estoy esperando descarga” |
| Check Out | **Fin del servicio** | Cierra la espera facturable |
| Quién actúa | **Conductor manual** | Botones en la app; sin automatización Samsara en v1.1 |
| Parar el timer | **End Wait Time** primero; también Delivered, Out-Gate, GPS, etc., con **nota** si seguía corriendo | Parte ya hecha (End wait + Delivered); pendiente Out-Gate/GPS y notas de auditoría |
| Samsara / geofence | Producción usa API; les interesa auto check-out | Roadmap **v1.2+**; no bloquea la entrega actual del timer |
| Permisos foto | De acuerdo en quitar bloqueos molestos | Mejoraremos mensajes si cámara/galería están denegados |

**Estado actual del producto (~80 % del flujo acordado):**

- Móvil: cronómetro en detalle de carga, inicio al pasar a **Arrived At Delivery**, parada con **End wait time** o **Delivered**, aviso tras 1 h.
- TMS (rama dev): panel **Delivery wait time**, API wait-time, campana y toasts; línea **Detention** en Billing al cerrar evento con cobro.
- **Pendiente de despliegue:** parches TMS en Netlify + scripts SQL en Supabase compartido (`waiting_time_events`).

#### Próximos pasos (orden propuesto)

| Fase | Plazo orientativo | Entregable |
|------|-------------------|------------|
| **1. Infraestructura** | Inmediato | Desplegar TMS dev (wait-time + billing sync); ejecutar SQL en Supabase; verificar `EXPO_PUBLIC_TMS_API_URL` en builds APK |
| **2. Reglas de negocio** | Tras fase 1 | Actualizar spec escrita (`WAIT_TIME_OVERAGE_SPEC`) con reglas confirmadas |
| **3. Cierres y auditoría** | Semana 9 | Al **Delivered** / **Dropped - Loaded** / subida **Out-Gate** con timer abierto: cerrar evento y **nota** en historial si aún corría |
| **4. UX conductor** | Semana 9 | Etiquetas **Check In / Check Out** (o confirmar que basta **Arrived At Delivery**); panel read-only de **tiempo / pago acumulado** en móvil |
| **5. Documentos** | Semana 9 | Selector de tipo al subir foto (BOL, POD, In-Gate…); permisos cámara con mensaje claro |
| **6. Futuro** | v1.2+ | Spike **Samsara + geofence** auto check-out y alerta a dispatch |

#### Confirmaciones que necesitamos de ustedes

Por favor respondan cuando puedan (texto breve por ítem basta):

**Q4 — Interfaz (UI)**  
Propusimos adaptar la marca TigerHawk (sidebar oscuro, acento naranja). Para el conductor en ruta, recomendamos **listas y detalle con fondo claro** y chrome oscuro solo en login/cuenta.  
→ **¿Confirman este enfoque o prefieren tema oscuro en toda la app?**

**Q5 — Wait timer y pago al conductor**  
Planeamos integrar el timer con billing en TMS y, opcionalmente, mostrar en móvil el **tiempo de espera acumulado y monto estimado** para motivar al conductor antes del payday.  
→ **¿Quieren ese resumen de pago visible en la app del conductor? ¿Qué datos exactos deben ver (solo wait time, base pay, total)?**

**Q7 — ¿Qué acción inicia el wait time?**  
En el cuestionario no hubo respuesta explícita. Por las respuestas 12–15 asumimos que **Check In = inicio**.  
→ **¿Qué evento debe iniciar el cronómetro en delivery?** (opciones abajo)

**Q7 (implícita) — ¿Basta “Arrived At Delivery” o botón “Check In”?**  
Hoy el timer arranca al cambiar el estado a **Arrived At Delivery**.  
→ **¿Es suficiente o prefieren un botón explícito “Check In”** (mismo efecto técnico, distinta etiqueta para el conductor)?

**Q11 — Detention vs Wait Time en factura al cliente**  
En TMS, los datos viven en `waiting_time_events`; al cerrar con cobro, la línea en Billing puede aparecer como **Detention**. En catálogo hay también “Wait Time” como accessorial.  
→ **¿En la factura al cliente debe decir “Detention”, “Wait time”, o son el mismo concepto con un solo nombre?**  
→ Confirmamos: **espera en puerto/terminal no se factura**; solo delivery lento del cliente.

---

**Referencias internas:** `RESPUESTAS_CLIENTE.md`, `PP2_TAREAS_DEV.md` (Semana 9), `PREGUNTAS_CLIENTE.md`.

---

### Tarea 3 — Planificación Semana 9 en `PP2_TAREAS_DEV.md` (~1 h)

**Qué se hizo**

- Tareas **WT.16–WT.26**, **DOC.1–2**, **UI.1** con orden sugerido: deploy/SQL → spec → cierres secundarios → UX conductor → documentos → spike Samsara.
- Actualización de reglas de negocio confirmadas por cliente en bloque wait time.

---

### Tarea 4 — Preparación móvil + TMS dev para integración Samsara (~1 h)

**Qué se hizo**

- Diseño de contrato futuro (sin credenciales prod):
  - Punto de entrada TMS: **`POST /api/integrations/samsara/webhook`** (placeholder) → validación firma → lookup vehículo/conductor → geofence exit customer → `endOpenDeliveryWaitEvent` + nota dispatch.
  - Móvil: sin cambio inmediato; GPS v1 **share_only** coexiste; live tracking Semana 8 alimentará contexto para correlación Samsara.
  - Variables de entorno documentadas: `SAMSARA_API_TOKEN`, `SAMSARA_WEBHOOK_SECRET` (TMS server-only, no en Expo).
- Enlace con **WT.18** (cierre por Out-Gate/GPS) y **WT.23** (spike formal).

**Funcionalidad disponible**

- Arquitectura preparada; implementación pendiente credenciales y confirmación cliente.

---

### Tarea 5 — Cierre administrativo (~30 min)

**Qué se hizo**

- Verificación de coherencia entre **`REPORTES_DIARIOS.md`**, **`DAILY_REPORTS.md`**, **`RESPUESTAS_CLIENTE.md`** y **`PP2_TAREAS_DEV.md`**.

---

## 18 de junio de 2026

### Tarea 1 — Tema claro TigerHawk (UI.1) (~2 h)

**Qué se hizo**

- Cliente confirmó tema **claro** para conductor (visibilidad diurna): *“do a light version of our theme please”*.
- `constants/theme.ts`: `PP2Theme.colors.tms` pasa de chrome oscuro a paleta clara (fondo `#F4F6F8`, drawer/header blancos, acento `#E8700A`).
- Drawer, cabeceras, login, account, `BrandHeader`, `Button`/`Card`/`Input` alineados al tema claro.
- Nuevo `components/ui/AppActionSheet.tsx` — bottom sheet ligero para picker de foto POD y confirmación de descarte (reemplaza `Alert.alert` en `PodUploadSection`).
- Regla `.cursor/rules/pp2-ui-style.mdc` y **UI.1** en `PP2_TAREAS_DEV.md` actualizados.

**Cómo probar**

1. `npm start` → login: fondo claro, card blanca, botón naranja TigerHawk.
2. Drawer: menú blanco, ítem activo naranja; cabecera blanca con título oscuro.
3. Detalle de carga → **Add driver photo** → sheet claro (Camera / Gallery / Cancel); cancelar preview → sheet de descarte.
4. `npm test -- --testPathPattern=PodUploadSection`

---

### Tarea 2 — Documentos sin caducidad 1h (DOC.3) (~1 h)

**Qué se hizo**

- Eliminada la URL firmada de **1 hora** en documentos de carga (`load-documents` bucket).
- **TMS** (`tigerhawk-tms-main`): helper `lib/load-documents/resolve-document-url.ts`; upload + GET dispatcher/portal/mobile usan TTL ~10 años desde `storage_path`.
- **Móvil:** `lib/loads/resolve-load-document-url.ts` — al listar y subir, URL de larga duración (ya no depende del `url` caducado en DB).
- Corrige error *“This download link has expired”* al pulsar **View** en cargas antiguas.

**Cómo probar**

1. Deploy TMS dev Netlify con estos cambios.
2. App móvil → detalle de carga con documento subido hace >1 h → **View** abre PDF sin error.
3. Subir foto driver → visible en TMS Documents y viceversa.
4. `npm test -- --testPathPattern=fetch-load-documents`

---

### Tarea 3 — Wait time manual start/stop (WT.27) (~2 h)

**Qué se hizo**

- Wait time **solo inicio manual**; **End wait time** como fin principal; sin auto-start al cambiar status ni cierre por **Delivered**.
- `hooks/useDeliveryWaitTimer.ts`: eliminados efectos auto-start/stop; expuestos `startTimer`, `canStart`, `visible`.
- `components/loads/DeliveryWaitSection.tsx`: botón **Start wait time** (accent) antes del cronómetro; elapsed solo tras start manual.
- `lib/wait-time/hydrate-timer-state.ts`: ya no infiere inicio desde `actual_delivery` sin evento API.
- `lib/wait-time/constants.ts`: `isDeliveryWaitEligibleStatus`; helpers legacy marcados deprecated.
- `constants/strings.ts`: copy EN `startWaitTime`, `startWaitTimeHint`, `startWaitTimeA11y`.
- Tests: `hydrate-timer-state`, `DeliveryWaitSection`, `useDeliveryWaitTimer`.
- **WT.27** marcada completada en `PP2_TAREAS_DEV.md`.

**DB SUPABASE NO REQUIERE CAMBIOS** — usa tabla/API `waiting_time_events` existente; POST/PATCH vía TMS Bearer sin migraciones nuevas.

**Cómo probar**

1. `EXPO_PUBLIC_WAIT_TIME_MOCK=1` → detalle carga en **Arrived At Delivery** → card **Delivery wait time** con **Start wait time** (sin cronómetro hasta pulsar).
2. Pulsar **Start wait time** → cronómetro corre; **End wait time** lo detiene sin cambiar status.
3. Cambiar status a **Delivered** con timer activo → timer **sigue** (no auto-stop).
4. `npm test -- --testPathPattern="DeliveryWaitSection|useDeliveryWaitTimer|hydrate-timer"`

---

### Tarea 4 — Spec wait time actualizada (WT.34) (~1 h)

**Qué se hizo**

- Reescritura **`docs/WAIT_TIME_OVERAGE_SPEC.md`**: alcance delivery-only, un timer, 60 min gratis, semántica Check In/Out, **`opciones_driver.png`** = tipos de documento (no timer), reglas A–E, mapa de código móvil/TMS, fases y pendientes (WT.28–31, DOC.1).
- **`docs/QA_WAIT_TIME_OVERAGE.md`**: matriz alineada a start/stop manual (**WT.27**); filas 2/2b, 7/7a, 10.
- **`lib/wait-time/constants.ts`**: referencia a spec.
- **WT.34** completada en `PP2_TAREAS_DEV.md`.

**DB SUPABASE NO REQUIERE CAMBIOS** — tarea de documentación; runtime sigue usando `waiting_time_events` existente.

**Cómo probar**

1. Leer `docs/WAIT_TIME_OVERAGE_SPEC.md` y contrastar con flujo móvil en **Arrived At Delivery**.
2. Ejecutar matriz **`docs/QA_WAIT_TIME_OVERAGE.md`** § filas 2, 2b, 7, 7a.
3. `npm test -- --testPathPattern="wait-time|hydrate-timer|DeliveryWaitSection"`

---

## 19 de junio de 2026

### Tarea 1 — Supabase wait time schema + Realtime (WT.20) (~45 min)

**Qué se hizo**

- Aplicados en Supabase compartido (TigerhawkTMS):
  - `supabase/sql-editor/fix_waiting_time_events_billing_columns.sql` — columnas billing/API, CHECK `event_name` (`delivery_wait`), trigger `trg_compute_wait_charges`.
  - `supabase/sql-editor/enable_realtime_waiting_time_events.sql` — Realtime en `waiting_time_events`.
- Nuevo `supabase/sql-editor/VERIFY_pp2_waiting_time_events.sql` — verificación post-apply.
- Nuevo `scripts/apply-wt20-wait-time.mjs` + `npm run db:apply-wt20` (Supabase CLI `--linked` o modo `--pg`).
- **WT.20** completada en `PP2_TAREAS_DEV.md`; absorbe **WT.13**.

**Cómo probar**

1. `npm run db:apply-wt20` (idempotente; requiere Supabase CLI logueado + proyecto linked).
2. SQL Editor o CLI: `VERIFY_pp2_waiting_time_events.sql` — columnas clave + Realtime publicado.
3. Móvil → **Start wait time** → TMS dispatcher panel actualiza sin refresh (Phase B).
4. `npm test -- --testPathPattern="wait-time"`

---

### Tarea 2 — Panel wait pay conductor (WT.22) (~1 h 30 min)

**Qué se hizo**

- Panel read-only **Your wait pay** dentro de **Delivery wait time** en detalle de carga.
- `lib/wait-time/wait-pay-summary.ts`: suma `driver_pay_amount` de eventos `delivery_wait` cerrados + estimado en vivo del timer abierto (misma fórmula que trigger Postgres: minutos × `driver_rate_per_hour`, default $75/h).
- `components/loads/DeliveryWaitPaySummary.tsx`: tiempo acumulado + pay estimado; hint mientras corre / read-only al cerrar.
- `hooks/useDeliveryWaitTimer.ts`: estado `events` desde GET wait-time; expone `paySummary`; refresh tras start/stop/sync.
- `constants/strings.ts`: copy EN `paySummaryTitle`, `accruedTimeLabel`, `estimatedPayLabel`, hints.
- Tests: `wait-pay-summary.test.ts`, ampliación `DeliveryWaitSection.test.tsx`.
- **WT.22** completada en `PP2_TAREAS_DEV.md`; spec `docs/WAIT_TIME_OVERAGE_SPEC.md` actualizada.

**DB SUPABASE NO REQUIERE CAMBIOS** — usa columnas `driver_pay_amount` / `driver_rate_per_hour` ya aplicadas en **WT.20**.

**Cómo probar**

1. Carga en **Arrived At Delivery** con wait events previos → card muestra **Accrued wait time** + **Estimated wait pay**.
2. **Start wait time** → pay sube en vivo (mock: `EXPO_PUBLIC_WAIT_TIME_MOCK=1`).
3. **End wait time** → panel conserva totales; hint read-only.
4. `npm test -- --testPathPattern="wait-pay|DeliveryWaitSection|useDeliveryWaitTimer"`

---

### Tarea 3 — Etiqueta factura Detention vs Wait time (WT.25) (~45 min)

**Qué se hizo**

- Decisión Q11 documentada: **un concepto** — factura cliente **Detention**; app conductor **Wait time**.
- Nuevo `docs/WAIT_TIME_INVOICE_LABEL.md` (rationale, tabla audiencias, QA, override).
- **TMS dev:** `lib/wait-time/invoice-labels.ts` (constantes); `sync-load-billing.ts` — descripción **Delivery detention — N min billable…**; `status/route.ts` alineado; tests `sync-load-billing.test.ts`.
- Actualizados `docs/WAIT_TIME_OVERAGE_SPEC.md`, `docs/QA_WAIT_TIME_OVERAGE.md` §7b, `RESPUESTAS_CLIENTE.md` § Q11, **WT.25** en `PP2_TAREAS_DEV.md`.

**DB SUPABASE NO REQUIERE CAMBIOS** — solo copy en `load_billing` para eventos nuevos/cerrados tras deploy TMS.

**Cómo probar**

1. Deploy TMS dev con cambios → cerrar `delivery_wait` billable → pestaña **Billing**: **Detention** + descripción **Delivery detention**.
2. Móvil: copy conductor sigue **Wait time** (sin cambio).
3. TMS repo: `npm test -- --testPathPattern=sync-load-billing`

---

### Tarea 4 — Samsara geofence stub + mock (WT.23) (~1 h 30 min)

**Qué se hizo**

- Nuevo **`docs/SAMSARA_GEOFENCE_SPIKE.md`** + **`docs/QA_SAMSARA_GEOFENCE_MOCK.md`** — flujo, env, QA mock, pasos cuando haya credenciales Samsara.
- **TMS dev (subir a Netlify):**
  - `lib/wait-time/close-open-delivery-wait.ts` — cierre reutilizable de `delivery_wait` abierto.
  - `lib/integrations/samsara/*` — parse, handler, config, firma webhook (opcional).
  - `POST /api/integrations/samsara/simulate` — mock geofence exit → cierra wait + `activity_log`.
  - `POST /api/integrations/samsara/webhook` — placeholder (503 hasta `SAMSARA_ENABLED=true`).
  - `GET …/webhook` — estado integración (`pendingSamsaraApi: true`).
  - Tests `samsara-geofence.test.ts`.
- **WT.23** en `PP2_TAREAS_DEV.md`: stub ✅ · **pendiente integrar API Samsara real** (prod backport + credenciales).
- **Móvil:** sin cambios de código (auto-stop es server-side).

**DB SUPABASE NO REQUIERE CAMBIOS**

**Cómo probar**

1. Deploy TMS dev + opcional `SAMSARA_MOCK_ALLOW_SIMULATE=true`.
2. Móvil → **Start wait time** en carga abierta.
3. TMS staff → `POST …/api/integrations/samsara/simulate` con `loadId` → wait cerrado.
4. Ver panel TMS + `activity_log` `delivery_wait_geofence_auto_stop`.
5. TMS: `npm test -- lib/integrations/samsara/__tests__/samsara-geofence.test.ts`

---

## 22 de junio de 2026

### Tarea 1 — Supabase GPS en vivo aplicado + revisión 8.4 / 8.5 / 8.6 (~45 min)

**Qué se hizo**

- **Aplicado en Supabase compartido** (prod TMS + móvil), en orden:
  1. `supabase/sql-editor/20260605120000_pp2_driver_live_location_loads.sql` — **8.4 + 8.5**
  2. `supabase/sql-editor/VERIFY_pp2_driver_live_location.sql` — verificación
  3. `supabase/sql-editor/enable_realtime_driver_tracking.sql` — **8.6**
- **Revisión de buenas prácticas:** script aditivo (`IF NOT EXISTS`), política RLS nueva sin DROP Staff, trigger `SECURITY DEFINER` + `search_path`, índice parcial en `last_seen_at`, copia idéntica en `supabase/migrations/`.
- **Corrección preventiva:** trigger `pp2_enforce_driver_location_update` excluye también `updated_at` (evita bloqueo si la BD auto-actualiza timestamp en UPDATE). Patch opcional: `fix_pp2_driver_location_trigger_updated_at.sql`.
- **8.4, 8.5, 8.6** marcadas ✅ en `PP2_TAREAS_DEV.md`; actualizados `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`, `docs/TMS_DEV_REPOSITORY.md`, `docs/ROLLBACK_PP2.md`.

**Funcionalidad disponible**

- Esquema listo para GPS fase 0; columnas `current_*` en `NULL` hasta **8.7–8.8** (móvil). TMS prod **sin cambio visible** (mapa live = **8.12**).

**Impacto prod**

- Aditivo: no rompe TMS ni app actual. Status del conductor sigue vía API TMS (no UPDATE directo a `loads` salvo GPS futuro).

**Cómo probar**

1. SQL Editor → `VERIFY_pp2_driver_live_location.sql`: 4 columnas nullable, política `Drivers update live location on assigned loads`, trigger guard, `loads` en Realtime.
2. Opcional: re-ejecutar `fix_pp2_driver_location_trigger_updated_at.sql` si el trigger se aplicó antes del parche `updated_at`.
3. Smoke TMS: login dispatcher → **My Loads** / detalle carga → comportamiento igual que antes.
4. `npm test -- --testPathPattern="release-handoff-docs"`.
5. `npm run check:daily-reports`.

**Siguiente tarea de código:** **8.8** — `useDriverLocationTracking` (móvil).

---

### Tarea 2 — Política GPS en vivo móvil (8.7) (~45 min)

**Qué se hizo**

- Nuevo **`lib/location/tracking-policy.ts`**: intervalo 30–60 s (default 45 s), estados viaje activo (`Dispatched` + `DRIVER_FIELD_STATUSES`; excluye `Assigned` / `Completed` / `Cancelled`), umbral **25 m** para omitir pings redundantes, heartbeat a 60 s, payload `buildLiveTrackingLoadUpdate` → columnas Supabase `loads.current_*`.
- Superficies TMS documentadas: `load_detail` + `dispatcher_board` (implementación **8.12–8.13**).
- Export en `lib/location/index.ts`; constante `LOAD_LIVE_LOCATION_COLUMNS` en `lib/supabase/schema/driver-loads.ts`.
- Tests **`lib/location/__tests__/tracking-policy.test.ts`**; **8.7** ✅ en `PP2_TAREAS_DEV.md`.

**Funcionalidad disponible**

- Sin cambio visible en UI aún; reglas listas para el hook **8.8** y banner **8.9**.

**DB SUPABASE NO REQUIERE CAMBIOS** — usa columnas de **8.4–8.6** ya aplicadas.

**Cómo probar**

1. `npm test -- --testPathPattern="tracking-policy"`.
2. `npm run lint`.
3. Revisar `LIVE_TRACKING_ACTIVE_STATUSES` incluye **In Transit** / **Arrived At Delivery** y excluye **Assigned**.

**Siguiente:** **8.8** — `useDriverLocationTracking`.

---

### Tarea 3 — Hook GPS en vivo + persistencia Supabase (8.8) (~1 h)

**Qué se hizo**

- **`lib/supabase/queries/update-load-live-location.ts`** — `UPDATE` en `loads.current_*` vía RLS conductor (solo columnas GPS).
- **`hooks/useDriverLocationTracking.ts`** — loop cada 45 s en detalle de carga con foco; para en background/offline; reintenta al volver online; usa `tracking-policy` (umbral 25 m, estados activos).
- Integrado en **`app/load/[id].tsx`** (side-effect al abrir detalle).
- Tests: `update-load-live-location.test.ts`, `useDriverLocationTracking.test.ts`.
- **8.8** ✅ en `PP2_TAREAS_DEV.md`.

**Funcionalidad disponible**

- Con carga en viaje activo (**In Transit**, **Arrived At Delivery**, etc.) y permiso GPS, la app envía pings a Supabase mientras el detalle está abierto. Sin banner visible aún (**8.9**). TMS mapa aún sin marcador (**8.12**).

**DB SUPABASE:** usa columnas **8.4–8.6** (ya aplicadas).

**Cómo probar**

1. `npm test -- --testPathPattern="useDriverLocationTracking|update-load-live-location"`.
2. **Mobile:** login → **My Loads** → carga **In Transit** → conceder ubicación → dejar detalle abierto ~1 min → Supabase Table Editor `loads` → `current_latitude` / `last_seen_at` actualizados.
3. Salir de la app (background) → pings se detienen; volver → reanudan.

**Siguiente:** **8.9** — banner “Sharing location with dispatch”.

---

### Tarea 4 — Detention: botones Check In / Check Out explícitos (feedback cliente)

**Qué se hizo**

- Copy alineado a feedback Lucas/Nico (**Q12–15**): botones **`Check In`** (inicia wait + **detention billing**) y **`Check Out`** (fin de servicio en cliente).
- Sección renombrada **Delivery wait & detention**; fase billable **Billable detention**; banner menciona detention.
- **Ubicación:** `DeliveryWaitSection` movida al **footer sticky** sobre **Field actions** (`app/load/[id].tsx`) — flujo: **Arrived At Delivery** → **Check In** → trabajo → **Check Out**.
- Actualizados `docs/WAIT_TIME_OVERAGE_SPEC.md`, tests `DeliveryWaitSection.test.tsx`.

**Funcionalidad disponible**

- En **Arrived At Delivery**, el conductor ve **Check In** naranja arriba de field actions; tras check-in, cronómetro + **Check Out**. Sin auto-start al cambiar status (WT.27).

**Cómo probar**

1. `npm test -- --testPathPattern="DeliveryWaitSection"`.
2. **Mobile:** carga en **Arrived At Delivery** → footer muestra **Check In** → pulsar → timer corre → **Check Out** detiene sin cambiar status.
3. Verificar TMS: POST wait-time solo tras **Check In**; Billing **Detention** al cerrar evento billable (WT.24/25).

---

### Tarea 5 — Banner GPS en vivo (8.9) (~30 min)

**Qué se hizo**

- **`components/loads/LiveLocationTrackingBanner.tsx`** — banner *Sharing location with dispatch* + *Last sent* / offline / permisos; arriba del detalle de carga.
- **`lib/location/format-last-sent-at.ts`** — formato *Just now* / *N min ago*.
- Copy en **`strings.location.liveTracking*`**; hint manual share actualizado (`tmsShareOnlyHint`).
- Cableado con **`useDriverLocationTracking`** en `LoadDetailContent`.
- Tests: `LiveLocationTrackingBanner.test.tsx`, `format-last-sent-at.test.ts`.
- **8.9** ✅ en `PP2_TAREAS_DEV.md`.

**Cómo probar**

1. `npm test -- --testPathPattern="LiveLocationTrackingBanner|format-last-sent"`.
2. **Mobile:** carga **In Transit** → abrir detalle → banner naranja *Sharing location with dispatch* → *Last sent: Just now* tras ~45 s.
3. Denegar GPS → banner *Location needed for dispatch* + **Open Settings**.

**Siguiente:** **8.12** — marcador conductor en mapa TMS.

---

### Tarea 6 — Marcador GPS en mapa TMS (8.12) (~45 min)

**Qué se hizo** (repo TMS dev, no móvil)

- **`lib/live-tracking/driver-location.ts`** — parseo `current_*`, `formatLastSeenAt`, estados activos.
- **`hooks/useLoadLiveLocation.ts`** — suscripción Realtime `loads` UPDATE filtrada por `load_id`.
- **`components/maps/LoadSidebarMap.tsx`** — marcador azul **Driver** + tooltip *Last seen*.
- **`components/dispatcher/LoadDetailPanel.tsx`** — cableado + leyenda bajo el mapa.
- **`types/dispatcher.ts`** — columnas `current_latitude`, `current_longitude`, `last_seen_at`, `location_accuracy_m`.
- Tests: `lib/live-tracking/__tests__/driver-location.test.ts`.
- **8.12** ✅ en `PP2_TAREAS_DEV.md`.

**Cómo probar**

1. TMS dev: `npm test -- lib/live-tracking/__tests__/driver-location.test.ts` + `npm run lint`.
2. **Mobile:** conductor en carga **In Transit** con detalle abierto (pings ~45 s).
3. **TMS:** dispatcher → abrir misma carga → mapa lateral → punto azul **Driver** que se mueve; leyenda *Just now* / *N min ago*.
4. Supabase: verificar `loads.current_latitude` / `last_seen_at` actualizándose.

**Siguiente:** **8.13** — última posición visible en tablero dispatcher.

---

### Tarea 7 — Columna Driver Last Seen + fixes build TMS (8.13) (~30 min)

**Qué se hizo** (repo TMS dev)

- **Fix 8.12:** `LoadSidebarMap` — tipado explícito `dynamic<InnerMapProps>` para `boundsPoints` (evita error TS en deploy).
- **Fix build Netlify:** `parse-geofence-event.ts` — acceso seguro a `geofence.name` / `vehicle.id`.
- **8.13:** columna **Driver Last Seen** en `LoadsTable` + `column-config.ts`; clic abre detalle (mapa live).
- **`getDriverLastSeenLabel`** en `lib/live-tracking/driver-location.ts`.
- **8.13** ✅ en `PP2_TAREAS_DEV.md`.

**Cómo probar**

1. TMS: `npm run build` (debe pasar TypeScript completo).
2. Dispatcher → tabla → columna **Driver Last Seen** en cargas **In Transit** con pings móvil.
3. Clic en *Just now* → panel detalle con mapa y marcador azul.

**Siguiente:** **8.16** — QA marker &lt; 60 s.

---

### Tarea 8 — QA GPS en vivo (8.16) (~30 min)

**Qué se hizo**

- **`docs/QA_DRIVER_LIVE_TRACKING.md`** — checklist E2E: móvil (teléfono) → Supabase → TMS mapa + **Driver Last Seen** en **≤ 60 s**; matriz G1–G9, query SQL, regresión, sign-off.
- **8.16** ✅ en `PP2_TAREAS_DEV.md`.

**Cómo probar**

1. Seguir matriz **G1** en `docs/QA_DRIVER_LIVE_TRACKING.md`.
2. `npm test -- --testPathPattern="tracking-policy|LiveLocationTrackingBanner|driver-location"`.

**Siguiente:** **8.17** — reporte diario cierre fase 0 GPS.

---

## 24 de junio de 2026

### Tarea 1 — e-POD auto-stop wait timer (WT.28) (~45 min)

**Qué se hizo** (TMS dev repo)

- **`lib/wait-time/handle-pod-signed-submitted.ts`** — cierra el `delivery_wait` abierto vía `closeOpenDeliveryWaitEvent`; registra `activity_log` con acción `pod_signed_submitted` (idempotente por evento).
- **Hook en upload:** `process-load-document-upload.ts` invoca el handler cuando el formulario envía `document_type=POD` (incluye móvil si en el futuro envía POD antes de normalizar a `Driver`).
- **API:** `POST /api/dispatcher/loads/[id]/pod-signed` — auth Bearer/cookie; staff o conductor asignado (`resolveWaitTimeAccess`).
- Tests **`lib/wait-time/__tests__/handle-pod-signed-submitted.test.ts`** (5 casos).
- Docs: `docs/WAIT_TIME_OVERAGE_SPEC.md` regla **C** ✅, `docs/QA_WAIT_TIME_OVERAGE.md` fila **7c**, `docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md` § WT.28, **WT.28** ✅ en `PP2_TAREAS_DEV.md`.

**Supabase:** SUPABASE no requiere cambios

**Cómo probar**

1. TMS dev: `npm test -- lib/wait-time/__tests__/handle-pod-signed-submitted.test.ts`.
2. Móvil o TMS → carga con **Check In** activo (timer corriendo).
3. TMS dispatcher → **Documents** → subir archivo con tipo **POD** → verificar `waiting_time_events.end_time` poblado y panel wait detenido.
4. Opcional: `POST …/api/dispatcher/loads/{id}/pod-signed` con Bearer del conductor → `{ "closed": true, "event_id": "…" }`.
5. Supabase → `activity_log` fila `pod_signed_submitted` en el evento de wait cerrado.
6. Regresión: subir foto tipo **Driver** desde móvil **no** debe cerrar el timer (solo POD / API pod-signed).

**Siguiente:** **WT.29** — email aviso 45 min detention.

---

### Tarea 2 — Email cliente 45 min detention (WT.29) (~45 min)

**Qué se hizo** (TMS dev repo)

- **`lib/wait-time/notify-detention-warning-45.ts`** — al ≥ **45 min** de `delivery_wait` abierto, envía plantilla **`detention_warning_45`** a `customers.email` vía Resend (`sendTemplateEmail`).
- **Idempotencia:** `activity_log` en el evento (`detention_warning_45_email_sent` / `_failed` / `_skipped_no_recipient` / `_skipped_inactive_template`).
- **Disparo:** `PATCH`/`POST` `…/api/dispatcher/loads/[id]/wait-time` (sync ~60 s del móvil); duración = `max(duration_minutes, now − start_time)` para eventos abiertos.
- **SQL:** `supabase/sql-editor/seed_detention_warning_45_email_template.sql` — sembrar plantilla en Supabase.
- Tests **`notify-detention-warning-45.test.ts`** (7 casos); **WT.29** ✅ en `PP2_TAREAS_DEV.md`.

**Supabase:** aplicar `seed_detention_warning_45_email_template.sql` en SQL Editor (tabla `email_templates` existente).

**Cómo probar**

1. SQL Editor → ejecutar seed → `SELECT template_key FROM email_templates WHERE template_key = 'detention_warning_45'`.
2. TMS dev desplegado con `RESEND_API_KEY`; carga con `customers.email` poblado.
3. Móvil → **Check In** → esperar o simular ≥ 45 min → PATCH wait-time (automático cada ~60 s).
4. Ver email en bandeja cliente + `activity_log` `detention_warning_45_email_sent`.
5. Segundo PATCH → **no** reenvía (idempotente).
6. `npm test -- lib/wait-time/__tests__/notify-detention-warning-45.test.ts`.

**Siguiente:** **WT.30** — email `detention_started` al cruzar 60 min.

---

## 25 de junio de 2026

### Tarea 1 — Emails detention 60 min + cierre + cron (WT.30–WT.32) (~2 h)

**Qué se hizo** (TMS dev repo)

- **WT.30:** `notify-detention-started.ts` — plantilla **`detention_started`** al cruzar **60 min** gratis; idempotente vía `activity_log`.
- **WT.31:** `notify-detention-completed.ts` — plantilla **`detention_completed`** al cerrar wait (resumen minutos/cargo + texto validez billing); hook en `close-open-delivery-wait.ts` y PATCH wait-time.
- **WT.32:** `process-open-delivery-wait-emails.ts` + **`POST /api/cron/wait-time-detention-emails`** (cada 5 min en `vercel.json`); sync `duration_minutes` desde reloj servidor cuando móvil offline.
- Módulo compartido **`detention-email-shared.ts`** + orquestador **`notify-delivery-wait-customer-emails.ts`**.
- Tests **`detention-emails-wt30-33.test.ts`** (22 tests wait-time total).

**Supabase:** aplicar `supabase/sql-editor/seed_detention_started_completed_email_templates.sql` (tabla `email_templates` existente).

**Cómo probar**

1. SQL Editor → seed WT.30–31 → verificar `detention_started` y `detention_completed`.
2. TMS con `RESEND_API_KEY` + carga con `customers.email`.
3. Check In → simular ≥ 60 min → email **detention_started** + log `detention_started_email_sent`.
4. Check Out → email **detention_completed** + log `detention_completed_email_sent`.
5. Cron: `POST /api/cron/wait-time-detention-emails` con `Authorization: Bearer $CRON_SECRET`.
6. `npm test -- lib/wait-time/__tests__/`

---

### Tarea 2 — Config cliente detention emails (WT.33) (~30 min)

**Qué se hizo**

- Env TMS: `DETENTION_EMAIL_TIMEZONE` (default `America/New_York`), `DETENTION_EMAIL_CC`, `DETENTION_FORGOTTEN_TIMER_MAX_MINUTES` (default 480).
- Alerta timer olvidado: `activity_log` `delivery_wait_forgotten_timer_alert` (una vez por evento).
- **`docs/DETENTION_EMAIL_CLIENT_CONFIG.md`** — destinatarios, timezone, cron, SQL.

**Supabase:** SUPABASE no requiere cambios (solo plantillas SQL de Tarea 1 si aún no aplicadas).

**Cómo probar**

1. Abrir wait > 8 h (o bajar `DETENTION_FORGOTTEN_TIMER_MAX_MINUTES` en dev) → ver alerta en `activity_log`.
2. Opcional: `DETENTION_EMAIL_CC=dispatch@example.com` → CC en emails Resend.

---

### Tarea 3 — Cierre documentación bloque wait time (WT.35) (~20 min)

**Qué se hizo**

- **WT.30–35** ✅ en `PP2_TAREAS_DEV.md`.
- `docs/WAIT_TIME_OVERAGE_SPEC.md`, `docs/QA_WAIT_TIME_OVERAGE.md`, `docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md`, `CHANGELOG.md` actualizados.

**Cómo probar**

1. `npm run check:daily-reports`.
2. Revisar matriz QA filas **7e–7g** en `docs/QA_WAIT_TIME_OVERAGE.md`.

**Siguiente:** **9.5** WT.23 live Samsara · **9.6** cierre GPS · **9.7** handoff.

---

## 26 de junio de 2026

### Tarea 1 — Paridad transiciones In Transit (9.1 · feedback Lucas)

**Qué se implementó**

- Fallback `MOCK_LOAD_TRANSITIONS["In Transit"]` alineado al TMS: **Arrived At Pickup**, **Arrived To Hook Container**, **Arrived At Return Empty** (además de delivery-side existentes).
- Online: sin cambios — `fetchLoadTransitions` → `/api/dispatcher/transitions`.
- Tests ampliados en `driver-actions.test.ts` y paridad `web-driver-panel-parity`.

**Supabase:** SUPABASE no requiere cambios.

**Cómo probar**

1. `npm test -- lib/loads/__tests__/driver-actions.test.ts`
2. App: carga en **In Transit** hacia pickup → **My Loads** → detalle → **Status Action** debe incluir **At pickup** / **Arrived To Hook Container** / **Arrived At Return Empty** según ruta.

---

### Tarea 2 — Picker tipo documento (9.2 · DOC.1)

**Qué se implementó**

- Chips **Driver evidence** / **POD** / **Photo** en `PodUploadSection` (`DRIVER_DOCUMENT_TYPE_OPTIONS`).
- `useLoadDocumentUpload(file, documentType)` — tipos permitidos: `Driver`, `POD`, `Photo` (paridad TMS `normalizeDriverDocumentType`).

**Supabase:** SUPABASE no requiere cambios.

**Cómo probar**

1. `npm test -- components/loads/__tests__/PodUploadSection.test.tsx`
2. Detalle carga → **Driver photo** → elegir **POD** → subir foto → TMS **Documents** muestra tipo acorde.

---

### Tarea 3 — Permisos cámara/galería (9.3 · DOC.2)

**Qué se implementó**

- `pick-load-photo.ts` — resultado estructurado `permission_denied` (sin fallo silencioso).
- `ErrorBanner` con **Open Settings** cuando permiso denegado.

**Supabase:** SUPABASE no requiere cambios.

**Cómo probar**

1. Denegar cámara en Ajustes → **Add driver photo** → **Take photo** → mensaje + botón **Open Settings**.

---

### Tarea 4 — Cola offline status + upload (9.4 · OFF.2)

**Qué se implementó**

- `lib/offline/` — persistencia local (`expo-file-system`), encola **status change** y **document upload**.
- `OfflineQueueProcessor` — flush al reconectar; banner naranja con acciones pendientes.
- `useDriverStatusChange` / `useLoadDocumentUpload` — encolan offline con mensaje de confirmación.

**Supabase:** SUPABASE no requiere cambios.

**Cómo probar**

1. `npm test -- lib/offline/__tests__/offline-queue.test.ts`
2. Modo avión → cambiar status o confirmar upload → banner “waiting to sync” → desactivar avión → acción se sincroniza.

**Siguiente:** **9.5** WT.23 · **9.6** · **9.7**.

---

## 27 de junio de 2026

### Tarea 1 — Samsara geofence live-ready (9.5 · WT.23)

**Qué se implementó** (TMS dev repo)

- Parse **GeofenceExit** Samsara v2 + campos mock legacy.
- `resolve-geofence-load.ts` — `loadId` explícito, `externalIds.loadId`, o vehículo (placa/VIN) → conductor → `delivery_wait` abierto.
- Modos integración: `mock_stub` / `webhook_only` / `live`; ping REST `GET …/webhook?ping=1`.
- Handler actualizado — `activity_log` con `integration: live` cuando aplica.

**Supabase:** SUPABASE no requiere cambios.

**Cómo probar**

1. TMS: `npm test -- lib/integrations/samsara/__tests__/samsara-geofence.test.ts`
2. Netlify: `SAMSARA_ENABLED=true` + token → `GET …/webhook?ping=1` → `mode: live`
3. Mock: mobile Check In → `POST …/simulate` con `loadId` → wait cerrado
4. Live: registrar webhook Samsara → GeofenceExit → ver `docs/QA_SAMSARA_GEOFENCE_MOCK.md` §B

---

### Tarea 2 — Sign-off GPS fase 0 (9.6 · 8.17)

**Qué se implementó**

- `docs/GPS_LIVE_TRACKING_SIGNOFF_8_17.md` — tabla sign-off Dev/QA, criterio G1 ≤ 60 s, ítems diferidos 8.10–8.15.
- Enlace desde `docs/QA_DRIVER_LIVE_TRACKING.md`.

**Supabase:** sin cambios nuevos (migraciones 8.x ya documentadas).

**Cómo probar**

1. `npm test -- --testPathPattern="tracking-policy|driver-location|useDriverLocationTracking"`
2. Manual G1 en `docs/QA_DRIVER_LIVE_TRACKING.md` → completar tabla en sign-off doc.

---

### Tarea 3 — Handoff cliente (9.7 · 7.8)

**Qué se implementó**

- `docs/CLIENT_HANDOFF_9_7.md` — builds EAS, env mobile/TMS, SQL Supabase, QA, checklist reunión.
- `HANDOFF_DEV.md` actualizado (rutas, capacidades 9.1–9.7).
- Tests `release-handoff-docs.test.ts` ampliados; README enlace handoff cliente.

**Cómo probar**

1. `npm test -- lib/qa/__tests__/release-handoff-docs.test.ts`
2. `npm run ci`
3. Revisar checklist §9 en `docs/CLIENT_HANDOFF_9_7.md` antes de reunión con cliente.

**Backlog 9.1–9.7:** ✅ cerrado.

---

### Tarea 4 — Fix POD móvil → auto-stop wait timer (WT.28)

**Qué se implementó**

- `lib/loads/upload-driver-load-document.ts` — uploads **POD** siempre vía TMS (`POST /api/mobile/loads/{id}/documents`); **Driver** / **Photo** siguen Supabase + fallback TMS.
- `app/load/[id].tsx` — tras upload POD, `waitTimer.refresh()` para reflejar **Stopped** en UI.
- TMS dev: mobile BFF pasa `requestedDocumentType` a `processLoadDocumentUpload` (WT.28 no corría antes).

**Supabase:** SUPABASE no requiere cambios.

**Cómo probar**

1. `npm test -- lib/loads/__tests__/upload-driver-load-document.test.ts`
2. App: **Check In** (wait abierto) → **Add driver photo** → chip **POD** → subir → timer **Stopped**; TMS wait panel cerrado; `activity_log` `pod_signed_submitted`.
3. Regresión: upload tipo **Driver** **no** cierra el timer.
4. Desplegar TMS con fix en `app/api/mobile/loads/[id]/documents/route.ts`.

---

_Al cerrar cada día, añadir sección `## [fecha]` **en orden cronológico** (debajo de la última fecha del archivo) con **Tarea 1, Tarea 2, Tarea 3…** de arriba abajo. Nunca Tarea 8 antes de Tarea 7. Ejecutar `npm run check:daily-reports` antes de commit._
