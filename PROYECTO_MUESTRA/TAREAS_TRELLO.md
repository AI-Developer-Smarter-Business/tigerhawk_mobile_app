# Tareas Trello (Tigerhawk TMS)

Tarjetas listas para copiar (título + cuerpo).

**Alcance de “proyecto terminado por completo” (obligatorio para este plan):** todo lo exigido por **`TigerHawk_TMS_Technical_Handoff.docx`** y **`TigerHawk_TMS_Testing_Plan.docx`** en el **TMS web** (Next.js + APIs + **Supabase**: esquema, RLS, datos operativos, Realtime donde aplique), con **código y migraciones** hasta cubrir esos documentos. **Queda fuera del alcance:** únicamente la **aplicación móvil nativa** (React Native / Expo / tiendas); el conductor en campo se valida con el **Driver Action Panel** y flujos web del Testing Plan. Ítems marcados como *low priority* solo en el Handoff (tema claro/oscuro, atajos de teclado, analytics extra) pueden seguir como backlog **post–cierre** si negocio no los pide.

Las **semanas 2–6** en esta hoja priorizan el cierre alineado con **`README_STEPS_NEXTS.md`** (Fases 1–4 en web), **`WORK_PLAN_PROJECT_1.docx`** / **`PLAN_DE_TRABAJO_PROYECTO_1.docx`**, y la documentación citada arriba. La **Semana 1** cubrió auditoría, especificación y barridos; a partir de la **Semana 2** predominan **implementación**, **calidad** y **finanzas E2E en web**.

**Documentos guía (.docx):** en el layout del proyecto deben estar en la **raíz** (mismo nivel que `package.json` y este archivo): **`TigerHawk_TMS_Technical_Handoff.docx`** y **`TigerHawk_TMS_Testing_Plan.docx`**. Si el workspace de Cursor abre solo una subcarpeta anidada (`…/tigerhawk-tms-main/tigerhawk-tms-main`), es posible que esos `.docx` queden en la carpeta **padre**; en ese caso abre la raíz correcta o copia los Word ahí para que el equipo y las herramientas los vean. **`README_STEPS_NEXTS.md`** resume Handoff §6 y fases de prueba; contrastar siempre con los Word para §6–§9 y el Testing Plan completo. Complemento útil: **`docs/Nonfunctional.docx`** (stubs UI) y **`docs/TigerHawk_TMS_Technical_Specification.docx`**.

**Numeración global (consecutiva):** **T1…T27** sin saltos. Tras **T14**: **Semana 3** agrupa **T15–T22** (una tras otra); **Semana 4** agrupa **T23–T27** (una tras otra). **T25**/**T26** son correctivos condicionales si QA detecta brecha frente a **T12**/**T13** (sin reescribir **1–14**). **T27** es la **auditoría final de cierre**: cruza Handoff + Testing Plan + código + esta hoja y produce el listado explícito de pendientes/errores antes de dar por cerrado el proyecto web.

**Cierre TMS (sin app móvil):** **Semana 3** y **Semana 4** listan las tareas pendientes y sus requisitos en bloques **### Tarea N** debajo de cada encabezado de semana.

---

## Validación frente a `TigerHawk_TMS_Technical_Handoff.docx` y `TigerHawk_TMS_Testing_Plan.docx`

Texto fuente revisado (feb–mar 2026 en los documentos). **Cobertura:** las tareas **T1–T27** (**Semana 3** = **15–22**, **Semana 4** = **23–27**) alinean el **TMS web completo** con Handoff §6–§9 y el Plan de pruebas, **excl. app móvil**; **25–26** condicionales; **T27** valida que no queden pendientes documentales sin cubrir en código. Las fases 1–10 del Testing Plan deben **ejecutarse en staging** además de las tarjetas.

### Handoff §6 (*Known Issues*) → tareas

| Handoff | Tarea(s) | Notas |
|---------|-----------|--------|
| **6.1** Mapas / orígenes sin coords | **8**, **9**, **10**, **1** (diseño) | Backfill + API + geocoding servidor; seguir datos sin ciudad/estado. |
| **6.2** Sin tests / sin CI | **15**, **16** | Plan recomienda Jest/RTL + Playwright; **T16** en **Semana 3** (tras **T15**). |
| **6.3** Terminales hardcode | **13** (Semana 2); **26** si QA halla brecha | Implementación planificada en **T13**; cierre en **T26** solo si falta algo. |
| **6.4** Dual savings | **11**, **23** | Handoff habla de *estimated savings* por distancia; **23** cierra UI/enlazado; comprobar **Street Turns** si aún muestra ahorro **0** (p. ej. `docs/Nonfunctional.docx`) y unificar criterio con dual. |
| **6.5** Fill down | **4** | Regresiones monitorizadas. |
| **6.6** Build SWC | Sin tarjeta | Entorno de despliegue; ver `README_ENGLISH.md` / Vercel. |

### Handoff §9 (*Recommended Next Steps*) → tareas

| Prioridad Handoff | Tema | Tarea(s) | Fuera de este repo |
|-------------------|------|-----------|---------------------|
| Alta | Tests + CI | **15** | — |
| Alta | Backfill coords | **8**, **9** | — |
| Alta | Terminales BD | **13**; **26** si aplica | — |
| Media | Dual por distancias | **11**, **23** | — |
| Media | Realtime | **20** | — |
| Media | **Driver mobile view** | — | **Excluido** (app nativa); panel web = Plan §“Simulated Driver”. |
| Media | Export en tablas | **17**, **24** | — |
| Media | Error boundaries / loading | **17** | — |
| Baja | Tema / atajos / analytics | Backlog Handoff | Opcional explícito en `README_STEPS_NEXTS` §6. |
| Baja | Email operativo | **18** | — |
| Baja | Import CSV masivo | **21** | — |

### Testing Plan (v1.1) → tareas

| Ítem / fase | Tarea(s) | Notas |
|-------------|-----------|--------|
| Prereqs **1–3** (transiciones, drivers, Driver Action Panel) | Hecho según plan; regresión **T22** | **T5**/**T14** holds alineados a “full transition blocking” recomendado. |
| Prereq **4** facturación por lotes (Phase 7) | **19** | Plan: “Must build API + UI batch”; checklist Phase 7. |
| Prereq **5** settlement rollup (Phase 8) | **19**, **12** / **25** | **T12** (Semana 2) implementa enforcement de deducciones; **T25** solo si QA detecta incumplimiento. |
| Recomendado **6** holds | **5**, **14** | |
| Recomendado **8** límites deducción | **12** / **25** | **T25** = corrección en **Semana 4** si hace falta. |
| **Phase 9** portal / documentos / RLS / 50 MB | **T22** (checklist QA) | No hay tarjeta exclusiva: añadir **pasos explícitos** en ejecución Phase 9 al cerrar **T22** o en `README_PRUEBAS.md`. |
| **Phase 10** E2E | **16**, **22** | **16** automatiza; **22** validación manual firmada. |
| Build items **4–5** “Pending A/R & A/P review” | **19** | Tras implementación, cerrar con revisión negocio. |

### Huecos o ampliaciones (tras cruce código + docs)

1. **Street Turn savings en UI:** si sigue en **0** o stub, tratar en **T23** (misma lógica que dual por distancia) o **StreetTurnsView**.  
2. **Tests “críticos” del Handoff:** calculator, **pipeline de estado**, **sync Port Houston** — criterios en **T15** (Semana 3).  
3. **Phase 9** del Testing Plan: checklist en **T22**.  
4. Brechas detectadas tras **T12**/**T13** → **T25**/**T26** (no editar tarjetas Semana 2).

**Conclusión:** **Cierre completo** TMS = **T1–T27** en web (**Semana 3:** **15–22**; **Semana 4:** **23–27**). **T22** cubre **Phase 9**; **T15**/**T16** tests + E2E; **T23** dual/street-turn. **T25**/**T26** se cierran sin trabajo si QA valida **T12**/**T13**. **T27** debe concluir con lista vacía de brechas *P0/P1* frente a Handoff + Testing Plan o con backlog explícito acordado. **Excluida** app móvil nativa. Ítems **Low** del Handoff pueden quedar fuera salvo negocio.

---

## Semana 1

**Tareas 1–7**

### Tarea 1 — Mapas y geocodificación: auditoría de datos y plan de backfill (obligatorio, primera tarea)

**Estimación:** ~4 h

**Descripción**

1. Trazabilidad de geocodificación de extremo a extremo: rutas servidor para orígenes de tarifas de conductores (Nominatim), uso en cliente en lane / zona / mapas de carga (p. ej. `LoadSidebarMap`).
2. Identifica brechas: registros sin `lat`/`lng`, sin ciudad/estado, pares inválidos e inconsistencias de `coordinate_source` si la columna existe.
3. Redacta un **plan de backfill**: orden de lotes, idempotencia, validación tras geocodificar y rollback/fallback para direcciones ambiguas o outliers de bbox.
4. Lista puntos de **retest UI** (vistas Leaflet) tras un backfill futuro; opcional: borradores de SQL o scripts como comentarios en el doc (no es obligatorio fusionar migraciones ejecutables en esta tarea).

**Criterio de hecho:** Plan escrito con consultas o criterios para encontrar filas incorrectos, procedimiento de backfill ordenado, lista de casos límite y pantallas de mapa explícitas para regresión.

---

### Tarea 2 — Terminales hardcodeadas (BCT/BAY): inventario y especificación de carga dinámica

**Estimación:** ~3 h

**Descripción**

1. Busca en el código códigos de terminal fijos y filtros (`VesselTable`, `ContainerTable`, `DualTransactionsView`, `StreetTurnsView`, APIs).
2. Compara códigos con el modelo de tabla `terminals` y `docs/INTEGRATION_GUIDE.md` (alineación Port Houston).
3. Escribe una **especificación** para carga dinámica: consulta por org, caché, UI de carga/error, tipos TypeScript y cómo aparecen filas nuevas en BD sin editar código.
4. Lista **áreas de regresión** (filtros, exportaciones, sync) para la tarjeta de implementación.

**Criterio de hecho:** Documento de especificación con referencias a archivos, criterios de aceptación y sin desajuste sin resolver entre constantes de UI y códigos de terminal en BD.


---

### Tarea 3 — Dual transactions: diseño de ahorro basado en distancia

**Estimación:** ~3 h

**Descripción**

1. Documenta la lógica actual de ahorro (p. ej. multiplicador fijo `ESTIMATED_COST_PER_TRIP`) en UI y `app/api/dispatcher/dual-transactions/`.
2. Lista campos disponibles en cargas emparejadas para calcular **distancia** (reutilizar Haversine o helpers de ruta del código de mapas de carga).
3. Propón fórmula, unidades, redondeo, copy de UI (“estimate”) y si se persisten valores (impacto API/BD).
4. Añade una **matriz de pruebas** (escenarios de pares, orden esperado de ahorros).

**Estado**
- Diseño completado en Semana 1.
- La resolución de implementación en funciones/UI/API se movió a **Semana 2 (Tarea 11)** para marcarla como trabajo de código cerrado.

**Criterio de hecho:** Nota de diseño validada en revisión propia: algoritmo claro, etiquetado en UI y checklist de implementación para la tarea de código.

---

### Tarea 4 — Rate profiles “fill down”: checklist de regresión y notas

**Estimación:** ~2 h

**Verificación frente a documentación Word (repo)**

- **`TigerHawk_TMS_Technical_Handoff.docx` §6.5 (Fill Down Edge Cases):** describe el bug histórico en el que `handleConditionUpdate` vaciaba `condition_value` al propagar `condition_type`; la corrección es hacer PATCH directo solo del campo copiado y vigilar regresiones. La **Tarea 4** sigue siendo la tarjeta correcta para checklist + endurecimiento en `RateProfilesView` y APIs bajo `app/api/drivers/pay-rates/profiles/`.
- **`TigerHawk_TMS_Testing_Plan.docx`:** no define pasos explícitos de “fill down”; menciona rate profiles de forma general en ítems diferibles. Los pasos de prueba manual de esta tarjeta cubren el hueco operativo alineado al Handoff y a `docs/RATE_SYSTEM_DESIGN.md`.

**Descripción**

1. Lee el flujo fill-down de `RateProfilesView` y rutas de edición masiva relacionadas; contrasta con `docs/RATE_SYSTEM_DESIGN.md`.
2. Construye un **script de prueba manual numerado** (pasos, entradas, celdas esperadas, comportamiento al deshacer).
3. Reproduce al menos un caso límite si es posible; captura notas o capturas.
4. Clasifica la capa de causa raíz (estado React, API, BD) para cada fallo encontrado.

**Estado:** Resuelta y documentada en código (Semana 1): checklist en observaciones + trazabilidad fill-down → `PATCH`/`POST` → `GET`, orden de helpers y depuración Network (ver bloques **Cómo está cableado…** y **Qué se cambió…**).

**Criterio de hecho:** Checklist guardada con la tarea (o en `docs/`) y enlazada desde la tarjeta; casos inestables conocidos con pasos de reproducción.

**Observaciones**

- **Pasos y rutas breves para probar fill-down / corrección**
  1. **Acceso y sesión:** Abre el TMS en el navegador, inicia sesión con un usuario **admin** o **dispatcher** (o el rol que tenga permiso para **Drivers**). **Resultado esperado:** entras al dashboard sin error de permisos.
  2. **Navegación hasta Rate Profiles:** En la barra lateral del dashboard, entra a **Drivers** (o la entrada que lleve a conductores). La URL debe ser **`http://localhost:3000/dashboard/drivers`** (o el dominio equivalente). En la fila de pestañas horizontales de esa página, haz clic en **Driver Pay Rates**. Debajo aparecerá otra fila de subpestañas: haz clic en **Rate Profiles**. **Resultado esperado:** ves la lista de perfiles de tarifa (tabla con nombres de perfiles), no la vista de grupos ni la calculadora.
  3. **Abrir el detalle de un perfil:** Haz clic en una fila de perfil (o en el botón/acción que abra ese perfil, según la UI: suele ser el nombre del perfil o **Open** / icono de edición si existe). **Resultado esperado:** se muestra la hoja tipo spreadsheet con **lanes** (filas de carril) y, dentro de cada carril, **filas de cargos** (charges) con columnas Rate, UOM, modo de cálculo, eventos, condiciones, etc. Necesitas al menos **dos filas de cargo** apiladas verticalmente en la misma columna (una arriba y otras debajo) para probar fill-down.
  4. **Fill down de Rate (tarifa):** Sitúa el puntero sobre la fila de un cargo que tenga **otra fila de cargo debajo** en la misma vista. En la columna **Rate** (número en color naranja), al pasar el ratón por la celda debe aparecer un **botón con icono de flecha hacia abajo** (fill down) junto al importe. Haz clic en esa **flecha abajo** (no hace falta cambiar el rate antes si ya hay valores distintos abajo). **Resultado esperado:** todas las filas de cargo **por debajo** de esa fila, en el orden vertical de la tabla, muestran el **mismo valor de tarifa** que la fila origen. Arriba de la tabla puede mostrarse un mensaje tipo “Filling down…” y luego “Filled N rows down”; el mensaje **desaparece solo** a los pocos segundos (~4 s). Si la fila elegida es la **última** del bloque (no hay cargos debajo), el mensaje debe indicar que **no hay nada que rellenar** (p. ej. “Nothing to fill below this row”), no quedarse colgado en “Filling down…”.
  5. **Fill down — columna Origin Event (y opcionalmente Destination Event):** En la cabecera de la tabla del perfil, la columna se llama **Origin Event** (no confundir con **From (mi)**, que son millas del carril). Pasa el ratón por una fila de cargo que tenga **otra fila de cargo debajo**; junto al selector de eventos aparece un botón con flecha abajo cuyo *tooltip* en inglés es **“Fill this origin event down to all rows below”**. Haz clic en esa flecha. Comprueba el desplegable **Pay Mode**: con **By Leg** el dato se guarda en `leg_from`; con **By Event** (u otro modo distinto de **By Leg**) se usa el campo `event`. Si quieres cubrir también el tramo de salida, usa la columna **Destination Event** y el botón con *tooltip* **“Fill this destination event down to all rows below”**. **Resultado esperado:** las filas inferiores muestran el mismo evento elegido que la fila origen; bajo **Origin Event** el texto coincide; mensajes **“Filling down…”** / **“Filled N rows down”** o **“Nothing to fill below this row”** como en el paso 4.
  6. **Fill down — columnas Addl Rule, Addl Exec, Addl Cond:** Las reglas adicionales usan tres columnas en inglés en la UI: **Addl Rule** (tipo de regla / `condition_type`), **Addl Exec** (operador) y **Addl Cond** (valor de condición). Necesitas al menos dos filas de cargo con filas inferiores y, para probar los tres campos, conviene tener **Addl Rule** ya informada en la fila origen. Con el ratón sobre la fila, junto a cada control aparece la flecha abajo con estos *tooltips* en inglés: **“Fill this rule type down to all rows below”** (Addl Rule), **“Fill this operator down to all rows below”** (Addl Exec), **“Fill this condition value down to all rows below”** (Addl Cond). Prueba **una** propagación por campo (clic en la flecha correspondiente). **Resultado esperado:** solo el campo propagado se copia hacia abajo; los otros dos campos de la misma condición en cada fila destino **no** deben borrarse solos (regresión Handoff §6.5). Mensajes de estado como en el paso 4.
  7. **Comprobación en DevTools (Network):** Abre las herramientas de desarrollador (**F12** o clic derecho → **Inspect**), pestaña **Network** / **Red**. Usa el tipo **All** o **Fetch/XHR** (si solo ves **Doc** u otros tipos, no aparecerán las llamadas `fetch` de la app). Marca **Disable cache** / **Desactivar caché** mientras DevTools está abierto. Limpia la lista (**Clear**), ejecuta un fill-down y revisa la columna **Method** / **Método**. **Resultado esperado:** primero uno o varios **`PATCH`** a **`/api/drivers/pay-rates/profiles/charges`** (Rate, **Origin Event**, **Destination Event** vía `leg_from`/`event`/`leg_to`) y/o **`PATCH`/`POST`** a **`/api/drivers/pay-rates/profiles/conditions`** (columnas **Addl Rule / Addl Exec / Addl Cond**); después **`GET`** a **`/api/drivers/pay-rates/profiles/charges?lane_id=…`** por carril afectado. Si un **`PATCH`** devuelve 401/403/500, la consola del navegador muestra un aviso `[patchChargeQuiet]` o `[handleFillDownCondition]` con el código HTTP.
- **Cómo está cableado el fill-down en código (no es solo estado local):**
  - **Rate / leg_to / campos de cargo:** `handleFillDownFrom` → `patchChargeQuiet` → **`PATCH`** `/api/drivers/pay-rates/profiles/charges` con cuerpo JSON `{ id: "<charge_uuid>", rate?: number, leg_to?: string, ... }` (solo los campos que se propaguen).
  - **Origin Event:** `handleFillDownOriginEvent` → `patchChargeQuiet` con **`leg_from`** o **`event`** según **Pay Mode** (`by_leg` → `leg_from`; si no → `event`).
  - **Condiciones:** `handleFillDownCondition` → **`PATCH`** o **`POST`** a **`/api/drivers/pay-rates/profiles/conditions`** con `{ id, condition_type? }` o cuerpo de alta según exista fila de condición.
  - Tras las mutaciones, **`fetchChargesForLane`** hace **`GET`** `.../charges?lane_id=...` para refrescar; no hay “Guardar” aparte ni debounce: el **`PATCH`/`POST`** se dispara en el mismo clic del fill-down.
- **Qué se cambió y por qué (breve)**
  - Se extrajo la construcción del body de `PATCH` de cargos (`buildChargePatchBody` + `patchChargeQuiet`) para que el fill-down de cargos no dispare un **refetch por cada fila** (solo al final por carril), reduciendo condiciones de carrera y parpadeo en edición masiva.
  - Se unificó el cierre del mensaje “Filling down…” en salidas tempranas, errores HTTP y fallos de red, evitando que el UI quede colgado en “Filling down…” sin feedback.
  - El fill-down de condiciones ya evitaba `handleConditionUpdate` (Handoff); se añadió comprobación de `res.ok` y refetch `await` por carril tras el lote.
  - **Reordenación y depuración:** `laneLabel`, `sortedLanes`, `buildChargePatchBody` y `patchChargeQuiet` se declararon **antes** de los handlers de fill-down (orden de lectura = orden de ejecución). Las mutaciones y el **GET** de refresco usan `cache: "no-store"` para evitar respuestas cacheadas engañosas en Network. Si un **`PATCH`** falla, se registra **`console.warn`** con el estado HTTP para verlo sin adivinar en la pestaña Network.
- **SUPABASE:** no se requiere cambiar datos en SUPABASE

---

### Tarea 5 — Transiciones de estado de carga vs holds activos: análisis de brechas

**Estimación:** ~3 h

**Descripción**

1. Enumera cada mutación que cambia el estado de la carga: `app/api/dispatcher/loads/[id]/status`, rutas de transición admin, cualquier otra API o server action.
2. Por cada ruta, registra el comportamiento con **hold** activo (bloqueado, permitido, código HTTP, cuerpo de error).
3. Compara con el **Testing Plan** para cargas despachadas / en tránsito.
4. Produce una **matriz**: estado × rol × hold × esperado vs real; lista discrepancias con pistas archivo:línea.

**Criterio de hecho:** Matriz completa para todas las rutas encontradas; discrepancias listadas con responsables o etiquetas de siguiente tarea.

**Estado:** Resuelta y documentada: matriz breve + observaciones (pasos de prueba y alineación Handoff / Testing Plan).

**Alineación con documentos (Handoff + Testing Plan)**

- **TigerHawk_TMS_Technical_Handoff.docx:** Las transiciones de estado no deben avanzar la carga mientras existan **holds operativos** sin liberar; se documenta una **excepción explícita para administradores** (“break-glass”) cuando haga falta forzar el flujo en soporte.
- **TigerHawk_TMS_Testing_Plan.docx:** Las pruebas de cargas en despacho / tránsito deben cubrir el caso **hold activo → intento de cambio de estado** y el mensaje/HTTP coherentes para el usuario (bloqueo + claridad).

**Matriz (rutas que mutan `loads.status` vs holds)**

| Ruta / mutación | Rol típico | Hold activo (`freight_hold`…`other_hold` = `hold`, `carrier_hold` = `true`) | Comportamiento actual | HTTP / cuerpo |
|-----------------|------------|------------------------------------------------------------------------------|------------------------|---------------|
| `PATCH /api/dispatcher/loads/[id]/status` | `dispatcher`, `driver` (asignado) | Sí | **Bloqueado** | `403` + `{ code: "ACTIVE_HOLDS", activeHolds: string[], error: "..." }` |
| Misma ruta | `admin` | Sí | **Permitido** (override) | `200` + carga actualizada |
| `POST /api/dispatcher/loads/[id]/assign-driver` | `dispatcher` | Sí | **Bloqueado** (misma política que `PATCH …/status`) | `403` + `{ code: "ACTIVE_HOLDS", activeHolds: string[], error: "..." }` |
| `POST /api/dispatcher/loads/[id]/assign-driver` | `admin` | Sí | **Permitido** (override) | `200` + carga actualizada |
| `POST /api/dispatcher/loads` (crear carga) | `admin`, `dispatcher` | N/A en creación típica | Inserta con estado inicial del formulario; no es transición de flujo con holds previos | `201` |
| Otras APIs (`shipments`, etc.) | — | — | No son el mismo modelo `loads` del dispatcher en este barrido | Ver código si se unifica modelo |

**Discrepancias / siguiente paso sugerido**

- *(Ninguna pendiente en esta matriz.)* La asignación de conductor con holds activos quedó alineada con **`PATCH …/status`** en la **Tarea 14** (`getActiveHoldKeys`, override solo **admin**).

**Observaciones**

- **Pasos para probar correcciones (API + UI)**
  1. **Preparar datos:** En una carga de prueba, pon al menos un hold en estado bloqueante: en BD o UI, `freight_hold` (u otro campo de hold) = **`hold`**, o **`carrier_hold` = true**. Comprueba que **no** cuentan como activos valores distintos de `hold` en los campos texto (p. ej. `released`).
  2. **Dispatcher / driver — bloqueo servidor:** Con sesión **dispatcher** o **driver** asignado a la carga, intenta cambiar estado vía **`PATCH /api/dispatcher/loads/<id>/status`** con body `{ "status": "<siguiente válido>" }` (Postman, DevTools → Network reproduciendo el panel, o la UI). **Esperado:** respuesta **403**, JSON con **`code: "ACTIVE_HOLDS"`** y lista **`activeHolds`**.
  3. **Admin — override:** Con sesión **admin**, mismo body sobre la misma carga con holds activos. **Esperado:** **200** y estado actualizado (comportamiento Handoff: override solo admin).
  4. **UI — botones deshabilitados:** Abre el detalle de la carga en el dispatcher (`LoadDetailPanel`). Con holds activos y usuario **no admin**, los botones del **`DriverActionPanel`** deben estar **deshabilitados** y el *tooltip* indicar que hay que liberar holds (el servidor sigue siendo la fuente de verdad).
  5. **Mensaje de error en panel:** Si deshabilitas la comprobación de UI o llamas a la API manualmente, el panel debe mostrar el error ampliado cuando `code === "ACTIVE_HOLDS"` (incluye nombres de holds en el mensaje).
  6. **Regresión — sin holds:** Con todos los holds liberados (`released` / no `hold`, `carrier_hold` false), **dispatcher** debe poder transicionar como antes (**200**).
  7. **assign-driver:** Con holds activos en una carga elegible, **`POST /api/dispatcher/loads/<id>/assign-driver`** como **dispatcher** debe responder **403** + **`ACTIVE_HOLDS`**; como **admin**, **200** y asignación aplicada. En UI, botones de asignar/reasignar deben estar deshabilitados para no-admin con *tooltip* acorde.

- **Qué se cambió y por qué (breve)**
  - **`lib/loadHolds.ts`:** Centraliza qué campos cuentan como “hold activo” (`hold` en los holds de texto; `true` en `carrier_hold`) para alinear API y UI con Handoff / Testing Plan.
  - **`PATCH …/loads/[id]/status`:** Tras validar la transición, si hay holds activos y el usuario **no** es **admin**, responde **403** con **`ACTIVE_HOLDS`** en lugar de persistir el cambio; los **admin** pueden forzar (soporte).
  - **`DriverActionPanel` + `LoadDetailPanel`:** Se pasa `activeHolds` y se usa **`useUserRole`** para deshabilitar los botones a no-admin cuando hay holds, y se mejora el texto de error si el servidor devuelve **`ACTIVE_HOLDS`** (UX acorde al plan de pruebas).
  - **`POST …/assign-driver` + tabla/planner (Tarea 14):** Misma validación de holds en API; **`LoadsTable`** y **`PlannerView`** alineados al bloqueo de asignación para no-admin.

- **SUPABASE:** SUPABASE no requiere cambios.

---

### Tarea 6 — Deducciones a conductores: trazado de límites y brechas

**Estimación:** ~2 h

**Descripción**

1. Trazabilidad de POST/PUT (y server actions) de deducciones y flujos de settlement que toquen `ap_deductions`.
2. Verifica uso de límites de `deduction_templates` y `driver_deduction_settings` en cada ruta (o documenta ausencia).
3. Especifica dónde debe vivir la validación (servidor obligatorio) y el status HTTP / forma JSON de error deseada para UX de A/P.
4. Alinea notas con pruebas **A/P E2E**; usa staging o fixtures—sin escrituras en producción.

**Criterio de hecho:** Lista de brechas con rutas/archivos, distinción clara entre “falta validación” y “OK”, y recomendaciones listas para un ticket de implementación.

**Estado:** Resuelta en alcance **Semana 1** (solo análisis y cierre documental). Matriz de rutas, plan de implementación y pruebas extendidas: **Tarea 12 (Semana 2)**.

**Alineación con documentos (raíz del repo)**

- **`TigerHawk_TMS_Technical_Handoff.docx`:** A/P incluye deducciones con **límites configurables**; tablas **`deduction_templates`** y **`driver_deduction_settings`**.
- **`TigerHawk_TMS_Testing_Plan.docx`:** Fase 8 recomendada, ítem **8 — Deduction limit enforcement:** los límites **no se validan al crear** deducciones; riesgo de **sobrededucción**.

**Brechas (lista breve; detalle en Tarea 12)**

- **`POST`/`PATCH`** `app/api/accounts-payable/deductions/` — sin comprobar límites antes de persistir (**falta validación**).
- **`POST`** `app/api/accounts-payable/deductions/generate` — `limit_total` parcial; **`limit_per_period`** no aplicado (**falta validación**).
- **Settlement** (`settlements/generate`, etc.) — enlazan o suman deducciones existentes (**OK** para alcance de creación; no sustituyen validación en alta).

**Observaciones**

- **¿La Tarea 6 queda resuelta solo documentando?** **Sí.** El criterio de hecho de esta tarjeta es **entregable de análisis** (trazabilidad, brechas por ruta, dónde validar en servidor y forma de error deseada, alineación E2E A/P). **No** exige merge de código. Corregir el producto (enforcement de límites) es trabajo de **Tarea 12**; si el equipo no prioriza A/P en Semana 2, puedes posponer la 12 sin reabrir la 6.
- **Pasos mínimos para comprobar el estado actual (smoke, staging/local):** rol **admin/accounting** → A/P **Deductions**; crear una deducción manual y revisar en **Network** que **`POST /api/accounts-payable/deductions`** responde **201** aunque existan límites en BD (comportamiento esperado hasta la Tarea 12).
- **Qué se cambió y por qué (breve):** se acortó esta tarjeta y se movió el alcance de **implementación + matriz + pruebas detalladas** a **Tarea 12** para no mezclar análisis (Semana 1) con código (Semana 2).
- **SUPABASE:** SUPABASE no requiere cambios.

---

### Tarea 7 — Barrido de bugs y arreglos puntuales en áreas de la semana

**Estimación:** ~3 h

**Descripción**

1. Elige **dos o tres** zonas ya trabajadas esta semana (mapas / orígenes, terminales, dual transactions, rate profiles, estado de cargas, UI o APIs de deducciones) y recorre **camino feliz + un camino de error** en local o staging—**sin nuevos documentos largos**; solo viñetas de repro en el PR si hace falta.
2. **Corrige fallos reales**: manejo de errores roto, regresiones visibles en UI, ruido en consola, tipos laxos, códigos HTTP incorrectos o fallos menores ligados a RLS en cliente. Prioriza **commits de código** frente a markdown nuevo; usa la descripción del PR para qué cambió y cómo lo probaste.
3. Ejecuta `npm run lint` y `npx tsc --noEmit`; mantén el PR **acotado** (un tema por PR si divides el trabajo).
4. Si no reproduces nada, invierte el tiempo en **endurecimiento dirigido** (null-safety, estados de carga/error) en archivos que ya tocaste antes en la semana—sigue siendo código, no prosa.

**Criterio de hecho:** Al menos un **PR listo para revisión o fusionado** con commits de bugfix o endurecimiento; pruebas manuales descritas en el cuerpo del PR; **no se exige entregable de documentación independiente** más allá de eso.

**Estado:** Resuelta en código y documentada (tres zonas revisadas + endurecimiento en UI A/P y load detail).

**Observaciones**

- **Zonas elegidas (2–3):** (1) **Accounts Payable → Deductions**, (2) **dispatcher Load detail** (sidebar map / `distance` save), (3) **Dual Transactions** tab (filtros y listas).
- **Pasos para verificar que no hay errores obvios (etiquetas de UI en inglés)**
  1. **Deductions (`/dashboard/accounts-payable/deductions`):** Inicia con rol **admin** o **finance**. Comprueba tarjetas **Unapproved** / **Approved** / **Settled**. Usa **Previous week** / **Next week** y el rango de fechas mostrado. En **All Drivers** elige un driver o **All Drivers**; en **Deduction Type** un tipo o **All Types**. **Happy path:** **Add Deduction** (modal) o clic en el badge de estado para alternar **Unapproved** ↔ **Approved**; opcional **Approve All Visible** / **Approve Selected** con filas **Unapproved** seleccionadas. **Error path:** **Approve Selected** sin filas **Unapproved** en la selección → alert *No unapproved deductions selected*; **Delete** (icono **Trash**) → cancelar el confirm no borra; si el API devuelve error, debe mostrarse **alert** con el mensaje. Cambia **Amount** y verifica que **Final Amount** en la fila coincide con **Amount** en estado local.
  2. **Load detail (dispatcher):** Abre el panel de una carga. En la barra lateral izquierda, sección **Route** (mapa **LoadSidebarMap** cuando hay **pickup_location** / **delivery_location**; leyenda **Pickup** / **Delivery** / **Return**). Espera millas junto al título **Route** (p. ej. `123 mi`). **Happy path:** en **Network**, **`PATCH`** **`/api/dispatcher/loads/<id>`** con JSON **`{ "distance": <number> }`** y **200**. **Error path:** si el **PATCH** no es **ok**, un nuevo cálculo de ruta debe poder volver a intentar el guardado (no quedar bloqueado por un flag interno).
  3. **Dual Transactions:** Abre la pestaña **Dual Transactions**. Arriba: pestañas **Available** / **Linked**, fecha (input **date**), botón **Recommend Duals**. Paneles **Containers To Return** (filtros **SSL**, **Type & Size**, **Search loads…**, icono **Filter**) y **Containers To Pick Up** (filtros **Terminal**, **Type & Size**, **Search loads…**, **Filter**). **Happy path:** cambiar filtros y búsqueda sin errores en consola del navegador. **Error path:** **Search loads…** con texto que no coincide → textos **No containers to return** / **No containers to pick up**, sin crash.
- **Comandos:** `npm run lint` y `npx tsc --noEmit` deben pasar tras los cambios.
- **Qué se cambió y por qué (breve)**
  - **`components/accounts-payable/DeductionsView.tsx`:** Alertas cuando **bulk approve** no aprueba ninguna fila o falla la red; **Delete** y edición inline muestran error del API en lugar de fallar en silencio; **`handleDelete`** usa actualización funcional de estado; al editar **`amount`** se sincroniza **`final_amount`** en el estado local para alinear con el API.
  - **`components/dispatcher/LoadDetailPanel.tsx`:** Solo se marca **`distance`** como guardada en cliente cuando el **PATCH** responde **ok**, para permitir reintento si el servidor falla.
  - **`package.json`:** Script **`lint`** apunta a rutas reales (`app`, `components`, `lib`, `hooks`) para que **`npm run lint`** sea útil en CI y en la Tarea 7.
- **SUPABASE:** SUPABASE no requiere cambios.

---

## Semana 2

**Tareas 8–14**

Prioridad: cerrar **Fase 1** pendiente en código (`README_STEPS_NEXTS` §2: **1.1** mapas/orígenes, **1.2** terminales, **1.6** límites deducciones), más **1.3** dual transactions (ya **Tarea 11**). Fuente datos/geo: `docs/SUGGESTION_FOR_RESOLVING_GEOLOCATION.md` y Anexo A de `README_STEPS_NEXTS.md`. Ajusta estimaciones en Trello si hace falta.

### Tarea 8 — Geolocalización: Supabase (esquema + datos para ciudades/puntos faltantes)

**Estimación:** ~3 h

**Descripción**

1. **Tablas que hoy sostienen coords persistidas (mapas de zona / orígenes):** principalmente **`lane_origins`** (`latitude`, `longitude`, `city`, `state`, `address`, `is_active`). Aquí vive el backfill del `PATCH` de orígenes.  
2. **Ciudades o puntos “no agregados”:** suele ser **falta de fila** en `lane_origins` o fila con **ciudad/estado vacíos** o **lat/lng nulos**. Resolverlo = **insertar o completar datos** (UI del TMS, import, o Table Editor) **y/o** migración si se añaden columnas.  
3. **Migración opcional (recomendada en el doc de sugerencias):** p. ej. `coordinate_source`, `geocoded_at` en **`lane_origins`** — requiere `ALTER TABLE` en Supabase vía migración en `supabase/migrations/`.  
4. **Maestros de organización (solo si el producto lo pide):** `customers`, `terminals`, `warehouses`, `yards` traen muchas veces solo texto (`city`, `state`); **no** tienen coords en el flujo actual de `app/api/organizations/locations`. Si se quiere geocodificar **antes** de crear orígenes desde orgs, valorar **nuevas columnas** `latitude`/`longitude` en una o varias de estas tablas (implica migración + políticas RLS si aplica).  
5. **Cargas (`loads`):** pickup/delivery/return son **cadenas**; el mapa lateral geocodifica en cliente **sin persistir**. Persistir millas/coords en BD sería **nueva migración** (opcional, otra tarjeta).

**Criterio de hecho:** migraciones aplicadas en **staging**; lista de filas corregidas o marcadas “revisión manual”; criterio claro de qué tablas quedan fuera de alcance en esta fase.

**Estado:** Resuelta en repo: migración `supabase/migrations/20260421_lane_origins_coordinate_provenance.sql` + criterios de alcance y auditoría SQL en observaciones; pruebas en `README_PRUEBAS.md` (Tarea 8).

**Observaciones**

- **Alcance cerrado en esta fase:** `lane_origins` (columnas de trazabilidad + índice de apoyo para filas activas sin coords). **Fuera de alcance aquí:** coords en maestros de organización (`customers`, `terminals`, `warehouses`, `yards`), persistencia de coords/millas en `loads` (sigue siendo geocodificación en cliente salvo tarjeta dedicada).
- **Auditoría de datos (staging):** en SQL Editor, revisar filas activas sin coords o sin ciudad/estado (consultas de ejemplo en `README_PRUEBAS.md` → Tarea 8). Corregir con Table Editor, **PATCH** por `origin_id` en `app/api/drivers/pay-rates/origins/route.ts`, o flujo bulk **PATCH** sin `origin_id` cuando city+state permiten Nominatim (respetar cuota; logs formales en **Tarea 9**).
- **API (alineación con columnas nuevas):** `GET`/`POST`/`PATCH` en `app/api/drivers/pay-rates/origins/route.ts` devuelven y actualizan **`coordinate_source`** / **`geocoded_at`** con valores fijados en servidor (`manual`, `nominatim`, `legacy` vía migración); no se acepta `coordinate_source` desde el cuerpo del cliente. Endurecimiento bbox / reverse-geocode y scripts con logs: **Tarea 9**.
- **SUPABASE:** Aplicar migración **`20260421_lane_origins_coordinate_provenance.sql`** (`lane_origins`: `coordinate_source`, `geocoded_at`, constraint, índice parcial, backfill `legacy` donde ya hay lat/lng). RLS existente de `lane_origins` no requiere cambios por solo añadir columnas.

---

### Tarea 9 — Geolocalización: código API orígenes + backfill con trazabilidad

**Estimación:** ~4 h

**Descripción**

1. Endurecer **`POST`/`PATCH`** en `app/api/drivers/pay-rates/origins/route.ts` (p. ej. bbox US, comprobación opcional con reverse geocode vs `state`).  
2. Escribir/ajustar **job o script** de backfill con **logs** por fila (éxito / omitido / fallo), idempotencia y respeto a cuota Nominatim (o proveedor externo).  
3. Rellenar **`coordinate_source`** (y timestamps) en cada escritura si la migración de la Tarea 8 existe.  
4. Ampliar **`activity_log`** en PATCH masivo si el equipo lo exige para auditoría.

**Criterio de hecho:** PR fusionable; pruebas manuales descritas (origen bueno, ambiguo, sin ciudad); sin romper `GET` de orígenes.

**Estado:** Resuelta en código: validación US (bbox + reverse opcional vs `state`), `PATCH` bulk con `results` por fila, `dry_run`, auditoría `activity_log` en bulk, script CLI `scripts/backfill-lane-origins-geocode.ts`, librería `lib/geocoding/lane-origin-nominatim.ts`; mensaje de UI en **Fix Map Coordinates** si hay filas con error.

**Observaciones**

- **Nominatim:** respetar política de uso (≈1 solicitud/s); forward + reverse encadenan esperas en el mismo handler.
- **422 en POST/PATCH manual:** cuerpo `{ error, code }` con `COORDS_OUTSIDE_US_BOUNDS`, `STATE_COORD_MISMATCH` o `REVERSE_GEOCODE_COUNTRY_MISMATCH` cuando la verificación no pasa; si el estado no es abreviatura de 2 letras reconocible, la verificación por estado se omite (solo bbox).
- **SUPABASE:** SUPABASE no requiere cambios (se asume migración Tarea 8 en `lane_origins`; se usa `activity_log` existente).

---

### Tarea 10 — Geolocalización: centralizar geocodificación en servidor donde aún vaya al cliente

**Estimación:** ~3 h

**Descripción**

1. Inventario de llamadas a **Nominatim** desde el navegador (`LaneRateMatrixView`, otros).  
2. Mover o encapsular en **API route** (misma política de User-Agent / API key de proveedor pago).  
3. **`LoadSidebarMap`:** decidir si mantiene cliente (OSRM + strings de carga) o se añade endpoint de geocodificación servidor; documentar la decisión en el PR.

**Criterio de hecho:** menos duplicación cliente/servidor; claves no expuestas al browser si hay proveedor de pago.

**Estado:** Resuelta en código.

**Observaciones**

- **Inventario (antes):** Nominatim directo en **`LaneRateMatrixView`** (modal **Add New Origin** → geocode) y en **`LoadSidebarMap`** (pickup/delivery/return strings). El servidor ya usaba **`lib/geocoding/lane-origin-nominatim.ts`** para orígenes (`app/api/drivers/pay-rates/origins/`).
- **Implementación:** **`POST /api/geocoding/forward`** (solo **admin** / **dispatcher**): cuerpo `{ query, mode?: "single" | "address_fallbacks" }`. Usa **`forwardGeocodeUsFreeform`** y **`geocodeUsAddressWithFallbacks`** en `lane-origin-nominatim.ts` (throttle + **User-Agent** + bbox US coherente con orígenes). La UI llama al API con **`credentials: "include"`**; el navegador ya no contacta `nominatim.openstreetmap.org`.
- **`LoadSidebarMap`:** la **geocodificación** pasa por el servidor; el **trazado en carretera** sigue en cliente con **OSRM** (`router.project-osrm.org`) entre coordenadas resueltas — menos latencia y sin persistir geometrías en esta tarea.
- **Navegación UI:** **`LaneRateMatrixView`** queda accesible en **Drivers** → **Driver Pay Rates** → subpestaña **Lane Rate Matrix** (`DriverPayRatesView`). La barra **`LaneRateActions`** (**Add Zone** / **Add Origin** / eliminar origen) se muestra a la **derecha** de esas subpestañas vía **`onActionsReady`** (el botón **+ Add First Zone** del lienzo solo crea **zonas** para el origen ya elegido, no un origen nuevo).
- **SUPABASE:** SUPABASE SIN CAMBIOS.

---

### Tarea 11 — Dual transactions: implementación de ahorro por distancia

**Estimación:** ~4 h

**Estado:** Resuelta en código.

**Descripción**

1. Implementar ahorro basado en distancia en UI/API de dual transactions (reemplazo del enfoque fijo por par) en:
   - `components/dispatcher/tabs/DualTransactionsTab.tsx`
   - `app/api/dispatcher/dual-transactions/route.ts`
   - `app/api/dispatcher/dual-transactions/match/route.ts` (si aplica respuesta de datos de ahorro)
2. Usar como base funcional los campos de ubicación del dominio (`delivery_location`, `return_location`, `pickup_location`) y lógica de distancia ya usada en el proyecto (OSRM/geo helpers según disponibilidad).
3. Aplicar fórmula de ahorro por millas con límite inferior en 0 y copy de UI explícito de estimación por distancia.
4. Mantener validaciones de compatibilidad de pares (SSL/tamaño/estado) sin regresión.
5. Añadir/actualizar matriz de pruebas manual para ranking y consistencia UI/API.

**Resolución en código (cerrada)**

1. **Lógica:** Millas evitadas = distancia Haversine entre coords de **`return_location`** (import) y **`pickup_location`** (export) tras geocodificar en servidor; `estimatedSavingsUsd = round(savedMiles × DUAL_EMPTY_SAVED_COST_PER_MILE_USD, 2)` (**2** USD/mi por defecto). Tres puntos deben geocodificar; si falta alguno, ahorro **0** para ese par.
2. **Compatibilidad de par:** mismo SSL, misma categoría de tamaño de contenedor, **`return_location` = `pickup_location`** (alineado entre **`DualTransactionsTab`**, **`GET`/`POST` dual-transactions** y página **`/dashboard/dispatcher/dual-transactions`**).
3. **Superficies:** `POST …/resolve-locations`; **`DualTransactionsTab`** (**Est. Savings**, **Recommend Duals**, **`resolve-locations`** en cliente) sigue **implementado** pero **`DispatcherPageTabs` no está montado** en ninguna ruta bajo `app/`. La ruta canónica **`/dashboard/dispatcher/dual-transactions`** (**`DualTransactionsView`**) incluye barra **Est. Savings** / **Potential** / **Recommend Duals**, geocodificación en servidor, **`POST …/match`** para enlazar y **`router.refresh`**; coherente con **T23** salvo la alternativa **`DispatcherPageTabs`** / pestaña empotrada en **`/dashboard/dispatcher`**.
4. **Informe:** `README_REPORTES_DIARIOS.md` → bloques **Dual transactions (Tarea 11)** y **Tarea 23 / calle** según corresponda.

**Criterio de hecho (requisitos para considerarla hecha)**
- Código mergeado con cálculo por distancia activo en los flujos de dual transactions.
- La **UI pública** montada (**`DualTransactionsView`**) no usa multiplicador fijo ni valores aleatorios y expone **Est. Savings**, **Potential**, **Recommend Duals** y **`resolve-locations`** coherente con API; la variante **`DualTransactionsTab`** dentro de **`DispatcherPageTabs`** permanece como código no montado hasta decidir **Tarea 23** (pestaña en **`/dashboard/dispatcher`**).
- API devuelve ahorro por par y total sin inconsistencias con los datos mostrados en **`DualTransactionsView`** / consumo API.
- Casos de prueba manual documentados: pares válidos/ inválidos, distancias extremas, fallback y orden esperado.
- `npm run lint` y `npx tsc --noEmit` pasan en el alcance de cambios.

**Confirmación de alcance (documentación revisada)**
- Revisado `README_STEPS_NEXTS.md` (Fase 1.3): pide migrar dual savings de fijo a distancia y etiqueta de estimación.
- Revisado `README_SPANISH.md` / `README_ENGLISH.md`: existe soporte operativo para geocodificación/ruteo (Nominatim + OSRM) reutilizable.
- Revisado `docs/SUGGESTION_FOR_RESOLVING_GEOLOCATION.md`: confirma viabilidad técnica para flujo basado en coordenadas/rutas sin bloquear por arquitectura.
- Conclusión: los requisitos de esta tarea en Semana 2 están completos y son alcanzables a nivel código.

**SUPABASE:** SUPABASE SIN CAMBIOS.

---

### Tarea 12 — A/P: enforcement de límites en deducciones (código + pruebas)

**Estimación:** ~4 h

**Descripción**

1. Implementar validación en **servidor** al crear/editar deducciones contra **`driver_deduction_settings`** y **`deduction_templates`** (mapear `deduction_type` / nombre de plantilla según acuerdo de producto), alineado a **Testing Plan** fase 8 ítem **8** y a **Handoff** (deducciones con límites configurables).
2. Completar **`limit_per_period`** en **`app/api/accounts-payable/deductions/generate/route.ts`** (hoy el bloque existe sin lógica); mantener coherencia con **`limit_total`** / **`total_deducted`**.
3. Definir respuesta HTTP estable (p. ej. **`422`**) con JSON `{ code, error, details }` para sobrepaso de límites; propagar mensaje usable en UI de **Deductions** / errores de fetch.
4. Ajustar **`PATCH`** si hace falta **`final_amount`** junto a **`amount`**; `npm run lint` y `npx tsc --noEmit` en el alcance del cambio.

**Criterio de hecho:** `POST`/`PATCH` rechazan montos que violen límites; generate respeta **`limit_per_period`**; pasos de prueba de la Tarea 12 reproducibles en staging; sin regresión en settlements que solo enlazan deducciones ya válidas.

**Contexto (desde Tarea 6)**

| Ruta / superficie | Método | `ap_deductions` | Límites template + settings |
|-------------------|--------|-----------------|------------------------------|
| `app/api/accounts-payable/deductions/route.ts` | `POST` | `INSERT` | Implementar validación |
| `app/api/accounts-payable/deductions/[id]/route.ts` | `PATCH` / `DELETE` | `UPDATE` / `DELETE` | Validar en `PATCH` si cambia monto |
| `app/api/accounts-payable/deductions/generate/route.ts` | `POST` | `INSERT` (lote) | Completar `limit_per_period` + coherencia con totales |
| `app/api/accounts-payable/settlements/generate/route.ts` | `POST` | `SELECT` + `UPDATE` | Sin cambio obligatorio si la deducción ya nació validada |
| `app/api/accounts-payable/settlements/route.ts` | `GET` / `POST` | `SELECT` | Sin cambio obligatorio |
| `app/api/accounts-payable/settlements/[id]/route.ts` | `GET` | `SELECT` | Sin cambio obligatorio |
| `app/api/accounts-payable/settlements/csv/route.ts` | `GET` | `SELECT` | Sin cambio obligatorio |
| `app/dashboard/accounts-payable/deductions/page.tsx` | RSC | `SELECT` | Mostrar error de API si aplica |

**Observaciones**

- **Pasos para probar (tras el PR)**  
  1. Staging: ajustar **`driver_deduction_settings`** (`limit_total`, `limit_per_period`, `total_deducted`) para un conductor + template.  
  2. **`POST /api/accounts-payable/deductions`:** monto por encima del permitido → **422** + `code`; monto válido → **201**.  
  3. **`PATCH …/deductions/<id>`:** subir `amount` por encima del remanente → **422**; caso válido → **200** y montos coherentes.  
  4. **`POST …/deductions/generate`:** periodo donde `amount > limit_per_period` → monto acotado o fila omitida según regla acordada en implementación.  
  5. **`POST …/settlements/generate`:** totales y enlaces sin cambio de comportamiento indebido.  
  6. UI A/P Deductions: intento que supere límite → mensaje claro (texto del `error` / `details`).

- **SUPABASE:** SUPABASE no requiere cambios salvo que el diseño pida columnas nuevas; por defecto bastan tablas existentes.

---

### Tarea 13 — Terminales: implementación de carga dinámica (cierre Fase 1.2 / Tarea 2)

**Estimación:** ~10 h

**Descripción**

1. Endpoint o hook compartido que lea **`terminals`** (y org si aplica) desde Supabase con caché acorde a `docs/INTEGRATION_GUIDE.md`.
2. Sustituir opciones fijas **BCT/BAY** en **`VesselTable`**, **`ContainerTable`**, **`DualTransactionsView`** / pestaña **Dual Transactions**, **`StreetTurnsView`** por opciones dinámicas; alinear tipos TypeScript.
3. Estados de carga y error en filtros; regresión en exportaciones/sync que usen código de terminal.

**Criterio de hecho:** PR fusionable; nuevas filas en **`terminals`** aparecen en UI sin deploy de código; `npm run lint` y `npx tsc --noEmit` pasan; checklist breve de regresión (filtros + vistas citadas).

**SUPABASE:** SUPABASE no requiere cambios.

---

### Tarea 14 — Loads: política de holds en `assign-driver` (cierre brecha Tarea 5)

**Estimación:** ~4 h

**Descripción**

1. Reutilizar **`getActiveHoldKeys`** (u homólogo) en **`POST /api/dispatcher/loads/[id]/assign-driver`** cuando el negocio exija el mismo bloqueo que en **`PATCH …/status`**, o documentar excepción explícita en código + README si se deja distinto.
2. Ajustar UI si el dispatcher asigna conductor con holds (mensaje claro / deshabilitar acción).

**Criterio de hecho:** Comportamiento acordado con producto implementado y probado (caso hold + asignación); sin regresión en asignación sin holds.

**Estado:** Resuelta: API alineada a **`PATCH …/status`**; UI (tabla de cargas, planner, panel de detalle) bloquea asignación para no-admin con holds activos y mensaje **`ACTIVE_HOLDS`** coherente.

**Observaciones**

- **`assign-driver/route.ts`:** Tras leer la fila de **`loads`** con columnas de holds, **`getActiveHoldKeys`**; si hay activos y el rol **no** es **admin**, **403** con **`code: "ACTIVE_HOLDS"`** y **`activeHolds`**.
- **UI:** **`LoadDetailPanel`** / **`LoadsTable`** / **`PlannerView`** usan la misma noción de holds que el sidebar y deshabilitan acciones de asignar o reasignar cuando aplica; **admin** conserva override.
- **Pruebas:** **`README_PRUEBAS.md`** → **Tarea 14**.

**SUPABASE:** SUPABASE no requiere cambios.

---

*Semana 2: geolocalización (**8–10**), dual savings (**11**), límites deducciones (**12**), terminales dinámicas (**13**), holds en asignación (**14**).*

---

## Semana 3

**Tareas consecutivas:** **T15**, **T16**, **T17**, **T18**, **T19**, **T20**, **T21**, **T22**.

---

### Tarea 15 — Tests: Jest + RTL, tests críticos y CI en PR

**Estimación:** ~28 h

**Descripción**

1. **2.1** Configurar **Jest + React Testing Library** (`jest.config`, `setupTests.ts`), mocks de `@/lib/supabase/*` y rutas Next según `docs/GitHub_Setup_Guide.md` donde aplique.
2. **2.2** Tests unitarios mínimos en **`lib/pay-calculator.ts`** (o API **calculate**) y en transiciones de estado de cargas con mocks; casos guía en `docs/ACCESSORIAL_EXAMPLES.md` donde encaje. El **Handoff §6.2** prioriza también **sync Port Houston** (`lib/port-houston/sync.ts` o rutas asociadas): añadir al menos **un** test o spec con mocks de red/DB que cubra el camino crítico acordado con el equipo (aunque sea “smoke” de orquestación).
3. **2.3** Workflow **`.github/workflows/ci.yml`**: `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm test` en cada PR.

**Criterio de hecho:** CI verde en rama principal; al menos **un** test estable en **pay calculator**, **uno** en **transición de carga** (o API equivalente) y **uno** acordado para **Port Houston sync** (puede ser integración liviana con mocks); documentación breve en comentario del workflow o `README_ENGLISH.md` sobre cómo correr tests local.

---

### Tarea 16 — E2E navegador (Handoff §6.2 / §9 · Fase 2.4)

**Estimación:** ~10 h

**Descripción**

1. Playwright (o herramienta acordada): flujos **login**, **load happy path** (dispatcher), smoke **Port Houston** con staging estable cuando exista.
2. No sustituye tests unitarios (**T15**); puede ejecutarse en CI en rama principal o job programado además de **`npm test`**.

**Criterio de hecho:** Al menos **un** flujo E2E reproducible localmente **y** documentado; encajar con **Phase 10** del Testing Plan donde aplique automatización.

---

### Tarea 17 — UX: errores, loading y exports CSV coherentes

**Estimación:** ~20 h

**Descripción**

1. **3.1** Patrón unificado de **error boundaries** / hooks con `isLoading` y `error` en layouts de dashboard; reducir ruido `console.error` vacío en queries.
2. **3.2** Inventario `app/dashboard` + `components/tables`; cerrar huecos de **export CSV** vía API con permisos correctos en vistas prioritarias acordadas con negocio. **Presentación / delimitador para Excel regional:** cubierto por **Tarea 24**; esta tarea se centra en cobertura, permisos y patrón unificado de exportes.

**Criterio de hecho:** Lista de pantallas tocadas + PRs; smoke manual sin regresión en navegación principal; exports probados con rol **finance**/**admin** según pantalla.

---

### Tarea 18 — Email: mapa de eventos y endurecimiento

**Estimación:** ~12 h

**Descripción**

1. **3.3** Inventariar llamadas a **`lib/email/sendTemplateEmail.ts`** y plantillas (`email-templates`, Supabase); documentar evento → correo (síncrono vs cola) y manejo de fallos/reintentos donde exista Resend.

**Criterio de hecho:** Tabla o doc corto en `docs/` o en cuerpo de PR enlazado; al menos **un** flujo crítico (p. ej. settlement finalizado) probado en staging con correo de prueba.

---

### Tarea 19 — Finanzas web: facturación A/R por lotes y cierre A/P settlements

**Estimación:** ~32 h

**Descripción**

1. **3.4** **Batch A/R** desde cargos/billing agrupados por cliente: endpoint + UI preview; validar contra Testing Plan fase de facturación donde corresponda.
2. **3.5** Cerrar **E2E** `settlements/generate` + UI **Settlements**: permisos, estados **`ap_driver_pay`**, idempotencia opcional, mensajes de error; coherente con límites de deducciones (**T12** entregada en Semana 2; **T25** si hubo corrección puntual).

**Criterio de hecho:** Flujos demo grabados o checklist firmado por QA; sin datos inconsistentes en `ar_invoices` / `ap_settlements` en pruebas de staging; `lint`/`tsc`/tests (si ya existen) pasan en el alcance.

---

### Tarea 20 — Realtime y centro de notificaciones

**Estimación:** ~22 h

**Descripción**

1. **4.1** Supabase **Realtime** en tableros/listas críticas (por rol), invalidación de caché cliente, límites y reconexión.
2. **4.2** Centro de notificaciones / historial; reutilizar o extender `admin/notification-settings` si aplica.

**Criterio de hecho:** Demo en staging con **dos** sesiones o documento de verificación; sin fugas de datos entre roles; degradación graceful si Realtime falla.

---

### Tarea 21 — Import CSV genérico y mejoras de reportes

**Estimación:** ~22 h

**Descripción**

1. **4.3** Import adicional (conductores, equipos, …) con **PapaParse + Zod** + upsert transaccional; plantillas CSV referenciadas en `docs/`.
2. **4.4** Revisión de consultas pesadas bajo `app/dashboard/reports`; optimización puntual (índices, RPC, vistas materializadas solo si hace falta).

**Criterio de hecho:** Al menos **un** import nuevo documentado end-to-end; **un** reporte mejorado medible (tiempo de carga o menos timeouts).

---

### Tarea 22 — Operación, seguridad y QA final

**Estimación:** ~16 h

**Descripción**

1. Revisión **RLS** / políticas sensibles (finanzas, loads) y notas en PR o `docs/`.
2. **Cron** Port Houston / `maxDuration` Vercel (`vercel.json`, `/api/port-houston/rotate`): comprobación de límites y logs.
3. Pasada final según **`TigerHawk_TMS_Testing_Plan.docx`** (raíz del repo); apoyo operativo en **`README_PRUEBAS.md`** y **`README_STEPS_NEXTS.md`**: registro de gaps como backlog post-lanzamiento. Incluir explícitamente **Phase 9** del plan (documentos BOL/RC/peso, límite **50 MB**, portal cliente, **RLS** sin fugas entre clientes).

**Criterio de hecho:** Lista de verificación firmada o equivalente; sin issues **P0** abiertos en alcance web; handoff corto para soporte (dónde mirar logs, variables críticas en `env.example`).

---

## Semana 4

**Tareas consecutivas:** **T23**, **T24**, **T25**, **T26**, **T27**.

---

### Tarea 23 — Dual Transactions: barra de ahorro en ruta canónica y enlazado completo (UI)

**Estimación:** ~14 h

**Descripción**

1. **Unificar navegación y superficie:** integrar **`DualTransactionsTab`** (**Est. Savings**, **Potential**, leyenda **Haversine** / **$/mi**, **Recommend Duals**, **`POST /api/dispatcher/dual-transactions/resolve-locations`** al filtrar) en **`/dashboard/dispatcher/dual-transactions`** *o* montar **`DispatcherPageTabs`** en **`/dashboard/dispatcher`** y enlazar la pestaña **Dual Transactions** sin duplicar lógica divergente respecto a **`DualTransactionsView`**. Objetivo: que el smoke “filtros → totales de ahorro → **Recommend Duals** → Network **`resolve-locations`**” sea una **ruta real** en el producto.
2. **Enlazado:** reemplazar o acotar el banner *Dual transaction linking is under development…* con el flujo acordado: selección de carga en cada columna, preview del par, confirmación, **`POST …/dual-transactions/match`**, actualización de **Available** / **Linked** y coherencia con **`street_turn_match_id`** en **`loads`** (sin romper reglas **SSL** / tamaño / terminal ya alineadas en API). Revisar **`StreetTurnsView`** en la misma línea (Handoff **6.4** / *street turn*): enlazado + estimación de ahorro si el producto debe reflejar distancia u hoy queda en **0** / stub.
3. **Documentación:** actualizar **`README_PRUEBAS.md`** / **`README_REPORTES_DIARIOS.md`** cuando la UI exista; **`npm run lint`** y **`npx tsc --noEmit`** en el alcance.

**Criterio de hecho:** Los campos **Est. Savings** / **Potential** / **Recommend Duals** son alcanzables desde el TMS sin código huérfano confuso; enlazado usable o mensajes de estado que reflejen el comportamiento real; checklist de regresión dual en el PR.

**SUPABASE:** solo si el flujo final exige columnas o políticas nuevas; por defecto reutilizar el modelo actual de emparejamiento en **`loads`**.

---

### Tarea 24 — Exportación CSV: columnas en Excel (delimitador regional)

**Estimación:** ~3 h

**Descripción**

1. **Contexto:** `lib/exportCSV.ts` genera CSV con separador **coma (`,`)** y cabeceras correctas; en Excel con configuración regional que usa **`;`** como separador de listas (p. ej. muchos equipos en español o Brasil), al abrir el `.csv` **toda la fila queda en la columna A** en lugar de repartirse en columnas.
2. **Implementación (elegir enfoque acordado con el equipo):** p. ej. delimitador **`;`** por defecto o según `navigator.language` / preferencia guardada; parámetro **`delimiter`** en **`exportToCSV`**; opción en UI **Export (comma / semicolon)**; y/o línea inicial tipo **`sep=,`** donde aplique la convención de Excel.
3. **Escape:** extender **`escapeCSV`** (o equivalente) para tratar comillas y el delimitador elegido; regresión en **`VesselTable`**, **`ContainerTable`** y demás usos de **`exportToCSV`** / **`ExportButton`**.
4. **Pruebas:** abrir exportación en Excel con la regional del cliente; documentar pasos breves en **`README_PRUEBAS.md`**.

**Criterio de hecho:** Al menos **Vessels** y **Containers** (y resto de exportes tocados) abren en columnas separadas sin paso manual de “Texto en columnas” en el escenario regional acordado; **`npm run lint`** y **`npx tsc --noEmit`** pasan en el alcance.

**SUPABASE:** SUPABASE no requiere cambios.

---

### Tarea 25 — Post–Semana 2: corrección A/P límites de deducciones (solo si QA falla)

**Estimación:** ~2–4 h (0 h si no hay brecha)

**Descripción**

1. **Disparador:** la **Tarea 12** ya se considera entregada en Semana 2; esta tarjeta **solo** aplica si pruebas manuales o el **Testing Plan** (fase 8, ítem límites) muestran que **`POST`/`PATCH`** `…/accounts-payable/deductions` o **`POST …/deductions/generate`** aún permiten sobrepasar **`driver_deduction_settings`** / **`deduction_templates`**.
2. Corregir en servidor la validación faltante, **`limit_per_period`** en generate si aplica, respuesta **`422`** estable y mensaje en UI **Deductions**; repetir pasos de prueba de **T12** sin modificar el texto de esa tarjeta.

**Criterio de hecho:** Checklist de **T12** pasa en staging; o tarjeta cerrada como *No aplica* con evidencia de QA.

**SUPABASE:** solo si el fix exige columnas nuevas (poco probable).

---

### Tarea 26 — Post–Semana 2: corrección terminales dinámicas (solo si QA falla)

**Estimación:** ~2–8 h (0 h si no hay brecha)

**Descripción**

1. **Disparador:** la **Tarea 13** ya se considera entregada en Semana 2; esta tarjeta **solo** aplica si alguna vista (**`ContainerTable`**, **`DualTransactionsView`**, **`StreetTurnsView`**, exportaciones o sync) sigue dependiendo de listas fijas **BCT/BAY** o no refleja filas nuevas en **`terminals`**.
2. Alinear con el patrón acordado en **T13** (hook/endpoint + props); regresión en filtros y export; **no** reabrir el enunciado de **T13**.

**Criterio de hecho:** Criterio de **T13** cumplido en todas las superficies probadas; o tarjeta *No aplica* con nota de QA.

**SUPABASE:** sin cambios de esquema por defecto.

---

### Tarea 27 — Cierre de proyecto: auditoría Handoff + Testing Plan vs código + tarjetas T1–T26 (implementación)

**Estimación:** ~12–24 h (según profundidad del barrido y hallazgos)

**Descripción**

1. **Fuente de verdad:** leer íntegros (no solo resúmenes) **`TigerHawk_TMS_Technical_Handoff.docx`** y **`TigerHawk_TMS_Testing_Plan.docx`** en la **raíz** del repo (junto a `package.json`). Complementar con **`README_STEPS_NEXTS.md`**, **`docs/RLS_SECURITY_REVIEW_T22.md`**, **`README_PRUEBAS.md`** y **`README_REPORTES_DIARIOS.md`** solo como índice; el cierre se juzga contra los **Word**.
2. **Inventario de pendientes documentales:** extraer de Handoff (§6 *Known Issues*, §9 *Recommended Next Steps*, anexos citados) y del Testing Plan (prerequisitos, fases 1–10, Phase 9 portal/documentos/RLS/50 MB, etc.) **cada ítem** que implique funcionalidad, corrección, migración, RLS, prueba obligatoria o exclusión explícita (p. ej. app móvil nativa fuera de alcance).
3. **Barrido del código del proyecto:** revisar **`app/`**, **`components/`**, **`lib/`**, **`hooks/`**, **`supabase/migrations/`**, **`e2e/`**, **`.github/workflows/`** y configuración relevante (`package.json`, `env.example`) para cada ítem del paso 2: confirmar **implementado**, **parcial** o **ausente** (rutas, APIs, UI, políticas, tests, CI).
4. **Cruce con esta hoja:** mapear cada hallazgo a **T1–T26** (o indicar **gap sin tarjeta**). Si una tarjeta dice “hecha” pero el Word aún exige algo no cubierto, **T27** debe marcarlo.
5. **Entregable obligatorio (cuerpo de la tarjeta / PR / `docs/` corto enlazado):** un documento o comentario estructurado con:
   - **Lista de funcionalidades o correcciones que faltan** (viñetas; cada ítem con referencia al Word: sección/fase y, si aplica, archivo o ruta de código esperada).
   - **Lista de errores o deuda técnica a corregir** (viñetas; prioridad sugerida *P0* / *P1* / *P2*; breve impacto).
   - **Lista de “verificado OK”** (opcional pero recomendado): ítems del Word cerrados con evidencia (ruta de código o ID de prueba en `README_PRUEBAS.md`).
6. **Criterio de proyecto finalizado:** no se declara cierre hasta que la lista de **faltantes *P0*/*P1*** frente a Handoff + Testing Plan (alcance web) esté **vacía** o **aceptada por negocio por escrito**; ítems *Low* solo en Handoff pueden quedar como backlog explícito post-lanzamiento.

**Criterio de hecho:** Entregable con las tres listas anteriores actualizado tras el barrido; `npm run lint`, `npx tsc --noEmit` y (si aplica en repo) `npm test` / `npm run test:e2e` sin regresiones nuevas atribuibles al cierre; responsable QA o líder técnico **firma** o equivalente (comentario en ticket) que el cruce Word ↔ código ↔ tarjetas **T1–T26** (implementación) y el informe de **T27** están completos.

**SUPABASE:** **SUPABASE no requiere cambios** por el solo hecho de **T27**; si el listado de gaps exige DDL/RLS/datos, esas tareas se abren como trabajo posterior o se referencian en la lista de pendientes con migración o script indicado.

---

## Estimación global de horas (referencia)

| Concepto | Horas | Notas |
|----------|------:|--------|
| **Referencia plan extendido solo web** | **~258 h** | `README_STEPS_NEXTS.md` (Fases 1–4; excluye ~35 h móvil nativo del .docx). |
| **Presupuesto / expectativa cliente** | **200 h** | Referencia contractual (~**33,3 días** a **6 h/día**). **No** se fuerza la suma de tarjetas a este número. |
| **Suma estimaciones de esta hoja (Tareas 1–27)** | **~249–261 h** orient. | **Semana 3:** **T15–T22**. **Semana 4:** **T23–T27**. **T25+T26** ~**0 h** si no hay brecha. **T27** ~**12–24 h** (auditoría final). |
| **¿Puede terminarse antes de 200 h?** | **Sí, es posible** | Si se **acota alcance** (p. ej. posponer **Tarea 16** Playwright ~10 h, reducir **4.4** en **Tarea 21**, o fraccionar **Tarea 19**), o con **menos incertidumbre de datos** y reutilización de código, un **MVP de cierre web** puede cerrarse **por debajo de 200 h**. Las **~231 h** sumadas en tarjetas son **orientativas** (suelen incluir margen). |
| **Brecha vs plan README** | **~27 h** | Aprox. **258 − 231** entre suma tarjetas y plan extendido; backlog o fases opcionales. |
| **Jornada** | **6 h/día** | Ej.: **231 h** ≈ **38,5 días**; **200 h** ≈ **33,3 días**. |

**Fórmula útil:** `días ≈ horas_totales / 6`.

### Supabase: cuándo suelen hacer falta cambios en tablas / políticas

| Tarea | ¿Migraciones / datos / RLS? | Comentario breve |
|-------|------------------------------|-------------------|
| **8** | **Sí (a menudo)** | `ALTER` / migración en **`lane_origins`** (`coordinate_source`, `geocoded_at`, etc.); datos corregidos en Table Editor o scripts; opcional columnas geo en maestros de org si el producto lo pide. |
| **9** | **Opcional** | Principalmente código y logs; **activity_log** si se amplía auditoría. Reutiliza columnas de la **8** si existen. |
| **10** | **No** salvo decisión nueva | Geocodificación vía API; sin cambio de esquema por defecto. |
| **12** | **No** por defecto | Lógica sobre tablas ya existentes (`ap_deductions`, `driver_deduction_settings`, `deduction_templates`). |
| **13** | **No** | SUPABASE no requiere cambios (tablas / políticas); el alcance usa **`terminals`** existente y RLS actual. Los **datos** (nuevas filas en **`terminals`**) son operación en Table Editor o carga, no DDL de esta tarea. |
| **14** | **No** | Solo reglas en API/UI salvo que el negocio pida flags nuevos en `loads`. |
| **15–18** | **No** en lo típico | CI, tests, UX, email desde código. |
| **23** | **Revisar** | Enlazado dual puede requerir solo código sobre **`loads`**; confirmar si hace falta DDL/RLS. |
| **24** | **No** | Solo cliente: **`lib/exportCSV.ts`** y consumidores; sin cambio de esquema. |
| **19** | **Posible** | Batch A/R / líneas de factura: **revisar** si el modelo actual cubre batch; si no, migración + RLS para tablas nuevas o columnas. Settlements: revisar estados `ap_driver_pay` (datos o constraints, no siempre migración). |
| **20** | **Sí (config)** | **Realtime**: habilitar **replication** en tablas elegidas + revisar **RLS** para suscripciones seguras. |
| **21** | **Opcional** | Imports usan tablas existentes; nuevas tablas “staging” solo si el diseño lo exige. **4.4** reportes: posibles **índices**, **RPC** o vistas en BD si hay cuellos de botella. |
| **22** | **Revisión, no siempre DDL** | Auditoría **RLS** y políticas; ajustes puntuales en SQL si se detectan huecos. |
| **25** | **No** por defecto | Misma lógica que **12**; DDL solo si el fix lo exige. |
| **26** | **No** por defecto | Misma lógica que **13**. |
| **27** | **No** por la auditoría en sí | Si el informe de gaps exige cambios en BD/RLS, documentarlos como trabajo derivado (puede reutilizar filas de **8–22** según el hueco). |

Si una tarea concreta **no** requiere `supabase/migrations/`, igual puede requerir **datos** en staging (Table Editor) para probar.
