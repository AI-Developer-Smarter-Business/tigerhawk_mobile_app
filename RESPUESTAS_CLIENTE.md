# Respuestas al feedback del cliente — Tigerhawk Mobile + TMS

**Fuentes:** `PREGUNTAS_CLIENTE.md`, repo móvil, TMS dev (`tigerhawk-tms-main`), auditoría WT.1–WT.15.  
**Fecha de análisis:** 12 jun 2026.

---

## RESPUESTAS EN ESPAÑOL

### Resumen ejecutivo

El cliente **aclara** que la imagen con BOL / POD / In-Gate **no era para el timer**, sino para **etiquetar fotos al subirlas**. El wait time aplica **solo en entrega al cliente** (no puerto/depósito), **un solo timer**, **60 min gratis**, con **Check In = presente para descarga** y **Check Out = fin del servicio**, ejecutado **manualmente por el conductor** y debiendo **arrancar/parar cobro automáticamente**. Lo implementado en WT.1–WT.15 **cubre ~80%** del flujo; faltan alineación de copy/UI, cierres secundarios con nota, despliegue TMS/Supabase, visibilidad de pago al conductor y (futuro) Samsara/geofence.

---

### Pregunta 1 — Wait time vs imagen de tipos de documento

| Lo que parecía                                          | Lo que el cliente confirma                                                                                             |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Timer disparado por check in/out vía tipos de documento | La imagen (`opciones_driver.png`) es el **selector de descripción** al subir una foto (BOL, POD, In-Gate Ticket, etc.) |

**Estado técnico:**

- **Móvil:** sube evidencia como tipo **`Driver`** (POD/foto genérica); **no** muestra ese picker completo.
- **TMS web:** `DocumentsTab.tsx` sí lista BOL, POD, In-Gate Ticket, Out-Gate Ticket, etc. (dispatcher).
- **Wait time:** **no** está ligado a subir documentos; arranca con status **`Arrived At Delivery`** o API `delivery_wait`.

**Conclusión:** No hay conflicto con el timer actual; hay **gap de producto** si el cliente quiere que el conductor elija categoría al subir (ver tarea **DOC.1**).

---

### Pregunta 2 — In-Gate, Samsara, geofence

**Respuesta cliente:** producción usa **Samsara**; les interesa **check-out automático por geofence** y aviso a dispatch si el conductor sale sin cerrar.

**Estado en TMS dev:**

- **Samsara:** solo referencia en plantillas de deducción (_Equipment Rental (Samsara)_); **no** hay integración API Samsara ni geofence en el repo analizado.
- **GPS móvil v1:** solo primer plano + compartir ubicación (Semana 5); live tracking en **Semana 8** (pendiente).

**Conclusión:** Feature **v1.2+** (Samsara + geofence). No bloquea el timer por status actual (ver **S8.1 / WT.23**).

---

### Pregunta 3 — Quitar bloqueo timeout/permisos en imagen/doc

**Acuerdo:** eliminar gate que frustre al conductor.

**Estado móvil:**

- Cámara/galería: si permiso denegado, `pick-load-photo.ts` devuelve `null` **sin mensaje** (UX pobre, no es un “timeout” explícito).
- Documentos TMS: URLs firmadas **1 h**; si expiran, pull-to-refresh pide enlace nuevo (comportamiento esperado).

**Conclusión:** Aceptado — mejorar UX permisos (mensaje + abrir Ajustes) y revisar si hay otro “block” que el cliente vio en QA (ver **DOC.2**).

---

### Pregunta 4 — UI alineada al TMS (dark chrome)

**Respuesta cliente:** sin texto (placeholder).

**Estado:** móvil usa `PP2Theme` + variantes `chrome` / fondo claro en listas; marca **Tigerhawk Mobile**. TMS usa sidebar `#111827` y acento naranja.

**Recomendación dev:** mantener **listas/detalle en fondo claro** (visibilidad diurna); chrome oscuro en login/cuenta. Confirmar con cliente si quieren dark en toda la app (ver **UI.1**).

---

### Pregunta 5 — Integración wait timer + driver pay motivacional

**Respuesta cliente:** sin texto (placeholder).

**Estado (ya implementado en dev, pendiente deploy/SQL):**

| Capa       | Implementado                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------ |
| Móvil      | `useDeliveryWaitTimer`, `DeliveryWaitSection`, **End wait time**, API Bearer                                       |
| TMS        | `DeliveryWaitTimerPanel`, `wait-time/route.ts`, campana, toasts                                                    |
| Billing    | `waiting_time_events` + trigger; `sync-load-billing.ts` → línea **Detention** en `load_billing` al cerrar          |
| Driver pay | En **Completed**, `status/route.ts` suma `driver_pay_amount` de wait events a `loads.driver_pay` / `ap_driver_pay` |

**Gap:** el conductor **no ve** en móvil el monto acumulado ni “payday estimate” (ver **WT.22**).

---

### Preguntas 6, 9, 10 — Alcance: solo delivery, un timer, 60 min gratis

**Cliente confirma:**

- Cobro solo si el **cliente descarga lento** (ubicación de entrega).
- Esperas en **puerto/depósito = no facturables**.
- **Un solo timer** (delivery).
- **60 min gratis** en delivery.

**Alineación con código:**

- Evento `delivery_wait`, `free_time_minutes = 60`.
- No se inicia timer en `Arrived At Pickup` ni return (correcto).
- Actualizar spec escrita (ver **WT.16**).

---

### Pregunta 7 — Evento de inicio (sin respuesta explícita)

**Inferencia** (preguntas 12–15 + reglas actuales):

| Acción negocio                    | Implementación propuesta                                                              |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| Check In = presente para descarga | **`Arrived At Delivery`** (hoy) **o** botón explícito **Check In** (mismo efecto API) |
| Automático start + billing        | Al Check In → POST `delivery_wait` con `start_time`                                   |

**Pendiente confirmación:** ¿Check In es **solo** botón nuevo o basta renombrar/duplicar la acción **Arrived At Delivery**?

---

### Pregunta 8 — Evento de parada

**Cliente:**

1. **Fase 1:** conductor usa **End Wait Time** (✅ ya en móvil).
2. **También deben parar:** Delivered, Out-Gate, GPS Samsara, etc., y **dejar nota** si el timer seguía activo.

**Estado:**

| Evento                       | ¿Para timer hoy?                | Gap                                          |
| ---------------------------- | ------------------------------- | -------------------------------------------- |
| End Wait Time                | ✅                              | —                                            |
| Delivered / Dropped - Loaded | ✅ vía `shouldStopDeliveryWait` | Falta **nota en activity_log** si aún corría |
| Out-Gate Ticket upload       | ❌                              | DOC + WT.18                                  |
| GPS / Samsara                | ⏳ mock simulate (WT.23 stub)    | **Pendiente API Samsara real**               |

---

### Pregunta 11 — Detention vs Wait Time

**Cliente:** pregunta abierta — ¿mismo concepto o distintos?

**Resolución WT.25 (19 jun 2026):** **un solo concepto** cobrable en delivery lento al cliente.

| Audiencia | Etiqueta |
| --------- | -------- |
| Factura al cliente / `load_billing` | **Detention** (`charge_type`) + descripción **Delivery detention** |
| App conductor / settlement | **Wait time** (sin cambio) |
| Datos internos | `waiting_time_events.event_name = delivery_wait` |

**No** se facturan dos líneas (Detention + Wait Time) por el mismo evento auto-sync. **ACC-WAIT** en catálogo = accessorial manual; líneas auto = **Detention** solamente.

Detalle: `docs/WAIT_TIME_INVOICE_LABEL.md`. TMS: `lib/wait-time/invoice-labels.ts` + `sync-load-billing.ts`.

---

### Preguntas 12–15 — Check In / Check Out

| Término        | Cliente                           | Equivalente técnico actual                                  |
| -------------- | --------------------------------- | ----------------------------------------------------------- |
| **Check In**   | Reconocido presente para descarga | `Arrived At Delivery` + inicio `delivery_wait`              |
| **Check Out**  | Fin del servicio                  | `Delivered` / **End wait time**                             |
| **Quién**      | Conductor manual                  | Field actions + botón End wait time                         |
| **Automático** | Start/stop wait + billing         | Parcial: API + trigger sí; UI “Check In” explícita opcional |

---

### Gaps prioritarios (siguientes pasos)

1. **Desplegar** TMS dev + SQL `waiting_time_events` en Supabase compartido.
2. **WT.16** — Actualizar spec con reglas confirmadas por cliente.
3. **WT.18** — Cierre secundario + nota si timer activo (Delivered, etc.).
4. **DOC.1** — Picker de tipo de documento en móvil (si negocio lo pide tras aclaración Q1).
5. **DOC.2** — UX permisos cámara/galería sin bloqueo silencioso.
6. **WT.22** — Mostrar al conductor wait acumulado / pay estimate (read-only).
7. **WT.23** — Spike Samsara + geofence (backlog).
8. **WT.25** — ✅ Etiqueta factura: **Detention** (cliente); **Wait time** (conductor).

---

## ANSWERS IN ENGLISH

### Executive summary

The client **clarifies** that the BOL / POD / In-Gate image was for **labeling photo uploads**, not for starting a wait timer. Billable wait applies **only at customer delivery** (not port/depot), **one timer**, **60 minutes free**, with **Check In = present for unloading** and **Check Out = service complete**, **manual driver actions** that must **auto start/stop billing**. WT.1–WT.15 deliver **~80%** of this; remaining work: copy/UI alignment, secondary stop + audit note, TMS/Supabase deploy, driver pay visibility, and (later) Samsara/geofence.

---

### Q1 — Wait time vs document-type image

The screenshot lists upload categories (BOL, POD, In-Gate Ticket, etc.). **Not** wait-timer triggers.

- **Mobile:** uploads as **`Driver`** only; no full type picker yet.
- **TMS web:** full list in `DocumentsTab.tsx` (dispatcher).
- **Timer:** starts on **`Arrived At Delivery`** / `delivery_wait` API — **not** on document upload.

**Action:** optional driver upload type picker (**DOC.1**), separate from wait time.

---

### Q2 — In-Gate, Samsara, geofence

Client wants **Samsara** production integration and **geofenced auto check-out** with dispatch alerts.

- **TMS repo:** Samsara mentioned only in deduction templates — **no live API/geofence code**.
- **Mobile GPS:** foreground share only; live tracking **Semana 8** pending.

**Action:** backlog **WT.23** (v1.2+).

---

### Q3 — Remove timeout/permission gate on images/docs

Agreed. Improve camera/gallery denial UX (message + Settings); signed URL 1h refresh remains by design.

**Action:** **DOC.2**.

---

### Q4 — TMS-aligned dark UI

No client answer yet. Recommend light content areas for daytime driving; dark chrome for auth/account. **UI.1** to confirm.

---

### Q5 — Wait timer integration + driver pay motivation

**Implemented in dev** (deploy pending): mobile timer, TMS panel, `waiting_time_events`, billing line on close, driver pay rollup on **Completed**.

**Gap:** driver does **not** see accrued wait pay on mobile (**WT.22**).

---

### Q6, Q9, Q10 — Delivery only, one timer, 60 min free

**Confirmed by client.** Matches `delivery_wait` + `free_time_minutes = 60`. Update written spec (**WT.16**).

---

### Q7 — Start event (no explicit answer)

**Inferred:** Check In = start → **`Arrived At Delivery`** today, or dedicated **Check In** button (same API). Confirm with client.

---

### Q8 — Stop events

**Phase 1:** **End Wait Time** button (done). **Also stop** on Delivered, Out-Gate, GPS, etc., with **note if timer still running** — partial; needs **WT.18** + Samsara later.

---

### Q11 — Detention vs Wait Time

**WT.25 resolution (19 Jun 2026):** **One billable concept** for slow customer delivery.

| Audience | Label |
|----------|--------|
| Customer invoice / `load_billing` | **Detention** (`charge_type`) + **Delivery detention** description |
| Driver app / settlement | **Wait time** (unchanged) |
| Internal | `delivery_wait` events |

No duplicate Detention + Wait Time lines for the same auto-synced event. **ACC-WAIT** catalog = manual add-on only.

See `docs/WAIT_TIME_INVOICE_LABEL.md`. TMS: `lib/wait-time/invoice-labels.ts`.

---

### Q12–15 — Check In / Check Out

| Term         | Client                | Current app                           |
| ------------ | --------------------- | ------------------------------------- |
| Check In     | Present for unloading | `Arrived At Delivery` → start timer   |
| Check Out    | Service complete      | `Delivered` / **End wait time**       |
| Actor        | Driver manual         | Field actions + End wait time         |
| Auto billing | Yes                   | API + DB trigger (UI labels optional) |

---

### Priority next steps

1. Deploy TMS dev + Supabase SQL for `waiting_time_events`.
2. **WT.16** — Update spec with confirmed rules.
3. **WT.18** — Secondary stops + audit note.
4. **DOC.1** / **DOC.2** — Upload types + permissions UX.
5. **WT.22** — Driver-facing wait/pay summary.
6. **WT.23** — Samsara/geofence spike.
7. **WT.25** — ✅ Invoice **Detention**; driver UX **Wait time**.

---

_Documento generado para alinear equipo y cliente. Respuestas abiertas (Q4, Q5, Q7, Q11) requieren follow-up corto por email._

--- \*\*

--- \*\*

--- \*\*

## Actualización de scope — feedback Lucas / Nico (18 jun 2026)

**Fuente:** mensajes WhatsApp Lucas → equipo PP2 (18/6/2026, ~10:58 CDMX).  
**Contexto:** conversación con Nico sobre check-in, wait time, emails al cliente y sync offline.

---

### RESUMEN DEL FEEDBACK (ES)

| #     | Decisión del cliente                                                                                                                                                                                                                                                                                    | Implicación                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **A** | Wait time: **solo inicio manual** (no automático al cambiar status)                                                                                                                                                                                                                                     | Hay que **retirar** auto-start en **Arrived At Delivery** (`useDeliveryWaitTimer`) y exponer botón explícito **Start wait time** / **Check In** |
| **B** | **Fin manual** = método principal para parar el timer                                                                                                                                                                                                                                                   | **End wait time** ya existe; reforzar copy y no depender de status como cierre principal                                                        |
| **C** | **Único cierre automático:** cuando el **POD electrónico generado por TMS** se **firma y envía**                                                                                                                                                                                                        | Nuevo hook en TMS; hoy el POD es PDF descargable (`generateProofOfDelivery`), **sin** flujo e-sign + submit en repo dev                         |
| **D** | Email al **cliente en archivo** (`customers.email`): **(1)** aviso a **45 min** (“detention comienza en 15 min”); **(2)** aviso al **inicio de detention** (min 61 / tras 60 min gratis); **(3)** email **final** al cerrar wait con resumen + texto de validez para billing / contactar si hay disputa | **Viable** con infra existente (Resend + `sendTemplateEmail` + `customers.email`); **no implementado** aún                                      |
| **E** | Notas conductor, cambios de status, POD, fotos: si falla sync → **guardar local y reintentar** cuando haya señal                                                                                                                                                                                        | **Cambio de scope mayor**; v1 actual **no tiene cola offline** (`docs/OFFLINE_V1.md`)                                                           |

---

### VIABILIDAD — emails al cliente (45 min / 60 min / cierre)

#### ¿Es viable?

**Sí, técnicamente viable** en el TMS (Next.js + Supabase), con esfuerzo **medio** (~2–4 días dev + QA + copy legal). **No requiere cambios en la app móvil** para enviar los correos; el disparador debe vivir en **servidor TMS** (o job Supabase) mientras el evento `delivery_wait` esté abierto.

#### Lo que ya existe

| Pieza                                | Estado                                                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| **`sendTemplateEmail`** + **Resend** | ✅ Usado en `status/route.ts` → template `load_status_update` al cliente                                    |
| **Email del cliente**                | ✅ `loads` → join `customers.email` (dispatcher ya lo muestra en detalle)                                   |
| **`waiting_time_events`**            | ✅ `start_time`, `end_time`, `duration_minutes`, `free_time_minutes` (60), `charge_amount`                  |
| **Notificación dispatcher**          | ✅ Campana + toast al superar 60 min (`maybeNotifyWaitExceeded` → `activity_log`, **sin email al cliente**) |
| **Templates detention/wait**         | ❌ No existen en `email_templates`                                                                          |

#### Lo que hay que construir

1. **Tres plantillas** en `email_templates` (editables por admin TMS), por ejemplo:
   - `detention_warning_45` — “Han transcurrido 45 minutos de espera; la **detención facturable** comienza en **15 minutos**…”
   - `detention_started` — “La espera ha superado el periodo gratuito de 60 minutos; el tiempo de **detention** se facturará…”
   - `detention_completed` — Resumen: inicio, fin, minutos gratis, minutos facturables, monto estimado, referencia de carga, texto: _“Si hay discrepancia, contáctenos; de lo contrario se considerará válido para facturación.”_

2. **Motor de disparo con idempotencia** (no reenviar el mismo email):
   - Opción recomendada: en **`wait-time/route.ts`** PATCH de sync periódico (~60 s desde móvil) **o** job **`pg_cron` / cron Netlify** que evalúe eventos abiertos.
   - Umbrales: `duration_minutes >= 45` → email 1; `>= 60` (o `billable = true`) → email 2; `end_time IS NOT NULL` → email 3.
   - Registro: tabla `waiting_time_email_log` o columnas `email_45_sent_at`, `email_60_sent_at`, `email_summary_sent_at`.

3. **Variables de plantilla:** `customer_name`, `reference_number`, `container_number`, `delivery_location`, `wait_start_time`, `wait_end_time`, `free_minutes` (60), `billable_minutes`, `estimated_charge`, `company_contact_email`, `company_phone`.

4. **Resend / env:** `RESEND_API_KEY` en TMS desplegado; dominio remitente verificado (mismo patrón que `load_status_update`).

5. **Copy legal:** redacción de “válido para billing” y plazo de disputa debe aprobarla **TigerHawk / legal**.

#### Riesgos / limitaciones

- Sin red en móvil, `duration_minutes` en servidor puede **retrasarse** → emails 45/60 tardíos. Mitigación: calcular en servidor `now() - start_time` en cron, no depender solo del PATCH móvil.
- Sin `customers.email` → no enviar; log en `activity_log` + alerta dispatcher.
- Envío síncrono hoy; cola de emails = mejora fase 2 si sube volumen.

#### Borrador de email de respuesta al cliente (Lucas / TigerHawk)

> **Subject:** Wait time — customer email notices & timer rules (confirmed with Nico)
>
> Hi Lucas,
>
> Thanks for the update after your chat with Nico. Here is how we understand the revised scope:
>
> **Timer rules**
>
> - **Start:** manual only — we will add **Start wait time** and remove automatic start on status change.
> - **Stop:** manual **End wait time** as the primary method.
> - **Auto-stop:** only when the **TMS electronic POD is signed and submitted** (we will connect wait-time close to that event once you confirm where e-POD runs in production).
>
> **Customer emails (3 notices)**  
> We can automate emails to the **customer email on file** via Resend + DB templates:
>
> 1. **At 45 minutes** — billable detention begins in **15 minutes** (60-minute free time).
> 2. **At 60 minutes** — **detention / billable wait** has started.
> 3. **When wait ends** — summary of wait time and charges, plus language that the customer may contact you to dispute; otherwise the wait is valid for billing.
>
> **What we need from you**
>
> - Approved **email copy** (and legal wording) for all three templates.
> - Confirm recipient (`customers.email` only vs CC dispatch).
> - Where **electronic POD sign-and-submit** happens today (mobile, TMS, third party).
>
> **Offline sync (notes, status, POD, photos)**  
> This is a **larger scope change** than wait-time emails. We recommend a dedicated phase: local queue + retry when online — happy to estimate separately.
>
> Please confirm or correct the above so we can update the build plan.
>
> Best,  
> [Team]

---

### VIABILIDAD — inicio/fin manual y POD electrónico

| Requisito                       | Estado actual                                      | Gap                                                      |
| ------------------------------- | -------------------------------------------------- | -------------------------------------------------------- |
| Inicio **manual**               | Auto-start en **Arrived At Delivery**              | **WT.27** — botón **Start wait time**; quitar auto-start |
| Fin **manual** principal        | **End wait time** ✅                               | Reforzar UX; Delivered ya no es cierre principal         |
| Fin auto solo **e-POD firmado** | POD = PDF en browser; upload móvil tipo **Driver** | **WT.28** — evento `pod_signed_submitted` → cerrar wait  |
| Emails 45 / 60 / resumen        | Solo alerta dispatcher interna                     | **WT.29–WT.31**                                          |

**Pregunta crítica e-POD:** ¿Dónde firma el conductor hoy en producción (app, portal, DocuSign, dispatcher upload)?

---

### VIABILIDAD — cola offline (notas, status, POD, fotos)

| Aspecto  | v1 actual                    | Lo que pide Lucas                                               |
| -------- | ---------------------------- | --------------------------------------------------------------- |
| Sin red  | Banner + bloqueo de acciones | **Encolar** y sincronizar después                               |
| Esfuerzo | —                            | **~1–2 semanas** — fase **OFF.2**, separada de emails wait time |

---

### PREGUNTAS ABIERTAS PARA LUCAS / NICO

_(Las antiguas P2 y P3 ya no van aquí: regla de negocio aclarada por Lucas/Nico el 18 jun; hechos técnicos en **§ Respuestas técnicas P2 y P3** abajo.)_

1. **Inicio manual:** ¿**Start wait time** solo después de **Arrived At Delivery**, o check-in independiente del status?
2. **P2 residual — tope de seguridad:** Si olvidan **End wait time** y nunca hay e-POD, ¿timer abierto sin límite(hoy es sin límite) o alerta/tope?
3. **Emails:** ¿Solo `customers.email`? ¿CC dispatch / A/R? ¿Copia al conductor?
4. **Emails 45/60:** ¿Zona horaria en el texto? ¿Monto a facturar solo en resumen final?
5. **Copy:** ¿Palabra **“detention”** en los tres correos (alineado a Billing TMS)?
6. **Offline queue:** ¿Prioridad inmediata o después de timer manual + emails?

---

### Respuestas técnicas P2 y P3 — auditoría TMS dev (18 jun 2026)

**Estado:** ✅ **Aclarado (negocio)** por Lucas/Nico · ✅ **Respondido (código)** por auditoría `tigerhawk-tms-main` · ⏳ **2 puntos** en lista abierta arriba (§2–3).

Repo revisado: `tigerhawk-tms-main` (rama dev local).

#### P2 — ¿Si olvidan **End wait time**, el timer corre hasta e-POD sin tope?

|                         | Respuesta                                                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Regla Lucas/Nico** ✅ | Sí: el timer sigue hasta **End wait time** (manual) o **e-POD firmado y enviado** (único auto-stop).                                          |
| **Código hoy** ✅       | Sin tope en BD. **End wait time** ✅. **e-POD** ❌ no cierra timer. **Delivered** ⚠️ sí lo cierra en móvil — quitar al alinear scope (WT.27). |
| **Si olvidan todo** ✅  | Timer **sigue corriendo** y acumula minutos facturables tras 60 min.                                                                          |
| **Implementación**      | WT.28 (auto-stop e-POD).                                                                                                                      |

#### P3 — ¿Existe e-POD? ¿URL o módulo?

|                    | Respuesta                                                                       |
| ------------------ | ------------------------------------------------------------------------------- |
| **En repo dev** ✅ | **No.** Sin firma electrónica ni submit que cierre wait time.                   |
| **Lo más cercano** | PDF imprimible (dispatcher) + foto móvil tipo **Driver** + portal solo lectura. |
| **Implementación** | WT.28 — construir o enlazar prod.                                               |

#### Pendiente confirmar con cliente

- **Tope/alerta** si el timer queda abierto mucho tiempo sin End wait time ni e-POD (→ pregunta abierta §2).
- **Dónde está el e-POD** en prod: ¿nuevo desarrollo, otro deploy, tercero? (→ pregunta abierta §3).

---

### Tareas sugeridas (Semana 9+)

| ID           | Tarea                                                       |
| ------------ | ----------------------------------------------------------- |
| **WT.27**    | Start wait manual; quitar auto-start y cierre por Delivered |
| **WT.28**    | Cierre wait al e-POD signed/submitted                       |
| **WT.29–31** | Emails cliente 45 min / 60 min / resumen                    |
| **WT.32**    | Cron server-side si móvil offline                           |
| **OFF.2**    | Cola offline (scope aparte)                                 |

---

### ENGLISH SUMMARY (Lucas / Nico, 18 Jun)

Manual start/end wait time. Only auto-stop: **e-POD sign + submit** (not built). Customer emails at 45/60/close: feasible (~2–4 days). Offline queue: separate phase.

**P2/P3 status:** Business rule clarified by client; technical facts answered via TMS audit. **Still ask client:** safety cap on open timers; e-POD location in prod.

---

_Análisis 18 jun 2026._
