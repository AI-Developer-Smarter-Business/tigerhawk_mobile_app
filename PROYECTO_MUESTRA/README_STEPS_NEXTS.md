# README_STEPS_NEXTS — Cierre del proyecto TigerHawk TMS (solo este repositorio)

Documento vivo que alinea el **plan de trabajo** con **lo que falta o está incompleto** en el **monorepo web** (Next.js + Supabase) y la **documentación interna**, y propone **cómo abordar** cada bloque.

## Alcance explícito: sin app móvil nativa

- **Queda fuera de este proyecto y de este README** cualquier **aplicación móvil nativa** (React Native / Expo, tiendas iOS/Android, etc.). Ese trabajo se hará **al final**, en **otro repositorio**, cuando el API y el web estén estables.
- **Dentro de este repo** el alcance de “conductor en campo” para pruebas E2E es el que ya describe el **Testing Plan**: **Driver Action Panel** y flujos web (`LoadDetailPanel`, APIs de estado y documentos). No se planifica aquí la app PortPro móvil.

**Fuentes usadas para esta guía**

| Fuente | Ubicación |
|--------|-----------|
| Plan de trabajo (inglés, extendido) | `WORK_PLAN_PROJECT_1.docx` |
| Plan de trabajo (español) | `PLAN_DE_TRABAJO_PROYECTO_1.docx` |
| Handoff técnico | `TigerHawk_TMS_Technical_Handoff.docx` (§6 *Known Issues*, §9 *Next Steps*) |
| Plan de pruebas E2E | `TigerHawk_TMS_Testing_Plan.docx` |
| APIs dispatcher | `docs/DISPATCHER_API_ROUTES.md` |
| Sistema de tarifas / pay | `docs/RATE_SYSTEM_DESIGN.md`, `docs/ACCESSORIAL_*.md` |
| Integración Port Houston | `docs/INTEGRATION_GUIDE.md`, `docs/PH API/` |
| Despliegue / entorno | `README_ENGLISH.md`, `README_SPANISH.md`, `docs/GitHub_Setup_Guide.md`, `env.example` |

**Horas de referencia**

- En `WORK_PLAN_PROJECT_1.docx` la **Fase 4** incluye ~**35 h** de **móvil nativo** que **no aplican** a este repositorio.
- **Ámbito solo web / TMS en este repo (orientativo):** Fase 1: 56 h · Fase 2: 50 h · Fase 3: 87 h · Fase 4 (sin móvil): **65 h** · **Total ~258 h** (el .docx sigue mostrando 293 h si no lo editas).

---

## 1. Resumen: qué significa “terminar” **este** proyecto

Incluye **estabilidad** (datos, mapas, reglas de negocio), **calidad verificable** (tests + CI), **cierre financiero E2E en web** (facturación batch y settlements según Testing Plan), y **UX robusta** en dashboard y portal. **No** incluye app móvil en otro codebase.

**Mapeo rápido Handoff §6 → este documento**

| Handoff §6 | Dónde se aborda aquí |
|------------|----------------------|
| 6.1 Mapas / geocoding | Fase 1.1 + **Anexo A** |
| 6.2 Sin tests / sin CI | Fase 2 |
| 6.3 Terminales hardcoded | Fase 1.2 |
| 6.4 Dual transaction savings | Fase 1.3 |
| 6.5 Fill down | Fase 1.4 |
| 6.6 Build SWC / arquitectura | `README_ENGLISH.md` / `README_SPANISH.md` (despliegue); sin feature nueva |

---

## 2. Fase 1 — Estabilidad (MANDATORY)

| # | Ítem del plan | Qué existe hoy | Qué falta / riesgo | Cómo abordarlo (módulos y funciones) |
|---|----------------|----------------|---------------------|--------------------------------------|
| 1.1 | **Fix maps + geocoding** | API `POST`/`PATCH` en `app/api/drivers/pay-rates/origins/route.ts` (Nominatim server-side); UI en `LaneRateMatrixView`; mapas en `RateProfilesView` / `ZoneMap`; rutas en `LoadSidebarMap` (Nominatim cliente). | Orígenes sin ciudad/estado sin coordenadas; lat/lng manuales sin validación; geocoding duplicado cliente/servidor. | **Anexo A:** pruebas + blindaje API (forward/reverse, bbox, `coordinate_source`, auditoría). Centralizar geocoding sensible en servidor. Backfill + datos maestros en orgs. |
| 1.2 | **Remove hardcoded values** | `VesselTable.tsx` y `ContainerTable.tsx` (**TODO**): opciones fijas BCT/BAY. `DualTransactionsView.tsx` y `StreetTurnsView.tsx` mapean filtro → `BCT`/`BAY` en código. | Terminales nuevos no reflejados; desalineación con tabla `terminals` en BD. | Cargar terminales desde Supabase; hook o endpoint compartido; reemplazar `<option>` fijos; alinear códigos con Port Houston / orgs (`docs/INTEGRATION_GUIDE.md`). |
| 1.3 | **Fix dual transactions** | `DualTransactionsTab.tsx`: **`ESTIMATED_COST_PER_TRIP = 150`** × número de pares (no distancia). APIs `app/api/dispatcher/dual-transactions/`. | Ahorro “estimado” no refleja km ni rutas reales. | Calcular con **distancias** entre puntos de cargas emparejadas (Haversine u OSRM como en `LoadSidebarMap`); opcional persistencia en BD; rotular claramente como estimación en UI. |
| 1.4 | **Adjust fill down** | Fix reciente en `RateProfilesView` (condiciones), Handoff §6.5. | Regresiones en edición masiva. | Checklist manual + casos de `docs/RATE_SYSTEM_DESIGN.md`; luego tests (Fase 2) si se extrae lógica pura. |
| 1.5 | **Hold enforcement on transitions** | Admin transitions `/dashboard/admin/transitions`; `app/api/dispatcher/loads/[id]/status`. Testing Plan recomienda reforzar bloqueo. | Holds activos pueden no bloquear todos los caminos de cambio de estado. | Regla única en API de estado: hold activo → **403** salvo excepciones documentadas; matriz de pruebas hold × estado × rol; mensajes UI alineados al error. |
| 1.6 | **Deduction limit enforcement** | `settlements/generate`, `ap_deductions`. Testing Plan: riesgo de no aplicar límites al crear. | Sobrededucción vs plantilla/config por driver. | Validar en **POST/PUT** de deducciones contra `deduction_templates` / `driver_deduction_settings`; errores claros; E2E Fase 8. |

---

## 3. Fase 2 — Calidad técnica

| # | Ítem del plan | Qué existe hoy | Qué falta | Cómo abordarlo |
|---|----------------|----------------|-----------|-----------------|
| 2.1 | **Test setup (Jest + RTL)** | Handoff §6.2: no hay framework de tests en el repo. | Jest, RTL, mocks Next/Supabase. | Dependencias + `jest.config` + `setupTests.ts`; mocks de `@/lib/supabase/*`; guía `docs/GitHub_Setup_Guide.md` donde aplique. |
| 2.2 | **Critical tests (pay calculator, loads)** | `lib/pay-calculator.ts`, API `calculate`; rutas loads en `docs/DISPATCHER_API_ROUTES.md`. | Cobertura 0. | Unit tests con casos de `docs/ACCESSORIAL_EXAMPLES.md`; tests de transiciones de estado con mocks. |
| 2.3 | **CI/CD pipeline** | `vercel.json` (cron); sin workflow CI visible. | Lint + `tsc` + tests en PR. | `.github/workflows/ci.yml`: `npm ci`, lint, `tsc --noEmit`, `npm test`. |
| 2.4 | **(Opcional Handoff §9)** Playwright E2E | No configurado en plan mínimo. | Flujos críticos en navegador. | Después de Jest estable; flujos: login, load happy path, Port Houston sync si hay entorno de staging. **No sustituye** tests unitarios del calculator. |

---

## 4. Fase 3 — UX y robustez (+ finanzas E2E en web)

| # | Ítem del plan | Qué existe hoy | Qué falta | Cómo abordarlo |
|---|----------------|----------------|-----------|-----------------|
| 3.1 | **Error handling + loading states** | `LoadingSkeleton`, `ErrorState`; dashboard con `console.error` de queries a veces con `{}`. | Patrón unificado. | Error boundaries en layouts de dashboard; hooks con `error`/`isLoading`; mejor logging PostgREST/Supabase para diagnosticar RLS. |
| 3.2 | **Complete exports** | CSV en A/P, reportes, varios botones. | Cobertura en todas las tablas/vistas principales del plan. | Inventario `app/dashboard` + `components/tables`; reutilizar componente/patrón CSV vía API con permisos correctos. |
| 3.3 | **Email flows** | Resend, `email-templates`, settlements email, `lib/email/sendTemplateEmail.ts`. | Mapa completo de eventos → correo; reintentos y fallos. | Listar eventos de negocio (completado, factura, etc.); documentar síncrono vs cola; plantillas en Supabase según migraciones. |
| 3.4 | **Batch A/R invoicing from charges** | `invoices/route.ts` POST **unitario** (Zod). Testing Plan: falta **batch** desde cargos agrupados por cliente. | Endpoint + UI “generar facturas desde billing pendiente”. | Transacción: agrupar líneas de billing por `customer_id` → `ar_invoices` + líneas; preview en UI A/R; validar Fase 7 Testing Plan. |
| 3.5 | **A/P settlement generation** | `settlements/generate/route.ts` con rollup por periodo y deducciones. | Cerrar E2E con UI, permisos y reglas de estados de `ap_driver_pay` como en Testing Plan Fase 8. | QA manual + ajustes UX/errores; idempotencia opcional; alinear con **1.6** (límites deducción). |

---

## 5. Fase 4 — Capacidades adicionales **(solo web / backend en este repo)**

| # | Ítem del plan | Qué existe hoy | Qué falta | Cómo abordarlo |
|---|----------------|----------------|-----------|-----------------|
| 4.1 | **Basic realtime** | Toasts / suscripciones parciales (Testing Plan v1.1). | Tablero y listas que se actualicen sin recarga completa. | Canales Supabase Realtime por rol; invalidación de caché cliente; reconexión y límites. |
| 4.2 | **Notifications** | Toasts + alertas dispatcher categorizadas. | Centro de notificaciones, historial, preferencias (admin ya parcial). | Tabla o uso de modelo existente + Realtime; UI bandeja; `admin/notification-settings`. |
| 4.3 | **CSV import** | `ImportPortProModal` + `app/api/dispatcher/import/route.ts`. Handoff: import genérico amplio pendiente. | Imports adicionales (conductores, equipos, …) con validación estricta. | PapaParse + Zod + upsert transaccional; plantillas CSV en `docs/`. |
| 4.4 | **Analytics improvements** | Muchos reportes bajo `app/dashboard/reports`. | KPIs nuevos, consultas pesadas, optimización. | Revisar SQL/RPC Supabase; vistas materializadas si hace falta; Recharts ya disponible. |

**Qué **no** entra en esta fase aquí:** app móvil nativa, `expo-location`, tiendas App Store / Play — **proyecto aparte al final**.

---

## 6. Backlog baja prioridad (Handoff §9 — no bloquean cierre web)

Solo si el negocio los pide explícitamente:

- Tema claro/oscuro (hoy solo dark en handoff).
- Atajos de teclado en dispatch.
- “Advanced analytics” más allá de los reportes actuales.
- Email adicional de marketing operativo (ya parcialmente cubierto en 3.3).

**Port Houston sync / cron** (`vercel.json`, `/api/port-houston/rotate`): el handoff los marca como funcionales; el trabajo aquí es monitoreo y límites de `maxDuration` en Vercel, no un módulo nuevo salvo incidencias.

---

## 6.1 Phase 9 (Testing Plan) y backlog explícito — Tarea 22

El documento **`TigerHawk_TMS_Testing_Plan.docx`** incluye la **Phase 9** (documentos BOL/RC/peso, límite **50 MB**, portal cliente, **RLS** sin fugas entre clientes). En este repo:

- **Seguimiento técnico:** notas de RLS, finanzas, cron Port Houston y handoff en **`docs/RLS_SECURITY_REVIEW_T22.md`**.
- **Pruebas manuales:** pasos actualizados en **`README_PRUEBAS.md`** (bloques **Tarea 21** y **Tarea 22**).
- **Gaps razonables como backlog post-lanzamiento** (si QA aún no los cerró): E2E automático de Phase 9; unificación documental del cron solo en **Netlify** (scheduled function + `CRON_SECRET`) cuando el deploy de producción deje de depender de Vercel; revisión multi-tenant si el producto añade orgs aisladas en Supabase.

---

## 7. Dependencias sugeridas (orden práctico)

1. **1.1–1.2** antes de fiarse de **1.3** (distancias coherentes).  
2. **1.5–1.6** antes de cerrar **3.5** (settlements seguros).  
3. **3.4–3.5** antes de ejecutar en serio Testing Plan fases 7–10.  
4. **Fase 2** en paralelo cuando 1.1 / 1.4 estén razonablemente estables.  
5. **Fase 4** realtime/notificaciones después de que loads y finanzas web no rompan contratos.

---

## 8. Índice de documentación en `docs/` (este repo)

- **`DISPATCHER_API_ROUTES.md`** — rutas HTTP del TMS web.  
- **`RATE_SYSTEM_DESIGN.md`** + **`ACCESSORIAL_*`** — pay calculator y accesoriales.  
- **`INTEGRATION_GUIDE.md`** + **`PH API/`** — Port Houston.  
- **`RLS_SECURITY_REVIEW_T22.md`** — RLS, cron Port Houston, Phase 9 (referencia QA).  
- **`csv_templates/`** — plantillas CSV para import staff (conductores / grupos).  
- **`SHIPMENT_ACTIONS_IMPLEMENTATION.md`** — acciones / estados legacy si aplica.  

*(El archivo `docs/driver_app_roadmap.md` describe la app móvil **fuera** de este repositorio; no forma parte del alcance de este README.)*

---

# Anexo A — Mapas y geocoding (detalle operativo)

*Ítem **Fase 1.1**; amplía Handoff §6.1.*

## A.1 Contexto

- Mapas de zonas dependen de **lat/lng en `lane_origins`**.
- Orígenes desde orgs a veces sin coordenadas si faltaba ubicación en maestro.
- **Nominatim** en servidor (`origins/route.ts`) y en algunos clientes; backfill por **PATCH**.
- Sin ciudad+estado, el geocoding automático no es fiable; el manual sin reglas es un riesgo de datos falsos.

## A.2 Pruebas iniciales (sin código nuevo)

1. Inventario Supabase: `lane_origins` con lat/lng nulos.  
2. PATCH masivo en `origins/route.ts` (sin `origin_id`); respetar ~1 req/s a Nominatim.  
3. POST con solo ciudad/estado vs POST con lat/lng forzados.  
4. UI zonas + `LoadSidebarMap` con direcciones buenas y malas.  
5. Registro: origen → antes/después → método → ¿mapa OK?

## A.3 Blindaje recomendado

- No confiar en lat/lng del cliente si hay dirección/ciudad/estado; geocodificar en servidor.  
- Validar overrides: bbox, reverse geocoding, distancia al forward geocode, auditoría (`coordinate_source`, `activity_log`), rol admin si aplica.  
- Exigir ciudad/estado en orgs antes de auto-crear orígenes (`RateProfilesView`).

## A.4 Orden de implementación

Pruebas A.2 → política bbox/región → endurecer `POST`/`PATCH` → migración `coordinate_source` → UI “override administrativo” explícita → opcional: unificar geocoding server-side en formularios.

## A.5 Referencias de código

| Área | Archivo |
|------|---------|
| Orígenes API | `app/api/drivers/pay-rates/origins/route.ts` |
| Matriz / geocode UI | `components/tables/LaneRateMatrixView.tsx` |
| Origen desde org | `components/tables/RateProfilesView.tsx` |
| Ruta en mapa de carga | `components/maps/LoadSidebarMap.tsx` |

## A.6 Resumen

Priorizar coordenadas **verificadas** por geocoding; el manual solo como **excepción auditada** y validada.

---

*README alineado al plan de trabajo y al código/documentación del monorepo **web**; **excluye** app móvil nativa (otro repo, al final).*
