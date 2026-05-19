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
| Local driver status change (mock, until TMS API) | `setQueryData` on list + detail (no refetch) |
| Sign out | `queryClient.clear()` |

---

## References

- TMS roadmap sample: `PROYECTO_MUESTRA/docs/driver_app_roadmap.md` (React Query examples)
- Supabase fetchers: `lib/supabase/queries/loads.ts`
