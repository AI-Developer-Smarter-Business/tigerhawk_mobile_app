# Offline handling (tasks 4.5, 5.5, 9.4 / OFF.2)

PP2 v1 **queues** driver status changes and document uploads while offline, then **syncs on reconnect**.

## Reconnect

When connectivity returns:

- In-flight React Query requests are **cancelled** while offline (avoids stuck pull-to-refresh spinners).
- TanStack Query **`onlineManager`** is wired to NetInfo; active queries use **`refetchOnReconnect`**.
- **`QueryNetworkRecovery`** refetches the driver profile (keeps the last profile on transient network errors) and refetches active load queries once, **debounced** (~400 ms) after NetInfo reports online.
- **`OfflineQueueProcessor`** flushes queued status changes and document uploads after the same debounce.
- **Profile refetch** after reconnect is **silent** when a profile is already cached (`isProfileGateLoading`) so loads/detail do not flash “No profile found”.
- Cancelled queries and **AbortError** are treated as transient network (profile preserved).
- **Pull-to-refresh** uses `usePullToRefresh` (local state + 45 s watchdog) so the top spinner only runs when the driver pulls down — not during background reconnect refetches.

Manual QA: **`docs/QA_NETWORK_RECONNECT_5_5.md`**.

**Foreground resume:** `useDriverLoadsRealtime` invalidates loads at most every **30 s** when the app becomes active (`lib/query/foreground-refetch-throttle.ts`), in addition to Realtime debouncing.

## Behavior

- **`@react-native-community/netinfo`** drives a global **`OfflineBanner`** when the device is offline.
- Fresh Supabase/TMS fetches call **`assertOnlineForFetch()`** and show a clear message instead of a generic failure.
- **Status changes** and **document uploads** while offline are **queued** in `lib/offline/` (AsyncStorage via `expo-file-system` under `pp2-offline-queue/`).
- **`OfflineQueueBanner`** shows pending actions waiting to sync.
- Cached React Query data may still appear on screen until the user pulls to refresh.
- **View document** still requires online (`assertOnlineForDriverAction`).

## Queue scope (9.4)

| Action | Queued offline? |
|--------|----------------|
| Status change (`DriverActionBar`) | Yes |
| Driver photo / POD / Photo upload | Yes |
| Load notes (TMS) | No mobile UI yet — not queued |

## Copy

`constants/strings.ts` → `network.*`, `loadDetail.podOfflineQueueHint`

## Code

- `lib/offline/` — enqueue, persist, process on reconnect
- `context/OfflineQueueContext.tsx` — pending count
- `components/offline/OfflineQueueProcessor.tsx`

## Tests

- `lib/network/__tests__/network-state.test.ts`
- `lib/offline/__tests__/offline-queue.test.ts`
