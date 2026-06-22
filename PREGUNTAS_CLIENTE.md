# PREGUNTAS Y RESPUESTAS PARA Y DEL CLIENTE

Este documento tiene como finalidad el poder analizar mejor el feedback que nos envía el cliente de este proyeto de aplicación móvil y observaciones del proyecto TMS con ruta `C:\Users\ariel\OneDrive\Escritorio\RECRUITING_SMARTER___BRASIL\proyecto_1_TigerHawk TMS\tigerhawk-tms-main\tigerhawk-tms-main` que es donde se enlaza la app móvil para diferentes funciones en tiempo real TMS → app móvil.

---

## 1. Wait time — check in / check out, detention, TMS billing

**Pregunta (cliente):**

> Driver app - wait time triggered by check in / check out. 1 hour detention notification. Automatic time reporting to tms. Tms then bills detention automatically

**Respuesta_del_cliente:**

> This image was to give the options for driver to choose the description of the image they are uploading

**Referencia:** `opciones_driver.png` (tipos de documento al subir imagen)

---

## 2. In-Gate / geofencing / Samsara

**Pregunta (equipo):**

> On mobile, the driver currently uploads as Driver (POD/photo). Uploading to In-Gate doesn't start the timer anywhere yet.

**Respuesta_del_cliente:**

> Production version is tied into Samsara API if you wish to explore. Geofenced automatic check-out (leaves facility but not checked out yet) as well as reporting geofenced auto check out to dispatch (in case of patterns) would be a cool feature

---

## 3. Timeout / permisos en imagen o documento

**Pregunta (equipo):**

> get rid of timeout permission block for image/doc reference, that is going to cause way bigger headache than it is worth

**Respuesta (equipo):**

> we'll remove that timeout/permission gate on image and document access.

**Respuesta_del_cliente:**

> Thank you

---

## 4. UI — alineación con diseño TMS

**Pregunta (equipo):**

> User Interface: The mobile application will adapt to the TMS design: the same TigerHawk branding, dark theme, and component style, although this isn't highly recommended for the driver and daytime visibility.

**Respuesta_del_cliente:**

> Respuesta_del_cliente

---

## 5. Wait timer — integración móvil ↔ TMS y driver pay

**Pregunta (equipo):**

> Wait Timer: We will integrate the mobile wait timer logic (waiting_time_events, lib/wait-time/hydrate-timer-state.ts) with the TMS development branch (DeliveryWaitTimerPanel, POST /api/dispatcher/loads/[id]/wait-time) so that both use the same billing and real-time synchronization rules. The TMS will require some patches to send and receive this data for billing processing and possibly to display the updated daily payment information to motivate the driver and show the amount due on payday.

**Respuesta_del_cliente:**

> Respuesta_del_cliente

---

## 6. ¿En qué etapa(s) se debe registrar el wait time?

**Respuesta_del_cliente:**

> At Delivery (customer location)?
>
> - The only time we can charge for delay is when the customer is unloading slowly. Waits at the port or depot are just tough luck.

---

## 7. ¿Qué evento debe iniciar el wait time en cada etapa?

**Respuesta_del_cliente:**

> Respuesta_del_cliente

---

## 8. ¿Qué evento debe detener el wait time?

**Ejemplos:**

- Driver taps an End Wait Time button.
- Status changes to Delivered.
- Uploading an Out-Gate Ticket.
- GPS departure (Samsara).
- Another event (please specify).

**Respuesta_del_cliente:**

> Initially we will have the driver tap an End Wait Time button but all of the other events should also stop the time and make a note if the timer is still running when they occur.

---

## 9. ¿Un timer por etapa o uno solo?

**Respuesta_del_cliente:**

> One timer only (Delivery).

---

## 10. ¿Los 60 minutos gratis aplican a…?

**Respuesta_del_cliente:**

> Delivery only?

---

## 11. ¿Detention en factura = Wait Time o conceptos distintos?

**Ejemplo:**

- Detention = Terminal waiting.
- Wait Time = Customer location waiting.

**Respuesta_del_cliente:**

> Or should both be treated as the same concept?

---

## 12–15. Clarificación Check In / Check Out

### 12. ¿Qué representa Check In?

**Respuesta_del_cliente:**

> Check in is being acknowledged as present for unloading at customer location.

### 13. ¿Qué representa Check Out?

**Respuesta_del_cliente:**

> completion of service

### 14. ¿Quién realiza estas acciones?

**Respuesta_del_cliente:**

> The driver manually

### 15. ¿Deben iniciar/parar wait time y billing automáticamente?

**Respuesta_del_cliente:**

> automatically start/stop wait time and billing

---

junio 18 de 2026
