# Reportes diarios — PP2 móvil

**Versión en inglés:** [`DAILY_REPORTS.md`](DAILY_REPORTS.md) (mismo contenido).

Registro de avances **relevantes para el producto**: nuevas funcionalidades, integraciones (login, Supabase, API TMS), pruebas automatizadas, agentes de IA, builds instalables, etc.

**No documentar aquí:** renombres, ajustes de documentación sin código, refactors cosméticos.

**Formato:** una fecha por día; bajo ella **Tarea 1**, **Tarea 2**, … en **orden numérico ascendente** (sin repetir la fecha).

---

## Directiva de documentación (obligatoria)

**Para agentes de IA y desarrolladores:** cada cambio **funcional** en la app debe registrarse **el mismo día** en este archivo:

1. Usar la sección `## [fecha actual]` (crearla si no existe).
2. Añadir o actualizar la **Tarea N** que corresponda al ítem de `PP2_TAREAS_DEV.md` (p. ej. 1.4 → Tarea de ese día sobre login).
3. Incluir: **qué se implementó**, **funcionalidad disponible**, y enlaces a archivos clave si ayuda.
4. Añadir **Cómo probar** (obligatorio): pasos breves para validar lo nuevo en la app o en tests; lenguaje claro, sin párrafos largos.
5. No duplicar la fecha en cada párrafo; numerar tareas dentro del día en orden ascendente (1, 2, 3, …).

Si un día abarca varias tareas dev, usar **Tarea 7**, **Tarea 8**, etc. en orden cronológico.

### Plantilla «Cómo probar»

Usar viñetas cortas. Ejemplos:

- **Solo tests:** `npm test` (o `npm run ci`) — debe pasar en verde.
- **Pantalla:** login → ruta → acción esperada (1–3 pasos).
- **Si no hay UI nueva:** indicar qué comando o archivo verificar.

No repetir la guía completa de QA; solo lo necesario para repetir la prueba ese día.

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

- Revisión **solo lectura** en `PROYECTO_MUESTRA/`: `DriverActionPanel.tsx`, `PATCH …/status/route.ts`, `…/documents/route.ts`.
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

*Al cerrar cada día, añadir sección `## [fecha]` con tareas numeradas en orden ascendente.*
