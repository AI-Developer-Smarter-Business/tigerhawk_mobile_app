# PP2 (móvil) — Tareas para el desarrollador

**Regla de formato:** en **cada semana** (Semana 1 … Semana 8) hay **exactamente 8 tareas**, numeradas **N.1** a **N.8**. Son ocho entregas distintas por semana, no una sola tarea genérica por semana. El orden es sugerido; algunas tareas pueden solaparse en el tiempo.

**Premisa:** mismo **Supabase** que el TMS web; sin nuevo backend propio salvo que haga falta un **BFF** en Next.js por secretos o lógica que no pueda ir al cliente móvil.

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
| 4.1 | ✅ **Completada (22 may 2026).** Opción **(A):** parche TMS `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md` (POST asignado + tipos `POD`/`Photo` para driver); capa móvil `lib/tms/upload-load-document.ts`, límites 50 MB/255, tests `document-upload-request`, `parse-document-error`, `upload-load-document`. Aplicar parche en repo TMS Netlify antes de QA E2E POD (4.2). |
| 4.2 | ✅ **Completada (22 may 2026, reorientada).** **Ver** documentos de la carga subidos en TMS: `fetchLoadDocumentsForDriver` (Supabase RLS), `useLoadDocumentsQuery`, `LoadDocumentsSection` (lista + **View** con `Linking`); Realtime `load_documents` + `enable_realtime_load_documents.sql`; pull-to-refresh. **Opcional:** `PodUploadSection` como evidencia del conductor (POD/foto) vía TMS 4.1.                                                                                                                                                                                                                                   |
| 4.3 | ⏸ **En espera.** Validar **tamaño máximo** y tipos MIME en cliente antes de subir (coherente con bucket/TMS). Lógica base en `lib/tms/document-upload-limits.ts`, `lib/media/allowed-image-mime.ts`; **QA E2E y habilitación en UI** pendientes de validación con cliente y despliegue parches TMS (subida conductor deshabilitada en app).                                                                                                                                                                                                                                                    |
| 4.4 | Verificar que cada archivo quede **asociado** al `load_id` correcto y a la tabla/vista de documentos acordada.                                                                                                                                                                                                                                                     |
| 4.5 | Manejo **offline** básico: mensaje “sin conexión” o cola simple (sin prometer offline completo en v1).                                                                                                                                                                                                                                                             |
| 4.6 | Tests unitarios de preparación de **FormData** / metadatos (con mocks).                                                                                                                                                                                                                                                                                            |
| 4.7 | **QA manual** de documentos: subida OK, cancelación, error de red, archivo demasiado grande.                                                                                                                                                                                                                                                                       |
| 4.8 | Revisión de **costos** Storage / cuotas Supabase y documentación en `docs/STORAGE_RLS.md` (políticas y rutas).                                                                                                                                                                                                                                                     |

---

## Semana 5 — Ubicación (si entra en MVP)

| #   | Tarea                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 5.1 | Decisión **go/no-go** con negocio: ubicación solo en primer plano vs segundo plano (implica permisos iOS/Android y texto legal).     |
| 5.2 | Integrar `expo-location` para **posición actual** en pantalla de carga o acción “compartir ubicación”.                               |
| 5.3 | Si aplica: persistir puntos en tabla existente o vía API del TMS (sin migraciones inventadas sin revisión).                          |
| 5.4 | Pruebas en **dispositivo real**: batería, permiso denegado, recuperación tras volver a la app.                                       |
| 5.5 | Tests unitarios de helpers geoespaciales (distancia, formato de coordenadas).                                                        |
| 5.6 | Si hay mapa: criterios de geocoding alineados a `README_SPANISH.md` / Nominatim (política de uso).                                   |
| 5.7 | Textos de **limitación** y disclaimer para el usuario final.                                                                         |
| 5.8 | Si la ubicación **no** entra en MVP: registrar en el mismo `HANDOFF_DEV.md` o backlog las tareas 5.2–5.7 como pospuestas con motivo. |

---

## Semana 6 — Notificaciones y realtime (opcional v1)

| #   | Tarea                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------- |
| 6.1 | Evaluar **Expo Push** y dónde registrar tokens (Supabase u otro) sin duplicar lógica de correo del TMS.     |
| 6.2 | Probar **Supabase Realtime** en un canal relevante para el conductor (si RLS lo permite).                   |
| 6.3 | Implementar suscripción con **cleanup** al desmontar pantallas y manejo de reconexión.                      |
| 6.4 | Pruebas en **staging** con al menos dos dispositivos o sesiones.                                            |
| 6.5 | Tests de integración ligeros o **E2E** (Maestro/Detox) en flujo mínimo: login + lista de cargas.            |
| 6.6 | Hardening de **rate limiting** en cliente (evitar refetch en bucle).                                        |
| 6.7 | Releer `README_STEPS_NEXTS.md` sobre realtime en web solo como **contexto** de producto; sin mezclar repos. |
| 6.8 | Documentar **EAS Build**: proyecto Expo, credenciales Apple/Google para builds internos.                    |

---

## Semana 7 — Calidad, E2E y rendimiento

| #   | Tarea                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------- |
| 7.1 | Aumentar cobertura de **tests unitarios** en módulos críticos (auth, loads, uploads).                      |
| 7.2 | Ampliar suite **E2E** al happy path acordado con QA (además del mínimo de la semana 6).                    |
| 7.3 | Perfilado de **listas** (`FlatList`: windowSize, keys estables, evitar re-renders innecesarios).           |
| 7.4 | Política de **imagen**: compresión/redimensionado antes de subir POD para memoria y ancho de banda.        |
| 7.5 | Ejecutar checklist derivado de **`README_PRUEBAS.md`** y del **Testing Plan** (fases aplicables al móvil). |
| 7.6 | Sesión formal de **QA** con registro de hallazgos (issues o checklist firmado).                            |
| 7.7 | Cerrar **P0** y **P1** salientes del QA.                                                                   |
| 7.8 | Generar **build interno** (TestFlight / Play Internal) con notas de versión legibles para el cliente.      |

---

## Semana 8 — Cierre de versión y operación

| #   | Tarea                                                                                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 8.1 | Versión **semver**, **changelog** y **tag** Git de la release.                                                                                                                 |
| 8.2 | **README** final: instalación, variables, canal de reporte de bugs.                                                                                                            |
| 8.3 | Plan de **rollback** y relación de **migraciones** Supabase tocadas por la app o el TMS para PP2.                                                                              |
| 8.4 | Entrega de **keystores / credenciales EAS** al propietario del producto (cliente), con custodia clara. Ver `docs/MOBILE_BUILDS.md` (Android APK; iOS en espera de Mac/iPhone). |
| 8.5 | Documento corto de **soporte**: escalado para RLS, Storage, Port Houston (solo si la app lo usa).                                                                              |
| 8.6 | **Post-mortem** breve: horas reales vs plan, deuda técnica aceptada.                                                                                                           |
| 8.7 | **Backlog v1.1** priorizado (mensajería avanzada, offline-first, geofencing, etc., según `docs/driver_app_roadmap.md`).                                                        |
| 8.8 | **Handoff** al cliente: enlaces a builds, cuentas y este archivo actualizado con estado por tarea (✅ / ⏳).                                                                   |

---

## Notas

- Los **Word** en la **raíz del repo** — `TigerHawk_TMS_Technical_Handoff.docx` y `TigerHawk_TMS_Testing_Plan.docx` — son fuente de verdad para **paridad funcional** con el TMS; `README_STEPS_NEXTS.md` y `README_PRUEBAS.md` sirven como índice y checklist operativo, no como sustituto del contenido completo de los `.docx`.
- **Deploy web** del equipo prioriza **Netlify** según reglas del proyecto; la app móvil usa **EAS / tiendas**, independiente del hosting del Next.js.
- **Mapa código → móvil** (exclusiones, gaps POD, panel conductor): ver **`PP2_DOCUMENTACION.md` §3** tras la revisión del monorepo TigerHawk.
