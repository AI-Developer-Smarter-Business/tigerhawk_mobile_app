# TMS patch — mobile Bearer JWT on API routes (401 fix)

**Symptom:** Tigerhawk Mobile shows **Session expired** / **Unauthorized** on POD upload or status PATCH, while Supabase reads (loads list, profile) work.

**Cause:** `lib/supabase/server.ts` builds the Supabase client from **cookies only** (`@supabase/ssr`). The Expo app sends **`Authorization: Bearer <access_token>`** and does not share browser cookies with the TMS host. `supabase.auth.getUser()` in API routes returns no user → **401** — this is **not** an RLS issue on `load_documents`.

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

## 2. Pass `request` in API routes used by mobile

**Documents (POD):**

```typescript
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient(request)
  // ... rest unchanged
}
```

**Status PATCH:** same — `const supabase = await createClient(request)` in `PATCH`.

**GET documents:** optional — `createClient(request)` for consistency.

---

## 3. Verify (production)

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
