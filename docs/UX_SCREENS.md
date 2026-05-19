# Pantallas MVP — PP2

Flujo principal: **Login → Cargas → Detalle → Acción / confirmación**

| # | Ruta | Pantalla | Notas |
|---|------|----------|--------|
| 1 | `/(auth)/login` | Login | Email, contraseña, error de credenciales |
| 2 | `/(drawer)/loads` | My loads | Lista Supabase, pull-to-refresh, drawer TMS |
| 3 | `/load/[id]` | Detalle | Ruta, mensajes, POD placeholder, acciones Driver |
| 4 | `/(drawer)/account` | Account | Perfil Supabase, entorno, cerrar sesión |

## Estados de UI cubiertos

- **Vacío:** lista sin cargas (`EmptyState`)
- **Error:** banner en login y lista (refresh fallido)
- **Carga:** botones con `loading` en login y acciones de estado
- **Holds:** mensaje en lista y bloqueo de acciones en detalle

## Wireframe textual (login → detalle)

```
[ Login PP2 ]
     ↓ Entrar
[ Tab: Cargas ]  —  #TH-24051  [Despachado]  HOT
                   Puerto → Warehouse
     ↓ tap
[ Detalle #TH-24051 ]
   Ruta | Mensajes | POD (placeholder)
   [ En tránsito ] [ En recogida ]  ← solo acciones Driver
```
