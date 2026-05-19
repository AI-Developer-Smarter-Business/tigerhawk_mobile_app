# Port Pro (móvil) — Tareas para el cliente (≈1 semana)

Objetivo de esta fase: dejar **listo el arranque del app móvil “Port Pro”** (nombre de producto), con **diseño y maquetado inicial** hechos con apoyo de Claude, **sin** montar backend ni base de datos nueva (se reutiliza el **mismo proyecto Supabase** del TMS TigerHawk).

Al cerrar esta lista, el cliente entrega al desarrollador: **repositorio nuevo**, **código maquetado**, **documentación mínima** y **decisiones de producto** tomadas por escrito.

### Si algo se siente demasiado técnico

No pasa nada. Si en algún momento las tareas de entorno, Supabase o la API les resultan **demasiado técnicas** o ajenas a su fortaleza, pueden **centrarse con tranquilidad en el diseño y el maquetado de las pantallas** (flujos, estilos, navegación con datos de prueba). La **conexión con el backend**, las variables sensibles y el ajuste fino con el TMS pueden dejarse en manos del **desarrollador**, que con gusto las retomará con el contexto que ustedes entreguen en el README y en `HANDOFF_DEV.md`. Lo importante es avanzar sin bloquearse: un buen diseño y un handoff claro ya son un aporte enorme.

---

## Día 1–2: Definición y entorno

1. **Confirmar alcance MVP móvil** (1–2 páginas): qué hace el conductor en la primera versión (p. ej. login, lista de cargas asignadas, detalle de carga, acciones de estado **de campo** alineadas al subconjunto *Driver* del TMS web, mensajes en carga, foto/POD si negocio lo pide). Evitar “todo el roadmap” de `docs/driver_app_roadmap.md` en la primera entrega. **No** incluir en el MVP: portal cliente (`/portal`), despacho completo, finanzas, nómina ni administración (ver `PORTPRO_DOCUMENTACION.md` §3.3).
2. **Crear repositorio Git** exclusivo para la app (nombre sugerido: `port-pro-mobile` o `tigerhawk-port-pro`). Añadir `README.md` con objetivo del producto y enlace a este plan.
3. **Inicializar proyecto** con plantilla recomendada por el equipo técnico: **Expo (React Native) + TypeScript + Expo Router** (coherente con `docs/driver_app_roadmap.md`). Comando típico: `npx create-expo-app@latest` con plantilla tabs o blank según prefiera Claude.
4. **Definir identidad “Port Pro”**: nombre en pantalla, slug de Expo, colores primarios/secundarios, tipografía (aunque sea provisional). Exportar decisiones en un `DESIGN_TOKENS.md` o sección en el README.

---

## Día 3–4: Diseño y maquetado con Claude

5. **Wireframes o Figma** (opcional pero muy recomendado): flujos de login → home → detalle de carga → confirmación. Si no hay Figma, dejar **capturas o lista numerada de pantallas** en el repo (`docs/UX_SCREENS.md`).
6. **Prompt maestro para Claude**: incluir contexto del negocio (drayage, Houston), stack (Expo, TypeScript), que **no** debe incrustar `SUPABASE_SERVICE_ROLE_KEY` en la app, y lista de pantallas del MVP. Puede basarse en la idea de “Project Context” de `docs/Claude_Prompt_Templates.md` adaptada a React Native.
7. **Maquetar con Claude** las pantallas del MVP: layouts, navegación, componentes visuales, estados vacíos y de error **solo de UI** (datos pueden ser mocks/JSON local). Si maquetan **subida de POD**, etiquetarla en el handoff como **“requiere trabajo en API TMS”** (hoy el `POST` de documentos en el servidor solo admite `admin`/`dispatcher`; el desarrollador ampliará la vía — ver `PORTPRO_DOCUMENTACION.md` §3.4).
8. **Assets**: icono app, splash, favicon Expo; placeholders si no hay diseño final.

---

## Día 5: Integración mínima con “datos falsos” y handoff

9. **Capa de datos simulada**: un `src/mocks/` o similar con tipos TypeScript alineados a lo que el desarrollador conectará después (cargas, estados, usuario). Documentar en `docs/DATA_CONTRACT.md` qué campos espera cada pantalla.
10. **Variables de entorno**: archivo `.env.example` en el repo móvil con **solo** claves públicas previstas, por ejemplo:
    - `EXPO_PUBLIC_SUPABASE_URL`
    - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
    - (opcional más adelante) `EXPO_PUBLIC_TMS_API_URL` si se usa el Next.js como BFF.
    **No** commitear `.env` con secretos.
11. **Checklist de entrega al desarrollador** (`HANDOFF_DEV.md`): versión de Node/npm, comando `npm run start`, lista de pantallas hechas, limitaciones conocidas (“Claude dejó X sin terminar”), y prioridad de corrección.
12. **Build de humo**: `npx expo start` y, si es posible, **EAS Build** de preview o al menos registro en [expo.dev](https://expo.dev) con proyecto creado (sin obligar a publicar en tiendas).

---

## Criterios de “listo para pasar al desarrollador”

- El proyecto **abre en Expo Go** o simulador sin errores de compilación.
- Navegación entre pantallas del MVP **funciona** con mocks.
- README + `.env.example` + `HANDOFF_DEV.md` **completos**.
- Decisiones de MVP **acotadas** (qué entra / qué no en v1).

---

## Referencias en el monorepo TigerHawk (solo lectura para el cliente)

- Roadmap técnico app conductor: `docs/driver_app_roadmap.md`
- TMS web y Supabase (contexto de dominio): `README_SPANISH.md`, `README_STEPS_NEXTS.md`
- Plantillas de prompts (adaptar a RN): `docs/Claude_Prompt_Templates.md`
- **Qué hace hoy el TMS para el conductor (referencia de pantallas):** `components/dispatcher/DriverActionPanel.tsx` (acciones de estado en el detalle de carga). No copiar botones de “Dispatcher” del panel web en el diseño móvil.
- **Qué no es Port Pro móvil:** el **portal cliente** (`app/portal/`) es otro rol y producto; no mezclar flujos de cliente shipper en la app del conductor.

Si el cliente necesita alineación legal de marca (“Port Pro” vs nombre interno TigerHawk), documentarlo en el README del repo móvil.
