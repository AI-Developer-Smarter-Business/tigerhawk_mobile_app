# Prompt maestro — PP2 (React Native / Expo)

Usar al maquetar o extender pantallas con Claude u otro asistente.

---

## Contexto de negocio

- Empresa de **drayage** en **Houston, TX** (TigerHawk TMS).
- App **PP2**: conductor de campo, no despacho ni cliente shipper.
- MVP: login, cargas asignadas, detalle, **acciones Driver** alineadas al TMS web, mensajes, POD futuro.

## Stack

- **Expo SDK 54**, **TypeScript**, **Expo Router**
- Mismo **Supabase** que el TMS (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`)
- Datos mock en `mocks/` hasta integración dev (`PP2_TAREAS_DEV.md`)
- Tema: `constants/theme.ts` (`PP2Theme`)

## Reglas de seguridad

- **Nunca** incluir `SUPABASE_SERVICE_ROLE_KEY`, secretos Port Houston ni `RESEND_API_KEY` en el cliente.
- Solo variables `EXPO_PUBLIC_*` en la app.

## Pantallas MVP

1. Login  
2. Lista de cargas (vacío / error / refresh)  
3. Detalle de carga + acciones Driver (no dispatcher)  
4. Mensajes por carga  
5. POD: solo placeholder — etiquetar **“requiere API TMS”**

## Referencias en repo

- `docs/MVP_SCOPE.md`, `docs/UX_SCREENS.md`, `docs/DATA_CONTRACT.md`
- `PROYECTO_MUESTRA/components/dispatcher/DriverActionPanel.tsx` (solo lectura)
- **No modificar** `PROYECTO_MUESTRA/`

## Estilo de código

- Componentes en `components/`, lógica pura en `lib/`
- Sin `any`; tipos en `types/`
- Tests Jest para utilidades en `lib/**/__tests__`
