# README_PRUEBAS — Semanas 1–3 (TigerHawk TMS)

Guía para **probar en el dashboard (frontend)** y **verificar migraciones / datos en Supabase** según cada tarea (`TAREAS_TRELLO.md`). Las etiquetas de pantalla van en **inglés** como en la aplicación.

**Orden:** bloques **`### Tarea N`** en **orden numérico ascendente** (1, 2, 3…); las tareas de **mayor número** documentadas aquí (**13**, **14**, …) van **al final**, no intercaladas antes que tareas de número menor.

**Antes de probar:** inicia sesión en el TMS (p. ej. `http://localhost:3000`), con el rol que indica cada bloque (**admin**, **dispatcher**, **finance**, **accounting**). Para ver llamadas a API, abre las herramientas del navegador (**F12**) → pestaña **Network** → filtro **Fetch/XHR**.

---

### Tarea 1 — Mapas y geocodificación: auditoría de datos y plan de backfill

**Cómo verificar en el dashboard**

1. Entra a **Dispatcher** (`/dashboard/dispatcher`) y abre el detalle de una carga con **pickup** y **delivery** útiles.
2. En el panel lateral, sección **Route**: el mapa debe cargar (Leaflet), mostrar leyendas **Pickup** / **Delivery** / **Return** si aplica, y millas (**mi**) cuando la ruta se calcula. Sin ubicaciones, debe verse **No locations set** o **Loading map...** sin romper la página ni errores graves en consola.
3. Entra a **Drivers** (`/dashboard/drivers`) → pestaña **Driver Pay Rates** (puedes usar `?tab=driver-pay-rates`).
4. Abre las vistas que incluyan mapas de zona / orígenes / matriz de carriles (según tu entorno). Comprueba que los mapas abren y que datos incompletos no dejan la pantalla en blanco.

---

### Tarea 2 — Terminales hardcodeadas (BCT/BAY): inventario y especificación de carga dinámica

**Nota:** La **implementación** de catálogo dinámico y API está en la **Tarea 13**; los pasos de prueba detallados están en el bloque **Tarea 13** al **final** de este README (orden numérico ascendente).

**Cómo verificar en el dashboard (resumen)**

1. **Vessels** (`/dashboard/vessels`): filtro **Terminal** y tarjetas por terminal deben reflejar códigos de **`terminals`** + datos de **vessels**, no solo dos tarjetas fijas.
2. **Containers** (`/dashboard/containers`): filtro de terminal coherente con códigos de buque.
3. **Dual / Street Turns:** filtros de terminal alineados con el mismo modelo de opciones.

---

### Tarea 3 — Dual transactions: diseño de ahorro basado en distancia

**Cómo verificar en el dashboard**

1. **`GET /api/dispatcher/dual-transactions`** (sesión **admin**/**dispatcher**): en **`potentialMatches`**, **`estimatedSavings`** / **`estimatedSavedMiles`** deben reflejar la lógica por **distancia** (Tarea 11), no un placeholder fijo por par.
2. **UI:** en **`/dashboard/dispatcher/dual-transactions`** (**`DualTransactionsView`**) están **Est. Savings**, **Potential**, **Recommend Duals** y **`POST …/resolve-locations`** al filtrar (ver **Tarea 23** y pasos en ese bloque).

---

### Tarea 4 — Rate profiles “fill down”: checklist de regresión y notas

**Cómo verificar en el dashboard**

1. Inicia sesión como **admin** o **dispatcher** (permiso **Drivers**). Debes entrar al dashboard sin error de permisos.
2. **Drivers** → `http://localhost:3000/dashboard/drivers` (o tu dominio) → pestaña **Driver Pay Rates** → subpestaña **Rate Profiles**. Debes ver la tabla de perfiles, no solo grupos o calculadora.
3. Abre un perfil (nombre, **Open** o icono de edición). Debe verse la hoja tipo spreadsheet: **lanes**, filas **charges**, columnas **Rate**, **UOM**, **Pay Mode**, eventos, **Addl Rule** / **Addl Exec** / **Addl Cond**. Necesitas al menos **dos filas de charge** en columna para probar fill-down.
4. **Rate:** en una fila con cargas debajo, columna **Rate**, clic en la **flecha abajo** (fill down). Las filas inferiores copian la tarifa. Mensajes **Filling down…** → **Filled N rows down** y luego desaparecen (~4 s). Si no hay filas debajo: **Nothing to fill below this row**, sin quedarse en **Filling down…**.
5. **Origin Event:** *tooltip* **Fill this origin event down to all rows below**. Opcional: **Destination Event** — **Fill this destination event down to all rows below**. Con **Pay Mode** **By Leg** vs **By Event**, el valor debe propagarse; mismos mensajes que en el paso 4.
6. **Addl Rule / Addl Exec / Addl Cond:** *tooltips* **Fill this rule type…**, **Fill this operator…**, **Fill this condition value…**. Propaga **un** campo: solo ese campo debe copiarse; los otros dos de la misma condición **no** deben borrarse solos.
7. **Network:** tras un fill-down, deben aparecer **`PATCH`** a `/api/drivers/pay-rates/profiles/charges` y/o **`PATCH`/`POST`** a `/api/drivers/pay-rates/profiles/conditions`, luego **`GET`** `/api/drivers/pay-rates/profiles/charges?lane_id=…`. Si falla un **PATCH** (401/403/500), en consola puede verse **`[patchChargeQuiet]`** o **`[handleFillDownCondition]`**.

---

### Tarea 5 — Transiciones de estado de carga vs holds activos

**Cómo verificar en el dashboard**

1. Prepara una carga con hold activo: `freight_hold` (u otro hold) = **`hold`**, o **`carrier_hold` = true**. Valores como **`released`** no deben bloquear como hold activo.
2. Como **dispatcher** o **driver** asignado, intenta cambiar estado (botones del **DriverActionPanel** / **Status Actions** o herramienta que llame al API). **Esperado:** bloqueo (**403** con **`ACTIVE_HOLDS`** y **`activeHolds`** si miras **Network**).
3. Como **admin**, con los mismos holds, el cambio de estado debe poder completarse (**200**).
4. Con holds y usuario **no admin**, los botones de **Status Actions** deben ir **deshabilitados**; el *tooltip* debe indicar liberar holds.
5. Si el servidor devuelve **`ACTIVE_HOLDS`**, el panel debe mostrar el mensaje incluyendo los holds.
6. Sin holds activos, **dispatcher** debe poder transicionar con normalidad (**200**).
7. *(Opcional)* Tras holds en carga temprana, prueba asignar conductor desde la UI y observa si el flujo coincide con lo esperado por negocio.

---

### Tarea 6 — Deducciones a conductores: trazado de límites y brechas

**Cómo verificar en el dashboard**

1. Como **admin** o **accounting**, abre **Accounts Payable → Deductions**: `/dashboard/accounts-payable/deductions`.
2. Crea una deducción con **Add Deduction** o usa una existente.
3. En **Network**, revisa **`POST /api/accounts-payable/deductions`**. Hasta implementar **Tarea 12 (Semana 2)**, puede responder **201** aunque en base de datos existan límites en plantillas/settings (comportamiento conocido hasta el cierre de esa tarea).

---

### Tarea 7 — Barrido de bugs y arreglos puntuales en áreas de la semana

**Cómo verificar en el dashboard**

1. **Deductions** (`/dashboard/accounts-payable/deductions`): rol **admin** o **finance**. Revisa tarjetas **Unapproved** / **Approved** / **Settled**, **Previous week** / **Next week**, **All Drivers**, **Deduction Type**. *Camino feliz:* **Add Deduction**, alternar **Unapproved** ↔ **Approved**, **Approve All Visible** / **Approve Selected** con filas **Unapproved**. *Error:* **Approve Selected** sin **Unapproved** → mensaje *No unapproved deductions selected*; **Delete** (**Trash**) cancelado no borra; si el API falla, debe mostrarse **alert**. **Amount** y **Final Amount** deben coincidir en la fila tras editar **Amount**.
2. **Detalle de carga (dispatcher):** sidebar **Route**, mapa, leyendas **Pickup** / **Delivery** / **Return**. *Camino feliz:* **PATCH** a `/api/dispatcher/loads/<id>` con **`distance`** → **200**. *Error:* si el **PATCH** falla, al recalcular la ruta debe poder reintentarse el guardado.
3. **Dual Transactions** (`/dashboard/dispatcher/dual-transactions`): pestañas **Available** / **Linked**; filtros **Returns** (**SSL**, tamaño) y **Pick Ups** (terminal, tamaño) y búsquedas. **No** esperar **Recommend Duals** en pantalla hasta **Tarea 23** (`TAREAS_TRELLO.md`). Listas vacías o mensajes de “sin resultados” no deben tumbar la app.

---

## Semana 2

### Tarea 8 — Geolocalización: Supabase (`lane_origins`, provenance)

**Objetivo:** confirmar que la migración de provenance está aplicada y que los datos de orígenes permiten mapas de zona / backfill razonable.

**1) Migración en Supabase (staging o local)**

1. En el proyecto Supabase: **SQL Editor** → ejecuta el contenido de `supabase/migrations/20260421_lane_origins_coordinate_provenance.sql` (o aplica migraciones con tu flujo habitual, p. ej. CLI `supabase db push`).
2. Comprueba que la tabla **`lane_origins`** tiene columnas **`coordinate_source`** y **`geocoded_at`** (Table Editor o `\d lane_origins` en psql).
3. **Esperado tras el script:** filas que ya tenían **`latitude`** y **`longitude`** quedan con **`coordinate_source = 'legacy'`** (salvo que ya hubieras rellenado otro valor). Filas sin coords siguen con **`coordinate_source` NULL** hasta backfill manual o **Tarea 9**.

**2) Auditoría de filas problemáticas (SQL Editor)**

Ejecuta y revisa resultados (ajusta esquema si tu proyecto usa otro nombre de tabla; no expongas el resultado en tickets públicos si contiene datos sensibles):

```sql
-- Activos sin coordenadas (prioridad para mapas / geocodificación)
SELECT id, name, code, city, state, address, is_active, coordinate_source, geocoded_at
FROM lane_origins
WHERE is_active = true
  AND (latitude IS NULL OR longitude IS NULL)
ORDER BY name;

-- Activos con coords pero sin ciudad/estado (revisión manual o completar texto)
SELECT id, name, code, city, state, latitude, longitude, coordinate_source
FROM lane_origins
WHERE is_active = true
  AND latitude IS NOT NULL
  AND longitude IS NOT NULL
  AND (NULLIF(TRIM(city), '') IS NULL OR NULLIF(TRIM(state), '') IS NULL)
ORDER BY name;

-- Valores de coordinate_source fuera del CHECK (no debería devolver filas tras migración)
SELECT id, name, coordinate_source
FROM lane_origins
WHERE coordinate_source IS NOT NULL
  AND coordinate_source NOT IN (
    'nominatim', 'manual', 'import', 'external_api', 'legacy'
  );
```

**3) Comportamiento de la app (smoke)**

1. Con rol **admin** o **dispatcher**, abre **Drivers** → **Driver Pay Rates** → **Rate Profiles** / matriz de carriles donde se listen orígenes (según tu entorno).
2. **Network:** **`GET /api/drivers/pay-rates/origins`** debe responder **200** y cada origen debe incluir **`coordinate_source`** y **`geocoded_at`** (pueden ser `null` en filas pendientes de backfill).
3. Mapas de zona: un origen activo con **lat/lng** debe seguir mostrándose; uno sin coords no debe romper la pantalla (mensaje o mapa vacío según UI).

**Seguridad / buenas prácticas:** no pegues **service role** keys en el navegador; la verificación DDL/DML hazla en Supabase Dashboard o CLI con credenciales adecuadas. Los endpoints de orígenes siguen requiriendo autenticación; mutaciones solo **admin**/**dispatcher** (ver `app/api/drivers/pay-rates/origins/route.ts`).

---

### Tarea 9 — Geolocalización: API de orígenes + backfill con trazabilidad

**Objetivo:** validar en el TMS que la API de orígenes aplica bbox US, verificación opcional de estado (reverse Nominatim), respuesta **`results`** fila a fila en el backfill masivo y registro en **`activity_log`**.

**Prerrequisito:** migración Tarea 8 aplicada (`coordinate_source`, `geocoded_at` en `lane_origins`). Rol **admin** o **dispatcher** para **POST**/**PATCH**.

---

#### Dónde ir en el dashboard (rutas útiles)

| Qué probar | Navegación en inglés (UI) | URL típica |
|------------|---------------------------|------------|
| Listado de orígenes y mapas de zona | **Drivers** → pestaña **Driver Pay Rates** → subpestaña **Rate Profiles** → abrir un perfil con carriles **zonal** que usen un ancla (origen) | `/dashboard/drivers?tab=driver-pay-rates` (luego **Rate Profiles** y abrir perfil) |
| Botón de backfill masivo | Dentro del perfil, bloque **Zone Maps** (solo aparece si hay carriles zonales con origen asignado) | Misma pantalla |
| Matriz de carriles / orígenes | **Driver Pay Rates** → vista de matriz (**Lane rate matrix**) según tu flujo | Depende de cómo abráis el perfil |

**Qué verás en pantalla (Zone Maps):**

- Si **todos** los orígenes del perfil tienen lat/lng: rejilla de mapas (**Zone Maps**) con un mapa por origen.
- Si **algún** origen del perfil **no** tiene coordenadas: caja oscura con texto del estilo *“N origins missing coordinates: …”* y botón naranja **Fix Map Coordinates** (o, si ya hay al menos un mapa, botón pequeño **Fix N Missing** junto al título **Zone Maps**).
- Tras pulsar **Fix Map Coordinates**: mensaje naranja *“Geocoded X of Y origins”* o, si hubo filas problemáticas, *“… (Z row(s) need review — see API response "results")”*. Eso indica que debes abrir **Network** y revisar el cuerpo JSON del **PATCH**.

---

#### 1) `GET` — sin regresión

**Pasos**

1. Entra a **Drivers** → **Driver Pay Rates** → **Rate Profiles** y abre un perfil (o recarga la lista de orígenes).
2. Abre **F12** → **Network** → filtro **Fetch/XHR**.

**Resultado esperado**

- Petición **`GET /api/drivers/pay-rates/origins`** (o con query `?all=true` si la UI lo usa) → **200**.
- En la respuesta JSON, cada elemento de **`origins`** incluye **`coordinate_source`** y **`geocoded_at`** (pueden ser `null`).

---

#### 2) `POST` — alta de origen con geocodificación (camino feliz vía UI)

El TMS crea orígenes por API cuando resuelves una instalación de organización a ancla en un carril zonal (servidor geocodifica ciudad/estado).

**Pasos**

1. En **Rate Profiles**, edita o crea un carril **zonal** y elige una instalación (**facility**) de la lista que tenga **ciudad y estado** en datos de organización.
2. Al guardar/asignar, la UI puede llamar **`POST /api/drivers/pay-rates/origins`** con `name`, `code`, `city`, `state`.

**Resultado esperado**

- **201** en **Network** para ese **POST**.
- Respuesta: objeto **`origin`** con **`latitude`** y **`longitude`** rellenados si Nominatim respondió; **`coordinate_source`** **`nominatim`** en ese caso.
- El origen nuevo aparece en listas/desplegables; **Zone Maps** puede pasar de mostrar solo **Fix Map Coordinates** a mostrar mapas cuando ya hay coords.

**POST — rechazos (probar con consola o cliente REST)**

No hay un formulario dedicado para “pin en Europa”; conviene **Network** → clic derecho en un **POST** existente → **Copy as fetch** y editar el cuerpo, o pegar en la consola (estando logueado en el TMS) un `fetch` a `/api/drivers/pay-rates/origins` con `credentials: 'include'`.

| Caso | Cuerpo de ejemplo (idea) | HTTP | En **Network** / JSON |
|------|---------------------------|------|------------------------|
| Fuera de bbox US | `latitude`/`longitude` fuera de regiones US admitidas + `name`/`code` | **422** | `code`: **`COORDS_OUTSIDE_US_BOUNDS`** |
| Estado incoherente | `latitude`/`longitude` de un estado y `"state": "XX"` (otra abreviatura de 2 letras) | **422** | `code`: **`STATE_COORD_MISMATCH`** (si reverse Nominatim confirma discrepancia) |

---

#### 3) `PATCH` — coordenadas manuales de un origen (`origin_id`)

**Pasos**

1. Copia un **`id`** de `lane_origins` (Table Editor, **GET** de orígenes, o lista en respuesta).
2. Desde consola del navegador (sesión **admin**/**dispatcher**):

```javascript
fetch("/api/drivers/pay-rates/origins", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({
    origin_id: "PEGA_UUID_AQUI",
    latitude: 29.76,
    longitude: -95.37,
  }),
}).then((r) => r.json()).then(console.log);
```

Usa coordenadas **coherentes** con el **`state`** guardado en esa fila (p. ej. Houston, TX).

**Resultado esperado**

- **200** y `{ "updated": 1 }`.
- En BD / **GET** posterior: **`coordinate_source`** **`manual`**, **`geocoded_at`** reciente.
- **400** si lat/lng no son números finitos; **404** si el UUID no existe; **422** si bbox o verificación de estado fallan.

---

#### 4) `PATCH` — backfill masivo (lo que hace el botón **Fix Map Coordinates**)

**Pasos**

1. Sitúate en **Rate Profiles** con **Zone Maps** visible y orígenes sin coordenadas (o usa consola).
2. Pulsa **Fix Map Coordinates** / **Fix N Missing**, o ejecuta:

```javascript
fetch("/api/drivers/pay-rates/origins", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify({}),
}).then((r) => r.json()).then(console.log);
```

**Simulación sin escribir en BD:**

```javascript
body: JSON.stringify({ dry_run: true })
```

**Resultado esperado**

- **200** y JSON con **`updated`**, **`total`**, **`dry_run`**, **`results`** (array).
- Cada elemento de **`results`** tiene **`id`**, **`name`**, **`status`** y a veces **`detail`**:
  - **`success`**: fila actualizada.
  - **`skipped_no_city_state`**: activo pero sin ciudad/estado para geocodificar.
  - **`geocode_failed`**: Nominatim no devolvió punto.
  - **`rejected_out_of_bounds`**, **`rejected_state_mismatch`**, **`rejected_not_us_country`**: validación no pasó (`detail` con texto).
  - **`db_error`**: error al guardar.
  - Con **`dry_run: true`**: **`dry_run_would_update`** donde habría actualizado.

**En la UI:** mensaje bajo **Zone Maps** con *“Geocoded X of Y origins”*; si hubo problemas, texto con *need review* y revisar **`results`** en **Network**.

**Auditoría:** en Supabase, tabla **`activity_log`**: **`entity_id`** = **`lane_origins_bulk`**, **`action`** = **`bulk_geocoded`** o **`bulk_geocode_dry_run`**, **`details.summary`** con conteos por `status`.

---

#### 5) Script CLI (operaciones, sin navegador)

**Pasos**

1. Exporta `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
2. En la raíz del repo: `npx tsx scripts/backfill-lane-origins-geocode.ts --dry-run` (solo logs) o sin `--dry-run` para persistir.

**Resultado esperado**

- Líneas `[status] id name` en consola; al final *“Updated: …”* o *“Would update: …”* en dry-run.

---

#### Tiempo de respuesta

El backfill masivo puede tardar **más de un minuto** si hay muchas filas (≈1 solicitud/s a Nominatim por pasos forward/reverse). No cierres la pestaña hasta ver **200** o error en **Network**.

---

### Tarea 10 — Geolocalización: Nominatim solo en servidor (`/api/geocoding/forward`)

**Objetivo:** comprobar que el navegador ya no llama a `nominatim.openstreetmap.org` directamente y que la geocodificación pasa por **`POST /api/geocoding/forward`** (sesión **admin** o **dispatcher**).

**Decisión `LoadSidebarMap`:** geocodificación por API; rutas entre puntos siguen con **OSRM** en el cliente.

**SUPABASE:** SUPABASE SIN CAMBIOS.

**Nota — `tsc` y `lint`:** sobre el código de la Tarea 10 ya se ejecutaron **`npx tsc --noEmit`** y **`npm run lint`** en el entorno donde se integró el cambio, con resultado correcto. **No es obligatorio** que los vuelvas a lanzar solo para “reprobar la tarea”; sí conviene ejecutarlos en tu máquina **si modificas** el proyecto después de eso.

---

#### 1) Dispatcher — detalle de carga, mapa **Route** (`LoadSidebarMap`) — camino más visible

**Pasos**

1. Como **admin** o **dispatcher**, abre **Dispatcher** y el detalle de una carga con **pickup** y/o **delivery** (y **return** si aplica) en texto.
2. En la barra lateral, sección **Route**, espera a que el mapa termine de cargar.
3. Abre **F12** → **Network** → **Fetch/XHR**.

**Resultado esperado**

- Para cada cadena de ubicación geocodificada, **`POST /api/geocoding/forward`** con **`"mode":"address_fallbacks"`** (una petición por parada; los reintentos de dirección van en el servidor).
- **No** deben listarse solicitudes del cliente a **`nominatim.openstreetmap.org`**.
- Pueden seguir apareciendo solicitudes a **`router.project-osrm.org`** (ruta en carretera entre coordenadas); es el comportamiento esperado.
- Mapa con marcadores **Pickup** / **Delivery** / **Return** cuando hay coords; si no hay resultados, *No locations to map* o equivalente sin romper la página.

---

#### 2) **Lane Rate Matrix** — modal **Add New Origin** (geocodificar antes de guardar)

En el dashboard, la matriz legacy (orígenes / zonas / celdas de tarifa) está bajo **Drivers** → **Driver Pay Rates** → subpestaña **Lane Rate Matrix** (entre **Rate Profiles** y **Accessorials**). URL de atajo: **`/dashboard/drivers?tab=driver-pay-rates`** y luego el botón **Lane Rate Matrix**.

**Pasos**

1. Inicia sesión como **admin** o **dispatcher**.
2. Barra lateral: **Drivers**.
3. Primera fila de pestañas de la página: **Driver Pay Rates** (no *Driver Profiles*).
4. Segunda fila (dentro del bloque de pay rates): pestaña **Lane Rate Matrix**.
5. Abre el modal **Add New Origin** así:
   - Si **no** hay ningún origen en el sistema: botón naranja central **Create Origin**.
   - Si **ya** hay orígenes (como en una cuenta con datos): a la **derecha** de la fila de subpestañas (**Driver Groups** / **Rate Profiles** / …) aparecen iconos: el **segundo** es **+** con *tooltip* en inglés **Add Origin** (el primero, icono de ruta, es **Add Zone**). Eso abre el mismo modal de nuevo origen.
   - **No** uses **+ Add First Zone** del panel principal para probar geocodificación de un **origen**: ese botón crea la **primera zona** del origen **ya seleccionado** en el desplegable **ORIGIN**, no un origen nuevo.
6. En el modal **Add New Origin**, rellena al menos **Address** y/o **City**, **State**, **ZIP** (cualquier combinación no vacía que permita buscar).
7. **Geocodificar (no confundir con guardar):** en la misma fila que la etiqueta **COORDINATES** (en inglés en la UI), a la **derecha**, hay un control **pequeño** naranja con icono de **lupa** y el texto en inglés **Lookup from address**. Ese es el que llama a **`/api/geocoding/forward`** y rellena lat/lng. **No** es el botón grande naranja del pie del modal **+ Create Origin**: ese último **envía** el formulario y crea el registro en base de datos **después** de que ya tengas los datos listos.

8. **Cómo verlo en el inspector (Network), paso a paso** (Chrome / Edge; Firefox es similar):

   1. Abre **DevTools** (**F12** o clic derecho → **Inspeccionar**) y entra a la pestaña **Network** / **Red**.
   2. Arriba, elige el filtro de tipo **Fetch/XHR** (o **Todo** / **All** si no ves nada).
   3. Pulsa **Borrar** / **Clear** (icono de prohibido o papelera) para vaciar la lista **antes** del clic en **Lookup from address**, así la petición nueva no se mezcla con otras.
   4. **Importante:** en el cuadro de filtro de texto de **Network**, **no** busques la palabra `lookup`: la URL del API **no** lleva “lookup”. Escribe **`forward`** o **`geocoding`** o deja el filtro **vacío** y busca en la columna **Nombre** / **Name** una fila **`forward`** bajo tu sitio (`localhost` o tu dominio).
   5. Con el modal ya abierto y los campos de dirección rellenos, pulsa **Lookup from address** una vez.
   6. Debe aparecer una fila **`forward`** con método **POST** y estado **200** (o **401**/**403** si hay problema de sesión). Clic en esa fila → pestaña **Payload** / **Carga útil**: debe verse JSON con **`query`** y **`mode":"single"`**; en **Response** / **Respuesta**, **`found`** y **`lat`** / **`lng`** si hubo hit.

   Si filtras por `lookup` la lista quedará **vacía** aunque el flujo funcione: es comportamiento normal del filtro, no del TMS.

**Resultado esperado**

- Una petición **`POST /api/geocoding/forward`** con cuerpo JSON del estilo `{ "query": "…", "mode": "single" }` → **200**.
- Respuesta **`{ "found": true, "lat": <número>, "lng": <número> }`** y los campos **Latitude** / **Longitude** del formulario se rellenan (6 decimales).
- **No** debe aparecer una petición del navegador a **`https://nominatim.openstreetmap.org/...`**.
- Si la dirección no resuelve en US válido para el servidor: **`{ "found": false }`** y mensaje en UI del tipo *No results found — try a more specific address*.

**Errores esperados**

- **401** / **403:** sesión caducada o rol no permitido; la UI puede mostrar aviso de permiso/sesión.

---

#### 3) Verificación en modo inspección (DevTools)

**Pasos**

1. **Network** → filtro de texto **`nominatim`**. Repite el flujo del **Dispatcher / Route** (apartado 1) y el de **Lane Rate Matrix / Lookup from address** (apartado 2).

**Resultado esperado**

- **Cero** peticiones en **Network** del navegador hacia **`nominatim.openstreetmap.org`**: Nominatim solo se invoca en el **servidor** al atender **`/api/geocoding/forward`**, y esas llamadas **no** aparecen en DevTools como tráfico del cliente. Sí debes ver los **POST** a **`/api/geocoding/forward`**.

2. Opcional: en **Network**, clic en **`POST .../api/geocoding/forward`** → pestaña **Payload** / **Carga útil**: comprueba **`query`** y **`mode`** (`single` vs `address_fallbacks`).

**Resultado esperado**

- Payload acorde al flujo; respuesta JSON **`found`** coherente con si el mapa o los campos lat/lng se rellenaron.

---

### Tarea 11 — Dual transactions: ahorro estimado por distancia (implementación)

**Rol:** **admin** o **dispatcher**. Objetivo: comprobar que el ahorro usa **geocodificación + Haversine** (no USD fijo por par), que **API** y **`DualTransactionsView`** comparten criterio de par, y que los importes en UI/API **no** son aleatorios.

**Importante — qué existe hoy en rutas:** La pantalla canónica es **`/dashboard/dispatcher/dual-transactions`** (**`DualTransactionsView`**), con barra de ahorro, **Recommend Duals**, **`resolve-locations`** y enlace vía **`POST …/match`** (Tarea 23). **`DualTransactionsTab`** sigue en código para **`DispatcherPageTabs`** (si se monta en otra ruta); la prueba de producto prioriza **`DualTransactionsView`**.

---

#### 1) Pantalla **`/dashboard/dispatcher/dual-transactions`**

**Pasos**

1. Abre **`/dashboard/dispatcher/dual-transactions`** (menú **Dispatcher** → **Dual Transactions**).
2. Revisa tarjetas de resumen, tablas **Returns** / **Pick Ups**, barra **Est. Savings** / **Potential** y botón **Recommend Duals**.
3. Cambia filtros (**SSL**, tamaño, terminal, búsqueda) y comprueba que las tablas responden sin errores y que en **Network** aparece **`POST …/resolve-locations`** cuando cambian las direcciones filtradas.

**Resultado esperado**

- Pares recomendados y totales respetan **mismo SSL**, **misma categoría de tamaño**, **`return_location` = `pickup_location`** (misma regla que la API).
- Los importes de ahorro son **estables** entre recargas con los mismos datos (no **Math.random**).
- Tras **Recommend Duals**, filas compatibles se resaltan; **Link** enlaza vía API cuando el par es válido (ver **Tarea 23**).

---

#### 2) API (Postman / Network)

**Pasos**

1. **GET** **`/api/dispatcher/dual-transactions`** (sesión **admin**/**dispatcher**).

**Resultado esperado**

- **200**; en **`potentialMatches`**, cada elemento incluye **`estimatedSavings`** (USD) y **`estimatedSavedMiles`**; orden descendente por **`estimatedSavings`** cuando hay varios. El **`summary`** puede incluir **`totalPotentialSavingsUsd`** y **`sumPairwisePotentialSavingsUsd`**.

2. **POST** **`/api/dispatcher/dual-transactions/match`** con cuerpo válido **`importLoadId`** / **`exportLoadId`** que cumplan **`dualPairCompatible`**.

**Resultado esperado**

- **200** y **`data.estimatedSavingsUsd`** / **`data.estimatedSavedMiles`** presentes. **400** si SSL/tamaño/terminal no coinciden (mensaje acorde).

3. (Opcional) **POST** **`/api/dispatcher/dual-transactions/resolve-locations`** con **`{ "addresses": [ … ] }`**: **200** y **`coords`**; la pantalla actual **no** dispara esta petición al filtrar — validación manual o tras **Tarea 23** si se reexpone en cliente.

---

### Tarea 13 — Terminales: carga dinámica (catálogo + filtros)

**Rol:** usuario autenticado (cualquier rol con lectura de **`terminals`** vía RLS; el API exige sesión válida). Para pantallas de dispatcher: **admin** o **dispatcher**.

**Qué se hizo / qué probar:** Catálogo de filtros desde tabla **`terminals`** (nombres que mapean a **BCT**/**BAY** por texto, o código explícito al final del nombre `Nombre (COD)`), unión con códigos que ya vienen en **`vessels.terminal`** / contexto de cargas, **`GET /api/terminals`** con caché breve para el cliente, tarjetas en **Vessels** sin límite fijo a dos códigos, **`DualTransactionsTab`** con fetch al API y **`loadMatchesPhTerminalFilter`**, y selects **dual-transactions** / **street-turns** con join **`containers.vessels`**.

#### 1) API `GET /api/terminals`

**Pasos**

1. Inicia sesión en el TMS. Abre **F12** → **Network** → **Fetch/XHR**.
2. Navega a una vista que dispare la carga (p. ej. pestaña interna **Dual Transactions** en **`DispatcherPageTabs`**, si la usas en tu build) o ejecuta en la consola del navegador:  
   `fetch('/api/terminals', { credentials: 'include' }).then(r => r.json()).then(console.log)`

**Resultado esperado**

- **200** y cuerpo `{ terminals: [ { id, name }, … ] }` ordenado por nombre.
- **401** sin sesión.

#### 2) Vessels (`/dashboard/vessels`)

**Pasos**

1. Entra a **Vessels**.
2. Revisa las **tarjetas** bajo el título: deben aparecer **BCT** y **BAY** si existen en el catálogo, más **cualquier otro código** presente en datos de buques y en las opciones fusionadas.
3. Usa el desplegable **Terminals** en **All Vessels** y filtra por un código listado.
4. Opcional: exporta CSV y confirma que la columna **Terminal** sigue siendo el código del buque.

**Resultado esperado**

- Sin errores de UI; filtro **Terminal** coincide con códigos de **`vessel.terminal`**.
- Si añades en Supabase una fila **`terminals`** con nombre reconocible (p. ej. “…BAYPORT…”) o con sufijo **`(XYZ)`**, tras recargar la página el código correspondiente puede aparecer en opciones cuando aplique la lógica de **`lib/terminals/phTerminalFilters.ts`**.

#### 3) Containers (`/dashboard/containers`)

**Pasos**

1. Mismo flujo que **Vessels** sobre el filtro de terminal de **`ContainerTable`**.

**Resultado esperado**

- Filtrado por **`vessels.terminal`** del contenedor; opciones incluyen fusión con catálogo + códigos vistos en datos.

#### 4) Dual Transactions (`/dashboard/dispatcher/dual-transactions`)

**Pasos**

1. Abre la ruta; en **PICK UPS**, prueba chips **Terminal** (**All** + códigos).
2. Comprueba que al elegir un terminal la lista se reduce de forma coherente (criterio **`loadMatchesPhTerminalFilter`**: ubicaciones + **transit_state** + terminal de buque si viene en el join).

**Resultado esperado**

- Sin pantalla en blanco; filtros reaccionan al instante.

#### 5) Street Turns (`/dashboard/dispatcher/street-turns`)

**Pasos**

1. Misma idea: filtros de ubicación/terminal que usan **`phTerminalFilterOptions`** cargadas con **`mergePhTerminalOptionsForLoadRows`** (incluye **`containers.vessels.terminal`** en el select de la página).

**Resultado esperado**

- Filtros operativos; datos de terminal de buque disponibles para la fusión de opciones.

#### 6) `DualTransactionsTab` (si montas `DispatcherPageTabs`)

**Pasos**

1. Abre la pestaña **Dual Transactions** dentro del layout que monte **`DispatcherPageTabs`**.
2. Observa **Network**: debe existir **`GET /api/terminals`** al cargar la pestaña.
3. Mientras carga, el área de chips puede mostrar **Loading terminals…**; si falla el API, mensaje en ámbar y chips basados en fallback/códigos de buque.

**Resultado esperado**

- Chips de terminal alineados con **`DualTransactionsView`** (misma familia de códigos), no solo texto bruto de **`pickup_location`**.

---

### Tarea 14 — Loads: holds en asignación de conductor (`assign-driver`)

**Rol:** **dispatcher** y **admin** (la API solo admite esos roles). Los casos de bloqueo por holds aplican a **dispatcher**; **admin** puede forzar asignación con holds activos (misma política que **`PATCH …/loads/[id]/status`**).

**Preparación:** Una carga en estado temprano (**Pending** / **Available** / **Assigned**) con al menos un hold activo según **`lib/loadHolds.ts`** (p. ej. `freight_hold` = **`hold`**, o **`carrier_hold` = true**). Otra carga de control sin holds activos.

#### 1) API `POST /api/dispatcher/loads/[id]/assign-driver`

**Pasos**

1. Con sesión **dispatcher**, envía **POST** con cuerpo **`{ "driver_id": "<uuid válido disponible>" }`** sobre la carga con holds activos (Postman, curl con cookie, o reproducir desde la UI y revisar **Network**).
2. Repite con sesión **admin** sobre la misma carga.

**Resultado esperado**

- **Dispatcher:** **403**, cuerpo con **`code: "ACTIVE_HOLDS"`**, **`activeHolds`** (claves) y **`error`** legible.
- **Admin:** **200** y carga actualizada con **`driver_id`** (override).
- Sin holds activos: **dispatcher** recibe **200** como antes (sin regresión).

#### 2) Dispatcher — tabla de cargas (`LoadsTable`)

**Pasos**

1. Inicia sesión como **dispatcher**. Abre **`/dashboard/dispatcher`** (o la vista que monte la tabla de cargas).
2. Localiza una fila con holds activos (coherente con el panel lateral / badge de holds si lo ves).
3. Intenta usar el control de **asignar conductor** en esa fila.

**Resultado esperado**

- El control está **deshabilitado** y el *tooltip* indica que hay que liberar holds. Si forzaras la petición, el mensaje de error debe reflejar **`ACTIVE_HOLDS`**.

#### 3) Dispatcher — vista Planner (`PlannerView`)

**Pasos**

1. Misma sesión **dispatcher**, misma carga con holds.
2. Usa el desplegable / acción de asignar conductor en el planner para esa carga.

**Resultado esperado**

- Asignación bloqueada en UI (deshabilitado + *tooltip*); error coherente si la llamada falla.

#### 4) Dispatcher — panel de detalle (`LoadDetailPanel`)

**Pasos**

1. Abre el detalle de la carga con holds activos.
2. Observa **Assign driver** / **Reassign** (o equivalente en **`DriverActionPanel`**).

**Resultado esperado**

- Botones deshabilitados para **no-admin**; no debe abrirse el flujo de asignación al clic. Con holds liberados, el flujo vuelve a estar disponible.

---

## Semana 3

### Tarea 15 — Tests críticos + CI (Jest/RTL)

**Objetivo:** validar que la cobertura nueva de pruebas protege el flujo de cálculo de pago, la transición de estado con holds y el orquestador de sync Port Houston, y que el pipeline CI lo ejecuta sin conflictos.

**Configuración Jest (una sola fuente de verdad):** en la raíz del repo el archivo activo es **`jest.config.mjs`**. No debe existir **`jest.config.ts`**: Jest en GitHub Actions no trae `ts-node` para leer config en TypeScript, y duplicar ambos nombres en documentación genera ruido en revisiones. El informe de alcance sigue en **`README_REPORTES_DIARIOS.md`** (2026-04-28, Tarea 15); aquí solo los pasos de prueba.

#### 1) Prueba local automática (rápida)

1. En la raíz del proyecto, ejecuta:
   - `npm test`
2. Deben pasar al menos estas pruebas nuevas:
   - `lib/pay-calculator.test.ts`
   - `app/api/dispatcher/loads/[id]/status/route.test.ts`
   - `lib/port-houston/sync.test.ts`
3. Verifica además:
   - `npm run lint`
   - `npx tsc --noEmit`

#### 2) Prueba visual (manual corto para cliente)

**Ruta exacta en el menú (sidebar):**

1. Inicia sesión con usuario **dispatcher**.
2. En la barra lateral izquierda, entra a **Dispatcher** (se despliegan opciones).
3. Haz clic en **Load Board** (ruta: **`/dashboard/dispatcher`**).
4. En la tabla/lista de cargas, abre una carga con estado **Assigned** (clic sobre la fila o acción de detalle para abrir el panel derecho).
5. En el detalle de la carga, verifica que tenga al menos un hold activo (por ejemplo `freight_hold = hold`, `terminal_hold = hold` o `carrier_hold = true`).
6. En la sección de acciones de estado (**DriverActionPanel** / botones de estado), intenta cambiar a **In Transit**.

**Resultado esperado (visual):**

- La transición se bloquea para rol **dispatcher**.
- Se muestra mensaje indicando holds activos (no debe avanzar a **In Transit**).
- La carga se mantiene en su estado previo (por ejemplo **Assigned**).

**Si no encuentras una carga en Assigned:**

1. Quédate en **Dispatcher -> Load Board**.
2. Usa búsqueda/filtros de la tabla para localizar cargas en **Assigned** o **Dispatched**.
3. Repite los pasos de intento de transición en una carga con hold activo.

**Si no existe ninguna carga Assigned, crea un ejemplo de prueba:**

1. En el menú lateral: **Dispatcher -> New Load** (o botón **+ Add New Load** dentro de Dispatcher).
2. Crea una carga mínima de prueba con datos obligatorios (customer, tipo de carga, pickup y delivery) y guarda.
3. Regresa a **Dispatcher -> Load Board** y abre esa carga.
4. Asigna un conductor desde el panel/acción de asignación para que la carga pase a **Assigned**.
5. Activa un hold desde la UI (sin tocar base de datos):
   - En el detalle de la carga, abre la pestaña **Load Info**.
   - Baja a la sección **Container Visibility**.
   - En **Freight Hold** (o **Custom Hold / Terminal Hold / Fees/Storage Hold / Other Hold**), marca la opción **Hold**.
   - Alternativamente, marca el checkbox **Carrier Hold**.
   - Verifica que el cambio quede guardado y regresa a acciones de estado.
6. Intenta cambiar estado a **In Transit**.

**Resultado esperado del ejemplo creado:**

- La carga creada de prueba queda en **Assigned** antes del intento.
- Con hold activo, la transición a **In Transit** se bloquea para **dispatcher** con mensaje de holds.

**Ejemplo de prueba para cliente (texto simple):**  
"Entra a **Dispatcher -> Load Board**, abre una carga en **Assigned** con hold activo y prueba pasarla a **In Transit**; valida que el sistema la bloquee para dispatcher y muestre el aviso de holds."

#### 3) Modo inspección (solo si aplica)

1. Abre **DevTools** (F12) -> **Network** -> **Fetch/XHR**.
2. Vuelve a hacer el flujo: **Dispatcher -> Load Board -> abrir carga -> intentar In Transit**.
3. Confirma que la llamada a **`PATCH /api/dispatcher/loads/<id>/status`** responde **403** con **`code: "ACTIVE_HOLDS"`** y lista **`activeHolds`**.

---

### Tarea 16 — E2E navegador (Playwright)

**Objetivo:** validar en automático un flujo E2E base de **login + Dispatcher Load Board** y un smoke de **Vessels / Port Houston**, sin reemplazar los tests unitarios de Tarea 15.

#### 1) Configuración mínima para correr E2E

1. En raíz del proyecto, define variables de entorno para pruebas:
   - `E2E_USER_EMAIL=<usuario_test>`
   - `E2E_USER_PASSWORD=<password_test>`
2. Asegúrate de tener el TMS corriendo local:
   - `npm run dev`
3. (Solo primera vez) instala navegador de Playwright:
   - `npx playwright install chromium`

#### 2) Ejecutar suite E2E

1. Corre:
   - `npm run test:e2e`
2. Opcional con navegador visible:
   - `npm run test:e2e:headed`

**Resultado esperado:**

- Se ejecuta el archivo `e2e/dispatcher-loadboard.spec.ts`.
- Si faltan variables `E2E_USER_EMAIL`/`E2E_USER_PASSWORD`, la suite se marca como **skipped** (no falla CI por credenciales ausentes).

#### 3) Rutas visuales cubiertas por el E2E (manual equivalente)

**Caso A — Login + Load Board (dispatcher happy path básico):**

1. Ir a **`/login`**.
2. Capturar **Email Address** y **Password**.
3. Clic en **Sign In**.
4. Ir a **`/dashboard/dispatcher`**.
5. Verificar que carga la vista del tablero (panel y contenido de dispatcher visibles).

**Caso B — Smoke Port Houston en Vessels:**

1. Ir a **`/dashboard/vessels`**.
2. Verificar encabezado **Vessel Tracking**.
3. Verificar botón **Sync Now** visible (control de sync Port Houston disponible).

#### 4) Modo inspección (solo si aplica)

1. Abre **DevTools** (F12) -> **Network** -> **Fetch/XHR**.
2. Repite flujo de login y navegación a:
   - **`/dashboard/dispatcher`**
   - **`/dashboard/vessels`**
3. Confirma respuestas **200/30x** en navegación y que no haya errores de runtime en consola al cargar ambas pantallas.

---

### Tarea 17 — UX: errores, loading y exports CSV coherentes

**Contexto / qué cambió:** resumen en **`README_REPORTES_DIARIOS.md`** → **2026-04-29** (bloque Tarea 17). Abajo solo pasos de verificación.

**Cómo probar en el TMS (resultado esperado):**

1. Inicia sesión con rol **admin** o **finance** y abre **`/dashboard/accounts-payable/settlements`**.
2. Pulsa **Pay Breakdown CSV** y luego **Deductions CSV**: en cada clic debe verse spinner mientras descarga, sin doble disparo del botón.
3. Si la respuesta API es 200, se descarga archivo `.csv` con nombre `pay-breakdown-YYYY-MM-DD.csv` o `deductions-YYYY-MM-DD.csv`.
4. Simula error de API (por ejemplo fecha inválida en query manual o forzando respuesta no-OK): debe aparecer mensaje rojo en la UI (no solo `console.error`).
5. Inicia sesión con rol **dispatcher** (u otro no financiero) en la misma pantalla: botones CSV deben estar deshabilitados y con `title` de permiso.
6. Verifica seguridad servidor llamando `GET /api/accounts-payable/settlements/csv?...` con rol no autorizado: esperado **403 Forbidden**.
7. Smoke de calidad local: ejecutar `npm run lint` y `npx tsc --noEmit` en el repo; ambos deben finalizar sin errores.

---

### Tarea 18 — Email: mapa de eventos y endurecimiento

**Dónde se prueba:**

- **Principal:** en la **UI del TMS**.
- **Verificación técnica:** en **Inspector del navegador** (Network).
- **Opcional:** en **Postman** para probar endpoints directos.

**Paso a paso recomendado (UI + Inspector):**

1. Inicia sesión como **admin** o **accounting**.
2. Ve a **`/dashboard/accounts-payable/settlements`**.
3. Elige una fila y pulsa **Finalize** (esto dispara correo `settlement_ready`).
4. En la misma fila, pulsa icono **Email** y envía correo manual.
5. Abre **F12 → Network** y valida:
   - `PATCH /api/accounts-payable/settlements/<id>` responde **200**.
   - `POST /api/accounts-payable/settlements/email` responde **200** y trae `messageId`.
6. (Backoffice) En **Supabase → `activity_log`** confirma registros de email:
   `settlement_finalized_email_sent` / `..._failed` / `..._skipped_inactive_template`.

**Opcional (Postman):**

- Probar `POST /api/accounts-payable/settlements/email` con sesión válida (cookie/token) y body con `to`, `driverName`, `periodStart`, `periodEnd`.
- Esperado: **200** + `messageId`; si faltan campos, **400**.

**Comandos locales:** `npm run lint`, `npx tsc --noEmit`, `npm test`.

**Mapa y detalle técnico:** **`README_REPORTES_DIARIOS.md`** → **2026-04-29** (bloque Tarea 18).

---

### Tarea 19 — Finanzas web: facturación A/R por lotes y cierre A/P settlements

**Contexto / qué cambió:** resumen en **`README_REPORTES_DIARIOS.md`** → **2026-04-29** (bloque Tarea 19).

**Dónde se prueba:** UI (**Billing**, **Settlements**) e Inspector (**Network**). Datos: al menos varias **`ar_invoices`** en **`Approved`**, **`amount_paid`** 0, mismo cliente en varias filas; y **`ap_driver_pay`** en periodo visible en **`Unapproved`** o **`Approved`**, **`settlement_id`** nulo.

**Pasos — Batch A/R (Billing):**

1. Inicia sesión como **admin**, **accounting** o **finance**.
2. Ve a **`/dashboard/accounts-receivable/billing`**.
3. Pulsa **Preview batch**: debe abrirse el modal con grupos por cliente (o mensaje de cero grupos si no hay candidatas **Approved** sin pago).
4. Pulsa **Create batch invoices**: esperado **200** en **`POST /api/accounts-receivable/invoices/batch`**; en la tabla, líneas originales en **`Consolidated`** y cabecera(s) **`Billed`** con número tipo **`BATCH-…`**; mismo **Charge Set #** en el grupo.
5. Verifica **`GET /api/accounts-receivable/invoices/batch`** (preview) en Network si necesitas repetir sin mutar.
6. Comprueba que **Aging** / widget de AR no duplican importe: líneas **`Consolidated`** no deben sumar como pendientes (filtro en aging/dashboard).

**Pasos — Generar settlements (A/P):**

1. Con el mismo rol financiero, ve a **`/dashboard/accounts-payable/settlements`**.
2. Ajusta la semana (flechas) para cubrir fechas de **`pay_date`** de tus líneas **`ap_driver_pay`**.
3. Opcional: filtra **Search driver** / selector de conductor para acotar.
4. Pulsa **Generate settlements**: primero se llama **`GET /api/accounts-payable/settlements/generate?period_start=…&period_end=…`**; confirma en el modal y ejecuta **`POST`** con el mismo periodo.
5. Esperado: **200** y **`settlements_created` ≥ 1** si había líneas elegibles; **`ap_driver_pay`** enlazadas pasan a **`Settled`**. Si no hay líneas, **400** y cuerpo con **`code: "NO_UNSETTLED_PAY"**.
6. **Review / Finalize:** prueba un **`PATCH /api/accounts-payable/settlements/<uuid>`** real (fila con settlement persistido, no fila agregada solo por pay sin registro **`ap_settlements`**): errores deben mostrarse en pantalla si la API responde **4xx/5xx**.

**Comandos locales:** `npm run lint`, `npx tsc --noEmit`, `npm test`.

---

### Tarea 20 — Realtime y centro de notificaciones

**Contexto / qué cambió:** resumen en **`README_REPORTES_DIARIOS.md`** → **2026-04-30** (bloque Tarea 20).

**Supabase:** aplicar migración **`20260505_task20_realtime_task21_indexes_task22_note.sql`** (añade tablas a **`supabase_realtime`** si faltan). En **Database → Publications** debe figurar **`loads`**, **`containers`**, **`vessels`**, **`activity_log`** en **`supabase_realtime`**.

**Ruta breve para probar (2 sesiones recomendadas):**

1. En tu navegador normal, inicia sesión con usuario **admin**.
2. Para segunda sesión (recomendado): abre una ventana **Incógnito** (o un navegador distinto), entra al mismo TMS e inicia sesión con usuario **dispatcher**.  
   Si no tienes usuario dispatcher, créalo desde **Admin > User Management > Add User** y en **Role** selecciona **dispatcher**.
3. **Sesión A (admin):** en el menú lateral izquierdo, haz clic en **Dispatcher** para expandir y luego clic en **Load Board**.
4. **Sesión A (admin):** sin cerrar esa vista, haz clic en **Dashboard** en el menú lateral (pantalla principal) para dejar una vista de referencia de módulos/contadores.
5. **Sesión B (dispatcher):** en el menú lateral, clic en **Dispatcher** > **Load Board**.
6. **Sesión B (dispatcher):** en la tabla, haz clic una sola vez sobre una fila de carga para abrir el detalle/edición de esa carga; en el campo o control **Status**, cambia el estado (ejemplo: **Dispatched** o **In Transit**) y guarda/aplica el cambio con el botón visible en el panel/modal.
7. **Resultado esperado en Sesión A (admin):** vuelve a **Dispatcher > Load Board** y/o **Dashboard**; en pocos segundos deben reflejarse cambios sin presionar F5.
8. En cualquier sesión staff, en la barra superior (header) haz clic en el ícono de campana **Alerts** (arriba a la derecha). Verifica:
   - lista de alertas visibles (demurrage / unassigned / vessels),
   - texto de estado de realtime (activo o reconexión/fallback),
   - enlace **Open notification center** al final del dropdown.
9. Desde esa campana, haz clic en **Open notification center** (alternativa: menú lateral **Notifications**).  
   Esperado: se abre el historial agrupado por fecha y al generar nueva actividad (otro cambio de status) el feed se actualiza.
10. Prueba de degradación (opcional): simula corte de realtime y confirma que la UI sigue usable y la campana muestra reconexión/fallback.

**Comandos locales:** `npm run lint`, `npx tsc --noEmit`, `npm test`.

---

### Tarea 21 — Import CSV (conductores / grupos) y optimización de reportes

**Contexto:** resumen en **`README_REPORTES_DIARIOS.md`** → **2026-04-30** (bloque Tarea 21). **Supabase:** aplicar **`20260430_csv_import_staff_and_report_indexes.sql`** (RPC + índices) y, en el mismo proyecto, **`20260505_task20_realtime_task21_indexes_task22_note.sql`** (refuerzo idempotente de índices + aviso si faltan RPC). Si tras aplicar la segunda migración el log de Postgres muestra **NOTICE** de funciones ausentes, ejecuta o vuelve a aplicar **`20260430_...`** completo.

**Plantillas:** archivos en **`docs/csv_templates/`**; descarga autenticada desde el TMS: **`/api/admin/csv-template/drivers`** y **`/api/admin/csv-template/driver_groups`**.

#### 1) Import conductores

1. Inicia sesión como **admin** o **dispatcher**.
2. **Drivers** → pestaña **Driver Profiles**.
3. Pulsa **Import CSV** (junto a export / **Add Driver**).
4. Opcional: abre el enlace de plantilla y guarda el CSV de ejemplo.
5. Sube un CSV válido (cabeceras como en la plantilla; **phone** obligatorio; **name** o **first_name** + **last_name**).
6. **Esperado:** mensaje de éxito implícito (modal se cierra) y la tabla se refresca; en **Network**, **`POST /api/admin/csv-import`** con **`entity":"drivers"`** responde **200** y cuerpo con **`result.inserted`** / **`result.updated`**. En Supabase **`activity_log`**, entrada **`csv_import`** / **`bulk_upsert`**.
7. **Regresión upsert:** repite con el mismo **phone** cambiando **name**; debe incrementar **`updated`** (no duplicar fila). Con **id** UUID existente en el CSV, debe actualizar esa fila.
8. **Error transaccional:** en un CSV de prueba, mezcla una fila con fecha inválida en **license_expiry**; **esperado:** **400** y ningún cambio parcial (verificar que el conductor “bueno” de la misma petición no quedó a medias — en la práctica el modal mostrará el error de Postgres/Zod).

#### 2) Import grupos (driver groups)

1. **Drivers** → **Driver Pay Rates** → subpestaña **Driver Groups**.
2. **Import CSV** → plantilla **`driver_groups`**; **`pay_type`** ∈ `per_move` | `hourly` | `per_mile` | `percentage` | `flat`; **`base_rate`** numérico.
3. Opcional: columna **`rate_profile_name`** con nombre **exacto** de un **`rate_profiles.name`** existente.
4. **Esperado:** **200** en **`POST /api/admin/csv-import`** con **`entity":"driver_groups"`**; lista de grupos se refresca. Mismo **name** (ignorando mayúsculas) debe **actualizar**, no duplicar.

#### 3) Reportes / aging (smoke tras índices)

1. Abre **`/dashboard/reports/overview`** y **`/dashboard/reports/financial/aging`** como rol con acceso.
2. **Esperado:** carga sin timeout; en Supabase **Query Performance** (si está disponible) las consultas sobre **`loads.created_at`** y **`ar_invoices`** abiertas deberían beneficiarse de los índices nuevos (validación cualitativa).

**Comandos locales:** `npm run lint`, `npx tsc --noEmit`, `npm test`.

---

### Tarea 22 — Operación, seguridad y QA (checklist)

**Contexto:** **`docs/RLS_SECURITY_REVIEW_T22.md`**, **`README_STEPS_NEXTS.md`** §6.1 (Phase 9). **Supabase (Tarea 22):** el checklist RLS/operación **no** exige DDL nuevo propio de la T22; conviene tener aplicadas **`20260430_csv_import_staff_and_report_indexes.sql`** (si usas import CSV) y **`20260505_task20_realtime_task21_indexes_task22_note.sql`** (Realtime T20 + refuerzo índices T21). Detalle en **`README_REPORTES_DIARIOS.md`** → **2026-05-05** (bloque migraciones).

#### 1) RLS y datos sensibles (revisión manual)

1. Con usuario **accounting** / **finance**, confirma acceso solo a rutas y menús esperados (sin rutas de admin de usuarios si no corresponde).
2. Con usuario **dispatcher**, intenta abrir URLs de A/R o A/P restringidas; **esperado:** **403** o redirección, sin datos en JSON.
3. **Phase 9 (Testing Plan):** si el portal cliente y documentos están en uso, verificar subida respetando **50 MB** y que un cliente **no** vea documentos de otro (según políticas actuales de storage/RLS).

#### 2) Port Houston — cron y límites

1. Revisa en el proveedor de deploy (Vercel y/o **Netlify**) que exista un schedule o job que llame **`POST /api/port-houston/rotate`** con **`Authorization: Bearer <CRON_SECRET>`** si usas auth de cron.
2. Comprueba logs del runtime ante timeouts: la ruta declara **`maxDuration = 60`**; en **Netlify** el tier puede imponer un tope menor — ajustar lote o timeouts si ves cortes.
3. **Referencia:** comentarios en **`app/api/port-houston/rotate/route.ts`** y **`docs/RLS_SECURITY_REVIEW_T22.md`** §2.

#### 3) Cierre QA

1. Ejecuta el **`TigerHawk_TMS_Testing_Plan.docx`** (incl. Phase 9) y registra hallazgos **P0** / **P1** en el tablero interno.
2. **`env.example`:** confirma variables críticas documentadas para soporte (Supabase, Resend, Port Houston, **CRON_SECRET**).

**Comandos locales:** `npm run lint`, `npx tsc --noEmit`, `npm test`.

---

### Tarea 23 — Dual Transactions: barra de ahorro, resolve-locations y enlace

**Rol:** **admin** o **dispatcher**. **Ruta:** **`/dashboard/dispatcher/dual-transactions`**.

**Nota:** En la pantalla solo hay una ayuda corta para el flujo (seleccionar return + pick up o **Recommend Duals**). La comprobación de **`POST /api/dispatcher/dual-transactions/resolve-locations`** al cambiar filtros es **solo técnica** y se hace con DevTools, pasos 1–3.

1. Abre **F12** → **Network** → **Fetch/XHR**.
2. Cambia un filtro (SSL, tamaño, terminal o búsqueda) en **Returns** o **Pick Ups**.
3. **Esperado:** aparece **`POST /api/dispatcher/dual-transactions/resolve-locations`** con **200** al actualizar direcciones visibles en los listados filtrados.
4. Revisa **Est. Savings** (tras **Recommend Duals**) y **Potential**; la leyenda indica Haversine y **$/mi**.
5. Pulsa **Recommend Duals**: filas compatibles se resaltan; **Ranked pairs** > 0 si hay pares válidos.
6. Selecciona un **return** y un **pick up** que cumplan reglas (mismo SSL, categoría de tamaño, **`return_location` = `pickup_location`**). Pulsa **Link**.
7. **Esperado:** **`POST /api/dispatcher/dual-transactions/match`** → **200**; la página se refresca; el par pasa a pestaña **Linked**; en Supabase ambas filas **`loads`** comparten **`street_turn_match_id`**.
8. Prueba un par inválido: **esperado** **400** y mensaje de error visible bajo la tarjeta de enlace.

**Comandos locales:** `npm run lint`, `npx tsc --noEmit`, `npm test`.

---

### Tarea 24 — Exportación CSV: columnas en Excel (delimitador regional)

**Rol:** cualquier usuario con acceso a vistas que exportan CSV (por ejemplo **Vessels** y **Containers**).

1. Abre **Vessels** (`/dashboard/vessels`) y pulsa el botón de exportación CSV.
2. Abre **Containers** (`/dashboard/containers`) y repite la exportación.
3. Abre cada archivo `.csv` en Excel (doble clic directo).
4. **Esperado (regional ES/PT):** el archivo abre en columnas separadas con `;` (sin usar “Texto en columnas”).
5. **Esperado (regional EN u otras):** el archivo abre en columnas separadas con `,`.
6. En ambos casos, revisa una celda con comillas o saltos de línea: el contenido debe mantenerse íntegro (sin romper columnas).
7. Validación técnica opcional: abre el CSV en un editor de texto y confirma que inicia con BOM UTF-8 y una línea `sep=,` o `sep=;` según el delimitador aplicado.

**Supabase:** **SUPABASE no requiere cambios.**

**Comandos locales:** `npm run lint`.

---

### Tarea 25 — Post–Semana 2: corrección A/P límites de deducciones

**Rol:** **admin** o **accounting**.

1. Prepara un driver con límites en `driver_deduction_settings` (`limit_per_period` y/o `limit_total`) y template habilitado.
2. En **Accounts Payable → Deductions** (`/dashboard/accounts-payable/deductions`), intenta crear una deducción con `amount` mayor al límite por período.
3. **Esperado:** la API responde **422** con `code: "DEDUCTION_LIMIT_PER_PERIOD_EXCEEDED"` y `details` con `requested_amount` y `limit_per_period`.
4. Edita una deducción existente y sube `amount` por encima del remanente total.
5. **Esperado:** **422** con `code: "DEDUCTION_LIMIT_TOTAL_EXCEEDED"` y `details.remaining_total`.
6. En ambos casos, la deducción no debe persistirse/actualizarse y la UI debe mostrar error de negocio.
7. Prueba generación semanal con **`POST /api/accounts-payable/deductions/generate`** para ese driver/periodo.
8. **Esperado:** los montos generados respetan `limit_per_period` y `limit_total` (sin filas sobre límite; si no hay remanente, se omite la deducción).

**Supabase:** **SUPABASE no requiere cambios.**

**Comandos locales:** `npm run lint`, `npx tsc --noEmit`.

---

### Tarea 26 — Post–Semana 2: corrección terminales dinámicas (filtros Dual/Street Turns)

**Rol:** **admin** o **dispatcher**.

1. Abre **Dispatcher → Dual Transactions** (`/dashboard/dispatcher/dual-transactions`).
2. En **Pick Ups**, selecciona un terminal distinto de **All**.
3. **Esperado:** aparecen filas cuya carga tenga `containers.vessels.terminal` igual al código filtrado, aunque el texto de `pickup_location` no contenga ese código/nombre.
4. Abre **Dispatcher → Street Turns** (`/dashboard/dispatcher/street-turns`) y repite filtro de terminal.
5. **Esperado:** misma consistencia: resultados por código real de `vessels.terminal`, no solo por coincidencias textuales de ubicación.
6. Prueba con un código adicional (si existe en datos, por ejemplo uno no BCT/BAY).
7. **Esperado:** no hay “falsos vacíos”; el filtro muestra las cargas que realmente pertenecen al terminal.

**Supabase:** **SUPABASE no requiere cambios.**

**Comandos locales:** `npm run lint`, `npx tsc --noEmit`.

---

*Referencia de alcance por tarea: `TAREAS_TRELLO.md` (Semanas 1–3). Añade nuevos bloques al **final**, manteniendo orden numérico de tarea (menor → mayor).*
