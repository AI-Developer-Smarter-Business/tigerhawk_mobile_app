# Próximos pasos — Tigerhawk Mobile (PP2)

Documento breve para **cliente y negocio**. **Deadline: 9 jun 2026.** Tres semanas de cierre (**Semana 5 → 7**; la **Semana 7** termina el **8 jun**).

**TMS en producción:** los cambios en el TMS se reflejan de inmediato en la app móvil.

Detalle técnico: `PP2_TAREAS_DEV.md` · Calendario: `PP2_ROADMAP_ENTREGA_JUN9.md`.

**Última actualización:** mayo 2026

---

## Esta semana — Semana 5 (GPS + desconexión)

| Prioridad | Tema | Tareas |
|-----------|------|--------|
| ✅ | GPS decisión + permisos | **5.1** |
| ✅ | Share location en detalle | **5.2** |
| **Alta** | Desconexión / reconexión | **5.5** |
| **Media** | QA documentos + estabilidad | **5.6–5.7** |

**No esta semana:** subida de fotos/evidencia → **Semana 6**.

---

## Semana 6 — Driver photo / subida de archivos

Todo lo de **Driver photo (optional)** en **POD / Documents**:

| Tipo TMS | Ejemplos |
|----------|----------|
| **POD** | Entrega, sello de carga, prueba de recepción |
| **Photo** | Percances, ponchadura, retrasos, docs extraordinarios |

| Tarea | Entregable |
|-------|------------|
| **6.1** | Confirmación alcance con cliente (ex 4.8) |
| **6.2** | Activar subida en app (`PodUploadSection`, POD vs Photo) |
| **6.3** | Validación tamaño/tipo (ex 4.3) |
| **6.4** | QA subida móvil → TMS (checklist 4.7 §D) |

Visible en la **misma pestaña Documents del TMS** para dispatch/admin.

---

## Semana 7 — Release (hasta 8 jun · deadline 9 jun)

Build EAS Android, QA final, README/changelog, credenciales, handoff al cliente.

---

## Estado funcional

| Funcionalidad | Estado |
|---------------|--------|
| Login, My Loads, detalle, field actions | ✅ |
| Ver documentos (View, Realtime) | ✅ — validar en **5.6** |
| Offline / banner | ✅ — endurecer en **5.5** |
| **GPS** | ✅ **5.1–5.2** (share en detalle) · **5.3–5.4** TMS + QA dispositivo | Primer plano operativo |
| **Subir evidencia** | ⏳ **Semana 6** |
| Mensajes | v1.1 |
| Push | v1.1 |

---

## Contacto técnico

- Tareas: `PP2_TAREAS_DEV.md`
- Roadmap: `PP2_ROADMAP_ENTREGA_JUN9.md`
- QA: `docs/QA_DRIVER_DOCUMENTS_4_7.md`, `docs/QA_DRIVER_ACTIONS_3_7.md`
- Handoff: `HANDOFF_DEV.md`
