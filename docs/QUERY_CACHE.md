# React Query cache — PP2 mobile (task 2.4)

**Date:** 19 May 2026  
**Library:** `@tanstack/react-query` v5

---

## Setup

| Piece | Path |
|-------|------|
| Provider | `lib/query/QueryProvider.tsx` (root layout, inside `AuthProvider`) |
| Client defaults | `lib/query/query-client.ts` — `staleTime` 60s, `gcTime` 5m |
| Query keys | `lib/query/query-keys.ts` |
| Invalidation helpers | `lib/query/invalidate-loads.ts` |

On **sign out**, `QueryCacheAuthSync` calls `queryClient.clear()`.

---

## Queries

| Hook | TanStack API | Key |
|------|--------------|-----|
| `useAssignedLoadsQuery` | `useInfiniteQuery` | `queryKeys.loads.list(userId)` |
| `useLoadDetailQuery` | `useQuery` | `queryKeys.loads.detail(userId, loadId)` |

`LoadsContext` still mirrors list/detail for navigation placeholders (`placeholderData` on detail) and optimistic status until TMS API (week 3).

---

## Pull-to-refresh

| Screen | Behavior |
|--------|----------|
| `/(drawer)/loads` | `refetch()` → `invalidateDriverLoads` + refetch list (also marks detail queries stale) |
| `/load/[id]` | `refetch()` → `invalidateLoadDetail` + refetch detail |

---

## Invalidation map

| Event | Invalidation |
|-------|----------------|
| Pull list | `loads.all(userId)` |
| Pull detail | `loads.detail(userId, loadId)` |
| TMS status PATCH success | `invalidateDriverLoads` + detail |
| TMS / dispatch updates `loads` in Supabase | Realtime → debounced `invalidateDriverLoads` (task 3.3) |
| App foreground | `invalidateDriverLoads` (fallback) |
| Sign out | `queryClient.clear()` |

---

## Realtime (task 3.3)

| Piece | Path |
|-------|------|
| Subscription | `lib/supabase/realtime/driver-loads-subscription.ts` |
| Hook | `hooks/useDriverLoadsRealtime.ts` (wired in `app/(drawer)/_layout.tsx`) |

Listens to `postgres_changes` on `public.loads` where `driver_id` matches the signed-in driver (assign, status change, unassign). Debounces invalidation ~450ms.

**Supabase:** table `loads` must be in publication `supabase_realtime`. Run `supabase/sql-editor/enable_realtime_loads.sql` if updates from TMS do not appear until app restart.

---

## References

- TMS roadmap sample: `PROYECTO_MUESTRA/docs/driver_app_roadmap.md` (React Query examples)
- Supabase fetchers: `lib/supabase/queries/loads.ts`
