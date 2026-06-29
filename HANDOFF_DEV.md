# Handoff al desarrollador / cliente — Tigerhawk Mobile

Documento de entrega del proyecto **PP2 Driver** (marca UI: **Tigerhawk Mobile**).

**Entrega formal cliente:** `docs/CLIENT_HANDOFF_9_7.md` · **GPS sign-off:** `docs/GPS_LIVE_TRACKING_SIGNOFF_8_17.md` · **Samsara:** `docs/SAMSARA_GEOFENCE_SPIKE.md`

**Referencia TMS (solo lectura):** `PROYECTO_MUESTRA/` — no modificar desde este repo.  
**TMS editable:** `docs/TMS_DEV_REPOSITORY.md`

---

## Resumen funcional (v0.1.0)

| Área | Estado |
|------|--------|
| Auth Supabase + magic link | ✅ |
| My Loads + detalle + Realtime | ✅ |
| Acciones conductor (TMS PATCH) | ✅ |
| Documentos Driver/POD/Photo + offline queue | ✅ **9.2–9.4** |
| Wait time Check In/Out + emails detention | ✅ WT.27–35 |
| GPS en vivo → mapa TMS | ✅ **8.16** (sign-off **9.6**) |
| Cola offline status + upload | ✅ **9.4** |
| Samsara geofence auto check-out | ✅ **9.5** (TMS webhook; mobile sin SDK) |

---

## Pantallas y rutas (Expo Router)

| Pantalla | Ruta |
|----------|------|
| Login | `app/(auth)/login.tsx` |
| Auth callback | `app/auth/callback.tsx` |
| My Loads | `app/(drawer)/loads.tsx` |
| Account | `app/(drawer)/account.tsx` |
| Detalle carga | `app/load/[id].tsx` |
| Raíz | `app/index.tsx` → sesión → loads |

Drawer: `app/(drawer)/_layout.tsx` · `components/navigation/AppDrawerContent.tsx`

Providers globales: `app/_layout.tsx` (auth, query, offline queue, banners).

---

## Credenciales de prueba

| Uso | Valor |
|-----|--------|
| Conductor | `driver_test@test.com` / `Driver01*` |
| Seed | `npm run db:seed-driver-test` |
| Asignar cargas | `npm run db:assign-driver-test-loads` |

---

## Variables de entorno (mobile)

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_TMS_API_URL=https://…   # sin /dashboard
```

EAS: `docs/EAS_CREDENTIALS_HANDOFF_7_5.md` · builds: `docs/MOBILE_BUILDS.md`

---

## Comandos

```bash
npm install
npm start
npm run lint
npm test
npm run ci
npm run build:android:preview
```

---

## Documentación clave

| Documento | Contenido |
|-----------|-----------|
| `PP2_TAREAS_DEV.md` | Plan completo semanas 1–9 |
| `docs/MOBILE_API.md` | Supabase vs TMS |
| `docs/CLIENT_HANDOFF_9_7.md` | Entrega cliente 9.7 |
| `docs/MOBILE_SUPPORT_RUNBOOK_7_6.md` | Soporte L1–L3 |
| `docs/ROLLBACK_PP2.md` | Rollback SQL |
| `REPORTES_DIARIOS.md` / `DAILY_REPORTS.md` | Bitácora |

---

## Checklist de entrega

- [x] Login + cargas reales Supabase + PATCH TMS
- [x] Documentos + permisos cámara + cola offline
- [x] GPS live + TMS map marker
- [x] Samsara geofence handler (TMS)
- [x] CI `npm run ci` + tests TMS Samsara
- [x] Handoff docs actualizados
- [ ] Sign-off manual GPS G1 (`GPS_LIVE_TRACKING_SIGNOFF_8_17.md`)
- [ ] APK producción entregado al cliente (EAS)
- [ ] Reunión handoff §9 checklist (`CLIENT_HANDOFF_9_7.md`)

*Última actualización: **27 jun 2026** — tareas **9.5–9.7**.*
