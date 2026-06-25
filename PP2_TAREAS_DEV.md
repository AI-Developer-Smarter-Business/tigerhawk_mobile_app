# PP2 (móvil) — Tareas para el desarrollador

**Formato (desde el cierre · mayo–jun 2026):** las **Semanas 1–7** conservan el histórico **completado**. Del **26 may al 9 jun 2026** quedaron **3 semanas de cierre** (**Semana 5 → 7**). **Post v0.1.0 (jun 2026):** bloque **Completadas** (WT._, GPS, DOC/UI hechos) y al **final del archivo** sección **Pendientes** (7.8, 8.x, WT._ abiertas). Tareas **WT.17 / WT.18 / WT.16 / 8.2 / WT.13** eliminadas o absorbidas — ver notas en **Pendientes**.

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
| 6.6 | ✅ **Completada (2 jun 2026).** Compresión/redimensionado ligero antes de subir: `expo-image-manipulator`, `prepare-driver-upload-image.ts` (máx. 1920 px, JPEG 0.82; HEIC o >1.5 MB o dimensiones grandes; sin cambio en web/fotos pequeñas); integrado en `PodUploadSection`. Tests `prepare-driver-upload-image.test.ts`.                                                                                                                                                                                                                                                                                                                         |

---

## Semana 7 — Release, QA final y handoff _(semana 3 del cierre · hasta 8 jun)_

**Ventana:** ~7 – **8 jun 2026** · **Deadline app:** **9 jun 2026** (buffer / build production / sign-off).

| #   | Tarea                                                                                                                                                                                                                                                                                                                                     |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 7.1 | ✅ **Completada (3 jun 2026).** QA release: `docs/QA_RELEASE_SIGNOFF_7_1.md` (P0 Bearer + P1 upload, matrices 5–6); `npm run qa:7.1`; tests `release-qa-preflight`. Sign-off manual QA/PM en tabla maestra pendiente.                                                                                                                     |
| 7.2 | ✅ **Completada (3 jun 2026).** EAS Android: `eas.json` preview/production APK; `docs/RELEASE_NOTES_0_1_0.md`; `npm run build:preflight`; `MOBILE_BUILDS.md` §7.1→7.2; scripts `build:android:preview` / `production`. Ejecutar build en Expo tras `projectId` + secrets.                                                                 |
| 7.3 | ✅ **Completada (3 jun 2026).** `CHANGELOG.md`, `docs/VERSIONING.md`, `docs/BUG_REPORTING.md`; README (instalación, tabla env, bugs); alineación semver `0.1.0` en `package.json` / `app.json`. Tests `release-handoff-docs`.                                                                                                             |
| 7.4 | ✅ **Completada (3 jun 2026).** `docs/ROLLBACK_PP2.md` — APK, RLS/Realtime/Storage, TMS; inventario `supabase/sql-editor/` + `migrations/` PP2; plantilla decisión incidente.                                                                                                                                                             |
| 7.5 | ✅ **Completada (3 jun 2026).** `docs/EAS_CREDENTIALS_HANDOFF_7_5.md` — matriz custodia, secrets EAS, keystore, checklist reunión entrega (sin secretos en repo). **Pendiente cliente:** rellenar matriz + `projectId` real + secrets antes del primer `eas build` (motivo: `REPORTES_DIARIOS.md` / `DAILY_REPORTS.md` — 3 jun, Tarea 6). |
| 7.6 | ✅ **Completada (3 jun 2026).** `docs/MOBILE_SUPPORT_RUNBOOK_7_6.md` — tiers L1–L3, RLS, Storage/documentos, TMS HTTP, Realtime, incidentes; contactos en handoff. Tests `release-handoff-docs` (7.6).                                                                                                                                    |
| 7.7 | ✅ **Completada (3 jun 2026).** `docs/BACKLOG_V1_1_7_7.md` — push, mensajes, wait time, geofencing, E2E, P2 quick wins; **rastreo en vivo** → **Pendientes § GPS** (8.4–8.17); orden sugerido v1.1. Enlazado desde `DRIVER_TMS_CAPABILITIES_5_7.md` y README.                                                                             |

---

## Completadas — post v0.1.0 (jun 2026)

Bloques posteriores al deadline **9 jun** ya entregados. Tareas abiertas → **§ Pendientes** (final del archivo).

### Wait time — WT.1–WT.15 (demo + producción base)

**Contexto:** cronómetro de espera en delivery; 60 min gratis; billing vía `waiting_time_events` + trigger TMS. Reglas vigentes en **`docs/WAIT_TIME_OVERAGE_SPEC.md`** (WT.34).

| #         | Tarea                                                                                                                                                                                |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **WT.1**  | ✅ **Completada (10 jun 2026).** `docs/WAIT_TIME_OVERAGE_SPEC.md` — disparador por estado **Arrived At Delivery**, 60 min gratis, cierre en **Delivered** / salida entrega, copy EN. |
| **WT.2**  | ✅ **Completada (10 jun 2026).** Auditoría + gaps en `docs/TMS_PATCH_WT_DRIVER_WAIT_TIME.md`.                                                                                        |
| **WT.3**  | ✅ **Completada (10 jun 2026).** Fase A móvil: `DeliveryWaitSection`, `useDeliveryWaitTimer`, mock `EXPO_PUBLIC_WAIT_TIME_MOCK=1`; integrado en detalle de carga.                    |
| **WT.4**  | ✅ **Completada (10 jun 2026).** Fase A TMS: `DeliveryWaitTimerPanel` en sidebar `LoadDetailPanel`; demo `?waitMock=1`.                                                              |
| **WT.5**  | ✅ **Completada (10 jun 2026).** `lib/tms/wait-time.ts` + tests contrato.                                                                                                            |
| **WT.6**  | ✅ **Completada (10 jun 2026).** `useDeliveryWaitTimer` — auto start/stop por estado; sync 60 s; `strings.waitTime.*`. _(Comportamiento auto — refactor en **WT.27**.)_              |
| **WT.7**  | ✅ **Completada (10 jun 2026).** Banner persistente al superar 60 min (conductor).                                                                                                   |
| **WT.8**  | ✅ **Completada (10 jun 2026).** TMS `wait-time/route.ts` — Bearer, driver asignado, POST `start_time` solo, PATCH + notify.                                                         |
| **WT.9**  | ✅ **Completada (10 jun 2026).** TMS panel live + Realtime `waiting_time_events`.                                                                                                    |
| **WT.10** | ✅ **Completada (10 jun 2026).** Trigger existente + enlace **Waiting Time Audit** en panel billable.                                                                                |
| **WT.11** | ✅ **Completada (10 jun 2026).** Campana TMS — alertas `waiting_time` + Realtime.                                                                                                    |
| **WT.12** | ✅ **Completada (10 jun 2026).** Toasts dispatcher (`useWaitTimeAlerts` + `FloatingToasts`).                                                                                         |
| **WT.14** | ✅ **Completada (10 jun 2026).** `docs/QA_WAIT_TIME_OVERAGE.md`.                                                                                                                     |
| **WT.15** | ✅ **Completada (10 jun 2026).** Backlog + reportes diarios.                                                                                                                         |

### Wait time — post feedback (11 jun 2026)

| #         | Tarea                                                                                                                                                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **WT.21** | ✅ **Completada (11 jun 2026).** Móvil: anti-regresión timer — `hydrate-timer-state.ts` prioriza `waiting_time_events` > `actual_delivery`; tests `hydrate-timer-state`, `useDeliveryWaitTimer`.                                                                         |
| **WT.24** | ✅ **Completada (11 jun 2026).** TMS: `sync-load-billing.ts` upsert **Detention** en `load_billing` al cerrar evento; QA § billing en `docs/QA_WAIT_TIME_OVERAGE.md`.                                                                                                    |
| **WT.27** | ✅ **Completada (22 jun 2026).** Móvil: **Check In** / **Check Out** explícitos (detention billing manual); footer sobre Field actions; sin auto-start en **Arrived At Delivery** ni cierre por **Delivered**; panel pay WT.22. _(Antes “Start/End wait time”, 18 jun.)_ |
| **WT.28** | ✅ **Completada (24 jun 2026).** TMS dev: POD firmado/enviado → cierra `delivery_wait` abierto — `handle-pod-signed-submitted.ts`, hook en upload `document_type=POD`, `POST …/pod-signed`, `activity_log` `pod_signed_submitted`. Sin cambios Supabase. |
| **WT.29** | ✅ **Completada (24 jun 2026).** TMS dev: plantilla `detention_warning_45` + envío idempotente al ≥ **45 min** (`maybeNotifyDetentionWarning45` en PATCH wait-time); SQL seed `seed_detention_warning_45_email_template.sql`. |
| **WT.30** | ✅ **Completada (25 jun 2026).** TMS dev: plantilla `detention_started` + envío idempotente al cruzar **60 min** gratis (`maybeNotifyDetentionStarted`). |
| **WT.31** | ✅ **Completada (25 jun 2026).** TMS dev: plantilla `detention_completed` + resumen al cerrar wait (`maybeNotifyDetentionCompleted`); hook en cierre wait + PATCH. |
| **WT.32** | ✅ **Completada (25 jun 2026).** TMS dev: cron `POST /api/cron/wait-time-detention-emails` (cada 5 min) — sync duración servidor + emails 45/60 offline-safe. |
| **WT.33** | ✅ **Completada (25 jun 2026).** Config cliente: `DETENTION_EMAIL_TIMEZONE`, `DETENTION_EMAIL_CC`, tope timer olvidado (`DETENTION_FORGOTTEN_TIMER_MAX_MINUTES`); doc `docs/DETENTION_EMAIL_CLIENT_CONFIG.md`. |
| **WT.35** | ✅ **Completada (25 jun 2026).** Reportes diarios + `CHANGELOG` bloque WT.27–32; specs/QA actualizados. |
| **WT.34** | ✅ **Completada (18 jun 2026).** `docs/WAIT_TIME_OVERAGE_SPEC.md` — delivery-only, un timer, 60 min, Check In/Out, `opciones_driver.png` ≠ timer, reglas A–D + mapa código; QA alineado.                                                                                 |
| **WT.19** | ✅ **Completada (jun 2026).** TMS dev desplegado en **Netlify**; móvil operativo vía `EXPO_PUBLIC_TMS_API_URL` + Bearer (wait-time, documentos, billing). Ver `docs/DEPLOYMENT_STATUS.md`.                                                                               |
| **WT.20** | ✅ **Completada (19 jun 2026).** Supabase: `fix_waiting_time_events_billing_columns.sql` + `enable_realtime_waiting_time_events.sql` aplicados (`npm run db:apply-wt20`). Ver `VERIFY_pp2_waiting_time_events.sql`.                                                      |
| **WT.22** | ✅ **Completada (19 jun 2026).** Móvil: panel read-only **Your wait pay** en detalle de carga — suma `driver_pay_amount` de eventos cerrados + estimado en timer activo (`lib/wait-time/wait-pay-summary.ts`, `DeliveryWaitPaySummary`).                                 |
| **WT.25** | ✅ **Completada (19 jun 2026).** Q11: factura cliente = **Detention** (`load_billing.charge_type`); descripción **Delivery detention**; conductor = **Wait time**. TMS `invoice-labels.ts` + `sync-load-billing.ts`; doc `docs/WAIT_TIME_INVOICE_LABEL.md`.              |
| **WT.23** | ⏳ **Stub (19 jun 2026).** TMS dev: mock geofence → auto-close `delivery_wait` (`/api/integrations/samsara/simulate`); doc `docs/SAMSARA_GEOFENCE_SPIKE.md`. **Pendiente live Samsara** — ver **§ Pendientes → WT.23** (≠ GPS Supabase 8.x).                             |

### GPS en vivo (Semana 8 — arquitectura)

| #   | Tarea                                                                                                                                                                                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.3 | ✅ **Completada (3 jun 2026).** Arquitectura fase 0: `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`, `docs/TMS_DEV_REPOSITORY.md`, regla `.cursor/rules/tms-dev-repository.mdc`. Estados “en curso” → **Pendientes § 8.7**. |

### Documentos y UI (feedback cliente)

| #         | Tarea                                                                                                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DOC.3** | ✅ **Completada (18 jun 2026).** URLs documentos sin caducidad 1h — `resolve-document-url.ts` TMS + móvil; TTL ~10 años desde `storage_path`. TMS en Netlify operativo.                 |
| **UI.1**  | ✅ **Completada (18 jun 2026).** Tema **claro** TigerHawk — `PP2Theme.colors.tms` light, drawer/header blancos, acento `#E8700A`; `AppActionSheet` en lugar de `Alert` para picker POD. |

**Repos wait time / TMS:**

| Componente                        | Ruta                                                                                                                            |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Móvil (Expo)**                  | `proyecto_PP2_app_mobile` (este repo)                                                                                           |
| **TMS (editable)**                | `C:\Users\ariel\OneDrive\Escritorio\RECRUITING_SMARTER___BRASIL\proyecto_1_TigerHawk TMS\tigerhawk-tms-main\tigerhawk-tms-main` |
| **Referencia TMS (solo lectura)** | `PROYECTO_MUESTRA/` — no modificar                                                                                              |

---

## Pendientes

Orden sugerido de trabajo. **Tareas absorbidas / eliminadas:** **8.2** → **8.7**; **8.10–8.11, 8.14–8.15** → notas fase 0 (fuera de tabla activa); **WT.13** → **WT.20**; **WT.16** → **WT.34**; **WT.17** → **WT.27**; **WT.18** (GPS stop wait) → **WT.23** Samsara; **WT.26** → **WT.35**.

### Release / handoff

| #   | Tarea                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------- |
| 7.8 | **Handoff** al cliente: APK/build, env, este archivo actualizado. Deadline original **9 jun** — margen imprevistos. |

### GPS en vivo (Semana 8 · v1.1 · prioridad #1)

**Ventana:** post **9 jun 2026** · **Fase 0:** app móvil abierta → Supabase `loads.current_*` cada **30–60 s** → mapa TMS con `last_seen_at`. **Sin API externa.** **Asumido:** viaje activo + **primer plano**. **Base v1:** Semana 5 ✅ share manual (`docs/GPS_V1_DECISION.md`).

**Docs:** `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md` · `docs/TMS_DEV_REPOSITORY.md` · `docs/BACKLOG_V1_1_7_7.md`

**Orden:** **8.4–8.6** (SQL) ✅ → móvil **8.7–8.9** ✅ → TMS **8.12–8.13** ✅ → **8.16** ✅ · **8.17**.

**Separación WT:** estas tareas son **rastreo GPS Supabase** (mapa dispatch). **No** son wait time. **WT.23** = geofence Samsara → auto-stop `delivery_wait` (distinto). Emails detention **WT.29–32 ✅**. Fuera de fase 0: **8.10** background, **8.14–8.15** historial; **8.11** opcional (TMS PATCH location).

| #    | Tarea                                                                                                                                                                                                         |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8.4  | ✅ **Completada (22 jun 2026).** Columnas nullable `current_*` / `last_seen_at` en `loads` — aplicado en Supabase compartido (`20260605120000_pp2_driver_live_location_loads.sql`).                           |
| 8.5  | ✅ **Completada (22 jun 2026).** Política `Drivers update live location…` + trigger `pp2_enforce_driver_location_update` (solo GPS; Staff intacto). Verificado: `VERIFY_pp2_driver_live_location.sql`.        |
| 8.6  | ✅ **Completada (22 jun 2026).** `enable_realtime_driver_tracking.sql` — `loads` en `supabase_realtime` (idempotente).                                                                                        |
| 8.7  | ✅ **Completada (22 jun 2026).** Móvil: `lib/location/tracking-policy.ts` — intervalo 30–60 s, estados viaje activo (8.2), umbral metros, payload Supabase, superficies TMS; tests `tracking-policy.test.ts`. |
| 8.8  | ✅ **Completada (22 jun 2026).** Móvil: `useDriverLocationTracking` + `update-load-live-location.ts` — primer plano, UPDATE Supabase, offline/retry, integrado en `app/load/[id].tsx`.                        |
| 8.9  | ✅ **Completada (22 jun 2026).** Móvil: `LiveLocationTrackingBanner` + copy `strings.location.liveTracking*`; `last_sent` en banner; integrado en `LoadDetailContent`.                                        |
| 8.12 | ✅ **Completada (22 jun 2026).** TMS dev: marcador **Driver** azul en `LoadSidebarMap` + Realtime (`useLoadLiveLocation`); leyenda _Last seen_ en `LoadDetailPanel`.                                          |
| 8.13 | ✅ **Completada (22 jun 2026).** TMS dev: columna **Driver Last Seen** en `LoadsTable` (clic → detalle + mapa); Realtime vía `router.refresh()` existente.                                                    |
| 8.16 | ✅ **Completada (22 jun 2026).** `docs/QA_DRIVER_LIVE_TRACKING.md` — E2E ≤60 s móvil → Supabase → TMS mapa + columna.                                                                                                                       |

### Wait time — Samsara geofence (WT.23)

**Distinto de GPS 8.x:** WT.23 usa **webhook Samsara** para cerrar wait al salir de geocerca; **no** sustituye el rastreo Supabase 8.9–8.17.

| #         | Tarea                                                                                                                                                                                                                                                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **WT.23** | ⏳ **Stub ✅ (19 jun).** Mock `/api/integrations/samsara/simulate` + docs. **Pendiente live:** credenciales + backport prod, webhook geofence exit → auto-close `delivery_wait`, `activity_log`. **Fallback** (sin Samsara/señal): Share location manual — `LoadLocationSection` (Semana 5). Ver `docs/SAMSARA_GEOFENCE_SPIKE.md`. |

### Documentos (móvil)

| #         | Tarea                                                                                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DOC.1** | Móvil: picker tipo documento al subir (BOL, POD, In-Gate Ticket, …) alineado a `DocumentsTab` TMS; respetar `documentTypeSchema` + tipos permitidos driver (`Driver`, `POD`, `Photo`). |
| **DOC.2** | Móvil: permisos cámara/galería — sin fallo silencioso (`pick-load-photo.ts`); mensaje + **Open Settings** si denegado.                                                                 |

### Wait time — timer manual + emails cliente

**Fuente:** `RESPUESTAS_CLIENTE.md` § Actualización scope wait time.

**Reglas confirmadas:**

| #   | Regla                                                                                       |
| --- | ------------------------------------------------------------------------------------------- |
| A   | Wait time: **solo inicio manual** (no auto al cambiar status) → **WT.27** ✅ (**Check In**) |
| B   | **Fin manual** = **Check Out** (método principal) → **WT.27** ✅                            |
| C   | **Único auto-stop:** e-POD TMS **firmado y enviado** → **WT.28** ✅                            |
| D   | Emails a **`customers.email`:** 45 min ✅ **WT.29**, 60 min ✅ **WT.30**, cierre ✅ **WT.31** · cron ✅ **WT.32**                    |
| E   | Sync offline: cola local → **OFF.2**                                                        |

**Orden sugerido:** **OFF.2** (fase aparte) · **WT.23** live Samsara · **DOC.1–2** · **7.8** handoff.

| #         | Tarea                                                                                                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **OFF.2** | **Cola offline** (~1–2 sem): encolar status, notas, POD, fotos; reintentar al recuperar señal (`docs/OFFLINE_V1.md`).                                                                                  |

**Dependencias:** Resend + `email_templates`; paridad Bearer TMS (**7.1** ✅); estados **`Arrived At Delivery`** en `DriverActionBar`. Wait time **no depende** de GPS Semana 8.

---

## Referencia rápida (post–9 jun)

| Tema                                  | Dónde                                                                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Backlog v1.1 (push, mensajes, E2E, …) | `docs/BACKLOG_V1_1_7_7.md`                                                                                                       |
| GPS en vivo (pendiente)               | **§ Pendientes → GPS** (8.4–8.17)                                                                                                |
| **Cobro tiempo excedido (wait time)** | **Completadas WT.1–15, WT.19–22, WT.24–25, WT.27–35, WT.34** · **WT.23 stub ✅ / live Samsara ⏳** · **Pendientes OFF.2** |
| **Rastreo GPS en vivo (Supabase)**    | **Completadas 8.3–8.9, 8.12–8.13, 8.16** · **Pendiente 8.17** (≠ WT.23 Samsara geofence)                                         |
| Entornos desplegados                  | **`docs/DEPLOYMENT_STATUS.md`** — TMS Netlify ✅ · Expo/EAS ✅ · no reabrir WT.19                                                |
| Wait time manual + emails (cliente)   | `RESPUESTAS_CLIENTE.md` §287+ · **WT.27–WT.35** · geofence **WT.23**                                                             |
| Paridad conductor ↔ TMS               | `docs/DRIVER_TMS_CAPABILITIES_5_7.md`                                                                                            |
| Subida evidencia (decisión)           | **OPC.1** TMS POST tipo **Driver** — ver `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md`                                                |

---

## Opcional — evidencia conductor (referencia)

| #       | Tarea                                                      |
| ------- | ---------------------------------------------------------- |
| OPC.1   | ✅ Producción: subida vía TMS POST + Bearer (móvil listo). |
| OPC.2   | No recomendado: Supabase Storage directo desde móvil.      |
| OPC.3   | Rechazado: duplicar `documents/route.ts`.                  |
| OPC.4–6 | Handoff / spike post–9 jun si negocio lo pide.             |

---

## Notas

- Plan hasta **9 jun:** `PP2_ROADMAP_ENTREGA_JUN9.md` · Handoff Word: raíz del repo (`TigerHawk_TMS_*.docx`).
- **TMS código:** repo dev en `docs/TMS_DEV_REPOSITORY.md` — no editar `PROYECTO_MUESTRA/`.
- **Mapa código móvil:** `PP2_DOCUMENTACION.md` §3.
- **Tareas eliminadas del listado activo:** **8.2**, **WT.13**, **WT.16**, **WT.17**, **WT.18**, **WT.26** — contenido integrado en filas de **Pendientes** arriba.
