# Reportes diarios — PP2 móvil

**Versión en inglés:** [`DAILY_REPORTS.md`](DAILY_REPORTS.md) (mismo contenido).

Registro de avances **relevantes para el producto**: nuevas funcionalidades, integraciones (login, Supabase, API TMS), pruebas automatizadas, agentes de IA, builds instalables, etc.

**No documentar aquí:** renombres, ajustes de documentación sin código, refactors cosméticos.

**No mencionar `PROYECTO_MUESTRA/`** en este archivo (ni rutas bajo esa carpeta). Referir el TMS web como **«TMS»**, **«API TMS»** o rutas HTTP (`/api/dispatcher/…`); detalle técnico en `docs/` (`MOBILE_API.md`, parches `TMS_PATCH_*.md`).

**Formato:** una fecha por día; bajo ella **Tarea 1**, **Tarea 2**, **Tarea 3**, … en **orden numérico ascendente estricto** (1 antes que 2, 2 antes que 3; **nunca** insertar Tarea 7 antes de Tarea 4). La nueva entrada del día es siempre la **siguiente** número libre e va **después** de la última tarea ya numerada, no al final del archivo si eso rompe el orden dentro de la fecha.

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

| Tabla | Uso en vivo |
|-------|-------------|
| **`load_documents`** | Foto del conductor → fila naranja en TMS **Documents** sin recargar; borrado del dispatcher → desaparece en la app móvil al instante. |
| **`loads`** | Cambios de estado/asignación en TMS o móvil se reflejan en listados y detalle sin pull-to-refresh manual. |

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

_Al cerrar cada día, añadir sección `## [fecha]` con **Tarea 1, Tarea 2, Tarea 3…** de arriba abajo (ej. dev 4.6 → Tarea 7, dev 4.7 → Tarea 8). Nunca Tarea 8 antes de Tarea 7._
