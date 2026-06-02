# PP2 (móvil) — Tareas para el desarrollador

**Formato (desde el cierre · mayo–jun 2026):** las **Semanas 1–4** conservan el histórico completado. Del **26 may al 9 jun 2026** quedan **3 semanas de cierre** (**Semana 5 → 7**); el número de tareas por semana es **flexible** (ya no aplica la regla de exactamente 8). **Semana 7** cierra el **8 jun**; el **9 jun 2026** es deadline / buffer.

**Premisa:** mismo **Supabase** y **TMS en producción** (Netlify) que el web; los cambios en TMS se reflejan de inmediato en la app móvil vía `EXPO_PUBLIC_TMS_API_URL`. Sin backend propio salvo BFF en Next.js si hiciera falta.

**Plan de ejecución:** `PP2_ROADMAP_ENTREGA_JUN9.md` · Resumen cliente: `PROXIMOS_PASOS.md`.

---

## Semana 1 — Repositorio, Supabase y seguridad

| #   | Tarea                                                                                                                                                                                                                                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1 | Clonar/abrir el repo móvil entregado por el cliente; auditar dependencias (`package.json`), TypeScript estricto, estructura `app/` (Expo Router).                                                                                                                                                                                                                          |
| 1.2 | Conectar `@supabase/supabase-js` con `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`; probar `getSession` / listener de auth en dispositivo.                                                                                                                                                                                                                  |
| 1.3 | Revisar **RLS** y roles para el rol “driver” (o equivalente) contra tablas que consumirá la app: leer `docs/RLS_SECURITY_REVIEW_T22.md` y contrastar con migraciones en `supabase/migrations/`; listar gaps en notas.                                                                                                                                                      |
| 1.4 | Implementar flujo de **login** real (email/magic link u OAuth según el TMS); deep linking `auth` para Expo ([scheme en `app.json`](https://docs.expo.dev/guides/authentication/#supabase)).                                                                                                                                                                                |
| 1.5 | **Auditoría TMS ↔ móvil (solo lectura y documento):** revisar `components/dispatcher/DriverActionPanel.tsx`, `app/api/dispatcher/loads/[id]/status/route.ts` y `documents/route.ts` (POST hoy solo `admin`/`dispatcher`). Volcar hallazgos en `docs/MOBILE_API.md`.                                                                                                        |
| 1.6 | ✅ **Completada (18 may 2026).** Sustituir mocks en **una pantalla piloto** por la **primera query real** a Supabase (perfil del usuario o listado mínimo de cargas del conductor). Entregado: `useProfile` + `fetchUserProfile` (Account), `useAssignedLoadsQuery` + `fetchLoadsForDriver` (Loads), sin mocks en flujo principal; datos de prueba `driver_test@test.com`. |
| 1.7 | ✅ **Completada (19 may 2026).** Capa `lib/supabase/` (`client`, `queries`, `hooks`, `index`), `useAuth` + `useProfile` alineados al TMS (`useUserRole`), guard anon vs service_role, `docs/SUPABASE_LAYER.md`. Sin lógica sensible en cliente.                                                                                                                            |
| 1.8 | ✅ **Completada (19 may 2026).** CI: `.github/workflows/ci.yml` (`lint` + `check:secrets` + tests); `docs/SECRETS_AND_BFF.md` (matriz secretos + BFF); `docs/GitHub_Setup_Guide.md`; `npm run check:secrets`.                                                                                                                                                              |

---

## Semana 2 — Dominio “cargas” y navegación estable

| #   | Tarea                                                                                                                                                                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2.1 | ✅ **Completada (19 may 2026).** Mapeo en `docs/LOADS_DATA_MAP.md` + `lib/supabase/schema/driver-loads.ts` (`loads`, `drivers`, embeds `containers`/`customers`, RLS `driver_id = auth.uid()`).                                         |
| 2.2 | ✅ **Completada (19 may 2026).** Listado paginado (`LOAD_LIST_PAGE_SIZE=20`, `fetchDriverLoadsPage`, infinite scroll), loading/refresh/loadingMore, error + retry, tests `map-load-row`.                                                |
| 2.3 | ✅ **Completada (19 may 2026).** Detalle Supabase (`LOAD_DETAIL_SELECT`, `fetchLoadDetailForDriver`, `useLoadDetailQuery`), UI maestros/holds/timeline, `docs/DISPATCHER_API_ROUTES.md`; acciones Driver siguen locales hasta semana 3. |
| 2.4 | ✅ **Completada (19 may 2026).** TanStack Query (`QueryProvider`, `queryKeys`, `useInfiniteQuery` listado, `useQuery` detalle), pull-to-refresh list + detail, invalidación cruzada list/detail/sign-out; `docs/QUERY_CACHE.md`.        |
| 2.5 | ✅ **Completada (19 may 2026).** Refactor UI: `LoadDetailContent`, `LoadDetailRow`, `ScreenState`, `resolveRouteParam`, `driver-query-gate`; tokens en `PP2Theme` (sin hex sueltos en UI); hooks sin duplicación.                       |
| 2.6 | ✅ **Completada (19 may 2026).** Tests unitarios ampliados: `format`, `active-holds`, `load-detail-helpers`, `map-load-row` + fixtures; directiva **Cómo probar** en `REPORTES_DIARIOS.md`.                                             |
| 2.7 | ✅ **Completada (19 may 2026).** Tests de hooks `useAssignedLoadsQuery` y `useLoadDetailQuery` con mocks de queries + `QueryClient`/`LoadsProvider`; utilidades en `hooks/testing/hooks-test-utils.tsx`.                                |
| 2.8 | ✅ **Completada (19 may 2026).** `docs/MOBILE_API.md` §4: matriz Supabase (reads implementados) vs TMS `app/api/` (status, messages, documents); diagrama, rutas de código y env `EXPO_PUBLIC_TMS_API_URL`.                             |

---

## Semana 3 — Acciones de conductor y validación servidor

| #   | Tarea                                                                                                                                                                                                                                                          |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 | ✅ **Completada.** `lib/tms/` (`patchLoadStatus`, errores `ACTIVE_HOLDS`/403/400), JWT Supabase, optimistic UI + rollback, invalidación React Query; `EXPO_PUBLIC_TMS_API_URL`.                                                                                |
| 3.2 | ✅ **Completada.** Solo transiciones `DRIVER_FIELD_STATUSES` en `DriverActionBar` (`filterDriverFieldActions`; sin `Completed`/`Cancelled` ni despacho).                                                                                                       |
| 3.3 | ✅ **Completada.** Guard cliente `assertDriverFieldStatusTarget` + `patchLoadStatus`; Realtime `loads` → invalidación React Query (`useDriverLoadsRealtime`); patch TMS documentado en `docs/TMS_PATCH_3_3_DRIVER_STATUS.md`; SQL `enable_realtime_loads.sql`. |
| 3.4 | ✅ **Completada.** `lib/errors/` (`mapSupabaseError`, `mapStatusChangeError`, `ErrorBanner` con título/detalles); hooks + `DriverActionBar` para 403 y `ACTIVE_HOLDS`.                                                                                         |
| 3.5 | ✅ **Completada.** `canOptimisticallyUpdateLoadStatus` + `runDriverStatusChange` (optimistic/rollback); `driverStatusTelemetry` + `safeLog.event`; hook `useDriverStatusChange`; `docs/MOBILE_TELEMETRY.md`.                                                   |
| 3.6 | ✅ **Completada.** `lib/tms/status-patch-request.ts` (path/headers/body puros) + tests `status-patch-request`, `patch-load-status`, `driver-status-action`.                                                                                                                                                             |
| 3.7 | ✅ **Completada.** `docs/QA_DRIVER_ACTIONS_3_7.md` + tests paridad `web-driver-panel-parity`; a11y (48dp, `accent`, labels); `DriverActionBar` / drawer / `Button`.                                                                                                    |
| 3.8 | ✅ **Completada.** `HANDOFF_DEV.md` actualizado: delta maquetado vs semanas 1–3, rutas, env, acciones TMS, límites y checklist.                                                                                                                                                                         |

---

## Semana 4 — Documentos / fotos y límites

| #   | Tarea                                                                                                                                                                                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 4.1 | ✅ **Completada (22 may 2026).** Opción **(A):** parche TMS `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md` (POST asignado + tipos `POD`/`Photo` para driver); capa móvil `lib/tms/upload-load-document.ts`, límites 50 MB/255, tests. **TMS en producción** — cambios en el repo TMS se reflejan en móvil al desplegar. |
| 4.2 | ✅ **Completada (22 may 2026, reorientada).** **Ver** documentos de la carga subidos en TMS: `fetchLoadDocumentsForDriver` (Supabase RLS), `useLoadDocumentsQuery`, `LoadDocumentsSection` (lista + **View** con `Linking`); Realtime `load_documents` + `enable_realtime_load_documents.sql`; pull-to-refresh. Subida conductor → **Semana 6**. |
| 4.3 | ↪ **Movida a Semana 6 (6.3).** Validación MIME/tamaño en UI + QA E2E de subida (lógica base ya en `document-upload-limits.ts`, `allowed-image-mime.ts`). |
| 4.4 | ✅ **Completada (25 may 2026).** Asociación `load_id` / `load_documents`: `lib/loads/document-load-association.ts` (filtro post-query, prefijo `storage_path`, validación respuesta TMS); `fetchLoadDocumentsForDriver`, `uploadLoadDocument`, `normalizeLoadIdParam` en `/load/[id]` y `useLoadDocumentsQuery`; tests `document-load-association`, `fetch-load-documents`, `upload-load-document`. |
| 4.5 | ✅ **Completada (25 may 2026).** Offline v1: NetInfo, banner, assert online, sin cola. **Reconexión:** `ProfileProvider`, `QueryNetworkRecovery`, `onlineManager` + `refetchOnReconnect`, perfil conservado en fallo de red, cancelación de queries offline. `docs/OFFLINE_V1.md`. **Regresión adicional** → **Semana 5 (5.5)**. |
| 4.6 | ✅ **Completada (25 may 2026).** Tests FormData/metadatos: `lib/tms/testing/form-data-test-utils.ts` (captura `append`), ampliación `document-upload-request.test.ts`, `upload-load-document.test.ts` (multipart en fetch), `resolve-upload-file-size.test.ts` (mock `expo-file-system`), `map-picker-asset.test.ts` (nombre generado). |
| 4.7 | ✅ **Completada (25 may 2026).** Checklist QA manual `docs/QA_DRIVER_DOCUMENTS_4_7.md` (TMS→móvil Realtime/pull, View/enlaces, offline). **Ejecución en producción** → **Semana 5 (5.6)**; §D subida → **Semana 6 (6.4)**. |
| 4.8 | ↪ **Movida a Semana 6 (6.1).** Alcance negocio: evidencia **Driver photo (optional)** — POD (entrega, sello), Photo (percances, retrasos, docs extraordinarios); visible en pestaña Documents del TMS. |

---

## Semana 5 — GPS, desconexión y estabilidad *(semana 1 del cierre · esta semana)*

**Ventana:** ~26 may – 30 may 2026 · **Enfoque:** ubicación en campo + cerrar problemas de red/reconexión + QA lectura documentos en TMS live.

| #   | Tarea |
| --- | ----- |
| 5.1 | ✅ **Completada (26 may 2026).** Decisión GPS v1: **solo primer plano** (`whenInUse`); sin background. `docs/GPS_V1_DECISION.md`, `lib/location/gps-v1-policy.ts`, `strings.location` (disclaimer + permisos), `app.json` plugin `expo-location` (background deshabilitado). Revisión rutas: `load/[id]` usa `normalizeLoadIdParam`; título stack desde `strings`. |
| **5.2** | ✅ **Completada (26 may 2026).** `expo-location` en detalle de carga: `LoadLocationSection`, `useLoadLocationShare`, `getForegroundPosition` (solo primer plano), `Share` con coordenadas + referencia de carga, **Open in Maps**, disclaimer; tests `format-coordinates`, `get-foreground-position`, `map-location-error`. |
| **5.3** | ✅ **Completada (26 may 2026).** Auditoría TMS: **no** existe `POST /tracking/loads/…/locations` ni tabla GPS por carga. v1 = **share_only** (`lib/location/tms-location-integration.ts`, `docs/GPS_TMS_INTEGRATION_5_3.md`). Stub `postDriverLocationToTms` para cuando exista ruta TMS; hint UI `tmsShareOnlyHint`. Sin migraciones inventadas. |
| **5.4** | ✅ **Completada (28 may 2026).** `docs/QA_DRIVER_LOCATION_5_4.md` (matriz dispositivo: permiso, Settings, background, batería). Helpers `lib/location/geo.ts`, `maps-url.ts`, `location-permission.ts`; validación coords en `getForegroundPosition`; `useLoadLocationShare` sincroniza permiso al volver (focus + `AppState`); tests `geo`, `maps-url`, `location-permission`, ampliación `get-foreground-position`. |
| **5.5** | ✅ **Completada (28 may 2026).** Hardening post-4.5: refetch perfil **silencioso** (`profile-gate-loading`, `applyProfileFetchResult` sin error en red); `QueryNetworkRecovery` debounced + reset offline; `isQueryCancellation`; `usePullToRefresh` watchdog 45s; orden providers `Network` → `Profile` → `Query`. GPS L5/L6: sync servicios GPS al volver de Ajustes, **Open Settings** si GPS apagado, hint `lowPowerHint` (`expo-battery`). `docs/QA_NETWORK_RECONNECT_5_5.md`. |
| **5.6** | ✅ **Completada (28 may 2026).** Runbook producción `docs/QA_PRODUCTION_SIGNOFF_5_6.md` (§A–C documentos + §E asociación + §F acciones 3.7); `npm run qa:5.6` preflight; test rutas `lib/qa/__tests__/load-detail-routes.test.ts`. Acciones 1–2 en producción **bloqueadas** sin parche Bearer TMS (documentado). Sign-off manual QA/PM pendiente filas A–C. |
| **5.7** | ✅ **Completada (28 may 2026).** `npm run smoke:5.7` (CI completo); `docs/QA_SMOKE_E2E_5_7.md` (smoke S1–S10); `docs/DRIVER_TMS_CAPABILITIES_5_7.md` (auditoría TMS vs móvil + backlog P0–v1.1). Rate-limit refetch: `foreground-refetch-throttle` (30s loads / 15s docs focus); tests `app-routes-smoke`, `foreground-refetch-throttle`. |

---

## Semana 6 — Evidencia del conductor / subida de archivos *(semana 2 del cierre)*

**Ventana:** ~2 jun – 6 jun 2026 · **Enfoque:** todo lo de **Driver photo (optional)**, subida POD/Photo y validación. TMS ya desplegado — QA E2E contra producción.

| #   | Tarea |
| --- | ----- |
| 6.1 | **Alcance 4.8:** confirmar con cliente casos POD (entrega, sello) y Photo (percances, ponchadura, retrasos, docs extraordinarios); misma pestaña **Documents** del TMS. |
| 6.2 | ✅ **Completada (1 jun 2026).** Subida **Add driver photo** (`PodUploadSection`, tipo **`Driver`**); TMS Bearer/middleware + `access_token`; Documents fila naranja; Realtime `load_documents`. |
| 6.3 | **4.3 — Validación cliente:** MIME y tamaño máximo (50 MB) antes de POST; mensajes claros; offline bloquea subida. |
| 6.4 | **QA E2E subida:** `docs/QA_DRIVER_DOCUMENTS_4_7.md` §D — móvil → TMS + Realtime inverso; cancel/discard; dispatch ve el archivo. |
| 6.5 | Textos `strings` (entrega, sello, percances, retraso); quitar copy “TMS patch pending” del placeholder. |
| 6.6 | *(Opcional si hay tiempo)* compresión/redimensionado ligero antes de subir (memoria / ancho de banda). |

---

## Semana 7 — Release, QA final y handoff *(semana 3 del cierre · hasta 8 jun)*

**Ventana:** ~7 – **8 jun 2026** · **Deadline app:** **9 jun 2026** (buffer / build production / sign-off).

| #   | Tarea |
| --- | ----- |
| 7.1 | Sesión QA formal: checklist firmado; cerrar **P0** y **P1** de semanas 5–6. |
| 7.2 | **EAS Build** Android (`preview` / `production`); notas de versión. Ver `docs/MOBILE_BUILDS.md`, `eas.json`. |
| 7.3 | **semver**, **changelog**, **README** (instalación, env, reporte de bugs). |
| 7.4 | Plan **rollback** + migraciones Supabase tocadas por PP2. |
| 7.5 | Entrega **credenciales EAS** / keystores al cliente (custodia clara). |
| 7.6 | Documento corto de **soporte** (RLS, Storage, escalado). |
| 7.7 | **Backlog v1.1:** push, mensajes, wait time, geofencing, E2E automatizado; **rastreo en vivo** → **Semana 8** (8.0–8.16). |
| 7.8 | **Handoff** al cliente: APK/build, env, este archivo actualizado (✅ / ⏳). **9 jun:** margen imprevistos. |

---

## Semana 8 — Rastreo en vivo conductor / carga (TMS + móvil) *(post–9 jun / v1.1)*

**Ventana:** tras cierre **9 jun 2026** · **Enfoque:** ubicación periódica en Supabase + mapa TMS en tiempo real (sin API de rastreo de terceros). Mismo proyecto Supabase que PP2 y Netlify.

**Contexto v1 ya entregado:** Semana 5 = GPS **solo primer plano** y **Share location** manual (`docs/GPS_V1_DECISION.md`, `docs/GPS_TMS_INTEGRATION_5_3.md` — sin persistencia ni mapa en vivo). Esta semana **sustituye/complementa** ese alcance cuando el cliente confirme reglas de negocio.

### Pregunta bloqueante al cliente (incluir en kickoff de 8.1)

> **¿Necesitan ubicación en tiempo real únicamente durante un viaje/carga activa, o desean rastrear a los conductores durante toda su jornada laboral (incluso con la app en segundo plano o cerrada)?**

| Respuesta cliente | Impacto técnico | Impacto producto |
| --- | --- | --- |
| **Solo durante viaje/carga activa** | `expo-location` en **primer plano** (o foreground service mínimo mientras la app está abierta en detalle/viaje); intervalos 15–30 s; sin background iOS/Android agresivo. | Solución **simple y barata**; alineada al TMS típico (tracking ligado a `loads` en curso). |
| **Toda la jornada / app cerrada** | **Background location** (permisos `always`, tareas en segundo plano, políticas Play/App Store, más QA batería). | Más desarrollo, más consumo batería, más filas o más frecuencia de `UPDATE`; requiere copy legal y política de privacidad explícita. |

**Recomendación PP2 (pendiente confirmación):** rastrear **solo cuando el load asignado al conductor está en estados “en curso”** (p. ej. *In Transit*, *At Pickup*, *At Delivery* — lista exacta en 8.2). Fuera de ese estado: **no enviar** o enviar cada 1–5 min solo si el cliente exige jornada completa.

### Análisis — mejor opción para mapa TMS (sin contratar API externa)

Flujo acordado con el ecosistema actual (móvil → Supabase → TMS Next.js con Realtime):

| Paso | Qué | Notas |
| --- | --- | --- |
| 1 | App obtiene `{ latitude, longitude }` | **Expo Location** (ya en proyecto) o `react-native-geolocation-service` si se sale de Expo managed. |
| 2 | Persistir en Supabase | Ver tabla siguiente — **no** hace falta Mapbox/Google Routes solo para **mostrar punto en mapa** (Leaflet/OSM en TMS si ya hay mapa). |
| 3 | TMS escucha Realtime | `postgres_changes` sobre la tabla elegida → refrescar marcador sin F5 (mismo patrón que `useRealtimeRefresh` + `loads` / `load_documents`). |
| 4 | Producción — ubicación **actual** vs historial | Ver comparativa abajo. |

**Comparativa de modelo de datos (elegir en 8.2, documentar en `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`):**

| Modelo | Esquema | Pros | Contras | Cuándo elegir |
| --- | --- | --- | --- | --- |
| **A — Solo historial** | `driver_locations` (INSERT cada tick: `driver_id`, `load_id?`, `lat`, `lng`, `created_at`) | Auditoría completa; mapa TMS puede animar ruta | Miles de filas/día; coste storage; mapa debe leer “último punto” con query | Cliente pide **historial de ruta** obligatorio |
| **B — Solo ubicación actual** | Columnas en `drivers` o en `loads`: `current_latitude`, `current_longitude`, `last_seen_at` + `UPDATE` por tick | Pocas filas; mapa TMS trivial (una marca por conductor/carga) | Sin trazado histórico salvo ampliar después | **Recomendado para v1.1** si el mapa solo debe ver “dónde está ahora” |
| **C — Híbrido (recomendado PP2)** | **`loads` o `drivers`:** `current_*` + `last_seen_at` (UPDATE); **`driver_location_history`:** INSERT cada N minutos o cada X metros | Mapa en vivo barato + historial para disputas/QA sin INSERT cada 30 s | Dos escrituras; definir retención (p. ej. 30 días) en 8.3 | Balance **producción** entre mapa live y auditoría |

**Decisión de enlace conductor ↔ carga:**

| Opción | Descripción |
| --- | --- |
| **Por carga** | `load_id` en cada punto (o columnas `current_*` en `loads`) — el dispatcher ve el camión **de esa carga** en el detalle/mapa del load. |
| **Por conductor** | `driver_id` en `drivers.current_*` — mapa “flota” de conductores activos; el panel dispatcher filtra por asignación. |

**TMS Realtime (paso 3):** suscribir canal a la tabla que cambie en cada tick (`UPDATE` en `loads`/`drivers` dispara evento; `INSERT` en historial si se usa A o C). Añadir tabla a publicación **`supabase_realtime`** (mismo procedimiento que `enable_realtime_pp2_driver_sync.sql`). RLS: conductor solo escribe su `driver_id` / loads asignados; dispatch lee según rol staff.

**Batería y frecuencia (definir con cliente en 8.1 / 8.5):**

| Regla | Valor propuesto (ajustable) | Motivo |
| --- | --- | --- |
| Intervalo con **viaje activo** | 15–30 s | Balance frescura mapa / batería |
| Intervalo **inactivo** (si aplica jornada) | 1–5 min | Menos ticks cuando no hay carga en curso |
| **Umbral de distancia** | 20–200 m (preguntar al cliente; opción 1 km para máximo ahorro) | No enviar si el GPS no se movió → menos red y batería |
| App cerrada / background | Solo si cliente elige jornada completa | Ver pregunta bloqueante |

### Tareas

| #   | Tarea |
| --- | ----- |
| **8.0** | **Bloqueante negocio:** enviar al cliente la pregunta de **viaje activo vs jornada completa** (tabla arriba); registrar respuesta por escrito en `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md` y en acta de reunión. Sin respuesta → no implementar background ni fijar intervalos finales. |
| **8.1** | **Alcance funcional:** estados de `loads` que cuentan como “viaje activo”; si el mapa vive en **Load detail**, **Dispatcher board** o ambos; si el dispatcher ve **todos** los conductores o solo los de cargas del día. |
| **8.2** | **Arquitectura (documento):** redactar `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md` — modelo **B o C** (tabla comparativa arriba), enlace `driver_id` / `load_id`, diagrama móvil → Supabase → TMS Realtime, y explícitamente **“sin API de rastreo de terceros”**. |
| **8.3** | **Supabase — esquema:** migración SQL Editor (raíz móvil `supabase/sql-editor/`): columnas `current_latitude`, `current_longitude`, `last_seen_at` en `loads` y/o `drivers`, y opcional `driver_location_history`; índices por `load_id`, `driver_id`, `created_at`. |
| **8.4** | **Supabase — RLS:** políticas `authenticated` — conductor `UPDATE`/`INSERT` solo en filas propias (`driver_id = auth.uid()` o loads asignados); staff/dispatcher `SELECT`; sin exponer ubicación de otros conductores al rol driver. |
| **8.5** | **Supabase — Realtime:** script idempotente `enable_realtime_driver_tracking.sql` — añadir tablas acordadas en 8.2 a `supabase_realtime`; verificación `SELECT` en `pg_publication_tables`. |
| **8.6** | **Móvil — política de envío:** módulo `lib/location/tracking-policy.ts` — intervalos, umbral de metros (constante hasta respuesta cliente), estados de carga que habilitan tracking; **no** enviar cada 1 s. |
| **8.7** | **Móvil — captura y envío:** hook `useDriverLocationTracking` (o ampliar `useLoadLocationShare`) — `expo-location`, primer plano obligatorio en v1.1; `UPDATE` Supabase vía cliente anon + RLS; manejo permisos denegados y offline (pausar cola, reintentar al reconectar). |
| **8.8** | **Móvil — UI:** indicador en detalle de carga (“Sharing location with dispatch” / pausado); disclaimer batería y privacidad en `strings`; solo visible cuando tracking activo según 8.1. |
| **8.9** | **Móvil — background (condicional):** **solo si cliente elige jornada completa** — `expo-location` background / task manager, `app.json` permisos `always`, matriz QA Android+iOS (`docs/QA_DRIVER_TRACKING_BACKGROUND.md`). Si solo viaje activo → marcar **N/A**. |
| **8.10** | **TMS — API (opcional):** si se prefiere centralizar validación en Next.js: `POST /api/mobile/drivers/location` o `PATCH /api/dispatcher/loads/[id]/location` con JWT Bearer (mismo patrón que documentos); si RLS directo basta → documentar “Supabase-only” y omitir ruta. |
| **8.11** | **TMS — mapa en vivo:** componente mapa (p. ej. extender `LoadSidebarMap` / vista dispatcher) — suscripción Realtime + `fetch` con `cache: 'no-store'`; marcador conductor/carga; leyenda `last_seen_at`. |
| **8.12** | **TMS — panel dispatcher:** en [dashboard dispatcher](https://tigerhawk.netlify.app/dashboard/dispatcher) — lista o mapa de cargas activas con última posición; click abre detalle de carga. |
| **8.13** | **TMS — historial (si modelo C):** pestaña o modal “Route history” — query `driver_location_history` con límite temporal; no bloquear v1.1 del mapa live. |
| **8.14** | **Retención y costes:** política de borrado/archivo de historial (p. ej. > 30 días); estimación filas/día según intervalo elegido; comunicar al cliente. |
| **8.15** | **QA E2E:** `docs/QA_DRIVER_LIVE_TRACKING.md` — conductor con carga *In Transit* → punto aparece en TMS < 60 s; conductor sin carga activa → no escribe (o intervalo largo); borrado de sesión detiene envío; prueba batería 30 min. |
| **8.16** | **Reportes:** actualizar `REPORTES_DIARIOS.md` / `DAILY_REPORTS.md` el día que se aplique SQL Realtime o se entregue mapa TMS. |

**Dependencias:** 8.0 → 8.1 → 8.2 → (8.3, 8.4, 8.5 en paralelo) → 8.6–8.9 móvil → 8.10–8.13 TMS → 8.15 QA.

**Relación con tareas anteriores:** sustituye el stub `postDriverLocationToTms` (5.3) cuando exista decisión 8.10; amplía GPS v1 (5.1–5.4) sin romper **Share location** manual.

---

## Referencia — tareas pospuestas (v1.1 / post–9 jun)

No forman parte del cierre de 3 semanas. Conservadas como backlog.

| Origen | Tema | Destino |
| --- | --- | --- |
| Ex 6.1–6.4 | Expo Push, Realtime extra | v1.1 (`7.7`) |
| Ex 6.5–6.7 | E2E Maestro/Detox, rate-limit avanzado | v1.1 |
| Ex 7.2–7.4 originales | E2E ampliado, perf FlatList | v1.1 salvo P0 en listas |
| Mensajes / wait time TMS | API existe; móvil placeholder | v1.1 |
| GPS primer plano (share manual) | ✅ Semana 5 | v1 |
| **GPS en vivo + mapa TMS** | **Semana 8** (8.0–8.16) | **v1.1** — tras respuesta cliente 8.0 |
| GPS segundo plano todo el día | Solo si cliente elige jornada completa | 8.9 |

---

## Tarea opcional — ¿TMS o solo Supabase para subida de evidencia del conductor?

**No cuenta como semana 9.** Referencia para el cliente y para un posible **v1.1** si cambia la estrategia de despliegue.

| Opción | Qué implica | Veredicto PP2 |
| --- | --- | --- |
| **(A) Ampliar TMS** `POST /api/dispatcher/loads/[id]/documents` | Cambios en **repo TMS** (permiso conductor asignado, JWT Bearer, mismos límites 50 MB, Storage vía admin + fila `load_documents`). Móvil ya preparado (`lib/tms/upload-load-document.ts`). | **Recomendada para v1** — misma vía que dispatch; `activity_log`, validación y URLs firmadas centralizadas. Parches: `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md`, `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`. |
| **(B) Supabase Storage + RLS INSERT desde móvil** | Políticas en bucket `load-documents` + INSERT en `load_documents` para rol `driver`; subida con `supabase.storage` desde la app (sin pasar por Next.js). | **No recomendada en v1** — duplica reglas del TMS, refresco de URLs, riesgo de desalinear tipos MIME/tamaño y de acercar secretos o atajos con `service_role` en cliente. |
| **(C) Ruta API móvil nueva en TMS** | Duplica `documents/route.ts` (validación, logging, límites). | **Rechazada** — más superficie sin beneficio frente a (A). |

### Opcional — documentar decisión y revisión (post–semana 8)

| # | Tarea |
| --- | --- |
| **OPC.1** | Registrar en handoff que la subida de evidencia usa **TMS POST (A)** en producción; lectura vía Supabase RLS + Realtime. |
| **OPC.2** | Tras cierre **6.4:** evaluar si ruta Supabase directa (B) aporta algo; si no, descartar en v1.1. |
| **OPC.3** | Spike (B) solo post–9 jun si negocio lo pide explícitamente. |

**Resumen:** opción **(A)** en producción; confirmación alcance en **6.1** (ex 4.8).

---

## Matriz paridad conductor — TMS (`PROYECTO_MUESTRA`) ↔ móvil (deadline 9 jun)

Referencia: `DriverActionPanel`, `DocumentsTab`, `PATCH …/status`, `POST …/documents`, `messages`, `wait-time`. Solo capacidades **relevantes para rol `driver`**.

| Capacidad TMS | Móvil | Tarea(s) | v1 (9 jun) |
| --- | --- | --- | --- |
| Login / sesión Supabase | ✅ | 1.x | Sí |
| Lista cargas asignadas (`driver_id`) | ✅ | 2.x | Sí |
| Detalle carga (ruta, holds, timeline, flags, notas) | ✅ | 2.3 | Sí |
| Acciones de campo (`DriverActionPanel` → subset Driver) | ✅ | 3.x | Sí |
| Ver documentos de la carga (dispatch sube BOL, RC, etc.) | ✅ | 4.2, 4.4, 4.7 | Sí — cerrar QA staging |
| **Subir evidencia** POD / Photo (misma tabla `load_documents`) | ⏸ UI deshabilitada; código listo | **6.1–6.4** (ex 4.3, 4.8) | **Sí** — semana 2 del cierre |
| Drawer / navegación mínima conductor | ✅ | 2.5 | Sí — My Loads, Account, Log Out |
| Cuenta / cerrar sesión | ✅ | Account | Sí |
| Offline / reconexión | ✅ base; hardening | 4.5, **5.5** | Sí |
| Mensajes por carga (`load_messages`) | Placeholder | — | **v1.1** (`7.7`) |
| Wait time (`wait-time` API) | No | — | **v1.1** |
| Ubicación GPS (primer plano) | ✅ share en detalle | **5.1–5.3** ✅ | **Sí** — share; persist TMS cuando exista API |
| **Rastreo GPS en vivo (mapa TMS)** | No | **8.0–8.16** | **v1.1** — bloqueado respuesta cliente 8.0 |
| Push / notificaciones | No | — | **v1.1** |
| Subir BOL / Rate Con / tipos staff en Documents | Solo dispatch en TMS | — | **Excluido** — conductor solo `POD`/`Photo` (4.1) |
| Asignar conductor, menú dispatch/A/R/settlements | Solo staff TMS | — | **Excluido** (no es rol driver) |

**Cobertura v1 (9 jun):** lectura documentos + status + GPS primer plano + reconexión estable + subida evidencia (**Semana 6**). Mensajes, wait time, push y **rastreo en vivo (Semana 8)** → v1.1.

---

## Notas

- **Plan de ejecución hasta 9 jun 2026:** `PP2_ROADMAP_ENTREGA_JUN9.md`.
- Los **Word** en la **raíz del repo** — `TigerHawk_TMS_Technical_Handoff.docx` y `TigerHawk_TMS_Testing_Plan.docx` — son fuente de verdad para **paridad funcional** con el TMS; `README_STEPS_NEXTS.md` y `README_PRUEBAS.md` sirven como índice y checklist operativo, no como sustituto del contenido completo de los `.docx`.
- **Deploy web** del equipo prioriza **Netlify** según reglas del proyecto; la app móvil usa **EAS / tiendas**, independiente del hosting del Next.js.
- **Mapa código → móvil** (exclusiones, gaps POD, panel conductor): ver **`PP2_DOCUMENTACION.md` §3** tras la revisión del monorepo TigerHawk.
