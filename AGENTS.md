# Directrices del proyecto PP2 (app móvil)

## Regla crítica: `PROYECTO_MUESTRA/`

**Nunca modificar, renombrar ni borrar archivos dentro de `PROYECTO_MUESTRA/`.**

Esa carpeta es el TMS web TigerHawk de **solo lectura** (referencia de dominio, APIs, Supabase y panel conductor). Cualquier cambio de código o documentación del móvil va en la **raíz** del repo (`app/`, `lib/`, `PP2_*.md`, etc.), no dentro de `PROYECTO_MUESTRA`.

Si hace falta alinear API o RLS con el TMS, documentarlo en `PP2_*.md` o en el TMS en otro repositorio/PR acordado — no editar `PROYECTO_MUESTRA` desde este flujo.

## Nombre del producto

- **Proyecto / app:** PP2  
- **Paquete npm:** `pp2-mobile`  
- **Expo slug / scheme:** `pp2`  
- Documentación de planificación en raíz: `PP2_DOCUMENTACION.md`, `PP2_TAREAS_CLIENTE.md`, `PP2_TAREAS_DEV.md`, `PP2_TASKS.md`

## Expo

Antes de escribir código Expo, consultar la documentación de la versión instalada: https://docs.expo.dev/versions/v54.0.0/

## UI y documentación de avance

### Barra lateral (drawer)

- **Referencia de layout:** `nav_lateral.png` (raíz del repo) — menú lateral tipo drawer con icono + etiqueta por fila y **Log Out** al final.
- **Colores y estilo:** los del TMS en `PROYECTO_MUESTRA/components/layout/DashboardLayout.tsx` (solo lectura):
  - Fondo sidebar `#111827`, borde `white/5`
  - Ítem activo `#E8700A` (naranja TigerHawk), texto activo blanco
  - Ítems inactivos `gray-400`, hover `white/5`
- **Implementación móvil:** `app/(drawer)/` + `components/navigation/AppDrawerContent.tsx`; tokens en `constants/theme.ts` → `PP2Theme.colors.tms`.
- **Alcance PP2:** solo ítems del conductor (**My Loads**, **Account**, **Log Out**), no el menú completo del TMS (Sales, A/R, etc.).

- **Idioma de la app:** todo texto visible al usuario en **inglés** (`constants/strings.ts`).
- **README.md:** inglés.
- **REPORTES_DIARIOS.md** (español) y **DAILY_REPORTS.md** (inglés): registrar cada cambio funcional el mismo día en ambos (ver directiva al inicio). Mapear a tarea `PP2_TAREAS_DEV.md` cuando aplique. Incluir siempre una sección breve **Cómo probar** / **How to test** (app o `npm test` / `npm run ci`). **No citar `PROYECTO_MUESTRA/`** en los reportes diarios — usar «TMS» / rutas API / `docs/`.
- **Logging:** usar `safeLog` (`lib/logging/safe-log.ts`); nunca `console.log` de contraseñas, tokens o sesiones. Telemetría de cambio de estado: `docs/MOBILE_TELEMETRY.md`.
- **UI:** marca visible **Tigerhawk Mobile** (`strings.app.name`); colores en `PP2Theme` + `variant="chrome"` / `accent` (regla `.cursor/rules/pp2-ui-style.mdc`).
- **Supabase SQL:** aplicar migraciones vía **SQL Editor**; copias en `supabase/sql-editor/`.
