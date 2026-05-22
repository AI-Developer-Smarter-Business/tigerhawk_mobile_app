import type { QueryClient } from '@tanstack/react-query';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  invalidateDriverLoads,
  invalidateLoadDetail,
  invalidateLoadDocuments,
} from '@/lib/query/invalidate-loads';

/** Coalesce bursts when TMS assigns many loads at once. */
const DEFAULT_DEBOUNCE_MS = 750;

type LoadRow = { id?: string; driver_id?: string | null };
type LoadDocumentRealtimeRow = { id?: string; load_id?: string };

export type DriverLoadsRealtimeHandle = {
  onChange: (loadId?: string) => void;
  onDocumentsChange: (loadId: string) => void;
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
  const pendingDocumentLoadIds = new Set<string>();

  const flush = () => {
    debounceTimer = null;
    void invalidateDriverLoads(queryClient, userId).then(() => {
      for (const id of pendingDetailIds) {
        void invalidateLoadDetail(queryClient, userId, id);
      }
      pendingDetailIds.clear();
      for (const id of pendingDocumentLoadIds) {
        void invalidateLoadDocuments(queryClient, userId, id);
      }
      pendingDocumentLoadIds.clear();
    });
  };

  const scheduleFlush = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(flush, debounceMs);
  };

  const dispose = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    pendingDetailIds.clear();
    pendingDocumentLoadIds.clear();
  };

  const onChange = (loadId?: string) => {
    if (loadId) pendingDetailIds.add(loadId);
    scheduleFlush();
  };

  const onDocumentsChange = (loadId: string) => {
    pendingDocumentLoadIds.add(loadId);
    scheduleFlush();
  };

  return { onChange, onDocumentsChange, dispose };
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

function loadIdFromDocumentPayload(
  payload: RealtimePostgresChangesPayload<LoadDocumentRealtimeRow>,
): string | undefined {
  const next = payload.new as LoadDocumentRealtimeRow | null;
  const prev = payload.old as LoadDocumentRealtimeRow | null;
  return next?.load_id ?? prev?.load_id;
}

/**
 * Subscribes to `loads` changes for the signed-in driver (assignments, status, unassign).
 * Requires `loads` and `load_documents` in publication `supabase_realtime` (sql-editor).
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
  let tearingDown = false;

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  /** Drop channel reference without calling removeChannel from inside subscribe (avoids stack overflow). */
  const detachChannel = () => {
    channel = null;
  };

  const removeChannelSafe = (ch: RealtimeChannel) => {
    if (tearingDown) return;
    tearingDown = true;
    void supabase.removeChannel(ch).finally(() => {
      tearingDown = false;
    });
  };

  const scheduleReconnect = () => {
    if (disposed || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      wireChannel();
    }, 2000);
  };

  const wireChannel = () => {
    if (disposed) return;

    detachChannel();
    const nextChannel = supabase.channel(`pp2-driver-loads:${userId}:${Date.now()}`);
    channel = nextChannel;

    nextChannel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'loads' },
      (payload: RealtimePostgresChangesPayload<LoadRow>) => {
        if (!affectsDriver(userId, payload)) return;
        handler.onChange(loadIdFromPayload(payload));
      },
    );

    nextChannel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'load_documents' },
      (payload: RealtimePostgresChangesPayload<LoadDocumentRealtimeRow>) => {
        const loadId = loadIdFromDocumentPayload(payload);
        if (loadId) handler.onDocumentsChange(loadId);
      },
    );

    nextChannel.subscribe((status) => {
      if (disposed) return;
      if (status === 'SUBSCRIBED') return;
      if (
        status === 'CHANNEL_ERROR' ||
        status === 'TIMED_OUT' ||
        status === 'CLOSED'
      ) {
        // Do not call removeChannel here — it re-enters subscribe → CLOSED → removeChannel (RangeError).
        detachChannel();
        scheduleReconnect();
      }
    });
  };

  wireChannel();

  return {
    unsubscribe: () => {
      disposed = true;
      handler.dispose();
      clearReconnectTimer();
      const ch = channel;
      detachChannel();
      if (ch) removeChannelSafe(ch);
    },
  };
}
