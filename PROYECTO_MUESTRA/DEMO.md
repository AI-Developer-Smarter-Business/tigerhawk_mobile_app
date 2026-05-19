# Guía de demo — TigerHawk TMS (Tareas 1–20, Semanas 1–3)

Documento para **presentar en vivo** las funcionalidades y correcciones implementadas según **`TAREAS_TRELLO.md`** hasta la **Tarea 20** de la **Semana 3** (incluye Semana 1, Semana 2 y T15–T20). Las etiquetas de pantalla están en **inglés**, tal como las ve el usuario en el frontend.

**Referencias:** `README_REPORTES_DIARIOS.md`, `README_PRUEBAS.md`.

**Sesión principal de esta guía:** inicia con usuario **admin** (una sola ventana para casi todo el recorrido). Como **admin** tienes el menú **Admin** (**User Management**, **Status Transitions**, etc.), puedes usar **override** cuando hay holds activos, y cubres finanzas y operación sin cambiar de usuario en la mayoría de pasos.

**Otros roles (solo cuando se indique):** una **segunda ventana** (p. ej. incógnito) con **dispatcher** para **Realtime** (T20) y, si quieres mostrar el bloqueo por holds tal como lo ve operaciones, el mismo flujo con sesión **dispatcher** (T5/T14). Opcional: entrar como **dispatcher** en **Driver Settlements** para mostrar botones CSV deshabilitados (T17).

---

## 1. Cambios en Supabase (y por qué)

| Ámbito | Qué | Por qué |
|--------|-----|---------|
| **`lane_origins`** | Migración `supabase/migrations/20260421_lane_origins_coordinate_provenance.sql`: columnas **`coordinate_source`**, **`geocoded_at`**, restricción de valores, índice para orígenes activos sin coordenadas, backfill **`legacy`** donde ya había lat/lng. | Trazabilidad de coordenadas (manual, Nominatim, import, etc.) y soporte a mapas / backfill sin perder el origen de los datos (**Tarea 8**). |
| **`activity_log`** | Uso ampliado en backfill masivo de orígenes (p. ej. acciones tipo bulk geocode / dry run). | Auditoría de operaciones masivas sin depender solo de logs de app (**Tarea 9**). |
| **`load_transition_overrides`** | Tabla para reglas de transición de estado de cargas (si aplica en tu proyecto: `supabase/migrations/20260303_load_transition_overrides.txt` o equivalente). | Permite que **Admin → Status Transitions** persista reglas; sin tabla, la UI puede caer en valores por defecto del código. |
| **Realtime (configuración)** | En el panel de Supabase: **replicación Realtime** habilitada para tablas que la app escucha (**p. ej.** `loads`, `containers`, `vessels`, `activity_log`), según políticas del proyecto. | Sin esto, la demo de **actualización en vivo** y la campana pueden degradarse a polling o no reflejar cambios al instante (**Tarea 20**). |
| **Facturación A/R y A/P** | **Sin migraciones nuevas obligatorias** en el repo para el batch A/R descrito en informes: se usan **`ar_invoices`**, estados como **`Consolidated`** / **`Billed`**, **`charge_set_number`**, etc., sobre el esquema existente. | Batch por cliente y aging coherente sin duplicar saldos pendientes (**Tarea 19**). |

**Nota:** Para entornos nuevos, confirma en Supabase que la migración de **`lane_origins`** está aplicada antes de demo de **Zone Maps** / orígenes; y que Realtime está activo para la demo de **Tarea 20**.

---

## 2. Errores corregidos (código / experiencia visual)

Resumen de problemas que **sí se manifestaban** en UI o consola y que el trabajo hasta **T20** aborda o documenta como cerrado:

| Problema (antes) | Dónde se notaba | Qué se espera ahora |
|------------------|-----------------|---------------------|
| **Rate Profiles — fill down** dejaba el mensaje colgado en **“Filling down…”** o vaciaba campos de condición al propagar (**Handoff §6.5**). | **Drivers → Driver Pay Rates → Rate Profiles**, flechas fill-down en **Rate**, **Origin Event**, **Addl Rule / Exec / Cond**. | Mensajes **“Filled N rows down”** / **“Nothing to fill below this row”**; solo el campo elegido se propaga en condiciones adicionales (**Tarea 4**). |
| **Inconsistencia holds:** se podía **asignar conductor** con holds activos aunque el cambio de estado estuviera bloqueado. | **Dispatcher → Load Board**, asignación en fila / planner / detalle. | **Dispatcher** bloqueado con **403** y código **`ACTIVE_HOLDS`**; botones deshabilitados y mensaje claro; **admin** puede forzar (**Tareas 5 y 14**). |
| **Deductions:** errores silenciosos, **Amount** vs **Final Amount** desalineados tras editar, **Approve Selected** sin feedback claro. | **Accounts Payable → Deductions**. | **alert** con error del API cuando falla; **Final Amount** alineado al editar **Amount** (**Tarea 7**). |
| **Load detail — Route:** si fallaba el guardado de **distance**, el cliente podía creer que ya estaba guardado y no reintentar. | **Dispatcher**, panel lateral **Route** (millas **mi**). | Solo se confirma distancia guardada tras **PATCH** exitoso (**Tarea 7**). |
| **Dual Transactions (página montada):** ahorro en pares potenciales era **aleatorio** (`Math.random`). | **`/dashboard/dispatcher/dual-transactions`**, sección **POTENTIAL MATCHES**. | Importes **estables** entre recargas con los mismos datos; criterio alineado con API (distancia / geocodificación) (**Tarea 11**). |
| **`GET /api/dispatcher/dual-transactions`** no aplicaba el mismo criterio de terminal/tamaño que la UI. | Listas y contadores incoherentes. | Criterio unificado (SSL, categoría de tamaño, **`return_location` = `pickup_location`**) (**Tarea 11**). |
| **Terminales:** UI asumía sobre todo **BCT/BAY** fijos. | **Vessels**, **Containers**, filtros en **Dual Transactions**, **Street Turns**. | Catálogo desde **`terminals`** + fusión con códigos de buque; tarjetas dinámicas en **Vessels** (**Tarea 13**). |
| **Load Board:** error de runtime **`AbortError: signal is aborted without reason`** al navegar. | **Dispatcher → Load Board**. | Manejo defensivo de abort en layout / rol; la vista no se rompe (**Tarea 15**). |
| **Guardar holds en detalle de carga:** consola **`PATCH failed: 400 {}`** al usar **Carrier Hold** (boolean vs enum en validación). | **Load Info → Container Visibility**. | Esquema **`carrier_hold`** como boolean; mejor logging del error (**Tarea 15**). |
| **Settlements — CSV:** fallos de red o permisos poco visibles; endpoint poco restrictivo. | **Accounts Payable → Driver Settlements**, botones **Pay Breakdown CSV** / **Deductions CSV**. | Spinner, bloqueo de doble clic, mensaje de error en pantalla; **403** para roles no financieros (**Tarea 17**; **accounting** incluido en export tras alineación con **Tarea 19**). |
| **Batch A/R y settlements:** faltaba flujo visual de preview/commit y coherencia **Consolidated** vs cobros. | **Billing**, **Aging**, **Apply Payments**. | Preview/commit batch; rechazo de pago sobre **`Consolidated`**; aging sin duplicar líneas consolidadas (**Tarea 19**). |
| **Realtime / notificaciones:** tableros desactualizados entre sesiones; campana sin centro de historial. | **Dashboard**, **Load Board**, header. | Refresco automático; **Notification Center**; campana con umbrales y estado Realtime (**Tarea 20**). |

**Nota:** **Tareas 15–16** añaden sobre todo **tests, CI y E2E**; la demo visual de **T15** es el flujo holds + transición (tabla arriba). **T18** mejora correo y trazas en **`activity_log`**; la demo visual típica es **Finalize** + icono **Email** en settlements.

---

## 3. Demo paso a paso (solo UI)

**Cómo leer cada bloque:** primero **qué fallaba o qué riesgo había** (técnico o de negocio); después **ruta exacta en el TMS** (menús y nombres en pantalla); luego **pasos** y **qué deberías ver**.

**Convención de sesión:** navegador principal = **admin** desde **§3.1**; segunda ventana solo cuando se indique (**dispatcher**).

**Tipo de entrega:** **[Nueva]** = funcionalidad nueva; **[Corrección]** = arreglo o endurecimiento.

---

### 3.1 Acceso al tablero — base para toda la demo

**Qué fallaba / qué evitamos:** sin login no hay recorrido; sin rol **admin** no ves **Admin** en la barra lateral, no puedes explicar override de holds ni **User Management** / **Status Transitions**, y algunos flujos financieros quedan incompletos.

**Ruta en el TMS:** `http://localhost:3000/login` → tras **Sign In**, **`/dashboard`**.

**Pasos**

1. Abre **`/login`**.  
2. **Email Address**, **Password** (usuario **admin**) → **Sign In**.

**Qué deberías ver:** **Dashboard** carga sin error; barra lateral con **Dashboard**, **Dispatcher**, **Drivers**, **Accounts Receivable**, **Accounts Payable**, **Admin**, etc. (nombres al expandir con el ratón).

---

### 3.2 Geocodificación y orígenes (T8–T10) — **[Nueva] / [Corrección]**

#### A) Provenance y backfill de orígenes (T8–T9)

**Qué fallaba:** no quedaba claro **de dónde salían** las coordenadas ni **cuándo** se fijaron; backfills masivos sin auditoría ni mensajes claros en **Zone Maps**.

**Ruta en el TMS:** **Drivers** → pestaña **Driver Pay Rates** → subpestaña **Rate Profiles** → abrir un perfil con carriles **zonal** y bloque **Zone Maps** → URL típica `/dashboard/drivers?tab=driver-pay-rates` (luego **Rate Profiles**).

**Pasos**

1. Abre el perfil; si faltan coords en anclas, usa **Fix Map Coordinates** o **Fix N Missing**.  
2. (Opcional) **F12** → **Network** → **Fetch/XHR**.

**Qué deberías ver:** mensaje tipo *Geocoded X of Y origins* o aviso de filas a revisar; **`GET /api/drivers/pay-rates/origins`** con **`coordinate_source`** y **`geocoded_at`**; sin pantalla en blanco.

#### B) Matriz: Nominatim ya no va desde el navegador (T10)

**Qué fallaba:** el cliente llamaba directo a Nominatim (política de uso, claves futuras, duplicación con servidor).

**Ruta en el TMS:** **Drivers** → **Driver Pay Rates** → subpestaña **Lane Rate Matrix** → modal **Add New Origin** (botón **Create Origin** o icono **+** con tooltip **Add Origin** a la derecha de las subpestañas; **no** **+ Add First Zone** para crear origen).

**Pasos**

1. Rellena dirección/ciudad/estado.  
2. Clic en **Lookup from address** (junto a **COORDINATES**).  
3. **Network:** filtrar por `geocoding` o `forward`.

**Qué deberías ver:** **`POST /api/geocoding/forward`** con **`mode":"single"`**; **cero** peticiones del navegador a `nominatim.openstreetmap.org`; **Latitude** / **Longitude** rellenados o *No results found — try a more specific address*.

#### C) Mapa **Route** en detalle de carga (T10)

**Qué fallaba:** misma duplicación de geocodificación en cliente; riesgo de inconsistencia con el criterio US del servidor.

**Ruta en el TMS:** **Dispatcher** (menú lateral) → **Load Board** → clic **una vez** en fila con texto en pickup/delivery → panel lateral **Route**.

**Pasos**

1. Espera a que el mapa cargue (leyendas **Pickup** / **Delivery** / **Return** si aplica).  
2. **Network** durante la carga.

**Qué deberías ver:** **`POST /api/geocoding/forward`** con **`mode":"address_fallbacks"`**; puede aparecer **OSRM** para la ruta; **no** Nominatim directo en el cliente.

---

### 3.3 Rate Profiles — Fill down (T4) — **[Corrección]**

**Qué fallaba:** UI quedaba en **“Filling down…”**; al propagar **Addl** a veces se borraban campos de condición (regresión Handoff §6.5).

**Dónde está en pantalla (ruta completa)**

1. Barra lateral izquierda → **Drivers** (icono de personas).  
2. En la **primera** fila de pestañas de esa página → **Driver Pay Rates** (no confundir con **Driver Profiles**).  
3. En la **segunda** fila de pestañas, justo debajo → **Rate Profiles**.  
4. Ves una **tabla de perfiles** con columnas **Profile Name** (nombre del perfil en texto naranja), **Lanes**, **Driver Groups**, **Effective**.  
5. Haz **clic en la fila** del perfil que quieras (sobre el nombre o cualquier celda de esa fila). **Importante:** eso abre la **vista de detalle** (hoja grande de carriles y cargos). El icono de **lápiz** (**Edit profile**) abre otro modal (**Edit Rate Profile**); para el fill-down necesitas la vista que se abre al hacer **clic en la fila**, no solo el modal de edición del nombre del perfil.

**Qué ves al entrar al perfil (detalle)**

- Arriba: botón **←** (volver), el **nombre del perfil** como título y, debajo, una **tabla ancha** tipo spreadsheet (scroll horizontal).  
- Cabeceras de columnas que debes reconocer: **Origin**, **Destination**, **From (mi)**, **To (mi)**, **Charge Code**, **Charge Name**, **Rate**, **UOM**, **Pay Mode**, **Origin Event**, **Destination Event**, **Addl Rule**, **Addl Exec**, **Addl Cond**, **Auto Add**.  
- Cada **carril** puede tener varias filas de **cargo** apiladas; necesitas **al menos dos filas de cargo** en la misma columna vertical para que “hacia abajo” tenga sentido.

**Dónde está el fill-down (visual)**

- Columna **Rate:** el importe se muestra en **naranja**. **Pasa el ratón por encima de la fila** del cargo: a la **derecha** del número aparece un **botón con flecha hacia abajo** (está oculto hasta el hover). En inglés, el tooltip dice **“Fill this rate down to all rows below”**. **Clic** en esa flecha.  
- Columna **Origin Event:** mismo patrón: hover en la fila → flecha abajo junto al selector; tooltip **“Fill this origin event down to all rows below”**.  
- Columnas **Destination Event**, **Addl Rule**, **Addl Exec**, **Addl Cond:** cada una puede tener su flecha abajo con tooltip *Fill this … down to all rows below* (mismo comportamiento: **solo visible al pasar el ratón por la fila**).

**Pasos resumidos**

1. **Drivers** → **Driver Pay Rates** → **Rate Profiles** → **clic en fila** de un perfil con varias filas de cargo.  
2. Localiza la columna **Rate** en la cabecera.  
3. **Hover** en una fila que tenga más cargos **debajo** en el mismo bloque → clic en la **flecha abajo** junto al importe naranja.  
4. Opcional: repetir en **Origin Event** / **Addl …** con una sola columna a la vez para validar que no se borran los otros campos de la condición.

**Qué deberías ver:** arriba a la derecha del título del perfil puede aparecer el mensaje azul **Filling down…** luego **Filled N rows down** (y desaparece); o **Nothing to fill below this row** si no hay filas debajo; en **Addl**, solo el campo que elegiste se propaga.

---

### 3.4 Holds — estado y asignación (T5, T14, T15) — **[Corrección]**

**Qué fallaba:** el **dispatcher** podía **asignar conductor** con holds aunque el cambio de estado estuviera alineado a bloqueo; reglas distintas entre **PATCH status** y **assign-driver**. Además, al guardar **Carrier Hold** a veces **400** por validación boolean vs enum.

**Ruta en el TMS (preparar carga):** **Dispatcher** → **Load Board** → fila en **Assigned** (o **Dispatcher** → **New Load** + asignar conductor) → detalle → pestaña **Load Info** → **Container Visibility**.

**Pasos**

1. **Freight Hold** (u otro) = **Hold**, o marca **Carrier Hold** → guarda (debe persistir sin **400** vacío en consola).  
2. Con sesión **admin:** **Status Actions** → intenta **In Transit**; **Assign driver** / **Reassign**.  
3. **Opcional segunda ventana** (**dispatcher**): misma carga → mismos intentos.

**Qué deberías ver:** **admin** puede actuar (override); comenta que **dispatcher** vería botones deshabilitados, mensaje de holds y **403** **`ACTIVE_HOLDS`** en **Network** si forzara la API.

---

### 3.5 Deductions (T7, T12) — **[Corrección]**

**Qué fallaba:** errores del API **sin alert**; **Amount** y **Final Amount** desincronizados tras editar; **Approve Selected** sin feedback claro.

**Ruta en el TMS:** **Accounts Payable** → **Deductions** → `/dashboard/accounts-payable/deductions`.

**Pasos**

1. Navega **Unapproved** / **Approved** / **Settled**, **Previous week** / **Next week**, **All Drivers**, **Deduction Type**.  
2. **Add Deduction** o edita **Amount** en una fila.

**Qué deberías ver:** **Final Amount** = **Amount** tras editar; si el servidor rechaza (p. ej. límite **T12**), **alert** con texto útil, no fallo silencioso.

---

### 3.6 Dual Transactions (T11) — **[Nueva]**

**Qué fallaba:** ahorro en **POTENTIAL MATCHES** era **aleatorio**; API y UI podían discrepar en terminal/tamaño/ubicación.

**Ruta en el TMS:** **Dispatcher** → **Load Board** → fila de pestañas horizontal del área dispatcher → pestaña **Dual Transactions** → `/dashboard/dispatcher/dual-transactions`.

**Pasos**

1. Pestañas superiores **Available** / **Linked**.  
2. Revisa **RETURNS**, **PICK UPS**, **POTENTIAL MATCHES**; mueve filtros **SSL**, tamaño, **Terminal**, búsquedas.

**Qué deberías ver:** sin cuelgues; importes de pares **estables** al recargar (mismos datos); **no** aparece aún **Est. Savings** / **Recommend Duals** en esta URL (**T23**). Banner *linking under development* puede seguir.

---

### 3.7 Vessels y terminales dinámicas (T13) — **[Nueva]**

**Qué fallaba:** filtros y tarjetas asumían sobre todo **BCT/BAY** fijos; nuevas filas en **`terminals`** no se reflejaban sin tocar código.

**Rutas en el TMS**

| Objetivo | Ruta |
|----------|------|
| Buques y sync | Menú **Vessels** → `/dashboard/vessels` |
| Contenedores | Menú **Containers** (o `/dashboard/containers`) |
| Dual (filtro terminal) | **Dispatcher** → **Dual Transactions** |
| Street turns | **Dispatcher** → **Street Turns** |

**Pasos**

1. En **Vessels:** leer **Vessel Tracking**, tarjetas por terminal, filtro **Terminals** en **All Vessels**, botón **Sync Now**.  
2. En **Containers:** filtro de terminal.  
3. En **Dual Transactions** / **Street Turns:** comprobar chips/select de terminal.

**Qué deberías ver:** opciones alineadas a datos + catálogo **`terminals`**; más de dos códigos si existen en BD.

---

### 3.8 Jest, CI y E2E (T15–T16) — **[Nueva]** (no es pantalla única)

**Qué fallaba / riesgo:** regresiones en calculadora de pago, transiciones o sync Port Houston **sin red de seguridad** antes de merge; en UI, **Load Board** podía lanzar **`AbortError`** al navegar; validación **carrier_hold** rompía el **PATCH** (ver **§3.4**).

**Ruta en el TMS (solo para ilustrar lo que protegen los tests):** misma navegación que usas en demo: **Dispatcher** → **Load Board**; **Vessels** → **Sync Now**.

**Pasos (laptop del presentador, no obligatorio en proyector)**

1. `npm test` — Jest + RTL.  
2. `npm run test:e2e` (con `E2E_USER_EMAIL` / `E2E_USER_PASSWORD` si aplica).

**Qué deberías ver / qué decir:** “Cada PR corre **lint**, **tsc**, **Jest** y **Playwright** en CI”; en pantalla el **Load Board** ya no se rompe por el abort esperado en dev.

---

### 3.9 Settlements — CSV y permisos (T17) — **[Corrección]**

**Qué fallaba:** descarga CSV sin feedback; errores solo en consola; endpoint poco alineado a roles financieros.

**Ruta en el TMS:** **Accounts Payable** → **Driver Settlements** → `/dashboard/accounts-payable/settlements`.

**Pasos**

1. Clic **Pay Breakdown CSV**, luego **Deductions CSV**.  
2. **Opcional:** segunda ventana con **dispatcher** en la misma URL.

**Qué deberías ver:** spinner durante descarga; archivos `pay-breakdown-YYYY-MM-DD.csv` y `deductions-YYYY-MM-DD.csv`; sin doble clic efectivo; error en **rojo** en la vista si falla; como **dispatcher**, botones deshabilitados (**title** explica permiso).

---

### 3.10 Email y settlements (T18) — **[Corrección]** / trazabilidad

**Qué fallaba:** envíos poco trazables; **Finalize** sin registro claro en **`activity_log`**; duplicación frágil del cliente Resend.

**Ruta en el TMS:** **Accounts Payable** → **Driver Settlements** (misma URL que **§3.9**).

**Pasos**

1. En una fila con settlement listo para cierre: **Finalize**.  
2. Opcional: icono **Email** en la fila.  
3. **Network** + (opcional) Supabase **`activity_log`**.

**Qué deberías ver:** **200** en **`PATCH /api/accounts-payable/settlements/<id>`** y en **`POST /api/accounts-payable/settlements/email`**; eventos `settlement_finalized_email_sent` / `…_failed` / `…_skipped_inactive_template`.

---

### 3.11 Finanzas: batch A/R y settlements (T19) — **[Nueva]**

#### A) Batch facturación (Billing)

**Qué fallaba:** no había preview/commit por cliente; riesgo de doble cobro en aging si las líneas consolidadas seguían como pendientes; pagos aplicados a **Consolidated** sin bloqueo claro.

**Ruta en el TMS:** **Accounts Receivable** → **Billing** → `/dashboard/accounts-receivable/billing`.

**Pasos**

1. Bloque **Batch customer invoicing** → **Preview batch** → **Create batch invoices** (confirmar si aparece diálogo).

**Qué deberías ver:** líneas origen **Consolidated**; cabecera **Billed** **BATCH-…**; **Charge Set #** compartido.

#### B) Aging y cobros

**Qué fallaba:** saldos **Consolidated** podían inflar “pendiente” si no se excluían.

**Ruta en el TMS:** **Accounts Receivable** → **Aging**; **Dashboard** (widget AR); **Accounts Receivable** → **Apply Payments & Credits**.

**Pasos**

1. Revisa aging / widget tras el batch.  
2. Intenta aplicar pago a factura **Consolidated**.

**Qué deberías ver:** **Consolidated** no duplica pendiente; el cobro a línea consolidada **falla** con mensaje que indique la factura batch padre.

#### C) Generar settlements

**Qué fallaba:** generación sin preview robusto; errores poco claros; rollbacks incompletos si fallaba el enlace.

**Ruta en el TMS:** **Accounts Payable** → **Driver Settlements**.

**Pasos**

1. Flechas de semana / **Search driver** → **Generate settlements** → confirmar en modal.  
2. Probar **Review** / **Finalize** si hay error de API.

**Qué deberías ver:** preview vía **GET** …/generate; **POST** crea settlements o **400** con **`NO_UNSETTLED_PAY`**; líneas elegibles a **Settled**; errores **Review**/**Finalize** visibles en pantalla.

---

### 3.12 Realtime, **Alerts** y **Notification Center** (T20) — **[Nueva]**

**Qué fallaba:** otra sesión cambiaba una carga y esta ventana no se enteraba hasta **F5**; campana sin historial operativo centralizado.

**Rutas en el TMS**

| Sesión | Ruta |
|--------|------|
| Ventana 1 (**admin**) | **Dispatcher** → **Load Board** o **Dashboard**; header → campana **Alerts**; **Notifications** o enlace **Open notification center** |
| Ventana 2 (**dispatcher**) | **Dispatcher** → **Load Board** → detalle → **Status Actions** |

**Preparación:** ventana 1 = **admin**; ventana 2 = **incógnito** con **dispatcher** (crear en **Admin** → **User Management** → **Add Staff User**, **Role** = **dispatcher**).

**Pasos**

1. Ventana 2: cambia estado (**Dispatched** / **In Transit**) con el botón correspondiente en **Status Actions**.  
2. Ventana 1: espera sin recargar.  
3. Ventana 1: clic campana → panel **Alerts**; pie **Realtime active** o **Realtime reconnecting (fallback: polling)** → **Open notification center** (o menú **Notifications**).

**Qué deberías ver:** lista y contadores actualizados sin **F5**; **Notification Center** con *Operational feed and history by role.*, **Refresh**, agrupación por fecha o **No notifications yet.**; nuevas filas al generar actividad.

---

### 3.13 **Status Transitions** (configuración) — **[Nueva]** (persistencia)

**Qué fallaba:** transiciones solo “duras” en código; negocio no podía permitir p. ej. **In Transit** → **Completed** sin deploy si no existía override en BD.

**Ruta en el TMS:** **Admin** → **Status Transitions** → `/dashboard/admin/transitions`.

**Pasos**

1. **Edit Rules** → fila **In Transit** → **Add** → **Completed** (si aplica) → **Save Changes**.

**Qué deberías ver:** en **Dispatcher** → **Load Board** → **Status Actions**, aparece la transición guardada (tras recargar reglas en cliente). Requiere tabla **`load_transition_overrides`** en Supabase.

---

## 4. Cierre de la demo (frase sugerida)

“Hasta la **Tarea 20** cubrimos: datos de orígenes trazables, geocodificación centralizada, fill-down estable, holds coherentes en estado y asignación, dual por distancia en la vista pública, terminales dinámicas, **Jest + RTL y CI** (más **Playwright** E2E), CSV y permisos en settlements, email trazado, **batch A/R** y **generación de settlements** con preview, y **Realtime** con **Notification Center** y campana **Alerts**.”

---

*Última alineación con tarjetas: **TAREAS_TRELLO.md** (T1–T20). Para pasos más largos o SQL de verificación, usar **`README_PRUEBAS.md`**.*
