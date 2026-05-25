# Próximos pasos — Tigerhawk Mobile (PP2)

Documento breve para **cliente y negocio**. Resume lo **por implementar y validar** en las tareas **4.1 a 5.8** (ocho por semana en `PP2_TAREAS_DEV.md`). Detalle técnico interno: `PP2_TAREAS_DEV.md`.

**Última actualización:** mayo 2026

---

## Funcionalidades objetivo para el conductor (alcance móvil)

| Funcionalidad | Estado previsto | Notas |
|---------------|-----------------|--------|
| **Inicio de sesión** | Disponible (semanas 1–3) | Mismo usuario Supabase que el TMS (rol conductor). |
| **Mis cargas y detalle** | Disponible (semanas 1–3) | Lista, detalle, acciones de campo (estado vía TMS). |
| **Ver documentos de la carga** | **Por implementar / cerrar (4.2)** | Archivos que dispatch sube en el TMS; lista en la app con **View** y actualización en tiempo real. |
| **Subir fotos (evidencia)** | **Por implementar (4.1 + 4.8)** | POD, percances, problemas de recepción; requiere TMS en producción. |
| **Mensajes en la carga** | Fuera de esta fase | Placeholder en v1. |
| **Ubicación / GPS** | Por decidir (semana 5) | Go/no-go con negocio. |

El objetivo es paridad con el conductor en el TMS (documentos y estado por carga), sin el menú completo de despacho.

---

## Recomendación de producto: fotos del conductor

Se **sugiere confirmar con el cliente** que el conductor pueda **subir fotos desde la app** como evidencia en la carga asignada, por ejemplo:

- **POD** (entrega realizada).
- **Percances o daño** (choque, contenedor, mercancía).
- **Problemas de recepción** (no recibido, rechazo parcial, discrepancia).

Esas fotos deben quedar en la **misma pestaña Documents del TMS** (tipo POD/Photo), visibles para dispatch y admin **sin pantalla nueva**. Esto se cubre con las tareas **4.1** (servidor TMS) y **4.8** (alcance y habilitación en app).

---

## Acción prioritaria del cliente / equipo TMS

1. **Aplicar y desplegar en el TMS en línea** los parches acordados (**4.1**): JWT **Bearer** en APIs de documentos/estado y permiso al **conductor asignado** para subir **POD** / **Photo** en su carga.
2. **Confirmar con negocio** el alcance de evidencia fotográfica desde móvil (**4.8**).
3. **Supabase (una vez):** habilitar Realtime en `load_documents` para que, al subir desde el TMS, el conductor vea el archivo al instante en la app (**4.2** / **4.7**).

Los **costos de Storage** los gestiona el cliente en su panel Supabase (fuera del alcance del equipo móvil).

---

## Semana 4 — Documentos y fotos (4.1 → 4.8)

| # | Tema | Próximo paso |
|---|------|----------------|
| **4.1** | **TMS: API de documentos para el conductor** | Desplegar en producción: sesión móvil (Bearer) + POST de documentos por el conductor asignado (tipos POD/Photo). Sin esto no hay subida fiable desde la app. |
| **4.2** | **Móvil: ver documentos de la carga** | Implementar y validar en la app la lista de archivos del TMS en el detalle de la carga (**View**, pull-to-refresh, tiempo real con Realtime en Supabase). |
| **4.3** | Validación tamaño / tipo | Validar en cliente antes de subir (50 MB, tipos de imagen); QA cuando **4.1** esté en producción. |
| **4.4** | Archivo en la carga correcta | Verificar que cada archivo quede en el `load_id` del conductor (TMS y móvil). |
| **4.5** | Sin conexión | Mensaje claro cuando no hay red (sin prometer offline completo en v1). |
| **4.6** | Pruebas automáticas | Tests de preparación y envío de archivos (calidad interna). |
| **4.7** | **QA manual** | Tras **4.2:** TMS sube archivo → aparece en **tiempo real** en la carga asignada del conductor (pull-to-refresh como respaldo). Tras **4.1:** QA de subida de evidencia desde móvil. |
| **4.8** | **Alcance con cliente** | Confirmar fotos de evidencia (percances, recepción, POD); habilitar subida en la app; cerrar este documento con el cliente. |

### Validación acordada (TMS → móvil, tiempo real) — tras **4.2**

1. Conductor en el **detalle de su carga asignada** con la app abierta.
2. Dispatch **sube un documento** en el TMS (Documents).
3. El archivo debe **verse en la app sin salir de la pantalla** (Realtime + conductor correcto en la carga).
4. Si no aparece al instante, **pull-to-refresh** debe mostrarlo.

Criterio de aceptación para **4.7** antes de dar por cerrada la consulta de documentos.

**Nota:** No hace falta otra pantalla en el TMS para ver lo que suba el conductor; se usa la misma pestaña **Documents**.

---

## Semana 5 — Ubicación (5.1 → 5.8)

| # | Tema | Decisión del cliente |
|---|------|----------------------|
| **5.1** | ¿Ubicación en v1? | Go/no-go: solo app abierta vs segundo plano. |
| **5.2** | Posición en pantalla de carga | Si sí: ubicación actual o “compartir ubicación”. |
| **5.3** | Dónde guardar | Tabla/API TMS existente (sin esquema nuevo sin revisión). |
| **5.4** | Pruebas en dispositivo | Batería, permiso denegado, volver a la app. |
| **5.5** | Tests geoespaciales | Helpers de distancia/coordenadas (dev). |
| **5.6** | Mapa / geocoding | Solo si el producto lo pide. |
| **5.7** | Textos legales | Limitaciones y disclaimer en la app. |
| **5.8** | Si no entra en v1 | Registrar en handoff/backlog el aplazamiento con motivo. |

---

## Orden sugerido

1. **TMS:** desplegar parches **4.1** (Bearer + documentos conductor).
2. **Móvil + QA:** cerrar **4.2** y validar tiempo real TMS → app (**4.7**).
3. **Cliente:** confirmar alcance de fotos de evidencia (**4.8**); completar **4.3**–**4.6** y subida móvil cuando **4.1** esté en producción.
4. **Cliente:** decisión ubicación **5.1**; luego **5.2**–**5.8** según go/no-go.

---

## Contacto técnico

- Plan de tareas (estado dev): `PP2_TAREAS_DEV.md`
- Parches TMS: `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`, `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md`
- Handoff: `HANDOFF_DEV.md`
