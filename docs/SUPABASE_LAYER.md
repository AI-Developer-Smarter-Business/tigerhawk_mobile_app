# Supabase layer — PP2 mobile (dev task 1.7)

**Date:** 19 May 2026  
**Scope:** client-only access with **anon key** + RLS; no service role in the app bundle.

---

## Layout

| Path | Responsibility |
|------|----------------|
| `lib/supabase/client.ts` | Singleton `getSupabase()` — SecureStore session, anon key guard |
| `lib/supabase/auth-session.ts` | Pure helpers: `getSession`, `onAuthStateChange` |
| `lib/supabase/auth-callback.ts` | Magic-link / OAuth URL → session |
| `lib/supabase/queries/*.ts` | Data access (profile, loads); accept `SupabaseClient` param |
| `lib/supabase/hooks/useAuth.ts` | Re-export of `useAuth` from `AuthProvider` |
| `lib/supabase/hooks/useProfile.ts` | Profile fetch after auth (like TMS `useUserRole`) |
| `lib/supabase/index.ts` | Public barrel export |
| `context/AuthContext.tsx` | Auth state + `signIn*` / `signOut` (UI-facing) |

**Import convention:** prefer `@/lib/supabase` or `@/lib/supabase/hooks/*`.  
Legacy `@/hooks/useAuth` and `@/hooks/useProfile` re-export the same symbols.

---

## Alignment with TMS web

| TMS (Next.js) | PP2 mobile |
|---------------|------------|
| `lib/supabase/client.ts` → `createBrowserClient` | `getSupabase()` → `createClient` + SecureStore |
| `lib/supabase/server.ts` / `admin.ts` | **Not used** in mobile |
| `lib/auth/useUserRole.ts` | `useProfile` + `useAuth` |
| Cookies for session | `expo-secure-store` via auth storage adapter |

---

## Security rules (client)

1. **Only** `EXPO_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_*` fallback in dev) in the app.
2. `assertSupabaseAnonKey()` rejects JWT payloads with `role: service_role` at client init.
3. **Never** import or read `SUPABASE_SERVICE_ROLE_KEY` in `app/`, `lib/`, or `hooks/`. It may exist in `.env.local` for `scripts/*.mjs` but must **not** use the `EXPO_PUBLIC_` prefix (Expo would bundle it).
4. Privileged writes (status change, POD upload) → **TMS Next API** with user JWT (`docs/MOBILE_API.md`), not direct table UPDATE where RLS blocks drivers.
5. Logging: `lib/logging/safe-log.ts` — no tokens or passwords.

---

## Hooks

### `useAuth`

- Provided by `AuthProvider` in root layout.
- Exposes `session`, `user`, `isSupabaseAuthenticated`, `signInWithPassword`, `signInWithMagicLink`, `signOut`, `refreshSession`.
- No mock session mixed in (mock login disabled by default).

### `useProfile`

- Loads `user_profiles` for `user.id` when session is ready.
- `isDriver` when `role === 'driver'`.
- Cancels in-flight fetch on unmount / user change.
- Used by `useAssignedLoadsQuery` to gate loads list.

### React Query (task 2.4)

- Server state for loads list/detail lives in **TanStack Query** (`lib/query/`, `docs/QUERY_CACHE.md`).
- Supabase fetchers stay pure in `lib/supabase/queries/`; hooks call them from `queryFn`.

---

## Queries (pure functions)

```ts
import { getSupabase, fetchLoadsForDriver } from '@/lib/supabase';

const { loads, errorMessage } = await fetchLoadsForDriver(getSupabase(), userId);
```

Keeps components thin and testable without mounting React.

---

## What stays out of this layer

| Concern | Where |
|---------|--------|
| Service role / admin Supabase | `scripts/*.mjs` only |
| TMS `PATCH …/status` | `lib/tms/patch-load-status.ts` (week 3.1) |
| UI strings | `constants/strings.ts` |
| Mock demo login | `context/MockAuthContext.tsx` (opt-in, not wired in main app) |

---

## References

- `docs/RLS_MOBILE_REVIEW.md` (1.3)
- `docs/MOBILE_API.md` (1.5)
- `docs/SECRETS_AND_BFF.md` — task 1.8 (CI + secrets matrix + BFF)
