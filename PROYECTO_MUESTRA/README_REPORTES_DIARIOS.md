# Reportes diarios de implementación (TigerHawk TMS)

Registro breve de **qué** se implementó, **por qué** y **cómo comprobarlo** en el dashboard. Sin numeración de tarjetas internas. **Orden:** fechas de **menor a mayor** (entradas más antiguas arriba, la jornada más reciente abajo).

---

## 2026-04-21

### Datos en Supabase: trazabilidad de coordenadas en orígenes de tarifa

**Qué:** Migración en `lane_origins` con columnas `coordinate_source` y `geocoded_at`, reglas de valores permitidos, índice para localizar orígenes activos sin lat/lng, y marca automática `legacy` en filas que ya tenían coordenadas antes del cambio.

**Por qué:** Saber de dónde salió cada punto (manual, Nominatim, import, etc.) y cuándo se fijó mejora soporte, auditoría y backfills sin perder el hilo de los datos históricos.

**Supabase:** hay que **ejecutar** el SQL de `supabase/migrations/20260421_lane_origins_coordinate_provenance.sql` en el proyecto (staging primero). Sin eso, el código que escribe esas columnas puede fallar hasta aplicar la migración.

**Cómo verlo en el TMS:** **Drivers** → **Driver Pay Rates** → **Rate Profiles** → abrir un perfil; en **Network** (F12), revisa **`GET /api/drivers/pay-rates/origins`**: cada origen debe incluir `coordinate_source` y `geocoded_at`. En **Zone Maps**, si el mapa del terminal se ve bien, las coords del ancla ya están; el valor `legacy` u otros aparecen en la respuesta del API o en Table Editor.

---

### API de orígenes: validación US, backfill con detalle y auditoría

**Qué:** Endurecimiento de altas y cambios de coordenadas (límites geográficos US y comprobación opcional de estado vía Nominatim), respuesta del backfill masivo con lista `results` por fila, opción `dry_run`, registro en `activity_log` para ejecuciones masivas, script CLI `scripts/backfill-lane-origins-geocode.ts`, y mensaje en pantalla cuando el backfill deja filas a revisar.

**Por qué:** Evitar pins incoherentes o fuera de operación, respetar cuota de Nominatim, dar trazabilidad operativa (quién disparó el bulk y qué pasó con cada origen) y no depender solo de mensajes genéricos.

**Supabase:** no se añadieron tablas nuevas en este bloque; se usa `activity_log` existente y las columnas nuevas de `lane_origins` tras la migración anterior.

**Cómo verlo en el TMS:** Misma ruta **Drivers** → **Driver Pay Rates** → **Rate Profiles** → perfil con **Zone Maps**. Si algún ancla del perfil **no** tiene coordenadas, aparece **Fix Map Coordinates** / **Fix N Missing**; al usarlo, mira **Network** → **PATCH** `/api/drivers/pay-rates/origins` y el JSON `results`. Si todos los anclas ya tienen coords (como en perfiles ya saneados), el botón no sale: prueba el **PATCH** desde consola del navegador (sesión admin/dispatcher) como en `README_PRUEBAS.md` (sección de geolocalización / orígenes).

---

## 2026-04-22

### Geocodificación centralizada en servidor (Tarea 10) y pestaña **Lane Rate Matrix**

**Qué:** Se añadió **`POST /api/geocoding/forward`** (solo **admin** / **dispatcher**) que encapsula Nominatim en servidor con el mismo **User-Agent**, throttle y criterio US que `lib/geocoding/lane-origin-nominatim.ts`. El cliente dejó de llamar a `nominatim.openstreetmap.org` en **`LoadSidebarMap`** (detalle de carga → **Route**) y en el modal **Add New Origin** de la matriz legacy. En **`DriverPayRatesView`** se expuso una subpestaña **Lane Rate Matrix** que monta **`LaneRateMatrixView`**. **`LaneRateMatrixView`** ya exponía **`LaneRateActions`** (iconos **Add Zone** / **Add Origin** / borrar origen) vía **`onActionsReady`**, pero el padre no los mostraba: se cableó esa barra a la **derecha** de las subpestañas de pay rates para que **Add Origin** sea visible cuando ya existen orígenes (el botón naranja **+ Add First Zone** del lienzo solo añade **zonas** al origen elegido, no un origen nuevo).

**Por qué (técnico):** Menos duplicación cliente/servidor, política de uso de Nominatim y límites de consulta bajo control del backend, sesión y rol verificados antes de geocodificar, y preparación para un proveedor de pago sin exponer claves en el navegador. **`LoadSidebarMap`** sigue usando **OSRM** en el cliente solo para trazar la ruta entre coordenadas ya resueltas (menos latencia y sin persistir geometrías en esta entrega).

**Decisión de producto: ¿por qué **Lane Rate Matrix**?** No venía impuesta por un ítem literal de menú en documentos Word del repo; la evolución del producto privilegia **Rate Profiles** para el modelo nuevo de tarifas. Aun así, **`LaneRateMatrixView`** sigue siendo código activo: orígenes, zonas, celdas sobre **`lane_rates`** y flujos como **Lookup from address**. Dejarlo sin ruta en el dashboard era **menos funcional**: formación y QA no podían reproducir la pantalla, soporte no podía orientar al usuario, y las guías de prueba apuntaban a una vista inexistente en la navegación. Añadir la subpestaña es una **mejora de acceso desde el menú y de operación diaria**: misma superficie de código, pero **accesible, documentable y coherente** con las pruebas en **`README_PRUEBAS.md`**. No sustituye a **Rate Profiles**; convive como herramienta legacy explícita hasta que el equipo decida retirarla o fusionar capacidades.

**Redacción de este informe:** En la primera versión del párrafo sobre la subpestaña se escribió por error **«descubribilidad»**, forma **incorrecta** en español (no es una palabra reconocida; suele confundirse con *descubrimiento* o con términos de UX como *findability* en inglés). Se **corrigió** sustituyendo la frase por **«mejora de acceso desde el menú y de operación diaria»**, que describe con precisión el beneficio (encontrar la pantalla en el dashboard y usarla en el día a día) **sin** ambigüedad ni errores ortográficos, para que el reporte sirva como referencia clara para el equipo y lectores no técnicos.

**Supabase:** sin cambios de esquema ni políticas RLS para este bloque.

**Cómo verlo en el TMS:** son **dos pantallas distintas**; en ambas la geocodificación debe ir solo a **`POST /api/geocoding/forward`** (no a Nominatim desde el navegador). Abre **F12** → **Network** → filtro **Fetch/XHR** antes de actuar.

1. **Matriz de tarifas por carril (modal de origen)**  
   - Entra por la barra lateral a **Drivers**.  
   - En la **primera** fila de pestañas de esa página, elige **Driver Pay Rates** (no confundir con *Driver Profiles*).  
   - En la **segunda** fila de pestañas (debajo), elige **Lane Rate Matrix**.  
   - Abre el modal de alta de origen: **Create Origin** (lista vacía de orígenes), o **+** con *tooltip* **Add Origin** a la derecha de las subpestañas (**no** confundir con **+ Add First Zone**, que es solo para la primera **zona** del origen seleccionado).  
   - Rellena dirección/ciudad/estado. Junto a la etiqueta **COORDINATES**, a la **derecha**, usa el enlace pequeño naranja **Lookup from address** (lupa); no el botón **+ Create Origin** del pie, que solo guarda el origen.  
   - **Qué esperar en Network:** un **`POST /api/geocoding/forward`** cuyo cuerpo incluye `"mode":"single"` (una búsqueda por el texto que armó el formulario).

   **Datos de ejemplo para probar Lookup from address:** si usas texto inventado o genérico (p. ej. *Street adress*), Nominatim a menudo **no** devuelve hit y verás en rojo *No results found — try a more specific address*; es el comportamiento esperado del servidor, no un fallo de la API. Usa **dirección o ciudad reales en EE. UU.**. Copia de prueba reproducible (ajusta nombre/código si ya existen en tu BD):

   - **ORIGIN NAME** (obligatorio en la UI) — `QA Port Houston lookup`  
   - **CODE** (obligatorio) — `QAPHOU` (u otro código único en tu entorno)  
   - **Address** — `1000 Clinton Dr`  
   - **City** — `Houston`  
   - **State** — `TX`  
   - **ZIP Code** — `77029`  

   Pulsa **Lookup from address**: deberían rellenarse **Latitude** y **Longitude** con valores coherentes (área Houston). **Alternativa mínima:** deja **Address** vacío, solo **City** `Houston`, **State** `TX`, **ZIP** `77002`, y vuelve a **Lookup from address**.

2. **Dispatcher — mapa de la carga (barra lateral)**  
   - Entra a **Dispatcher** y abre el **detalle** de una carga que tenga texto en pickup/delivery (y return si aplica).  
   - En el panel lateral, localiza la sección **Route** y espera a que el mapa termine de cargar.  
   - **Qué esperar en Network:** uno o más **`POST /api/geocoding/forward`** con **`"mode":"address_fallbacks"`** (cada parada de ruta; los reintentos de dirección ocurren en el servidor). Pueden aparecer además peticiones a **OSRM** (`router.project-osrm.org`) para dibujar la ruta; eso es normal y distinto de Nominatim.

**Comprobación rápida:** en **Network**, filtra por `nominatim`: **no** debe haber llamadas del navegador a `nominatim.openstreetmap.org`. Pasos numerados y casos límite: **`README_PRUEBAS.md`** → **Tarea 10**.

### Dual transactions (Tarea 11) — ahorro estimado por distancia (cerrado en código)

**Qué:** Se sustituyó el multiplicador fijo (**~USD 150 por par**) por un **estimado por millas vacías evitadas**: geocodificación **US** (Nominatim en servidor, misma política que orígenes) sobre cadenas `delivery_location` / `return_location` / `pickup_location`, distancia **Haversine** entre el punto del **return** del import y el **pickup** del export (tramo de reposicionamiento vacío que el dual evita cuando el par es compatible), `savedMiles = max(0, dist)` y **`estimatedSavingsUsd = round(savedMiles × costPerMile, 2)`** con **`DUAL_EMPTY_SAVED_COST_PER_MILE_USD = 2`** en `lib/dual-transaction-savings.ts` (ajustable en código). **Compatibilidad de par** alineada en UI y API: mismo **SSL**, misma **categoría de tamaño** de contenedor y **`return_location` = `pickup_location`**.

**Archivos / rutas:** `lib/geo/haversine.ts`, `lib/dual-transaction-savings.ts`, `lib/dual-transaction-resolve-server.ts`, `lib/dual-transaction-load-adapter.ts`, **`POST /api/dispatcher/dual-transactions/resolve-locations`** (lote de direcciones; hoy la pantalla pública **no** lo dispara desde el navegador), **`GET /api/dispatcher/dual-transactions`** (`potentialMatches` con `estimatedSavings`, `estimatedSavedMiles`, resumen ampliado), **`POST /api/dispatcher/dual-transactions/match`**, **`DualTransactionsTab`** (código con **Est. Savings** / **Recommend Duals** / `resolve-locations` en cliente, **no montado en ninguna ruta**; ver **`DispatcherPageTabs`** sin uso), **`app/dashboard/dispatcher/dual-transactions/page.tsx`** + **`DualTransactionsView`** (única UI dual montada: tarjetas RETURNS / PICK UPS / POTENTIAL MATCHES; geocodificación en servidor al cargar la página).

**Por qué:** El plan de producto pide que el ahorro refleje **distancia** y quede explícito como **estimación**; el servidor centraliza geocodificación y la UI muestra **$/mi** en la leyenda de ahorro.

**Inconsistencias corregidas**

- **`GET /api/dispatcher/dual-transactions`:** antes solo cotejaba **SSL** y **`container_size`** en bruto; ahora usa el **mismo criterio que la pestaña** **Dual Transactions** del dispatcher: **terminal de retiro = pickup** (`return_location` del import = `pickup_location` del export) y **categoría de tamaño** de contenedor (p. ej. 40' ST vs HC), además del SSL alineado con `dualPairCompatible`.
- **Página dedicada** **`/dashboard/dispatcher/dual-transactions`:** antes el ahorro en pares potenciales era un **valor aleatorio** (`Math.random`); ahora el cálculo es el **mismo enfoque por distancia / geocodificación** que el resto del flujo dual (API + pestaña), sin placeholder.

**Cómo probar (smoke)**

En el código desplegable hoy, la **única** pantalla **Dual Transactions** accesible es **`/dashboard/dispatcher/dual-transactions`** (pestaña del layout dispatcher junto a Street Turns, etc.). Muestra **RETURNS**, **PICK UPS**, **POTENTIAL MATCHES**, el aviso de *linking under development* y filtros; **no** muestra **Est. Savings**, **Potential** (totales de ahorro) ni **Recommend Duals** — esa UI existe en **`DualTransactionsTab`** pero **`DispatcherPageTabs` no está enlazado a ninguna página**, así que **no hay ruta real** para el smoke “clic en pestaña + barra de ahorro”.

**Smoke acotado (lo que sí se puede verificar ahora):**

1. **`/dashboard/dispatcher/dual-transactions`:** contadores y listas coherentes al filtrar; **POTENTIAL MATCHES** según criterio (SSL, categoría de tamaño, terminal); si hay filas de pares potenciales con importe, debe ser **estable** entre recargas (misma data), no aleatorio. El banner amarillo es esperado hasta cerrar enlazado completo (ver **Tarea 23** en `TAREAS_TRELLO.md`).

2. **API (recomendado para Tarea 11):** **`GET /api/dispatcher/dual-transactions`** y **`POST /api/dispatcher/dual-transactions/match`**; opcional **`POST …/resolve-locations`** con herramienta externa o cuando la UI lo exponga de nuevo.

**No documentar** como pasos de prueba en producto la combinación “`/dashboard/dispatcher` + pestaña Dual Transactions + Est. Savings” hasta que **`DispatcherPageTabs`** se integre o **`DualTransactionsView`** incorpore esa barra (**Tarea 23**).

**SUPABASE SIN CAMBIOS.**

---

## 2026-04-23

### Terminales dinámicas — Tarea 13 (Fase 1.2)

**Qué:** Se añadió **`GET /api/terminals`** (sesión requerida, respuesta cacheada de forma privada y **`revalidate`** 120 s en la ruta) para centralizar la lectura del catálogo. Se amplió **`lib/terminals/phTerminalFilters.ts`**: además de **BCT**/**BAY** por nombre, se admite código explícito al final del nombre de la fila en **`terminals`** con el patrón `Nombre (COD)`; helper **`mergePhTerminalOptionsForLoadRows`** para unir catálogo y códigos **`containers.vessels.terminal`** en dual/street-turns. La página **Vessels** dejó de asumir solo dos tarjetas fijas: las tarjetas y el mapa se reorganizan en bloque (tarjetas dinámicas + mapa). **`DualTransactionsTab`** carga el catálogo vía API, muestra carga/error en chips y filtra pickups con **`loadMatchesPhTerminalFilter`** como **`DualTransactionsView`**. Las consultas de **dual-transactions** y **street-turns** incluyen **`vessels`** bajo **`containers`** donde hacía falta para la fusión de códigos.

**Por qué:** Nuevas filas en **`terminals`** o nuevos códigos de sincronización en **vessels** deben reflejarse en filtros y vistas sin redeploy por constantes **BCT**/**BAY**; un único criterio de matching reduce inconsistencias entre tablas, dual transactions y street turns.

**Mejora:** Operación y QA pueden validar terminales desde datos reales; menos riesgo de opciones de filtro desalineadas con la API de dual transactions; inspección de red documentada para **`/api/terminals`**.

**Supabase:** **SUPABASE no requiere cambios** (se reutiliza la tabla **`terminals`** y RLS existente). Para códigos nuevos no inferibles por nombre, convención recomendada: nombre con sufijo **`(COD)`** acorde a **`vessels.terminal`**.

**Pruebas:** Ver **`README_PRUEBAS.md`** → **Tarea 13**.

### Asignación con holds — Tarea 14

**Qué:** **`POST /api/dispatcher/loads/[id]/assign-driver`** ahora usa **`getActiveHoldKeys`** sobre la fila de **`loads`** (mismas columnas de holds que en **`PATCH …/status`**). Si hay holds activos y el usuario **no** es **admin**, la API responde **403** con **`code: "ACTIVE_HOLDS"`** y la lista **`activeHolds`**. En **`LoadDetailPanel`**, **`LoadsTable`** y **`PlannerView`**, la asignación y reasignación quedan deshabilitadas para **dispatcher** cuando hay holds, con *tooltip* y manejo del error **`ACTIVE_HOLDS`** en la respuesta.

**Por qué:** Cerrar la brecha documentada en la **Tarea 5**: antes se podía pasar una carga a **Assigned** vía asignación ignorando holds; el Handoff y el plan de pruebas exigen no avanzar el flujo con holds operativos salvo override de **admin**.

**Mejora:** Una sola regla de negocio en servidor y reflejo en UI; menos confusiones operativas y mismos códigos HTTP que en cambio de estado.

**Supabase:** **SUPABASE no requiere cambios.**

**Pruebas:** Ver **`README_PRUEBAS.md`** → **Tarea 14**.

---

## 2026-04-28

### Tests críticos + CI en PR — Tarea 15

**Qué:** Se configuró la base de pruebas con **Jest + React Testing Library** (config en **`jest.config.mjs`** únicamente — no usar `jest.config.ts`, que en CI exige `ts-node`), `setupTests.ts`, scripts de test en `package.json`, y tres pruebas críticas: `lib/pay-calculator.test.ts`, `app/api/dispatcher/loads/[id]/status/route.test.ts` y `lib/port-houston/sync.test.ts`. Además, se creó el workflow **`.github/workflows/ci.yml`** para ejecutar `npm ci`, `npm run lint`, `npx tsc --noEmit` y `npm test` en PR/push.

**Error detectado (Load Board):** al abrir **Dispatcher → Load Board** aparecía en runtime `AbortError: signal is aborted without reason` (chunk dev en `.next`). El fallo venía del `useEffect` en `app/dashboard/dispatcher/layout.tsx` que consulta badges con Supabase (`Street Turns` / `Problem Containers`) sin protección ante abortos de navegación/unmount en entorno dev.

**Corrección aplicada:** se endureció `app/dashboard/dispatcher/layout.tsx` con `try/catch`, detección explícita de abortos (`AbortError` / mensaje `signal is aborted`), y guardia `cancelled` para evitar `setState` tras desmontaje. También se aplicó el mismo patrón defensivo en `lib/auth/useUserRole.ts` para la carga de sesión/rol en cliente. Los abortos esperados ya no rompen la vista; solo errores reales se reportan por consola.

**Error detectado (PATCH 400 al activar holds):** al guardar desde **Load Detail → Load Info → Container Visibility**, la consola mostraba `[LoadDetailPanel] PATCH failed: 400 {}`.

**Causa raíz:** `carrier_hold` se enviaba como boolean (`true/false`, por checkbox de UI), pero en `updateLoadSchema` se validaba como enum de texto (`none/hold/released`), provocando rechazo de validación y respuesta 400.

**Corrección aplicada (PATCH):**

- `lib/validations/schemas.ts`: `carrier_hold` pasó a `z.boolean().optional().nullable()` para alinearse con la UI y el modelo en `loads`.
- `components/dispatcher/LoadDetailPanel.tsx`: mejora de logging en `handleSave` para mostrar `status`, `statusText`, `error` y `details` (en lugar de `{}`), facilitando soporte y diagnóstico.

**Por qué:** El Handoff exige cobertura mínima en cálculo de pago, transición de cargas y sync de Port Houston, y también pipeline automático en PR para evitar regresiones antes de merge.

**Mejora:** Se reduce riesgo de romper lógica crítica sin detectar, el repositorio queda con validación continua reproducible en local y en CI, y la navegación a **Load Board** queda estable frente a abortos esperados durante cambios de ruta.

**Supabase:** **SUPABASE no requiere cambios** para esta tarea (sin migraciones, sin ajustes de RLS, sin cambios de esquema).

**Pruebas:** Ver **`README_PRUEBAS.md`** → **Tarea 15**.

### E2E navegador (Playwright) — Tarea 16

**Qué:** Se implementó infraestructura E2E con Playwright (`playwright.config.ts`, carpeta `e2e/` y test `e2e/dispatcher-loadboard.spec.ts`) y scripts en `package.json` (`test:e2e`, `test:e2e:headed`). El flujo automatizado cubre: login en `/login`, navegación a `/dashboard/dispatcher` (load board) y smoke de `/dashboard/vessels` validando encabezado y control de sync **Sync Now**. Además, CI (`.github/workflows/ci.yml`) ahora instala navegador Chromium de Playwright y ejecuta `npm run test:e2e` después de lint/tsc/jest.

**Por qué:** La Tarea 16 exige al menos un flujo E2E reproducible localmente y documentado. Se priorizó un smoke estable que valide navegación crítica de dispatcher y disponibilidad operativa de Port Houston desde la vista de vessels, sin reemplazar pruebas unitarias.

**Mejora:** Queda cobertura E2E ejecutable en local y CI para detectar regresiones de autenticación y rutas críticas de operación. Se incluyó mecanismo seguro para ambientes sin credenciales E2E: si faltan `E2E_USER_EMAIL` / `E2E_USER_PASSWORD`, los tests se marcan **skipped** en lugar de fallar por configuración.

**Bugs detectados en la implementación:** no se detectaron bugs funcionales nuevos durante Tarea 16. Ajuste aplicado de robustez: control explícito de credenciales ausentes para evitar falsos negativos en CI.

**Supabase:** **SUPABASE no requiere cambios** para esta tarea (sin migraciones, sin cambios de RLS/esquema).

**Pruebas:** Ver **`README_PRUEBAS.md`** → **Tarea 16**.

---

## 2026-04-29

### UX: errores, loading y exports CSV coherentes — Tarea 17

**Qué:** Se endureció el flujo de exportación CSV de **Accounts Payable → Settlements** en cliente y servidor. En `components/accounts-payable/SettlementsView.tsx` ahora los botones **Pay Breakdown CSV** y **Deductions CSV** usan un patrón unificado de estado (`csvDownloadType` + `csvError`): muestran *loading* con spinner mientras descarga, bloquean clics duplicados y presentan error visible en pantalla cuando la API falla. Además, la UI valida rol con `useUserRole`: solo **admin** y **finance** pueden exportar, con `title` explicativo cuando no hay permiso.

**Qué (API):** En `app/api/accounts-payable/settlements/csv/route.ts` la exportación dejó de ser “solo autenticado” y pasó a permisos explícitos por rol (**admin/finance**), con respuestas HTTP claras (**401**, **403**, **400** por parámetros faltantes o tipo inválido). También se reforzó la generación CSV: escape correcto de comillas/saltos, sanitización de celdas que inician con `=`, `+`, `-`, `@` para evitar ejecución de fórmulas en Excel, y `Cache-Control: no-store`.

**Por qué:** La Tarea 17 pide coherencia de UX en errores/loading y cobertura de exportes con permisos correctos en vistas prioritarias. Antes, fallos de red o permisos en CSV podían quedar silenciosos en consola y el endpoint no restringía por rol financiero.

**Mejora:** Exportes de settlements más confiables y auditables para operación financiera, con feedback inmediato al usuario y menor riesgo de descargar CSV inválidos o potencialmente peligrosos al abrirlos en Excel.

**Supabase:** **SUPABASE no requiere cambios** (sin migraciones, sin ajustes de RLS/esquema).

**Pruebas:** Ver **`README_PRUEBAS.md`** → **Tarea 17** (pasos numerados; no duplicar aquí el mismo bloque).

---

### Email: mapa de eventos y endurecimiento — Tarea 18

**Qué:** Inventario y endurecimiento del envío operativo por **Resend**: cliente compartido **`lib/email/resendClient.ts`** (`getResend`, `DEFAULT_FROM`, **`sendResendEmailWithRetry`** con hasta 3 intentos y backoff corto ante errores típicamente transitorios: rate limit, timeout, 502/503/504). **`lib/email/sendTemplateEmail.ts`** deja de duplicar el cliente Resend y usa ese helper; mensajes de configuración ya no citan un proveedor de hosting concreto. **`POST /api/accounts-payable/settlements/email`** usa el mismo cliente y reintentos en lugar de un segundo `getResend` local.

**Flujo crítico (settlement finalizado):** en **`PATCH /api/accounts-payable/settlements/[id]`** al pasar a **Finalized**, el envío de **`settlement_ready`** pasó de *fire-and-forget* a **`await sendTemplateEmail`** con registro en **`activity_log`**: `settlement_finalized_email_sent`, `settlement_finalized_email_failed`, o `settlement_finalized_email_skipped_inactive_template` si la fila en **`email_templates`** está inactiva. Las variables enviadas al template incluyen **`settlement_period`** y **`total_amount`** alineadas con la plantilla sembrada en migración (`20260302_notification_settings_and_email_templates.txt`), además de `settlement_number`, `period_start`, `period_end`, `net_pay` para plantillas personalizadas.

**Mapa evento → correo (síncrono vs plantilla):**

| Disparador | Superficie | Entrega | Plantilla / origen |
|------------|------------|---------|---------------------|
| Alta usuario staff | `POST /api/admin/users` | Síncrono en request (sin cola); fallo solo en log | `email_templates.template_key = staff_welcome` vía `sendTemplateEmail` |
| Alta usuario portal | `POST /api/admin/portal-users` | Igual | `portal_welcome` |
| Cambio de estado de carga (si hay email de cliente) | `PATCH /api/dispatcher/loads/[id]/status` | *Fire-and-forget* + `.catch` en log | `load_status_update` |
| Settlement **Finalizado** | `PATCH …/settlements/[id]` | Síncrono + `activity_log` | `settlement_ready` |
| Email manual settlement (UI modal) | `POST /api/accounts-payable/settlements/email` | Síncrono + `activity_log` `email_sent` | HTML inline (no fila `email_templates`) |
| Prueba / envío admin | `POST /api/admin/email-templates/send` | Síncrono + `activity_log` | Cualquier `template_key` existente |

**Cola:** no hay cola de trabajos en aplicación; todo es **HTTP síncrono** en la ruta que dispara el envío (o *fire-and-forget* donde ya existía). Reintentos = solo **Resend** en el mismo request, acotados.

**Por qué:** Tarea 18 pide trazabilidad, un solo sitio para Resend, y manejo explícito de fallos en el flujo crítico de settlement; además reduce duplicación y mensajes de error inconsistentes.

**Supabase:** **SUPABASE no requiere cambios** (se usan `email_templates` y `activity_log` ya definidos; sin migraciones nuevas en esta tarea).

**Pruebas:** Ver **`README_PRUEBAS.md`** → **Tarea 18**.

### Finanzas web: facturación A/R por lotes y cierre A/P settlements — Tarea 19

**Qué:** **Batch A/R:** nuevo endpoint **`GET/POST /api/accounts-receivable/invoices/batch`** (roles **admin**, **accounting**, **finance**). El GET agrupa facturas **`Approved`**, sin pagos aplicados y cuyo número no sea cabecera `BATCH-*`, por **`customer_id`** y devuelve vista previa. El POST crea por grupo una factura cabecera **`Billed`** con importe sumado, **`charge_set_number`** común y **`activity_log`** `batch_consolidated`; las líneas originales pasan a **`Consolidated`** y comparten el mismo charge set para trazabilidad. En **`BillingView`** hay bloque “Batch customer invoicing” con modal de preview y confirmación. **Cobros:** **`POST /api/accounts-receivable/payments`** rechaza aplicaciones a facturas **`Consolidated`** (hay que cobrar la factura batch padre). **Aging / dashboard:** consultas que alimentan saldos abiertos excluyen también **`Consolidated`** (páginas aging, API aging, widget dashboard, **`ArAgingModule`**).

**Qué (A/P):** **`GET /api/accounts-payable/settlements/generate`** previsualiza conductoras, líneas de **`ap_driver_pay`** y netos sin persistir. **`POST`** alinea permisos con **admin / accounting / finance**; respuesta **400** con código **`NO_UNSETTLED_PAY`** cuando no hay líneas elegibles; ante fallo al enlazar **`ap_driver_pay`** se elimina el settlement creado; ante fallo al enlazar deducciones se restaura **`ap_driver_pay`** con los **`status`** previos y se elimina el settlement. **`SettlementsView`:** botón **Generate settlements** (preview modal + confirmación), mensajes de error en **Review/Finalize**, y export CSV alineado con API (**accounting** incluido). **`PATCH /api/accounts-payable/settlements/[id]`** permite también rol **finance**. La página **`/dashboard/accounts-payable/settlements`** admite **accounting**.

**Por qué:** La Tarea 19 cierra batch invoicing por cliente y el flujo E2E de generación de settlements con permisos coherentes, mensajes HTTP claros, rollback parcial y UI de preview, alineado con Testing Plan (fases facturación / settlements) y con **`ap_driver_pay`** en estado **Settled** tras generar.

**Supabase:** **SUPABASE no requiere cambios** en migraciones añadidas en este repo para esta tarea. El batch usa **`charge_set_number`** y valores de **`billing_status`** (`Consolidated`, `Billed`) sobre el esquema existente de **`ar_invoices`**, como ya asume la UI de Billing.

**Pruebas:** Ver **`README_PRUEBAS.md`** → **Tarea 19**.

---

## 2026-04-30

### Realtime y centro de notificaciones — Tarea 20

**Qué:** Se implementó invalidación **Realtime** en superficies críticas para staff. Nuevo hook **`hooks/useRealtimeRefresh.ts`** escucha cambios en tablas clave (`loads`, `containers`, `vessels`, `activity_log`) con **debounce** y reconexión graceful ante `CHANNEL_ERROR`/`TIMED_OUT`/`CLOSED`. Se integró en **`DashboardClient`** y **`DispatcherClient`** para refrescar datos del servidor con `router.refresh()` sin recargar manualmente la página.

**Qué (notificaciones):** Se creó centro de notificaciones/historial para operación en **`/dashboard/notifications`** con feed de `activity_log` vía **`GET /api/notifications`** (roles `admin`, `dispatcher`, `accounting`, `finance`) y actualización en vivo por inserciones nuevas de `activity_log`. En layout se añadió acceso dedicado en navegación + campana de notificaciones en header.

**Qué (campana):** **`NotificationBell`** pasó a usar settings de **`notification_settings`** (`demurrage_alerts`, `unassigned_load_alerts`, `vessel_arrival_alerts`) para umbrales y comportamiento. Además ahora se actualiza por Realtime (loads/containers/vessels), muestra estado de salud del canal (“Realtime active” / “reconnecting fallback”) y enlaza al Notification Center.

**Por qué:** La Tarea 20 exige realtime en listas/tableros relevantes y un centro de notificaciones con historial operativo. Con esta implementación se evita desalineación entre sesiones (staff), se centraliza trazabilidad en una vista dedicada y se mantiene degradación controlada cuando Realtime falla.

**Verificación técnica:** `npm run lint`, `npx tsc --noEmit`, `npm test` en alcance de cambios.

**Supabase:** **SUPABASE no requiere cambios** (sin migraciones nuevas para esta tarea; se reutiliza `notification_settings`, `activity_log` y publicación Realtime existente para `loads`).

**Pruebas:** Ver **`README_PRUEBAS.md`** → **Tarea 20**.

---

### Import CSV genérico (conductores / grupos) y reportes — Tarea 21

**Qué (4.3):** Import staff con **PapaParse** en cliente, validación **Zod** en **`lib/csv-import/staff-schemas.ts`**, y **upsert transaccional** en Postgres vía RPC **`import_drivers_csv_transaction`** e **`import_driver_groups_csv_transaction`** (una sola transacción por petición; error en una fila revierte todo). API **`POST /api/admin/csv-import`** (roles **admin** / **dispatcher**); descarga de plantillas **`GET /api/admin/csv-template/drivers`** y **`…/driver_groups`** leyendo **`docs/csv_templates/*.csv`**. UI: **Import CSV** en **`DriverTable`** (pestaña **Driver Profiles**) y en **Drivers → Driver Pay Rates → Driver Groups**.

**Qué (4.4):** Índices para consultas de reportes y aging: **`idx_loads_created_at_desc`**, **`idx_ar_invoices_created_at_desc`**, **`idx_ar_invoices_open_status`** (parcial sobre facturas no cerradas).

**Por qué:** Extender imports más allá de PortPro con datos maestros validados y trazabilidad en **`activity_log`**; reducir tiempo de respuesta en vistas que filtran por **created_at** y facturas abiertas.

**Supabase:** hay que **ejecutar** el SQL de **`supabase/migrations/20260430_csv_import_staff_and_report_indexes.sql`** en el proyecto (staging primero). Sin las funciones RPC, **`POST /api/admin/csv-import`** fallará; sin los índices, los reportes siguen funcionando pero con menos ayuda al planificador.

**Pruebas:** Ver **`README_PRUEBAS.md`** → **Tarea 21**.

---

### Operación, seguridad y QA final — Tarea 22

**Qué:** Revisión documentada de **RLS** y superficies sensibles (finanzas, cargas, Phase 9 portal/documentos) en **`docs/RLS_SECURITY_REVIEW_T22.md`**. Aclaraciones de **cron Port Houston** y **`maxDuration`** en comentarios de **`app/api/port-houston/rotate/route.ts`** (Vercel vs **Netlify**, `CRON_SECRET`). Sección **6.1** en **`README_STEPS_NEXTS.md`** con Phase 9 del Testing Plan y backlog explícito.

**Por qué:** Cerrar la tarjeta de operación/seguridad con un punto de referencia para QA y soporte sin ampliar el alcance funcional más allá de lo ya entregado en web.

**Supabase:** **SUPABASE NO REQUIERE CAMBIOS** en esta tarea (solo documentación y comentarios de operación). El import CSV de la **Tarea 21** sigue dependiendo de su migración SQL si aún no se aplicó en el proyecto.

**Pruebas:** Ver **`README_PRUEBAS.md`** → **Tarea 22**.

---

## 2026-05-05

### Dual Transactions — barra de ahorro, resolve-locations y enlace real (Tarea 23)

**Qué:** En **`/dashboard/dispatcher/dual-transactions`**, **`DualTransactionsView`** ahora incluye la barra **Est. Savings** / **Potential** (leyenda Haversine y **$/mi**), botón **Recommend Duals** (ranking de pares por USD), resaltado de filas recomendadas y llamadas **`POST /api/dispatcher/dual-transactions/resolve-locations`** cuando cambian los listados filtrados (returns / pick ups). Se eliminó el mensaje de “linking under development”; el botón **Link** llama **`POST /api/dispatcher/dual-transactions/match`**, persiste **`street_turn_match_id`** en ambas cargas y hace **`router.refresh()`**. Constantes compartidas en **`lib/dual-transactions-board-constants.ts`** alinean estados elegibles del tablero con la validación del **match** (import: estados de retorno del board; export: **Available** / **Available At Port**; rechazo si ya hay match; comparación de estado **case-insensitive**). La página **`dual-transactions/page.tsx`** usa esas mismas constantes en las consultas Supabase.

**Por qué:** Cerrar la Tarea 23: una ruta real de producto para el smoke “filtros → totales → Recommend Duals → Network **resolve-locations**” y enlace usable coherente con el modelo **`loads`**.

**Supabase:** **SUPABASE no requiere cambios** (solo actualización de filas existentes **`street_turn_match_id`** vía API).

**Pruebas:** Ver **`README_PRUEBAS.md`** → **Tarea 23**.

---

### Migraciones Supabase — Tareas 20, 21 y 22 (operación): qué tocan y para qué sirven

Hay **dos archivos** en orden lógico: primero la base de **T21** (RPC + índices), luego el refuerzo **T20/T21** y la nota de **T22**.

#### `20260430_csv_import_staff_and_report_indexes.sql` (Tarea 21 — núcleo)

**Qué agrega o modifica**

- **Índices** (solo lectura/escritura de metadatos en Postgres; no cambian reglas de negocio en la app):
  - **`idx_loads_created_at_desc`** sobre **`loads(created_at DESC)`** — acota coste de informes y listados que ordenan o filtran por fecha de creación de cargas.
  - **`idx_ar_invoices_created_at_desc`** sobre **`ar_invoices(created_at DESC)`** — mismo criterio para facturas A/R.
  - **`idx_ar_invoices_open_status`** parcial sobre facturas con estado “abierto” (excluye **Paid** / **Cancelled** / **Write-off**) — ayuda a aging, dashboards y consultas de saldo pendiente sin escanear toda la tabla.
- **Funciones RPC transaccionales** (**`SECURITY DEFINER`**, **`search_path = public`**):
  - **`import_drivers_csv_transaction(p_rows jsonb)`** — upsert masivo de **`drivers`** en **una sola transacción**; un error en una fila revierte todo el lote.
  - **`import_driver_groups_csv_transaction(p_rows jsonb)`** — igual para **`driver_groups`** (incluye **`rate_profile_id`** cuando viene en el JSON; el API puede resolver nombre de perfil antes de llamar).
- **Permisos:** **`REVOKE`** al **`PUBLIC`** y **`GRANT EXECUTE`** solo a **`service_role`** — coherente con **`POST /api/admin/csv-import`**, que usa cliente admin y no expone la RPC al anon.

**Beneficio operativo**

- Import CSV de staff **predecible y atómico** (sin medias tablas en error).
- Reportes y vistas financieras que pegan a **`loads` / `ar_invoices`** por fechas o estados abiertos **con menos carga** en el motor (menos timeouts en entornos con mucho histórico).

#### `20260505_task20_realtime_task21_indexes_task22_note.sql` (T20 refuerzo + T21 red de seguridad + puntero T22)

**Qué agrega o modifica**

- **T20 (Realtime):** por cada tabla **`loads`**, **`containers`**, **`vessels`**, **`activity_log`**, si **no** figura ya en la publicación **`supabase_realtime`**, ejecuta **`ALTER PUBLICATION supabase_realtime ADD TABLE ...`**. Es **idempotente** (no falla si ya estaba). Si el proyecto no es Supabase estándar y no existe esa publicación, solo **NOTICE** y sigue.
- **T21 (red de seguridad):** repite los **tres `CREATE INDEX IF NOT EXISTS`** con la **misma definición** que el `20260430` — útil si en algún entorno corrieron migraciones a medias y faltaban índices pero no se quiere re-ejecutar el archivo grande.
- **Comprobación ligera:** bloque **`DO`** que emite **NOTICE** si faltan las RPC del `20260430` (no altera datos; orienta a aplicar el archivo anterior completo).
- **T22:** no introduce políticas RLS nuevas; la revisión de seguridad y Phase 9 sigue documentada en **`docs/RLS_SECURITY_REVIEW_T22.md`**.

**Beneficio operativo**

- **`useRealtimeRefresh`** y suscripciones **`postgres_changes`** pueden **disparar refresco** del tablero, listas y centro de notificaciones cuando cambian filas en esas tablas (sin depender solo de polling).
- Menos sorpresas en despliegues donde **Realtime** nunca se habilitó en publicación aunque el código ya existiera.

**Orden recomendado en Supabase:** (1) **`20260430_...`** si el proyecto usa import CSV o nunca se aplicó; (2) **`20260505_...`**. Si tras (2) el log muestra **NOTICE** de RPC ausentes, aplicar o re-aplicar (1).

**Supabase:** ejecutar en **staging** antes que producción; mismo flujo habitual del equipo (**SQL Editor**, **`supabase db push`**, etc.).

**Pruebas:** **`README_PRUEBAS.md`** → **Tarea 20** (Realtime), **Tarea 21** (import / reportes), **Tarea 22** (checklist).

---

## 2026-05-06

### Exportación CSV: delimitador regional para Excel (Tarea 24)

**Qué:** Se mejoró `lib/exportCSV.ts` para soportar delimitador configurable (`","` o `";"`), escape correcto basado en el delimitador activo y detección regional por idioma del navegador (`es*` / `pt*` -> `;`, resto -> `,`). Además, la exportación incluye la primera línea `sep=<delimitador>` para que Excel abra el archivo directamente en columnas con la configuración regional esperada.

**Por qué:** En equipos con Excel configurado para usar `;` como separador de listas, los CSV con coma se abrían en una sola columna. Con esta mejora, los exportes de tablas que ya usan `exportToCSV` (incluyendo Vessels y Containers) se separan correctamente sin pedir al usuario “Texto en columnas”.

**Supabase:** **SUPABASE no requiere cambios.**

**Cómo verlo en el TMS:** En cualquier vista que exporte con `exportToCSV` (por ejemplo **Vessels** o **Containers**), descarga el CSV y ábrelo en Excel. Si el navegador/sistema está en español o portugués, el archivo debe abrir en columnas usando `;`; en inglés, debe mantenerse `,`. En ambos casos, la fila de encabezados y los valores con comillas/saltos de línea deben conservarse correctamente.

---

### A/P deducciones — enforcement post-QA de límites (Tarea 25)

**Qué:** Se cerró la brecha de límites en deducciones de A/P con validación de servidor en tres superficies:
1) **`POST /api/accounts-payable/deductions`** ahora valida contra `driver_deduction_settings` + `deduction_templates` (match por `deduction_type` con `template.name`, case-insensitive) y rechaza montos que exceden `limit_per_period` o el remanente de `limit_total`.
2) **`PATCH /api/accounts-payable/deductions/[id]`** aplica la misma validación cuando cambia `amount` (o `deduction_type`) y además sincroniza `final_amount` cuando se actualiza `amount` sin enviar `final_amount`.
3) **`POST /api/accounts-payable/deductions/generate`** ahora aplica de forma efectiva `limit_per_period` y `limit_total` al monto generado (cap por periodo + cap por saldo remanente), evitando inserciones por encima de límites.

**Por qué:** La Tarea 25 es correctiva de Tarea 12 cuando QA detecta sobre-deducción. Antes, `POST`/`PATCH` podían persistir montos por encima del límite y `generate` tenía `limit_per_period` incompleto.

**Contrato de error (nuevo):** cuando se exceden límites, la API responde **422** con estructura estable `{ code, error, details }` usando códigos:
- `DEDUCTION_LIMIT_PER_PERIOD_EXCEEDED`
- `DEDUCTION_LIMIT_TOTAL_EXCEEDED`

**Supabase:** **SUPABASE no requiere cambios.**

**Cómo verlo en el TMS:** Desde **Accounts Payable → Deductions**, intenta crear o editar una deducción con monto mayor al permitido para ese driver/template: la UI debe recibir **422** y mostrar error de negocio (en Network se ven `code` y `details`). En generación semanal (`/api/accounts-payable/deductions/generate`), los montos nuevos deben respetar el tope por periodo y el saldo de límite total.

---

### Terminales dinámicas — corrección post-QA en filtros de Dual/Street Turns (Tarea 26)

**Qué:** Se corrigió `lib/terminals/phTerminalFilters.ts` en `loadMatchesPhTerminalFilter` para que el filtro de terminal no dependa solo de texto en `pickup_location`/`delivery_location`/`return_location` o `transit_state`. Ahora también evalúa primero coincidencia exacta con `containers.vessels.terminal` (código real del buque), que es la fuente más estable para terminales dinámicas.

**Por qué:** Había escenarios donde el catálogo de terminales mostraba códigos nuevos (por mezcla `terminals` + `vessels.terminal`), pero algunas cargas no incluían ese código en el texto de ubicación; eso provocaba falsos negativos al filtrar en **Dual Transactions** y **Street Turns**.

**Revisión de inconsistencias:** barrido de referencias a terminales fijas y validación técnica posterior al fix con `npm run lint` y `npx tsc --noEmit` sin errores.

**Supabase:** **SUPABASE no requiere cambios.**

**Cómo verlo en el TMS:** En **Dispatcher → Dual Transactions** y **Dispatcher → Street Turns**, al seleccionar un chip de terminal (incluyendo códigos añadidos por `vessels.terminal`), deben aparecer cargas cuyo `vessels.terminal` coincida aunque la dirección no contenga el nombre/código del terminal.

---

## 2026-05-07

### Cierre QA — Tarea 27 (auditoría Handoff/Testing Plan vs código + batería técnica) y enlace Street Turns

**Qué:** Se ejecutó la batería de calidad sobre el repo (`npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, `npm run test:e2e`). Se contrastó el estado del código y las tarjetas **T1–T26** con los índices del repo (**`README_PRUEBAS.md`**, **`README_STEPS_NEXTS.md`**, **`docs/RLS_SECURITY_REVIEW_T22.md`**, **`TAREAS_TRELLO.md`**). Los archivos **`TigerHawk_TMS_Technical_Handoff.docx`** y **`TigerHawk_TMS_Testing_Plan.docx`** **no están en esta copia del workspace**; el cruce literal sección por sección del Word queda **pendiente** hasta ubicarlos en la raíz del repo (junto a `package.json`) o repetir la auditoría en un entorno donde existan. Se corrigió una inconsistencia detectada en la revisión: en **`StreetTurnsView`**, el botón **Link** no invocaba **`POST /api/dispatcher/street-turns/link`** pese a que la ruta API ya existía; ahora enlaza con manejo de **Linking…**, error visible y **`router.refresh`**, y se sustituyeron los avisos de “under development” por copy operativo. Se actualizó el bloque **“Resolución en código”** de la **Tarea 11** en **`TAREAS_TRELLO.md`** para alinearlo con **`DualTransactionsView`** (barra **Est. Savings** / **Potential** / **Recommend Duals** en la ruta canónica).

**Por qué:** **T27** exige un entregable estructurado y comprobaciones sin regresiones antes del cierre; un botón de enlace sin handler frente a un API activo es una brecha clara de UX y de alineación con **T23** (street turn). Mantener **`TAREAS_TRELLO.md`** acorde al código reduce falsos “pendientes” en el cruce tarjeta ↔ implementación.

**Entregable T27 — tres listas (actualizado con este barrido)**

**1) Funcionalidad o correcciones que faltan (viñetas; referencia Word / tarjeta)**  
- Releer íntegramente **Handoff** (sección 6 *Known Issues*, sección 9 *Next Steps*, anexos) y **Testing Plan** (prerrequisitos, fases 1–10, Phase 9 portal/documentos/RLS/tamaños de archivo, etc.) cuando los archivos `.docx` estén disponibles en la raíz del repo; mapear cada ítem a **T1–T26** o marcar **gap sin tarjeta**.  
- **T23 (opcional de producto):** si se exige la pestaña **Dual Transactions** empotrada en **`/dashboard/dispatcher`**, montar **`DispatcherPageTabs`** (hoy el flujo canónico y probado está en **`/dashboard/dispatcher/dual-transactions`**).  
- Ejecutar en **staging** el checklist manual acumulado en **`README_PRUEBAS.md`** (especialmente fases que el Word del plan liste como obligatorias y no puedan sustituirse solo por pruebas locales).

**2) Errores o deuda técnica (prioridad sugerida; impacto breve)**  
- **P1 (proceso / trazabilidad):** sin los **dos Word en el repo**, no se puede **certificar** aquí el 100% del cruce documento ↔ código exigido por el enunciado literal de **T27**; riesgo: firmar cierre sin revisar secciones 6 y 9 del Handoff ni fases completas del plan.  
- **P2:** **`npm run test:e2e`** en CI y local deja los 2 smokes en **skip** si faltan **`E2E_USER_EMAIL`** y **`E2E_USER_PASSWORD`**; la pipeline no ejecuta login real hasta configurar variables (`.github/workflows/ci.yml` ya invoca Playwright).  
- **P2:** **`app/dashboard/pageV3.tsx`** contiene filas demo con terminales **BCT/BAY** fijas; no afecta vistas operativas con catálogo dinámico, pero puede confundir si se usa como referencia de datos vivos.

**3) Verificado OK (evidencia breve)**  
- **2026-05-07:** `npm run lint`, `npx tsc --noEmit`, `npm test` (**4** suites, **7** tests), `npm run build` — sin fallos en el árbol tocado.  
- **`npm run test:e2e`:** **2** pruebas **omitidas** por diseño sin credenciales; no se reportan fallos de ejecución.  
- Rutas **dual** y **street-turns/link** coherentes; **`DualTransactionsView`** con barra de ahorro y enlace vía **`POST …/dual-transactions/match`**; **`StreetTurnsView`** con **Link** → **`POST /api/dispatcher/street-turns/link`** tras el cierre de brecha.  
- **T24–T26** y **T22** RLS/realtime documentados en entradas previas de este archivo y en **`README_PRUEBAS.md`**.

**Firma / equivalente de ticket (QA):** Auditoría técnica y listas anteriores completadas en código en **2026-05-07**. **Actualización:** la **declaración formal de cierre** acordada con el cliente queda registrada con **fecha 2026-05-08** y firma del desarrollador en el bloque **`## 2026-05-08`** de este archivo; da por satisfechos los pendientes priorizados en los Word y las tarjetas **T1–T27**. Lo anterior sobre “lista P0/P1” queda referido al rigor **técnico-documental** del barrido, sin oponerse al **cierre de negocio** declarado ese día.

**SUPABASE:** **SUPABASE no requiere cambios** para el fix de **Street Turns** (reutiliza columnas existentes en **`loads`**).

**Cómo verlo en el TMS:** **Dispatcher → Street Turns** — pestaña **Available**, filtrar por terminal si aplica, elegir un **Import** y un **Export** con el mismo **SSL** y **container size**; pulsar **Link**. En **Network**, **`POST /api/dispatcher/street-turns/link`** debe responder **200**; al refrescar, el par debe aparecer bajo **Linked**. Si el par no cumple reglas del servidor, la UI muestra el mensaje de error devuelto por la API.

---

## 2026-05-08

### Declaración formal de cierre — proyecto web TigerHawk TMS

**Qué:** Se deja constancia de **cierre del proyecto web** (alcance **TMS en navegador**, sin app móvil nativa) acordado entre **cliente** y **equipo de implementación**: se consideran **completadas** las tareas **`T1–T27`** descritas en **`TAREAS_TRELLO.md`** y los **pendientes que el cliente priorizó** según los documentos de referencia **`TigerHawk_TMS_Technical_Handoff.docx`** y **`TigerHawk_TMS_Testing_Plan.docx`**. Este bloque sirve como **acta breve** para soporte, continuidad y posibles ampliaciones.

**Por qué:** Un cierre explícito en este archivo evita ambigüedad sobre “qué quedó entregado” frente a versiones antiguas del Handoff o notas dispersas; centraliza la decisión de negocio de dar por fin la fase contractual/planificada para el **TMS web**.

**Alcance declarado como cerrado**

- **Tarjetas:** cumplimiento del plan **`TAREAS_TRELLO.md`** (**T1–T27**, **Semana 3–4** incluidas), en la línea ya registrada en los reportes previos de esta misma bitácora (incluida **T27** como auditoría y comprobaciones técnicas).
- **Documentos Word:** los entregables y prioridades que el **cliente** extrajo de **`TigerHawk_TMS_Technical_Handoff.docx`** y **`TigerHawk_TMS_Testing_Plan.docx`** se dan por **satisfechos** en el estado del producto acordado; cualquier nueva exigencia posterior se trata como **cambio o fase nueva**, no como deuda del mismo cierre.
- **Exclusiones y decisiones de producto documentadas aquí** (no invalidan el cierre):
  - **Lane Rate Matrix:** la subpestaña en **Drivers → Driver Pay Rates** quedó **comentada** en código (**`DriverPayRatesView.tsx`**) por **solicitud del cliente**; **`LaneRateMatrixView`** y APIs asociadas **no se eliminaron**, para reactivar sin retrabajo si cambia el criterio.
  - **App móvil nativa:** permanece **fuera del alcance** web según el propio marco de **`TAREAS_TRELLO.md`**.
- **Verificación operativa:** las pruebas manuales siguen **`README_PRUEBAS.md`** según necesidad de **staging** y soporte; el cierre formal es **de alcance y aceptación**, no sustituye el mantenimiento rutinario post-lanzamiento.

**Supabase:** sin migración adicional exigida **solo** por esta declaración; lo ya aplicado en entornos del cliente sigue siendo responsabilidad operativa habitual.

**Fecha de esta declaración:** **2026-05-08**  
**Firmado por:** **Ariel Fuentes** — Dev. Full Stack

---

*Actualizar este archivo al cierre de cada jornada con un bloque de fecha similar (orden cronológico ascendente: fechas de menor a mayor).*
