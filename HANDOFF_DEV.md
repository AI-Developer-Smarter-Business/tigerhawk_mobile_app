# Handoff al desarrollador — PP2 móvil

## Entorno

| Herramienta | Versión recomendada |
|-------------|---------------------|
| Node.js | 20 LTS |
| npm | 10+ |
| Expo SDK | 54 |

```bash
npm install
npm start          # Expo Go / emulador
npm run lint       # tsc --noEmit
npm test           # Jest
npm run ci         # lint + tests (igual que GitHub Actions)
```

Variables: copiar `.env.example` → `.env.local` (ya puede existir con claves del TMS).

## Pantallas implementadas (maquetado + mocks)

| Pantalla | Ruta | Estado |
|----------|------|--------|
| Login | `/(auth)/login` | Mock auth |
| Cargas | `/(drawer)/loads` | Supabase + pull-to-refresh |
| Detalle | `/load/[id]` | Mock + acciones Driver locales |
| Cuenta | `/(drawer)/account` | Perfil Supabase + logout |

## Credenciales demo

- Email: `driver@tigerhawk.demo`
- Password: `demo123`

## Limitaciones conocidas

1. **Auth:** sin Supabase Auth real (`PP2_TAREAS_DEV.md` §1.4).
2. **Datos:** `mocks/` y `LoadsContext` — no hay queries Supabase.
3. **POD:** placeholder; requiere extender API TMS (§3.4 `PP2_DOCUMENTACION.md`).
4. **Acciones de estado:** simuladas en cliente; falta `PATCH` al TMS y validación servidor.
5. **Mensajes:** solo lectura mock; sin POST ni realtime.
6. **EAS:** `app.json` → `extra.eas.projectId` pendiente de registrar en expo.dev.

## Prioridad sugerida (dev)

1. Login Supabase + deep linking  
2. Listado real de cargas (RLS `driver_id`)  
3. `PATCH` status + errores `ACTIVE_HOLDS`  
4. POD / Storage  
5. Tests E2E (Maestro/Detox)

## Documentación

- `docs/MVP_SCOPE.md`, `docs/UX_SCREENS.md`, `docs/DATA_CONTRACT.md`
- Plan: `PP2_TAREAS_DEV.md`
- **No editar** `PROYECTO_MUESTRA/` (referencia TMS)

## CI & secrets

- GitHub Actions: `.github/workflows/ci.yml` en cada push/PR.
- `npm run ci` = lint + `check:secrets` + Jest (mismo pipeline local).
- Nunca incluir `SUPABASE_SERVICE_ROLE_KEY` en la app — ver `docs/SECRETS_AND_BFF.md`.
