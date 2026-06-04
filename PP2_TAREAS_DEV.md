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
| 3.6 | ✅ **Completada.** `lib/tms/status-patch-request.ts` (path/headers/body puros) + tests `status-patch-request`, `patch-load-status`, `driver-status-action`.                                                                                                    |
| 3.7 | ✅ **Completada.** `docs/QA_DRIVER_ACTIONS_3_7.md` + tests paridad `web-driver-panel-parity`; a11y (48dp, `accent`, labels); `DriverActionBar` / drawer / `Button`.                                                                                            |
| 3.8 | ✅ **Completada.** `HANDOFF_DEV.md` actualizado: delta maquetado vs semanas 1–3, rutas, env, acciones TMS, límites y checklist.                                                                                                                                |

---

## Semana 4 — Documentos / fotos y límites

| #   | Tarea                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 4.1 | ✅ **Completada (22 may 2026).** Opción **(A):** parche TMS `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md` (POST asignado + tipos `POD`/`Photo` para driver); capa móvil `lib/tms/upload-load-document.ts`, límites 50 MB/255, tests. **TMS en producción** — cambios en el repo TMS se reflejan en móvil al desplegar.                                                                                   |
| 4.2 | ✅ **Completada (22 may 2026, reorientada).** **Ver** documentos de la carga subidos en TMS: `fetchLoadDocumentsForDriver` (Supabase RLS), `useLoadDocumentsQuery`, `LoadDocumentsSection` (lista + **View** con `Linking`); Realtime `load_documents` + `enable_realtime_load_documents.sql`; pull-to-refresh. Subida conductor → **Semana 6**.                                                    |
| 4.3 | ↪ **Movida a Semana 6 (6.3).** Validación MIME/tamaño en UI + QA E2E de subida (lógica base ya en `document-upload-limits.ts`, `allowed-image-mime.ts`).                                                                                                                                                                                                                                            |
| 4.4 | ✅ **Completada (25 may 2026).** Asociación `load_id` / `load_documents`: `lib/loads/document-load-association.ts` (filtro post-query, prefijo `storage_path`, validación respuesta TMS); `fetchLoadDocumentsForDriver`, `uploadLoadDocument`, `normalizeLoadIdParam` en `/load/[id]` y `useLoadDocumentsQuery`; tests `document-load-association`, `fetch-load-documents`, `upload-load-document`. |
| 4.5 | ✅ **Completada (25 may 2026).** Offline v1: NetInfo, banner, assert online, sin cola. **Reconexión:** `ProfileProvider`, `QueryNetworkRecovery`, `onlineManager` + `refetchOnReconnect`, perfil conservado en fallo de red, cancelación de queries offline. `docs/OFFLINE_V1.md`. **Regresión adicional** → **Semana 5 (5.5)**.                                                                    |
| 4.6 | ✅ **Completada (25 may 2026).** Tests FormData/metadatos: `lib/tms/testing/form-data-test-utils.ts` (captura `append`), ampliación `document-upload-request.test.ts`, `upload-load-document.test.ts` (multipart en fetch), `resolve-upload-file-size.test.ts` (mock `expo-file-system`), `map-picker-asset.test.ts` (nombre generado).                                                             |
| 4.7 | ✅ **Completada (25 may 2026).** Checklist QA manual `docs/QA_DRIVER_DOCUMENTS_4_7.md` (TMS→móvil Realtime/pull, View/enlaces, offline). **Ejecución en producción** → **Semana 5 (5.6)**; §D subida → **Semana 6 (6.4)**.                                                                                                                                                                          |
| 4.8 | ↪ **Movida a Semana 6 → 6.1 ✅.** Alcance negocio: evidencia **Driver photo (optional)** — POD (entrega, sello), Photo (percances, retrasos, docs extraordinarios); visible en pestaña Documents del TMS.                                                                                                                                                                                           |

---

## Semana 5 — GPS, desconexión y estabilidad _(semana 1 del cierre · esta semana)_

**Ventana:** ~26 may – 30 may 2026 · **Enfoque:** ubicación en campo + cerrar problemas de red/reconexión + QA lectura documentos en TMS live.

| #       | Tarea                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 5.1     | ✅ **Completada (26 may 2026).** Decisión GPS v1: **solo primer plano** (`whenInUse`); sin background. `docs/GPS_V1_DECISION.md`, `lib/location/gps-v1-policy.ts`, `strings.location` (disclaimer + permisos), `app.json` plugin `expo-location` (background deshabilitado). Revisión rutas: `load/[id]` usa `normalizeLoadIdParam`; título stack desde `strings`.                                                                                                                  |
| **5.2** | ✅ **Completada (26 may 2026).** `expo-location` en detalle de carga: `LoadLocationSection`, `useLoadLocationShare`, `getForegroundPosition` (solo primer plano), `Share` con coordenadas + referencia de carga, **Open in Maps**, disclaimer; tests `format-coordinates`, `get-foreground-position`, `map-location-error`.                                                                                                                                                         |
| **5.3** | ✅ **Completada (26 may 2026).** Auditoría TMS: **no** existe `POST /tracking/loads/…/locations` ni tabla GPS por carga. v1 = **share_only** (`lib/location/tms-location-integration.ts`, `docs/GPS_TMS_INTEGRATION_5_3.md`). Stub `postDriverLocationToTms` para cuando exista ruta TMS; hint UI `tmsShareOnlyHint`. Sin migraciones inventadas.                                                                                                                                   |
| **5.4** | ✅ **Completada (28 may 2026).** `docs/QA_DRIVER_LOCATION_5_4.md` (matriz dispositivo: permiso, Settings, background, batería). Helpers `lib/location/geo.ts`, `maps-url.ts`, `location-permission.ts`; validación coords en `getForegroundPosition`; `useLoadLocationShare` sincroniza permiso al volver (focus + `AppState`); tests `geo`, `maps-url`, `location-permission`, ampliación `get-foreground-position`.                                                               |
| **5.5** | ✅ **Completada (28 may 2026).** Hardening post-4.5: refetch perfil **silencioso** (`profile-gate-loading`, `applyProfileFetchResult` sin error en red); `QueryNetworkRecovery` debounced + reset offline; `isQueryCancellation`; `usePullToRefresh` watchdog 45s; orden providers `Network` → `Profile` → `Query`. GPS L5/L6: sync servicios GPS al volver de Ajustes, **Open Settings** si GPS apagado, hint `lowPowerHint` (`expo-battery`). `docs/QA_NETWORK_RECONNECT_5_5.md`. |
| **5.6** | ✅ **Completada (28 may 2026).** Runbook producción `docs/QA_PRODUCTION_SIGNOFF_5_6.md` (§A–C documentos + §E asociación + §F acciones 3.7); `npm run qa:5.6` preflight; test rutas `lib/qa/__tests__/load-detail-routes.test.ts`. Acciones 1–2 en producción **bloqueadas** sin parche Bearer TMS (documentado). Sign-off manual QA/PM pendiente filas A–C.                                                                                                                        |
| **5.7** | ✅ **Completada (28 may 2026).** `npm run smoke:5.7` (CI completo); `docs/QA_SMOKE_E2E_5_7.md` (smoke S1–S10); `docs/DRIVER_TMS_CAPABILITIES_5_7.md` (auditoría TMS vs móvil + backlog P0–v1.1). Rate-limit refetch: `foreground-refetch-throttle` (30s loads / 15s docs focus); tests `app-routes-smoke`, `foreground-refetch-throttle`.                                                                                                                                           |

---

## Semana 6 — Evidencia del conductor / subida de archivos _(semana 2 del cierre)_

**Ventana:** ~2 jun – 6 jun 2026 · **Enfoque:** todo lo de **Driver photo (optional)**, subida POD/Photo y validación. TMS ya desplegado — QA E2E contra producción.

| #   | Tarea                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 6.1 | ✅ **Completada (1 jun 2026).** **Alcance 4.8 confirmado con cliente:** evidencia del conductor como **Driver photo (optional)** — cubre casos de negocio POD (entrega, sello) y Photo (percances, daños, retrasos, docs extraordinarios) en un solo tipo **`Driver`** en `load_documents` (v1); visible en pestaña **Documents** del TMS (fila naranja, badge Driver). Copy móvil: `strings.loadDetail.driverEvidenceTitle` / `driverEvidenceHint`; UI `LoadDocumentsSection` + `PodUploadSection`. TMS: `normalizeDriverDocumentType` acepta POD/Photo del conductor y persiste como **Driver**; dispatch sube otros tipos (BOL, etc.) sin cambio. |
| 6.2 | ✅ **Completada (1 jun 2026).** Subida **Add driver photo** (`PodUploadSection`, tipo **`Driver`**); TMS Bearer/middleware + `access_token`; Documents fila naranja; Realtime `load_documents`.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 6.3 | ✅ **Completada (2 jun 2026).** **4.3 — Validación cliente:** `validateDriverUploadFile` (MIME imagen + 50 MB + archivo vacío, copy en `strings.loadDetail`); validación al elegir foto (`PodUploadSection`) y antes de Supabase/TMS (`useLoadDocumentUpload`, `upload-driver-load-document`); `assertOnlineForDocumentUpload` + UI offline (botones deshabilitados, `podOfflineHint`). Tests `validate-driver-upload-file.test.ts`.                                                                                                                                                                                                                 |
| 6.4 | ✅ **Completada (2 jun 2026).** **QA E2E subida:** runbook `docs/QA_DRIVER_UPLOAD_E2E_6_4.md` (D1–D10: móvil→TMS, Realtime inverso, cancel/discard, dispatch ve archivo); §D actualizado en `docs/QA_DRIVER_DOCUMENTS_4_7.md`; `npm run qa:6.4` (67 tests); contrato `driver-upload-e2e-contract`, `useLoadDocumentUpload.test`, `PodUploadSection.test`. Sign-off manual QA/PM pendiente filas D1–D7.                                                                                                                                                                                                                                               |
| 6.5 | ✅ **Completada (2 jun 2026).** Copy `strings.loadDetail`: entrega/sello/percances/retraso en `driverEvidenceHint`, `podConfirmHint`, `documentsNote`; eliminado `podNote` y cualquier placeholder «TMS patch pending»; `podPreviewA11y` alineado a driver photo. Tests `strings-driver-evidence.test.ts`.                                                                                                                                                                                                                                                                                                                                           |
| 6.6 | ✅ **Completada (2 jun 2026).** Compresión/redimensionado ligero antes de subir: `expo-image-manipulator`, `prepare-driver-upload-image.ts` (máx. 1920 px, JPEG 0.82; HEIC o >1.5 MB o dimensiones grandes; sin cambio en web/fotos pequeñas); integrado en `PodUploadSection`. Tests `prepare-driver-upload-image.test.ts`. |

---

## Semana 7 — Release, QA final y handoff _(semana 3 del cierre · hasta 8 jun)_

**Ventana:** ~7 – **8 jun 2026** · **Deadline app:** **9 jun 2026** (buffer / build production / sign-off).

| #   | Tarea                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------- |
| 7.1 | ✅ **Completada (3 jun 2026).** QA release: `docs/QA_RELEASE_SIGNOFF_7_1.md` (P0 Bearer + P1 upload, matrices 5–6); `npm run qa:7.1`; tests `release-qa-preflight`. Sign-off manual QA/PM en tabla maestra pendiente. |
| 7.2 | ✅ **Completada (3 jun 2026).** EAS Android: `eas.json` preview/production APK; `docs/RELEASE_NOTES_0_1_0.md`; `npm run build:preflight`; `MOBILE_BUILDS.md` §7.1→7.2; scripts `build:android:preview` / `production`. Ejecutar build en Expo tras `projectId` + secrets. |
| 7.3 | ✅ **Completada (3 jun 2026).** `CHANGELOG.md`, `docs/VERSIONING.md`, `docs/BUG_REPORTING.md`; README (instalación, tabla env, bugs); alineación semver `0.1.0` en `package.json` / `app.json`. Tests `release-handoff-docs`. |
| 7.4 | ✅ **Completada (3 jun 2026).** `docs/ROLLBACK_PP2.md` — APK, RLS/Realtime/Storage, TMS; inventario `supabase/sql-editor/` + `migrations/` PP2; plantilla decisión incidente. |
| 7.5 | ✅ **Completada (3 jun 2026).** `docs/EAS_CREDENTIALS_HANDOFF_7_5.md` — matriz custodia, secrets EAS, keystore, checklist reunión entrega (sin secretos en repo). **Pendiente cliente:** rellenar matriz + `projectId` real + secrets antes del primer `eas build` (motivo: `REPORTES_DIARIOS.md` / `DAILY_REPORTS.md` — 3 jun, Tarea 6). |
| 7.6 | ✅ **Completada (3 jun 2026).** `docs/MOBILE_SUPPORT_RUNBOOK_7_6.md` — tiers L1–L3, RLS, Storage/documentos, TMS HTTP, Realtime, incidentes; contactos en handoff. Tests `release-handoff-docs` (7.6). |
| 7.7 | ✅ **Completada (3 jun 2026).** `docs/BACKLOG_V1_1_7_7.md` — push, mensajes, wait time, geofencing, E2E, P2 quick wins; **rastreo en vivo** → **Semana 8** (8.1–8.17); orden sugerido v1.1. Enlazado desde `DRIVER_TMS_CAPABILITIES_5_7.md` y README. |
| 7.8 | **Handoff** al cliente: APK/build, env, este archivo actualizado (✅ / ⏳). **9 jun:** margen imprevistos.                |

---

## Semana 8 — Rastreo en vivo conductor / carga (TMS + móvil) _(post–9 jun / v1.1)_

**Prioridad producto (jun 2026):** **Semana 8 es el primer bloque de v1.1** — por delante de push, mensajes, wait time y geofencing (`docs/BACKLOG_V1_1_7_7.md`). Como **TMS y móvil los desarrollamos nosotros**, el seguimiento en vivo es viable **sin API externa de rastreo** (ver abajo).

**Ventana:** tras cierre **9 jun 2026** · **Enfoque:** ubicación periódica en Supabase + mapa TMS en tiempo real (sin API de rastreo de terceros). Mismo proyecto Supabase que PP2 y Netlify.

**Contexto v1 ya entregado:** Semana 5 = GPS **solo primer plano** y **Share location** manual (`docs/GPS_V1_DECISION.md`, `docs/GPS_TMS_INTEGRATION_5_3.md` — sin persistencia ni mapa en vivo). Esta semana **añade persistencia + mapa TMS** mientras la app (o una página TMS opcional) esté abierta con permiso de ubicación.

### MVP fase 0 — “última posición en mapa” (alcance acordado equipo)

Objetivo: dispatcher ve en el **mapa TMS** dónde va el conductor con **timestamp** de última señal, actualizándose cada **30–60 s** mientras el dispositivo envía GPS.

| Tema | Fase 0 | Fuera de fase 0 |
|------|--------|-----------------|
| Permiso / envío | **Opción 1:** app móvil abierta en detalle de carga (`proyecto_PP2_app_mobile`) | Link web TMS, background, teléfono bloqueado → **fuera fase 0** / **8.10 N/A** |
| Vista TMS | Mapa en vivo en **repo TMS dev** (ver abajo) — extender `LoadSidebarMap` / detalle dispatcher | `PROYECTO_MUESTRA/` solo lectura |
| Intervalo | 30–60 s (`tracking-policy.ts`) | Sub-segundo, siempre-on jornada |
| Datos | Modelo **B:** `loads.current_latitude`, `current_longitude`, `last_seen_at` | Historial de ruta (**8.14**), retención avanzada (**8.15**) |
| TMS | Marcador en mapa + Realtime; leyenda `last_seen_at` | Panel flota completo si no hace falta en 8.13 |
| API externa | **No** — Expo Location + Supabase + Leaflet/OSM en TMS | Mapbox/Google **Tracking**, Samsara, etc. |
| TMS Next route | **Opcional** (8.11) — basta `UPDATE` Supabase con RLS | Obligatorio solo si negocio exige validación en BFF |

**Arquitectura:** `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md` (tarea **8.3**).

**Tareas mínimas fase 0:** **8.2**, **8.3**, **8.4**, **8.5**, **8.6**, **8.7**, **8.8**, **8.9**, **8.12**, **8.16**, **8.17**. **No ejecutar aún:** **8.10** (background). **Posponer:** **8.14**, **8.15** (salvo estimación rápida).

### Pregunta bloqueante al cliente (incluir en kickoff de tarea 8.1)

> **¿Necesitan ubicación en tiempo real únicamente durante un viaje/carga activa, o desean rastrear a los conductores durante toda su jornada laboral (incluso con la app en segundo plano o cerrada)?**

| Respuesta cliente                   | Impacto técnico                                                                                                                                                           | Impacto producto                                                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Solo durante viaje/carga activa** | `expo-location` en **primer plano** (o foreground service mínimo mientras la app está abierta en detalle/viaje); intervalos 15–30 s; sin background iOS/Android agresivo. | Solución **simple y barata**; alineada al TMS típico (tracking ligado a `loads` en curso).                                           |
| **Toda la jornada / app cerrada**   | **Background location** (permisos `always`, tareas en segundo plano, políticas Play/App Store, más QA batería).                                                           | Más desarrollo, más consumo batería, más filas o más frecuencia de `UPDATE`; requiere copy legal y política de privacidad explícita. |

**Recomendación PP2 (pendiente confirmación):** rastrear **solo cuando el load asignado al conductor está en estados “en curso”** (p. ej. _In Transit_, _At Pickup_, _At Delivery_ — lista exacta en 8.2). Fuera de ese estado: **no enviar** o enviar cada 1–5 min solo si el cliente exige jornada completa.

**Para MVP fase 0 (solo app/página abierta + 30–60 s):** basta confirmar por escrito **“viaje activo + primer plano”**. La pregunta de **jornada completa / background** solo desbloquea **8.10**; no bloquea schema, móvil ni mapa TMS de fase 0.

### Análisis — mejor opción para mapa TMS (sin contratar API externa)

Flujo acordado con el ecosistema actual (móvil → Supabase → TMS Next.js con Realtime):

| Paso | Qué                                            | Notas                                                                                                                                       |
| ---- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | App obtiene `{ latitude, longitude }`          | **Expo Location** (ya en proyecto) o `react-native-geolocation-service` si se sale de Expo managed.                                         |
| 2    | Persistir en Supabase                          | Ver tabla siguiente — **no** hace falta Mapbox/Google Routes solo para **mostrar punto en mapa** (Leaflet/OSM en TMS si ya hay mapa).       |
| 3    | TMS escucha Realtime                           | `postgres_changes` sobre la tabla elegida → refrescar marcador sin F5 (mismo patrón que `useRealtimeRefresh` + `loads` / `load_documents`). |
| 4    | Producción — ubicación **actual** vs historial | Ver comparativa abajo.                                                                                                                      |

**Comparativa de modelo de datos (elegir en 8.3, documentar en `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`):**

| Modelo                            | Esquema                                                                                                                              | Pros                                                                  | Contras                                                                    | Cuándo elegir                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **A — Solo historial**            | `driver_locations` (INSERT cada tick: `driver_id`, `load_id?`, `lat`, `lng`, `created_at`)                                           | Auditoría completa; mapa TMS puede animar ruta                        | Miles de filas/día; coste storage; mapa debe leer “último punto” con query | Cliente pide **historial de ruta** obligatorio                        |
| **B — Solo ubicación actual**     | Columnas en `drivers` o en `loads`: `current_latitude`, `current_longitude`, `last_seen_at` + `UPDATE` por tick                      | Pocas filas; mapa TMS trivial (una marca por conductor/carga)         | Sin trazado histórico salvo ampliar después                                | **Recomendado para v1.1** si el mapa solo debe ver “dónde está ahora” |
| **C — Híbrido (recomendado PP2)** | **`loads` o `drivers`:** `current_*` + `last_seen_at` (UPDATE); **`driver_location_history`:** INSERT cada N minutos o cada X metros | Mapa en vivo barato + historial para disputas/QA sin INSERT cada 30 s | Dos escrituras; definir retención (p. ej. 30 días) en 8.4                  | Balance **producción** entre mapa live y auditoría                    |

**Decisión de enlace conductor ↔ carga:**

| Opción            | Descripción                                                                                                                            |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Por carga**     | `load_id` en cada punto (o columnas `current_*` en `loads`) — el dispatcher ve el camión **de esa carga** en el detalle/mapa del load. |
| **Por conductor** | `driver_id` en `drivers.current_*` — mapa “flota” de conductores activos; el panel dispatcher filtra por asignación.                   |

**TMS Realtime (paso 3):** suscribir canal a la tabla que cambie en cada tick (`UPDATE` en `loads`/`drivers` dispara evento; `INSERT` en historial si se usa A o C). Añadir tabla a publicación **`supabase_realtime`** (mismo procedimiento que `enable_realtime_pp2_driver_sync.sql`). RLS: conductor solo escribe su `driver_id` / loads asignados; dispatch lee según rol staff.

**Batería y frecuencia (definir con cliente en 8.2 / 8.7):**

| Regla                                      | Valor propuesto (ajustable)                                     | Motivo                                                |
| ------------------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------- |
| Intervalo con **viaje activo**             | **30–60 s** (fase 0); 15–30 s si dispatch pide más frescura     | Balance frescura mapa / batería                       |
| Intervalo **inactivo** (si aplica jornada) | 1–5 min                                                         | Menos ticks cuando no hay carga en curso              |
| **Umbral de distancia**                    | 20–200 m (preguntar al cliente; opción 1 km para máximo ahorro) | No enviar si el GPS no se movió → menos red y batería |
| App cerrada / background                   | Solo si cliente elige jornada completa                          | Ver pregunta bloqueante                               |

| #    | Tarea                                                                                                                                                                                                                                                                                  |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.1  | **Bloqueante negocio:** enviar al cliente la pregunta de **viaje activo vs jornada completa** (tabla arriba); registrar respuesta por escrito en `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md` y en acta de reunión. Sin respuesta → no implementar background ni fijar intervalos finales. |
| 8.2  | **Alcance funcional:** estados de `loads` que cuentan como “viaje activo”; si el mapa vive en **Load detail**, **Dispatcher board** o ambos; si el dispatcher ve **todos** los conductores o solo los de cargas del día.                                                               |
| 8.3  | ⏳ **Borrador listo.** `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md` — modelo **B** fase 0; sin API externa; checklist mínimo. Pendiente: cerrar con respuesta cliente 8.1 y lista estados 8.2. Modelo **C** si exigen historial. |
| 8.4  | **Supabase — esquema:** migración SQL Editor (raíz móvil `supabase/sql-editor/`): columnas `current_latitude`, `current_longitude`, `last_seen_at` en `loads` y/o `drivers`, y opcional `driver_location_history`; índices por `load_id`, `driver_id`, `created_at`.                   |
| 8.5  | **Supabase — RLS:** políticas `authenticated` — conductor `UPDATE`/`INSERT` solo en filas propias (`driver_id = auth.uid()` o loads asignados); staff/dispatcher `SELECT`; sin exponer ubicación de otros conductores al rol driver.                                                   |
| 8.6  | **Supabase — Realtime:** script idempotente `enable_realtime_driver_tracking.sql` — añadir tablas acordadas en 8.3 a `supabase_realtime`; verificación `SELECT` en `pg_publication_tables`.                                                                                            |
| 8.7  | **Móvil — política de envío:** módulo `lib/location/tracking-policy.ts` — intervalos, umbral de metros (constante hasta respuesta cliente), estados de carga que habilitan tracking; **no** enviar cada 1 s.                                                                           |
| 8.8  | **Móvil — captura y envío:** hook `useDriverLocationTracking` (o ampliar `useLoadLocationShare`) — `expo-location`, primer plano obligatorio en v1.1; `UPDATE` Supabase vía cliente anon + RLS; manejo permisos denegados y offline (pausar cola, reintentar al reconectar).           |
| 8.9  | **Móvil — UI:** indicador en detalle de carga (“Sharing location with dispatch” / pausado); disclaimer batería y privacidad en `strings`; solo visible cuando tracking activo según 8.2.                                                                                               |
| 8.10 | **Móvil — background (condicional):** **solo si cliente elige jornada completa** — `expo-location` background / task manager, `app.json` permisos `always`, matriz QA Android+iOS (`docs/QA_DRIVER_TRACKING_BACKGROUND.md`). Si solo viaje activo → marcar **N/A**.                    |
| 8.11 | **TMS — API (opcional):** si se prefiere centralizar validación en Next.js: `POST /api/mobile/drivers/location` o `PATCH /api/dispatcher/loads/[id]/location` con JWT Bearer (mismo patrón que documentos); si RLS directo basta → documentar “Supabase-only” y omitir ruta.           |
| 8.12 | **TMS — mapa en vivo (repo dev obligatorio):** en `proyecto_1_TigerHawk TMS\tigerhawk-tms-main\tigerhawk-tms-main` — extender `LoadSidebarMap` + `LoadDetailPanel`: marcador conductor desde `loads.current_*`, Realtime, leyenda `last_seen_at`. Hoy el mapa solo muestra pickup/delivery (no GPS vivo). Ver `docs/TMS_DEV_REPOSITORY.md`. |
| 8.13 | **TMS — panel dispatcher (mismo repo dev):** dashboard dispatcher — lista o mapa de cargas activas con última posición; click → detalle. Deploy dev = cambios en esa ruta, no en `PROYECTO_MUESTRA/`.                                                                                           |
| 8.14 | **TMS — historial (si modelo C):** pestaña o modal “Route history” — query `driver_location_history` con límite temporal; no bloquear v1.1 del mapa live.                                                                                                                              |
| 8.15 | **Retención y costes:** política de borrado/archivo de historial (p. ej. > 30 días); estimación filas/día según intervalo elegido; comunicar al cliente.                                                                                                                               |
| 8.16 | **QA E2E:** `docs/QA_DRIVER_LIVE_TRACKING.md` — conductor con carga _In Transit_ → punto aparece en TMS < 60 s; conductor sin carga activa → no escribe (o intervalo largo); borrado de sesión detiene envío; prueba batería 30 min.                                                   |
| 8.17 | **Reportes:** actualizar `REPORTES_DIARIOS.md` / `DAILY_REPORTS.md` el día que se aplique SQL Realtime o se entregue mapa TMS.                                                                                                                                                         |

**Dependencias:** 8.1 (light) → 8.2 → 8.3 → (8.4, 8.5, 8.6 en paralelo) → 8.7–8.9 móvil → 8.12–8.13 TMS → 8.16 QA → 8.17 reportes. **Paralelo opcional:** 8.11. **Rama aparte:** 8.10 solo si cliente pide background. **Después de fase 0:** 8.14, 8.15.

**Relación con tareas anteriores:** sustituye el stub `postDriverLocationToTms` (5.3) cuando exista decisión 8.11; amplía GPS v1 (5.1–5.4) sin romper **Share location** manual.

---

## Referencia — tareas pospuestas (v1.1 / post–9 jun)

No forman parte del cierre de 3 semanas. Conservadas como backlog.

| Origen                          | Tema                                   | Destino                               |
| ------------------------------- | -------------------------------------- | ------------------------------------- |
| Ex 6.1–6.4                      | Expo Push, Realtime extra              | v1.1 (`7.7`)                          |
| Ex 6.5–6.7                      | E2E Maestro/Detox, rate-limit avanzado | v1.1                                  |
| Ex 7.2–7.4 originales           | E2E ampliado, perf FlatList            | v1.1 salvo P0 en listas               |
| Mensajes / wait time TMS        | API existe; móvil placeholder          | v1.1                                  |
| GPS primer plano (share manual) | ✅ Semana 5                            | v1                                    |
| **GPS en vivo + mapa TMS**      | **Semana 8** (8.1–8.17)                | **v1.1** — tras respuesta cliente 8.1 |
| GPS segundo plano todo el día   | Solo si cliente elige jornada completa | 8.10                                  |

---

## Tareas opcionales — subida de evidencia y seguimiento

**No cuentan como semana 9.** Referencia para el cliente y para **v1.1** si cambia la estrategia de despliegue.

### Opcional — ¿TMS o solo Supabase para subida de evidencia del conductor?

| #     | Opción / tarea                                                  | Qué implica                                                                                                                                                                                | Veredicto PP2                                                                                                                                                                                          |
| ----- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| OPC.1 | **(A) Ampliar TMS** `POST /api/dispatcher/loads/[id]/documents` | Cambios en **repo TMS** (permiso conductor asignado, JWT Bearer, mismos límites 50 MB, Storage vía admin + fila `load_documents`). Móvil ya preparado (`lib/tms/upload-load-document.ts`). | **Recomendada para v1** — misma vía que dispatch; `activity_log`, validación y URLs firmadas centralizadas. Parches: `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md`, `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`. |
| OPC.2 | **(B) Supabase Storage + RLS INSERT desde móvil**               | Políticas en bucket `load-documents` + INSERT en `load_documents` para rol `driver`; subida con `supabase.storage` desde la app (sin pasar por Next.js).                                   | **No recomendada en v1** — duplica reglas del TMS, refresco de URLs, riesgo de desalinear tipos MIME/tamaño y de acercar secretos o atajos con `service_role` en cliente.                              |
| OPC.3 | **(C) Ruta API móvil nueva en TMS**                             | Duplica `documents/route.ts` (validación, logging, límites).                                                                                                                               | **Rechazada** — más superficie sin beneficio frente a OPC.1.                                                                                                                                           |

### Opcional — documentar decisión y revisión (post–semana 8)

| #     | Tarea                                                                                                                            |
| ----- | -------------------------------------------------------------------------------------------------------------------------------- |
| OPC.4 | Registrar en handoff que la subida de evidencia usa **TMS POST (OPC.1 / A)** en producción; lectura vía Supabase RLS + Realtime. |
| OPC.5 | Tras cierre **6.4:** evaluar si ruta Supabase directa (OPC.2 / B) aporta algo; si no, descartar en v1.1.                         |
| OPC.6 | Spike (OPC.2 / B) solo post–9 jun si negocio lo pide explícitamente.                                                             |

**Resumen:** opción **OPC.1 (A)** en producción; confirmación alcance en **6.1** (ex 4.8).

---

## Matriz paridad conductor — TMS (`PROYECTO_MUESTRA`) ↔ móvil (deadline 9 jun)

Referencia: `DriverActionPanel`, `DocumentsTab`, `PATCH …/status`, `POST …/documents`, `messages`, `wait-time`. Solo capacidades **relevantes para rol `driver`**.

| Capacidad TMS                                                  | Móvil                                 | Tarea(s)                            | v1 (9 jun)                                              |
| -------------------------------------------------------------- | ------------------------------------- | ----------------------------------- | ------------------------------------------------------- |
| Login / sesión Supabase                                        | ✅                                    | 1.x                                 | Sí                                                      |
| Lista cargas asignadas (`driver_id`)                           | ✅                                    | 2.x                                 | Sí                                                      |
| Detalle carga (ruta, holds, timeline, flags, notas)            | ✅                                    | 2.3                                 | Sí                                                      |
| Acciones de campo (`DriverActionPanel` → subset Driver)        | ✅                                    | 3.x                                 | Sí                                                      |
| Ver documentos de la carga (dispatch sube BOL, RC, etc.)       | ✅                                    | 4.2, 4.4, 4.7                       | Sí — cerrar QA staging                                  |
| **Subir evidencia** Driver photo (POD/Photo → tipo **Driver**) | ✅ subida + TMS + validación + QA 6.4 | **6.1–6.4** ✅; sign-off manual D\* | **Sí** — ejecutar matriz 6.4 en staging                 |
| Drawer / navegación mínima conductor                           | ✅                                    | 2.5                                 | Sí — My Loads, Account, Log Out                         |
| Cuenta / cerrar sesión                                         | ✅                                    | Account                             | Sí                                                      |
| Offline / reconexión                                           | ✅ base; hardening                    | 4.5, **5.5**                        | Sí                                                      |
| Mensajes por carga (`load_messages`)                           | Placeholder                           | —                                   | **v1.1** (`7.7`)                                        |
| Wait time (`wait-time` API)                                    | No                                    | —                                   | **v1.1**                                                |
| Ubicación GPS (primer plano)                                   | ✅ share en detalle                   | **5.1–5.3** ✅                      | **Sí** — share; persist TMS cuando exista API           |
| **Rastreo GPS en vivo (mapa TMS)**                             | No                                    | **8.1–8.17**                        | **v1.1** — bloqueado respuesta cliente 8.1              |
| Push / notificaciones                                          | No                                    | —                                   | **v1.1**                                                |
| Subir BOL / Rate Con / tipos staff en Documents                | Solo dispatch en TMS                  | —                                   | **Excluido** — conductor solo tipo **Driver** (6.1–6.2) |
| Asignar conductor, menú dispatch/A/R/settlements               | Solo staff TMS                        | —                                   | **Excluido** (no es rol driver)                         |

**Cobertura v1 (9 jun):** lectura documentos + status + GPS primer plano + reconexión estable + subida evidencia (**Semana 6**). Mensajes, wait time, push y **rastreo en vivo (Semana 8)** → v1.1.

---

## Notas

- **Plan de ejecución hasta 9 jun 2026:** `PP2_ROADMAP_ENTREGA_JUN9.md`.
- Los **Word** en la **raíz del repo** — `TigerHawk_TMS_Technical_Handoff.docx` y `TigerHawk_TMS_Testing_Plan.docx` — son fuente de verdad para **paridad funcional** con el TMS; `README_STEPS_NEXTS.md` y `README_PRUEBAS.md` sirven como índice y checklist operativo, no como sustituto del contenido completo de los `.docx`.
- **Deploy web** del equipo prioriza **Netlify** según reglas del proyecto; la app móvil usa **EAS / tiendas**, independiente del hosting del Next.js.
- **Mapa código → móvil** (exclusiones, gaps POD, panel conductor): ver **`PP2_DOCUMENTACION.md` §3** tras la revisión del monorepo TigerHawk.
