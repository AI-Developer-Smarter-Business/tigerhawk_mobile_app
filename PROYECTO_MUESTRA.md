# PROYECTO_MUESTRA — Referencia TMS TigerHawk

Carpeta con el **monorepo web** del TMS (Next.js 16 + Supabase). La app móvil **PP2** en la raíz de este repositorio es un proyecto **separado** que reutiliza la misma base Supabase.

## Uso para el equipo móvil

| Recurso | Ruta |
|---------|------|
| Panel acciones conductor | `PROYECTO_MUESTRA/components/dispatcher/DriverActionPanel.tsx` |
| API cambio de estado | `PROYECTO_MUESTRA/app/api/dispatcher/loads/[id]/status/route.ts` |
| Cliente Supabase web | `PROYECTO_MUESTRA/lib/supabase/client.ts` |
| Migraciones / RLS | `PROYECTO_MUESTRA/supabase/migrations/` |
| Roadmap app conductor | `PROYECTO_MUESTRA/docs/driver_app_roadmap.md` |
| Handoff Word | `TigerHawk_TMS_Technical_Handoff.docx`, `TigerHawk_TMS_Testing_Plan.docx` (cuando estén en repo) |

**No modificar nunca** archivos dentro de `PROYECTO_MUESTRA/` (solo lectura). La documentación activa del móvil está en la raíz: `PP2_DOCUMENTACION.md`, `PP2_TAREAS_*.md`, `PP2_TASKS.md`. Ver también `AGENTS.md`.
