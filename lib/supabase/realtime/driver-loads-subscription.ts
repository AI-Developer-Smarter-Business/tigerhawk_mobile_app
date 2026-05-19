import type { QueryClient } from '@tanstack/react-query';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  invalidateDriverLoads,
  invalidateLoadDetail,
} from '@/lib/query/invalidate-loads';

const DEFAULT_DEBOUNCE_MS = 450;

type LoadRow = { id?: string; driver_id?: string | null };

export type DriverLoadsRealtimeHandle = {
  onChange: (loadId?: string) => void;
  dispose: () => void;
};

/** Debounced invalidation for list + optional detail (testable without Supabase). */
export function createDriverLoadsRealtimeHandler(
  queryClient: QueryClient,
  userId: string,
  debounceMs = DEFAULT_DEBOUNCE_MS,
): DriverLoadsRealtimeHandle {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  const pendingDetailIds = new Set<string>();

  const dispose = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    pendingDetailIds.clear();
  };

  const onChange = (loadId?: string) => {
    if (loadId) pendingDetailIds.add(loadId);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void invalidateDriverLoads(queryClient, userId).then(() => {
        for (const id of pendingDetailIds) {
          void invalidateLoadDetail(queryClient, userId, id);
        }
        pendingDetailIds.clear();
      });
    }, debounceMs);
  };

  return { onChange, dispose };
}

function affectsDriver(
  userId: string,
  payload: RealtimePostgresChangesPayload<LoadRow>,
): boolean {
  const next = payload.new as LoadRow | null;
  const prev = payload.old as LoadRow | null;
  return next?.driver_id === userId || prev?.driver_id === userId;
}

function loadIdFromPayload(
  payload: RealtimePostgresChangesPayload<LoadRow>,
): string | undefined {
  const next = payload.new as LoadRow | null;
  const prev = payload.old as LoadRow | null;
  return next?.id ?? prev?.id;
}

/**
 * Subscribes to `loads` changes for the signed-in driver (assignments, status, unassign).
 * Requires `loads` in Supabase publication `supabase_realtime` (see sql-editor note).
 */
export function subscribeDriverLoadsRealtime(
  supabase: SupabaseClient,
  queryClient: QueryClient,
  userId: string,
): { unsubscribe: () => void } {
  const handler = createDriverLoadsRealtimeHandler(queryClient, userId);
  let channel: RealtimeChannel | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  const wireChannel = () => {
    if (disposed) return;

    channel = supabase.channel(`pp2-driver-loads:${userId}:${Date.now()}`);
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'loads' },
      (payload: RealtimePostgresChangesPayload<LoadRow>) => {
        if (!affectsDriver(userId, payload)) return;
        handler.onChange(loadIdFromPayload(payload));
      },
    );

    channel.subscribe((status) => {
      if (disposed) return;
      if (status === 'SUBSCRIBED') return;
      if (
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT' ||
        status === 'CLOSED'
      ) {
        if (channel) void supabase.removeChannel(channel);
        channel = null;
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(wireChannel, 2000);
      }
    });
  };

  wireChannel();

  return {
    unsubscribe: () => {
      disposed = true;
      handler.dispose();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (channel) void supabase.removeChannel(channel);
    },
  };
}
