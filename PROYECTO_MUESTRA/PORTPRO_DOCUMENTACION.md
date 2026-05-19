# Port Pro — Documentación de arranque (app móvil)

**TOTAL DE HORAS PARA EL DESARROLLO DEL PROYECTO = 355 horas** (estimación orientativa)

| Bloque | Horas (aprox.) | Notas |
|--------|------------------|--------|
| Cliente: definición, repo Expo, maquetado MVP con Claude, handoff | 40 h | ≈1 semana calendario intensa |
| Desarrollador: integración Supabase, sustitución de vibe coding, APIs/RLS, **extensión API documentos conductor**, documentos, ubicación opcional, notificaciones opcional, tests, E2E, QA, builds | 315 h | 8 semanas × ~39 h; +15 h respecto a la estimación previa por brecha detectada en `documents` POST (solo staff hoy) |

La cifra total es **indicativa**: puede variar ±25 % según el MVP acotado, si el maquetado del cliente es limpio, y si el MVP incluye o excluye GPS en segundo plano, push y offline avanzado.

---

## 1. Qué se revisó en la documentación del monorepo TigerHawk

### 1.1 Markdown en raíz y carpetas relevantes

- **Raíz:** `README_SPANISH.md`, `README_ENGLISH.md`, `README_STEPS_NEXTS.md`, `README_PRUEBAS.md`, `README_REPORTES_DIARIOS.md`, `TAREAS_TRELLO.md`, `DEMO.md`, `QUESTIONS.md`, `FINANCIAL_REPORTS_STRUCTURE.md`, y otros.
- **`docs/`:** `driver_app_roadmap.md` (roadmap React Native / Expo para app conductor, referencia directa para Port Pro), `INTEGRATION_GUIDE.md`, `DISPATCHER_API_ROUTES.md`, `RATE_SYSTEM_DESIGN.md`, `RLS_SECURITY_REVIEW_T22.md`, `SHIPMENT_ACTIONS_IMPLEMENTATION.md`, `Claude_Prompt_Templates.md`, `GitHub_Setup_Guide.md`, `ACCESSORIAL_*.md`, `SUGGESTION_FOR_RESOLVING_GEOLOCATION.md`, etc.

### 1.2 Word (.docx) en el repo

En la **raíz del repositorio** (mismo nivel que `package.json`) deben estar, entre otros:

| Archivo | Uso para Port Pro / TMS |
|---------|-------------------------|
| **`TigerHawk_TMS_Technical_Handoff.docx`** | Handoff técnico (p. ej. §6 *Known Issues*, §9 *Next Steps*); fuente para paridad de reglas de negocio y gaps conocidos. |
| **`TigerHawk_TMS_Testing_Plan.docx`** | Plan de pruebas E2E (fases, Phase 9 documentos/RLS, etc.); adaptar checklist a flujos móviles donde aplique. |
| `WORK_PLAN_PROJECT_1.docx`, `PLAN_DE_TRABAJO_PROYECTO_1.docx`, `initial_analysis_of_the_tigerhawk_project.docx` | Plan de trabajo e historia del proyecto. |
| `docs/SUGGESTION_FOR_RESOLVING_GEOLOCATION.docx` | Material de geolocalización (complemento del `.md` en `docs/`). |

Tu entorno local ya lista **`TigerHawk_TMS_Technical_Handoff.docx`** y **`TigerHawk_TMS_Testing_Plan.docx`** en esa raíz: son la **fuente de verdad** junto con los `.md` citados en `TAREAS_TRELLO.md` y `README_STEPS_NEXTS.md` (estos últimos son índice/resumen, no sustitutos del Word).

### 1.3 Coherencia con la documentación “global” del proyecto

El TMS web define:

- Stack **Next.js + Supabase** (`README_SPANISH.md`), variables en `env.example`.
- Alcance **sin app móvil nativa** dentro del mismo repo (`README_STEPS_NEXTS.md`); la app móvil es **proyecto aparte**.
- Seguridad multi-tenant y RLS (`docs/RLS_SECURITY_REVIEW_T22.md`, menciones a Phase 9 en `README_STEPS_NEXTS.md`).
- Rutas y dominio dispatcher documentados en `docs/DISPATCHER_API_ROUTES.md`.

Port Pro móvil debe **respetar las mismas reglas de datos y RLS**; no duplicar backend ni base de datos.

---

## 2. Ruta recomendada para crear el proyecto móvil “Port Pro”

### 2.1 Decisión de arquitectura

| Opción | Ventaja | Inconveniente |
|--------|---------|----------------|
| **A) Nuevo repo: Expo + TypeScript + Expo Router** (recomendado) | Alineado con `docs/driver_app_roadmap.md`, builds con EAS, equipo separado del web | Hay que sincronizar tipos/esquema con el monorepo web |
| B) Monorepo (Turborepo / workspace) con paquete `apps/mobile` | Código compartido (tipos, validadores) | Más complejidad de CI y de límites del cliente si solo maquetará una parte |

**Recomendación:** **Opción A** — repositorio independiente `port-pro-mobile` (o nombre acordado), con documentación que enlace al repo TigerHawk como **fuente de verdad del esquema** (`supabase/migrations/`).

### 2.2 Backend y datos

- **Misma instancia Supabase** del TMS: `NEXT_PUBLIC_SUPABASE_URL` / anon key equivalentes en el móvil como `EXPO_PUBLIC_*`.
- **Cliente Supabase** solo con **anon key**; políticas **RLS** deben permitir al rol conductor lo necesario. Operaciones que requieran privilegios elevados deben ir por **API Routes del Next.js** ya desplegado (BFF), sin exponer `SUPABASE_SERVICE_ROLE_KEY` en la app.
- **Auth:** Supabase Auth con deep links de Expo; URLs de redirect añadidas en el panel Supabase para esquemas `exp://` / dominio de preview EAS.

### 2.3 Paridad funcional

- Contrastar siempre con **`TigerHawk_TMS_Technical_Handoff.docx`** y **`TigerHawk_TMS_Testing_Plan.docx`** en la raíz del repo; usar **`README_PRUEBAS.md`** y **`README_STEPS_NEXTS.md`** como índice operativo (holds, documentos, límites, Phase 9, etc.).
- El roadmap largo de conductor en `docs/driver_app_roadmap.md` es **aspiracional**; el MVP debe acotarse en `PORTPRO_TAREAS_CLIENTE.md`.

### 2.4 Herramientas

- **Cliente:** Claude para maquetado UI sobre plantilla Expo.
- **Desarrollador:** tests unitarios (Jest), E2E (Maestro o Detox), QA manual según checklist adaptado de `README_PRUEBAS.md`.

### 2.5 Hosting

- El **TMS web** puede seguir desplegado en **Netlify** según las reglas del equipo; la app móvil no depende de ello salvo por llamadas HTTP a `NEXT_PUBLIC_APP_URL` si se usa como BFF.

---

## 3. Revisión de código TMS → Port Pro (qué existe y qué traslada el móvil)

Esta sección resume un **reconocimiento del código** del monorepo TigerHawk (Next.js) para alinear expectativas del producto móvil con la implementación real.

### 3.1 Comportamiento “conductor” ya modelado en web

| Área en código | Ubicación principal | Qué hace hoy |
|----------------|---------------------|--------------|
| Simulación de acciones de campo | `components/dispatcher/DriverActionPanel.tsx` | Lista transiciones válidas (`/api/admin/transitions` o `VALID_LOAD_TRANSITIONS`), separa visualmente acciones **Driver** vs **Dispatcher** vs finales (`Completed` / `Cancelled`). Llama `PATCH /api/dispatcher/loads/[id]/status`. |
| Cambio de estado | `app/api/dispatcher/loads/[id]/status/route.ts` | Permite **staff** (`admin`, `dispatcher`) **o** conductor **asignado** (`profile.role === "driver"` y `loads.driver_id === user.id`). Valida transición, **bloqueo por holds** activos salvo `admin`. |
| Asignación de conductor | `LoadDetailPanel.tsx`, `assign-driver/route.ts` | **Solo despacho**; no es flujo móvil. |
| Mensajes por carga | `app/api/dispatcher/loads/[id]/messages/route.ts` | GET/POST sin filtro de rol explícito en el fragmento revisado: asume auth + existencia de carga (RLS/insert debe proteger en profundidad). Candidato natural a **chat despacho ↔ conductor** en móvil. |
| Tiempos de espera | `app/api/dispatcher/loads/[id]/wait-time/route.ts` | Comentario en código: usado por **conductores** (registro) y despacho (revisión). Candidato a móvil si el MVP incluye “log de espera”. |
| Documentos de carga | `app/api/dispatcher/loads/[id]/documents/route.ts` | GET accesible con sesión; **POST restringe a `admin` y `dispatcher` únicamente** (límite **50 MB** en servidor). Un conductor con app **no puede** reutilizar ese POST tal cual para POD: hace falta **extensión de API**, **otra ruta**, o **subida directa a Storage** con políticas RLS acordes. |

### 3.2 Funcionalidades TMS que **sí** deben inspirar el MVP móvil (conductor)

- **Autenticación** Supabase (mismo proyecto).
- **Lista y detalle** de cargas donde `driver_id` coincide con el usuario (coherente con la comprobación del `status` route).
- **Transiciones de estado** equivalentes al subconjunto **Driver** del `DriverActionPanel` (misma API `PATCH …/status`); mensajes de error para `ACTIVE_HOLDS` y transiciones inválidas.
- **Mensajes** en la carga (si negocio lo prioriza).
- **Documentos / fotos**: lectura según RLS; **escritura** requiere trabajo backend o Storage (ver 3.1).
- **Wait time** (opcional MVP): si hoy los conductores lo cargan desde web, el móvil puede sustituir ese uso en campo.

### 3.3 Funcionalidades que **no** conviene integrar al móvil Port Pro (o no en v1) — y por qué

| Funcionalidad / módulo TMS | Recomendación | Motivo |
|----------------------------|---------------|--------|
| **Portal cliente** (`/portal/*`, `app/api/portal/*`) | **No** mezclar en la app Port Pro conductor | Rol `customer`, flujos y RLS distintos; es otro producto (visibilidad del shipper). Mantener app separada o solo web. |
| **Dispatcher completo** (Load Board, Planner, Street Turns, Dual Transactions, New Load, Itinerary…) | **No** | Operaciones masivas, asignación, pricing y coordinación; pantallas grandes y permisos de staff. |
| **Drivers / Pay rates / Settlements / Deducciones** (`/dashboard/drivers`, A/P) | **No** en app conductor | Datos salariales sensibles y reglas contables; riesgo legal y de UX; mejor portal o documento PDF acordado con negocio. |
| **A/R, facturación, reportes financieros y operativos** | **No** | Solo roles back-office; irrelevante para ejecución en ruta. |
| **Admin** (usuarios, transiciones globales, activity log, templates) | **No** | Configuración del sistema; no debe estar en terminal de conductor. |
| **Vessels / Containers / Organizations / Equipment / Warehouse** como vistas globales | **No** (salvo lectura mínima embebida) | Son tableros de flota y maestros; el conductor solo necesita datos **de su carga** (contenedor, ventanas, direcciones) ya presentes en el join de `loads`. |
| **Port Houston / cron / import masivo** | **No** | Integraciones server-side y secretos; el móvil no debe duplicarlas. |
| **Acciones “Dispatcher” y finales** en el mismo panel que el conductor (`DriverActionPanel` muestra ambas) | **No** en UI móvil | En web es útil para QA; en móvil el conductor solo debe ver **acciones Driver** (y eventualmente una acción final **solo si** negocio y API lo permiten explícitamente). Además conviene **endurecer el servidor** para que un rol `driver` no pueda enviar estados reservados a despacho si hoy el mapa de transiciones lo permitiera por error. |
| **Mapa web avanzado** (`LoadSidebarMap`, geocoding OSRM/Nominatim en cliente) | **Diferido** o versión simplificada | Stack web (Leaflet/OSRM en browser); en móvil usar `react-native-maps` + políticas de uso de tiles/OSRM sin copiar toda la lógica del web. |

### 3.4 Riesgos / gaps detectados para el desarrollador

1. **Subida POD / documentos:** el `POST` actual de documentos es **solo staff**; el plan móvil debe contemplar **cambio en este repo TMS** o ruta alternativa documentada.
2. **Paridad UI vs seguridad:** el panel web mezcla botones dispatcher y driver; el móvil debe ser **menor superficie** y revisar **matriz rol × transición** en API.
3. **Navegación dashboard para rol `driver`:** el `middleware` no restringe rutas por rol; un conductor podría abrir muchas URLs de dashboard si las conoce (defensa debe ser **RLS + comprobaciones en API**). El móvil no “arregla” eso, pero no debe asumir que el web ya limitó la UX.

---

## 4. Tareas por rol (referencia cruzada)

| Documento | Contenido |
|-----------|-------------|
| `PORTPRO_TAREAS_CLIENTE.md` | Lista de tareas para el cliente (~1 semana): repo Expo, diseño, maquetado Claude, mocks, `.env.example`, handoff. |
| `PORTPRO_TAREAS_DEV.md` | **8 semanas; en cada una, 8 tareas concretas** (índices N.1 … N.8): Supabase, cargas, estados, documentos/POD, ubicación opcional, notificaciones/realtime opcional, tests, QA, release. |

---

## 5. Checklist mínima de documentación que debe existir en el repo móvil al integrar

1. `README.md` — cómo ejecutar, stack, enlace al TMS.
2. `.env.example` — solo variables públicas previstas.
3. `HANDOFF_DEV.md` — estado real del maquetado (cliente).
4. `docs/DATA_CONTRACT.md` — campos por pantalla (cliente o dev).
5. `docs/MOBILE_API.md` — Supabase directo vs API Next (dev, semana 2).
6. `docs/STORAGE_RLS.md` — si hay subida de archivos (dev, semana 4).

---

## 6. Glosario rápido

- **TigerHawk TMS:** sistema web actual (Next.js + Supabase).
- **Port Pro (móvil):** producto móvil de campo enlazado al mismo Supabase; nombre comercial acordado con negocio.
- **Vibe coding:** maquetado o lógica generada rápidamente (p. ej. con IA) que el desarrollador debe **revisar, endurecer y probar** antes de producción.

---

*Documento de plan de trabajo; ajustar horas y alcance tras la revisión del handoff del cliente y el cruce sección por sección con `TigerHawk_TMS_Technical_Handoff.docx` y `TigerHawk_TMS_Testing_Plan.docx`.*
