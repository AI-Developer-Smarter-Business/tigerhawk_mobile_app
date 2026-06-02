# TMS patch — mobile Bearer JWT on API routes (401 fix)

**Symptom:** Tigerhawk Mobile shows **Session expired** / **Unauthorized** on POD upload or status PATCH, while Supabase reads (loads list, profile) work.

**Cause:** The Expo app sends **`Authorization: Bearer <access_token>`** (no TMS browser cookies). API routes must call **`supabase.auth.getUser(jwt)`** with that token (see `lib/supabase/get-user-from-request.ts`). Relying on cookies only, or only setting `global.headers` without passing the JWT to `getUser()`, returns no user → **401**. This is **not** fixed by changing RLS on `load_documents` (upload uses the TMS **service role** after auth).

**Apply in the TMS Next.js repo** (production: `https://tms.tigerhawklogistics.com`).

---

## 1. `createClient` accepts the incoming request

```typescript
// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export async function createClient(request?: NextRequest) {
  const cookieStore = await cookies()
  const authorization = request?.headers.get("Authorization") ?? undefined

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — safe to ignore
          }
        },
      },
      global: authorization
        ? { headers: { Authorization: authorization } }
        : undefined,
    }
  )
}
```

---

## 2. Resolve user with `getUserFromRequest` (Bearer JWT)

Add `lib/supabase/get-user-from-request.ts` — extracts the Bearer token and calls **`getUser(bearerToken)`** (required for mobile).

In API routes used by the app:

```typescript
import { getUserFromRequest } from "@/lib/supabase/get-user-from-request"

export async function POST(request: NextRequest, context: ...) {
  const { user, supabase } = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ... use `supabase` for RLS-scoped reads (loads, user_profiles)
}
```

Apply to: `POST/GET …/documents`, `PATCH …/status`, and any other mobile-facing dispatcher routes.

---

## 3. Middleware must allow Bearer on `/api/*` (critical)

`middleware.ts` runs **before** API route handlers. If it only calls `getUser()` from cookies, mobile requests get **401** even when the route uses `getUserFromRequest`.

If `getUser()` in middleware cannot validate Bearer (Edge), **do not return 401** when `Authorization: Bearer` is present — let the API route handler authenticate:

```typescript
if (!user && pathname.startsWith("/api/")) {
  if (extractBearerToken(request)) {
    return supabaseResponse
  }
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}
```

Dispatcher web uploads use **cookies** on the same `POST /api/dispatcher/loads/[id]/documents` route; mobile uses **Bearer** on that same route.

---

## 4. Verify (production)

1. Login in mobile as `driver_test@test.com` (same Supabase project as TMS).
2. Copy `access_token` from dev tools or log (never commit).
3. Curl:

```bash
curl -X POST "https://tms.tigerhawklogistics.com/api/dispatcher/loads/{LOAD_ID}/documents" \
  -H "Authorization: Bearer {ACCESS_TOKEN}" \
  -F "file=@test.jpg" \
  -F "document_type=POD"
```

- **Before patch:** `401 Unauthorized`
- **After patch + driver 4.1:** `201` for assigned load, `403` if not assigned

---

## 4. Supabase RLS (reference)

| Layer | Driver POD |
|-------|------------|
| Mobile → TMS `POST` | Auth = JWT in `Authorization` (this patch) |
| TMS `load_documents` INSERT | Server client with user JWT + staff/driver rules in route |
| Direct mobile → Storage | **Not used** — `INSERT` on `load_documents` remains staff-only in RLS |

No Supabase policy change is required for this 401; confirm policies with `supabase/sql-editor/VERIFY_pp2_driver_rls_policies.sql` if needed.
