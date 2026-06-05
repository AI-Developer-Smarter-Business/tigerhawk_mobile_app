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
| 7.7 | ✅ **Completada (3 jun 2026).** `docs/BACKLOG_V1_1_7_7.md` — push, mensajes, wait time, geofencing, E2E, P2 quick wins; **rastreo en vivo** → **Semana 8** (8.2–8.17); orden sugerido v1.1. Enlazado desde `DRIVER_TMS_CAPABILITIES_5_7.md` y README. |
| 7.8 | **Handoff** al cliente: APK/build, env, este archivo actualizado (✅ / ⏳). **9 jun:** margen imprevistos.                |

---

## Semana 8 — Rastreo en vivo GPS (TMS + móvil) _(post–9 jun · v1.1 · prioridad #1)_

**Ventana:** tras **9 jun 2026** · **Fase 0:** app móvil abierta → Supabase `loads.current_*` cada **30–60 s** → mapa TMS con `last_seen_at`. **Sin API externa** de rastreo. **Asumido:** viaje activo + **primer plano** (sin confirmación escrita al cliente). **Base v1:** Semana 5 ✅ share manual (`docs/GPS_V1_DECISION.md`).

**Docs (detalle técnico):** `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md` · `docs/TMS_DEV_REPOSITORY.md` (repo TMS editable) · `docs/BACKLOG_V1_1_7_7.md`

**Supabase compartido:** columnas nuevas nullable no rompen TMS sin UI GPS; RLS **aditivo** (8.5). Orden: **8.2** → **8.4–8.6** → móvil **8.7–8.9** → TMS **8.12–8.13** → **8.16**.

| #    | Tarea |
| ---- | ----- |
| 8.2  | Definir estados `loads` “en curso”, superficie del mapa (detalle / dispatcher) y alcance de visibilidad. |
| 8.3  | ✅ **Completada (3 jun 2026).** Arquitectura fase 0: `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`, `docs/TMS_DEV_REPOSITORY.md`, regla `.cursor/rules/tms-dev-repository.mdc`. Pendiente alinear lista de estados con **8.2**. |
| 8.4  | ⏳ **Scripts listos (5 jun 2026).** `supabase/sql-editor/20260605120000_pp2_driver_live_location_loads.sql` — columnas nullable en `loads`. **Aplicar** en SQL Editor (no ejecutado en repo). |
| 8.5  | ⏳ **Incluido en el mismo script** — política nueva `Drivers update live location…` + trigger (solo `current_*`); **sin DROP** de políticas Staff. Verificar: `VERIFY_pp2_driver_live_location.sql`. |
| 8.6  | ⏳ `enable_realtime_driver_tracking.sql` (idempotente; suele bastar con `enable_realtime_pp2_driver_sync.sql`). |
| 8.7  | Móvil: `lib/location/tracking-policy.ts` (intervalo 30–60 s, estados activos, umbral metros). |
| 8.8  | Móvil: `useDriverLocationTracking` — `expo-location` primer plano, `UPDATE` Supabase, offline/retry. |
| 8.9  | Móvil: UI “Sharing location with dispatch” + copy `strings`. |
| 8.10 | **N/A fase 0** — background / jornada completa fuera de alcance (`docs/QA_DRIVER_TRACKING_BACKGROUND.md`). |
| 8.11 | **Opcional** — ruta TMS `PATCH …/location`; si no, Supabase-only (recomendado fase 0). |
| 8.12 | TMS (repo dev): marcador conductor en `LoadSidebarMap` / `LoadDetailPanel` + Realtime. |
| 8.13 | TMS (repo dev): dispatcher — última posición en lista o mapa; enlace a detalle. |
| 8.14 | **Pospuesto** — historial de ruta (modelo C). |
| 8.15 | **Pospuesto** — retención/costes historial. |
| 8.16 | QA: `docs/QA_DRIVER_LIVE_TRACKING.md` (punto en TMS en menos de 60 s con carga activa). |
| 8.17 | Reportes diarios el día de SQL o entrega mapa TMS. |

---

## Referencia rápida (post–9 jun)

| Tema | Dónde |
|------|--------|
| Backlog v1.1 (push, mensajes, E2E, …) | `docs/BACKLOG_V1_1_7_7.md` |
| GPS en vivo | **Semana 8** arriba |
| Paridad conductor ↔ TMS | `docs/DRIVER_TMS_CAPABILITIES_5_7.md` |
| Subida evidencia (decisión) | **OPC.1** TMS POST tipo **Driver** — ver `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md` |

---

## Opcional — evidencia conductor (referencia)

| # | Tarea |
|---|--------|
| OPC.1 | ✅ Producción: subida vía TMS POST + Bearer (móvil listo). |
| OPC.2 | No recomendado: Supabase Storage directo desde móvil. |
| OPC.3 | Rechazado: duplicar `documents/route.ts`. |
| OPC.4–6 | Handoff / spike post–9 jun si negocio lo pide. |

---

## Notas

- Plan hasta **9 jun:** `PP2_ROADMAP_ENTREGA_JUN9.md` · Handoff Word: raíz del repo (`TigerHawk_TMS_*.docx`).
- **TMS código:** repo dev en `docs/TMS_DEV_REPOSITORY.md` — no editar `PROYECTO_MUESTRA/`.
- **Mapa código móvil:** `PP2_DOCUMENTACION.md` §3.
