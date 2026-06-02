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
| 7.7 | **Backlog v1.1:** push, mensajes, wait time, geofencing, E2E automatizado (ex semanas 6–8 originales). |
| 7.8 | **Handoff** al cliente: APK/build, env, este archivo actualizado (✅ / ⏳). **9 jun:** margen imprevistos. |

---

## Referencia — tareas pospuestas (v1.1 / post–9 jun)

No forman parte del cierre de 3 semanas. Conservadas como backlog.

| Origen | Tema | Destino |
| --- | --- | --- |
| Ex 6.1–6.4 | Expo Push, Realtime extra | v1.1 (`7.7`) |
| Ex 6.5–6.7 | E2E Maestro/Detox, rate-limit avanzado | v1.1 |
| Ex 7.2–7.4 originales | E2E ampliado, perf FlatList | v1.1 salvo P0 en listas |
| Mensajes / wait time TMS | API existe; móvil placeholder | v1.1 |
| GPS segundo plano / mapa | No acordado en 5.1 | v1.1 |

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
| Push / notificaciones | No | — | **v1.1** |
| Subir BOL / Rate Con / tipos staff en Documents | Solo dispatch en TMS | — | **Excluido** — conductor solo `POD`/`Photo` (4.1) |
| Asignar conductor, menú dispatch/A/R/settlements | Solo staff TMS | — | **Excluido** (no es rol driver) |

**Cobertura v1 (9 jun):** lectura documentos + status + GPS primer plano + reconexión estable + subida evidencia (**Semana 6**). Mensajes, wait time, push y GPS background → v1.1.

---

## Notas

- **Plan de ejecución hasta 9 jun 2026:** `PP2_ROADMAP_ENTREGA_JUN9.md`.
- Los **Word** en la **raíz del repo** — `TigerHawk_TMS_Technical_Handoff.docx` y `TigerHawk_TMS_Testing_Plan.docx` — son fuente de verdad para **paridad funcional** con el TMS; `README_STEPS_NEXTS.md` y `README_PRUEBAS.md` sirven como índice y checklist operativo, no como sustituto del contenido completo de los `.docx`.
- **Deploy web** del equipo prioriza **Netlify** según reglas del proyecto; la app móvil usa **EAS / tiendas**, independiente del hosting del Next.js.
- **Mapa código → móvil** (exclusiones, gaps POD, panel conductor): ver **`PP2_DOCUMENTACION.md` §3** tras la revisión del monorepo TigerHawk.
