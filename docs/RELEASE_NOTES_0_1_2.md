# Tigerhawk Mobile — release notes v0.1.2

**Build profiles:** `preview` (internal APK) · `production` (APK / iOS → TestFlight)  
**Package:** `com.tigerhawk.mobile` · **Scheme:** `pp2://` · **Version:** `0.1.2`

Oleada 1 (Q12): **Loads + Clock + Pick-and-Run + POD stamp**.

---

## Highlights

- **Login** — Username via `POST /api/mobile/auth/login` (no `user_profiles` gate for truck drivers).
- **Loads** — Active / Upcoming move cards from `GET /api/mobile/driver/loads`.
- **Accept / Reject** — Per move; Accept & Start is one request.
- **Progress** — `start_move` | `enroute` | `arrived` | `complete` with server labels (TABLE).
- **Chassis** — Free text on arrive at pick; TIR Out / TIR In uploads; Complete checklist from `missing[]`.
- **POD legal** — Signature stamp via `…/pod-signature`; gate before leaving delivery; offline queue order.
- **Clock** — Duty In/Out (separate from Wait Check In/Out).
- **Shell** — Bottom tabs Loads · Clock · Account; Contact dispatch; Open in Maps (pin only).

---

## Environment (EAS — required)

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Same Supabase as TMS |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anon key only |
| `EXPO_PUBLIC_TMS_API_URL` | Public TMS base URL (not localhost) |
| `EXPO_PUBLIC_DISPATCH_PHONE` | Account Call dispatch (recommended) |
| `EXPO_PUBLIC_DISPATCH_EMAIL` | Account Email dispatch (recommended) |

```bash
npm run eas:push-env
npm run build:preflight
npm run qa:k1
npm run build:android:preview    # APK
npm run build:ios:production     # then npm run submit:ios
```

See `docs/MOBILE_BUILDS.md` § K.3.

---

## Known limitations (oleada 1)

- Pay / Messages / My Equipment → Wave 2 (before full release).
- No in-app turn-by-turn; no in-app forgot-password.
- Device QA matrix rows in `docs/QA_OLEADA1_MATRIX_K1.md` must be signed on hardware.

---

**QA:** `docs/QA_OLEADA1_MATRIX_K1.md` · **API:** `docs/MOBILE_API.md` · **Changelog:** `CHANGELOG.md`
