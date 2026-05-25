# Offline handling (task 4.5)

PP2 v1 does **not** offer full offline mode or an upload queue.

## Reconnect

When connectivity returns:

- In-flight React Query requests are **cancelled** while offline (avoids stuck pull-to-refresh spinners).
- TanStack Query **`onlineManager`** is wired to NetInfo; active queries use **`refetchOnReconnect`**.
- **`QueryNetworkRecovery`** refetches the driver profile (keeps the last profile on transient network errors) and refetches active load queries once.
- **Pull-to-refresh** uses `usePullToRefresh` (local state) so the top spinner only runs when the driver pulls down — not during background reconnect refetches.

## Behavior

- **`@react-native-community/netinfo`** drives a global **`OfflineBanner`** when the device is offline.
- Fresh Supabase/TMS fetches call **`assertOnlineForFetch()`** and show a clear message instead of a generic failure.
- Field actions (status change, **View** document) call **`assertOnlineForDriverAction()`** while offline.
- Cached React Query data may still appear on screen until the user pulls to refresh.

## Copy

`constants/strings.ts` → `network.*`

## Tests

`lib/network/__tests__/network-state.test.ts`
