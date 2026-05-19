# Alcance MVP — PP2 (app conductor)

## En v1 (esta fase de maquetado + mocks)

| Flujo | Descripción |
|-------|-------------|
| Login | Pantalla de acceso (mock: `driver@tigerhawk.demo` / `demo123`) |
| Lista de cargas | Cargas asignadas al conductor (`driver_id` = usuario) |
| Detalle de carga | Ruta, citas, cliente, notas, estado |
| Acciones Driver | Solo transiciones del subconjunto **Driver** del TMS (`DriverActionPanel`) |
| Mensajes | Lectura de mensajes por carga (mock) |
| POD / fotos | Placeholder UI — **requiere API TMS** (ver `PP2_DOCUMENTACION.md` §3.4) |
| Estados UI | Vacío, error con reintento, pull-to-refresh |

## Fuera de v1

- Portal cliente (`/portal`)
- Despacho completo (load board, planner, asignaciones)
- Finanzas, nómina, settlements, A/R, A/P
- Administración de usuarios y transiciones globales
- Port Houston, import masivo, cron server-side
- Botones de acción **Dispatcher** en la misma pantalla que el conductor
- GPS en segundo plano, push, offline-first completo (backlog dev)

## Referencia técnica

- Panel conductor web: `PROYECTO_MUESTRA/components/dispatcher/DriverActionPanel.tsx`
- Mismo Supabase que el TMS; sin backend nuevo en esta fase.
