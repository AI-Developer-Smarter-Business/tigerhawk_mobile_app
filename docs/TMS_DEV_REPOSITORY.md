# TMS development repository (deployed dev)

**Purpose:** single source of truth for **where to change TigerHawk TMS code** when integrating with Tigerhawk Mobile (PP2).

**Deploy status:** TMS is **live on Netlify**; mobile uses it via `EXPO_PUBLIC_TMS_API_URL`. **WT.19 is complete** — see `docs/DEPLOYMENT_STATUS.md`. Do not treat Netlify deploy as pending work.

---

## Editable TMS (development deploy)

All TMS application changes for the **deployed development** environment must be made in:

```
C:\Users\ariel\OneDrive\Escritorio\RECRUITING_SMARTER___BRASIL\proyecto_1_TigerHawk TMS\tigerhawk-tms-main\tigerhawk-tms-main
```

| Action | Repo |
|--------|------|
| Edit Next.js pages, dispatcher UI, `app/api/*` | **TMS path above** |
| Edit Tigerhawk Mobile (Expo) | `proyecto_PP2_app_mobile` (this repo) |
| Read-only TMS reference (audit, parity) | `PROYECTO_MUESTRA/` inside mobile repo — **do not modify** |

**Agents:** see `.cursor/rules/tms-dev-repository.mdc`, `.cursor/rules/deployment-status.mdc`, and `AGENTS.md` § Entornos desplegados.

---

## Live driver map — current state (audit)

Checked against the **TMS dev repo** (not `PROYECTO_MUESTRA/`):

| Item | Status |
|------|--------|
| `components/maps/LoadSidebarMap.tsx` | **Exists** — Leaflet + OSM; geocodes **pickup / delivery / return**; OSRM driving segments between stops |
| `components/dispatcher/LoadDetailPanel.tsx` | **Uses** `LoadSidebarMap` in load detail sidebar |
| `loads.current_latitude` / `current_longitude` / `last_seen_at` | **Not in schema yet** — mobile repo SQL pending task **8.4** |
| Driver marker + Realtime refresh on map | **Not implemented** — not functional for live tracking today |
| Dedicated “live route” page | **Does not exist** — phase 0 = extend load detail map + optional dispatcher list (**8.12–8.13**) |

**Conclusion:** the TMS has a **static route map** (stops), not **live driver position**. Semana 8 tasks **8.12–8.13** implement the dispatcher view; **8.4–8.9** implement mobile send + Supabase.

---

## Preferred integration path (phase 0)

1. **Driver:** Tigerhawk Mobile — load detail open, foreground GPS every 30–60 s → Supabase `UPDATE` on assigned `loads` (RLS).
2. **Dispatch:** TMS dev repo — subscribe to Realtime `loads` updates; show moving marker + `last_seen_at` on `LoadSidebarMap` (or sibling component).

**Not in scope for phase 0:** separate browser “tracking link” for drivers; background GPS.

Architecture: `docs/GPS_LIVE_TRACKING_ARCHITECTURE.md`.

---

## Related mobile docs

- `docs/TMS_PATCH_MOBILE_BEARER_AUTH.md`
- `docs/TMS_PATCH_4_1_DRIVER_DOCUMENTS.md`
- `docs/MOBILE_API.md`
- `PP2_TAREAS_DEV.md` § Semana 8 (tasks **8.12–8.13** name this repo)
