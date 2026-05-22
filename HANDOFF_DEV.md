# Handoff al desarrollador / cliente — PP2 Driver (móvil)

Documento de entrega tras la **fase maquetado** (`PP2_TAREAS_CLIENTE.md`) y las **semanas 1–3 de desarrollo** (`PP2_TAREAS_DEV.md` §1–3). Describe qué cambió respecto al arranque con mocks y qué queda para v1.

**Producto en pantalla:** **PP2 Driver** (no “TigerHawk” en la app móvil).  
**Referencia TMS (solo lectura):** `PROYECTO_MUESTRA/` — no modificar desde este repo.

---

## Resumen: maquetado inicial → estado actual

| Área | Maquetado inicial (cliente) | Estado actual (dev semanas 1–3) |
|------|-----------------------------|----------------------------------|
| **Auth** | Mock (`driver@tigerhawk.demo`) | Supabase: contraseña + magic link + deep link `pp2://auth/callback` |
| **Lista de cargas** | JSON / mocks locales | Supabase PostgREST + RLS + paginación infinita |
| **Detalle de carga** | Mock + cambio de estado **solo en memoria** | Lectura Supabase + **PATCH TMS** persiste estado |
| **Acciones conductor** | Todos los botones del mock | Solo subconjunto **Driver** (como `DriverActionPanel` web) |
| **Errores** | Texto genérico | `ACTIVE_HOLDS`, 403, 401, red — mensajes claros en inglés |
| **Sync TMS ↔ app** | No existía | Realtime `loads` + invalidación React Query |
| **Navegación** | Tabs simples | Drawer TMS (oscuro) + cabecera **PP2 Driver** |
| **Login / Account** | Fondo claro genérico | Estilo **chrome** alineado al drawer (naranja `#E8700A`) |
| **POD / fotos** | `PodUploadSection` + `expo-image-picker` | Subida vía `uploadLoadDocument`; TMS debe tener parche 4.1 en el host de `EXPO_PUBLIC_TMS_API_URL` |
| **Mensajes en carga** | Mock lectura | Pendiente POST / realtime — **semana 5+** |
| **Tests** | Ninguno | Jest: 115+ tests, `npm run ci` en GitHub Actions |

---

## Pantallas y rutas (Expo Router)

| Pantalla | Ruta | Comportamiento actual |
|----------|------|------------------------|
| Login | `app/(auth)/login.tsx` | Supabase password + “Email me a sign-in link” |
| Auth callback | `app/auth/callback.tsx` | Completa magic link |
| Lista de cargas | `app/(drawer)/loads.tsx` | Infinite scroll, pull-to-refresh, dedupe filas |
| Detalle | `app/load/[id].tsx` | Detalle Supabase + `DriverActionBar` → TMS PATCH |
| Cuenta | `app/(drawer)/account.tsx` | Perfil + sesión + logout (UI chrome) |
| Redirect raíz | `app/index.tsx` | Sesión → loads; si no → login |

**Navegación:** `app/(drawer)/_layout.tsx` — drawer personalizado `AppDrawerContent` (marca **PP2 Driver**).

---

## Credenciales y datos de prueba

| Uso | Valor |
|-----|--------|
| Conductor de prueba | `driver_test@test.com` / `Driver01*` |
| Crear usuario | `npm run db:seed-driver-test` |
| Asignar cargas (3) | `npm run db:assign-driver-test-loads` |
| Paginación QA (21) | `npm run db:assign-driver-test-loads:pagination` |
| Recortar exceso | `npm run db:trim-driver-test-loads` |
| Mock legacy (dev) | `EXPO_PUBLIC_ENABLE_MOCK_AUTH=1` — desactivado por defecto |

**Demo antigua del maquetado** (`driver@tigerhawk.demo` / `demo123`) ya no es el flujo principal.

---

## Variables de entorno (`.env.local`)

```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_TMS_API_URL=http://localhost:3000   # TMS Next.js (PATCH status)
```

- En **dispositivo físico**, `TMS_API_URL` debe ser IP/LAN o URL pública de staging, no `localhost`.
- **Nunca** `EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` en la app — ver `docs/SECRETS_AND_BFF.md`.

---

## Entorno y comandos

| Herramienta | Versión |
|-------------|---------|
| Node.js | 20 LTS |
| npm | 10+ |
| Expo SDK | 54 |

```bash
npm install
npm start              # Expo Go / emulador
npm run lint           # tsc --noEmit
npm test               # Jest
npm run ci             # lint + check:secrets + tests (≈ GitHub Actions)
```

---

## Capa de acciones de conductor (semana 3)

Flujo en detalle de carga:

1. `DriverActionBar` → `useDriverStatusChange` → `runDriverStatusChange`
2. Optimistic UI **solo si** `canOptimisticallyUpdateLoadStatus` (sin holds, transición válida)
3. `patchLoadStatus` → `PATCH {base}/api/dispatcher/loads/{id}/status` body `{ status }`, JWT Supabase
4. Éxito: invalidación React Query; fallo: rollback + `ErrorBanner`

**Archivos clave**

| Tema | Ruta |
|------|------|
| PATCH + payload | `lib/tms/patch-load-status.ts`, `lib/tms/status-patch-request.ts` |
| Orquestación | `lib/driver-status/run-driver-status-change.ts` |
| Botones visibles | `lib/loads/driver-actions.ts`, `components/loads/DriverActionBar.tsx` |
| Errores UX | `lib/errors/`, `docs/MOBILE_ERRORS.md` |
| Telemetría dev | `lib/telemetry/`, `docs/MOBILE_TELEMETRY.md` |
| QA web vs móvil | `docs/QA_DRIVER_ACTIONS_3_7.md` |
| Realtime | `hooks/useDriverLoadsRealtime.ts`, `supabase/sql-editor/enable_realtime_loads.sql` |
| Patch TMS servidor (otro repo) | `docs/TMS_PATCH_3_3_DRIVER_STATUS.md` |

---

## UI y estilo (respecto al maquetado)

- Tokens: `constants/theme.ts` (`PP2Theme.colors.tms` — sidebar/login).
- Regla para nuevas pantallas: `.cursor/rules/pp2-ui-style.mdc` + `AGENTS.md`.
- Variantes: `Screen`/`Card`/`Input` `variant="chrome"`; botones `accent` / `outlineAccent` en login y acciones de carga.
- Textos UI: inglés en `constants/strings.ts`.

---

## Limitaciones conocidas (v0.2 — post semana 3)

1. **POD / documentos:** UI placeholder; parche TMS documentado (4.1 ✅) — desplegar en Netlify antes de QA E2E; wiring `expo-image-picker` en 4.2.
2. **Mensajes en carga:** lectura vía Supabase donde RLS aplique; sin hilo completo ni POST conductor en móvil.
3. **Transiciones:** mapa estático `MOCK_LOAD_TRANSITIONS` en cliente; el TMS puede usar `GET /api/admin/transitions` — alinear cuando se wiree.
4. **Magic link:** requiere redirect URLs en Supabase (`docs/SUPABASE_AUTH_REDIRECTS.md`); mensaje verde = “revisa tu correo”, no sesión abierta aún.
5. **QA manual 3.7:** matriz en `docs/QA_DRIVER_ACTIONS_3_7.md` — sign-off staging opcional (TMS + mismo `driver_test` + misma carga).
6. **iOS build:** documentado en `docs/MOBILE_BUILDS.md`; Android preview listo vía EAS.

---

## Prioridad sugerida (siguiente trabajo)

Orden en `PP2_TAREAS_DEV.md`:

1. **Semana 4** — desplegar parche TMS 4.1 + `expo-image-picker` (4.2)  
2. **Semana 5** — Mensajes en carga  
3. **Semana 6+** — GPS, offline avanzado, E2E (Maestro/Detox)  
4. Aplicar en repo TMS el patch de `docs/TMS_PATCH_3_3_DRIVER_STATUS.md` si aún no está en producción  

---

## Documentación del repo

| Documento | Contenido |
|-----------|-----------|
| `PP2_DOCUMENTACION.md` | Arquitectura y mapa TMS → móvil |
| `PP2_TAREAS_DEV.md` | Plan 8 semanas (§1–3 ✅) |
| `docs/MVP_SCOPE.md` | Alcance v1 |
| `docs/UX_SCREENS.md` | Flujos pantallas |
| `docs/DATA_CONTRACT.md` | Campos mock → Supabase |
| `docs/MOBILE_API.md` | Supabase vs TMS API |
| `docs/MOBILE_BUILDS.md` | APK Android, EAS secrets |
| `REPORTES_DIARIOS.md` / `DAILY_REPORTS.md` | Bitácora diaria |

---

## CI y secretos

- Workflow: `.github/workflows/ci.yml` → `npm run ci`
- Guard: `scripts/check-client-secrets.mjs` (sin service role en `app/`, `lib/`, etc.)

---

## Checklist de entrega (actualizado)

- [x] Proyecto abre en Expo sin errores de compilación  
- [x] Navegación MVP con **datos reales** Supabase (no solo mocks)  
- [x] Login Supabase + deep linking  
- [x] Lista/detalle cargas conductor (RLS)  
- [x] PATCH estado vía TMS + errores holds/403  
- [x] Drawer + marca PP2 Driver + login/account alineados  
- [x] Tests unitarios + CI  
- [x] `HANDOFF_DEV.md` actualizado (este documento)  
- [ ] POD funcional (semana 4)  
- [ ] Sign-off manual QA 3.7 en staging (opcional, ver `docs/QA_DRIVER_ACTIONS_3_7.md`)  

*Última actualización: tarea dev **3.8** — cierre semana 3 (acciones de conductor).*
