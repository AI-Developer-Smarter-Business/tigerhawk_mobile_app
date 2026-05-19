# Secrets matrix & TMS BFF — PP2 mobile (dev task 1.8)

**Date:** 19 May 2026  
**CI:** `.github/workflows/ci.yml` → `npm run ci` (lint + tests + `check:secrets`).

---

## 1. Rule: what never ships in the mobile app

| Secret / capability | In mobile bundle? | Where it belongs |
|-------------------|-------------------|------------------|
| `SUPABASE_SERVICE_ROLE_KEY` | **Never** | TMS Next.js (`lib/supabase/admin.ts`), local `scripts/*.mjs` only |
| `EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | **Never** (blocked in `lib/config/env.ts`) | — |
| `SUPABASE_DB_PASSWORD` | **Never** | Developer machine / CI for migrations only |
| `RESEND_API_KEY` | **Never** | TMS `lib/email/resendClient.ts` |
| `PORT_HOUSTON_CLIENT_SECRET` | **Never** | TMS `lib/port-houston/auth.ts` |
| `createAdminClient()` | **Never** in `app/`, `lib/`, `hooks/`, `components/`, `context/` | TMS API routes only |
| Stripe / payment keys | **Never** | TMS if used |

**Allowed in mobile (public):**

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | RLS-scoped client (JWT role `anon`) |
| `EXPO_PUBLIC_TMS_API_URL` | Base URL for TMS `app/api/*` (BFF) |

Runtime guard: `assertSupabaseAnonKey()` in `lib/supabase/client.ts` rejects anon keys that are actually `service_role` JWTs.

Automated check: `npm run check:secrets` (also part of `npm run ci`).

---

## 2. Operations matrix: Supabase direct vs TMS BFF

| Operation | Mobile channel | Why |
|-----------|----------------|-----|
| Login / session | **Supabase Auth** (anon + SecureStore) | Standard client auth |
| Read own `user_profiles` | **Supabase SELECT** | RLS: own row |
| List assigned `loads` | **Supabase SELECT** | RLS: `driver_id = auth.uid()` |
| Read `load_messages` / `load_documents` | **Supabase SELECT** (or TMS GET) | RLS scoped after migration 20260518 |
| **PATCH load status** | **TMS BFF** `PATCH /api/dispatcher/loads/[id]/status` | No driver UPDATE on `loads`; server validates transitions + holds |
| **Upload POD / document** | **TMS BFF** (extend POST) or Storage policy TBD | Current TMS POST is admin/dispatcher only |
| Signed document URLs | **TMS GET** documents or Storage signed URL via API | Admin client used server-side today |
| Assign driver / dispatch | **Not in mobile** | Staff TMS UI |
| Driver pay / settlements / A/R | **Not in mobile** | Staff + financial RLS |
| Port Houston sync | **Not in mobile** | Server cron + secrets |
| CSV import / admin users | **Not in mobile** | Service role + staff |
| Activity log insert | **Not in mobile** | Admin client on TMS |
| Email send | **Not in mobile** | Resend on TMS |

**BFF base URL:** `env.tmsApiUrl` (`EXPO_PUBLIC_TMS_API_URL` or `NEXT_PUBLIC_APP_URL` in shared `.env.local` for dev).

**Auth to BFF:** `Authorization: Bearer <supabase_access_token>` from `useAuth().session.access_token`.

---

## 3. When to add a new TMS route (decision tree)

```
Need data or action from mobile?
├─ RLS allows driver with anon key only?
│  ├─ Yes → Supabase query in lib/supabase/queries/
│  └─ No → TMS app/api route (BFF)
│       ├─ Needs service role or staff-only table?
│       │  └─ Yes → route uses createAdminClient() on server
│       └─ Needs secret (email, Port Houston, etc.)?
│          └─ Yes → route on TMS only
└─ Never add service role to Expo env
```

---

## 4. Local development & scripts

| Tool | Secrets used | Committed? |
|------|--------------|------------|
| Expo app (`npm start`) | Anon key only in bundle | `.env.local` gitignored |
| `scripts/create-driver-test-user.mjs` | `SUPABASE_SERVICE_ROLE_KEY` | Run locally only |
| `scripts/assign-loads-driver-test.mjs` | Service role | Run locally only |
| `npm run db:apply-rls` | `SUPABASE_DB_PASSWORD` (optional) | Local only |

`.env.example` lists public vars; commented block lists **forbidden** mobile vars.

---

## 5. CI/CD (GitHub Actions)

Workflow: `.github/workflows/ci.yml`

| Step | Command |
|------|---------|
| Install | `npm ci` |
| Typecheck | `npm run lint` (`tsc --noEmit`) |
| Secret guard | `npm run check:secrets` |
| Tests | `npm test -- --ci --coverage` |

Or locally: `npm run ci`.

**GitHub repo secrets (optional later):** only needed for EAS build workflows — not required for current quality job. Do **not** add `SUPABASE_SERVICE_ROLE_KEY` to Expo/EAS env for driver builds.

Setup guide: `docs/GitHub_Setup_Guide.md`.

---

## 6. EAS / store builds

- Configure **only** `EXPO_PUBLIC_*` in EAS secrets / `eas.json` env.
- Same matrix as §1; production driver APK must not embed service role.

---

## References

- `docs/SUPABASE_LAYER.md` (1.7)
- `docs/MOBILE_API.md` (1.5)
- `docs/RLS_MOBILE_REVIEW.md` (1.3)
- `scripts/check-client-secrets.mjs`
