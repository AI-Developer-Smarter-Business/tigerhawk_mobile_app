import type { InfiniteData, QueryClient } from '@tanstack/react-query';
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
  SupabaseClient,
} from '@supabase/supabase-js';

import {
  patchDocumentsFromRealtimePayload,
  documentIdFromPayload,
} from '@/lib/loads/apply-realtime-document-patch';
import {
  patchDriverLoadsInfiniteData,
  patchLoadDetailFromRealtimeRowWithFullHolds,
} from '@/lib/loads/apply-realtime-load-patch';
import { refetchActiveDriverLoadQueries } from '@/lib/query/refetch-active-driver-loads';
import { queryKeys } from '@/lib/query/query-keys';
import type { DriverLoadsPageResult } from '@/lib/supabase/queries/loads';
import { syncSupabaseRealtimeAuth } from '@/lib/supabase/realtime/sync-realtime-auth';
import type { LoadDocument } from '@/types/load-document';
import type { LoadDetail } from '@/types';

/** Coalesce bursts when TMS assigns many loads at once. */
const DEFAULT_DEBOUNCE_MS = 300;

type LoadRow = { id?: string; driver_id?: string | null };
type LoadDocumentRealtimeRow = { id?: string; load_id?: string };

export type DriverLoadsRealtimeHandle = {
  onChange: (loadId?: string) => void;
  onDocumentsChange: (loadId: string) => void;
  dispose: () => void;
};

/** Debounced refetch for list + detail + documents (testable without Supabase). */
export function createDriverLoadsRealtimeHandler(
  queryClient: QueryClient,
  userId: string,
  debounceMs = DEFAULT_DEBOUNCE_MS,
): DriverLoadsRealtimeHandle {
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    debounceTimer = null;
    void refetchActiveDriverLoadQueries(queryClient, userId);
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
  };

  const onChange = (_loadId?: string) => {
    scheduleFlush();
  };

  const onDocumentsChange = (_loadId: string) => {
    scheduleFlush();
  };

  return { onChange, onDocumentsChange, dispose };
}

function applyRealtimeLoadPatch(
  queryClient: QueryClient,
  userId: string,
  loadId: string,
  row: Record<string, unknown>,
): void {
  queryClient.setQueryData(
    queryKeys.loads.detail(userId, loadId),
    (old: LoadDetail | null | undefined) =>
      patchLoadDetailFromRealtimeRowWithFullHolds(old, row) ?? old,
  );
  queryClient.setQueriesData(
    { queryKey: queryKeys.loads.list(userId) },
    (old: InfiniteData<DriverLoadsPageResult> | undefined) =>
      patchDriverLoadsInfiniteData(old, loadId, row),
  );
}

function applyRealtimeDocumentPatch(
  queryClient: QueryClient,
  userId: string,
  loadId: string,
  payload: RealtimePostgresChangesPayload<LoadDocumentRealtimeRow>,
): void {
  queryClient.setQueryData(
    queryKeys.loads.documents(userId, loadId),
    (old: LoadDocument[] | undefined) =>
      patchDocumentsFromRealtimePayload(old, payload),
  );
}

function loadRowFromPayload(
  payload: RealtimePostgresChangesPayload<LoadRow>,
): Record<string, unknown> | null {
  const next = payload.new as Record<string, unknown> | null;
  return next && Object.keys(next).length > 0 ? next : null;
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
 * Subscribes to `loads` + `load_documents` (TMS pattern: no client filter; RLS scopes events).
 * Requires both tables in publication `supabase_realtime` (sql-editor).
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

    void syncSupabaseRealtimeAuth(supabase).finally(() => {
      if (disposed) return;

      detachChannel();
      const nextChannel = supabase.channel(`pp2-driver-loads:${userId}:${Date.now()}`);
      channel = nextChannel;

      // Match TMS `useRealtimeRefresh`: no column filter; Supabase RLS delivers scoped rows.
      nextChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'loads' },
        (payload: RealtimePostgresChangesPayload<LoadRow>) => {
          const loadId = loadIdFromPayload(payload);
          const row = loadRowFromPayload(payload);
          if (loadId && row) {
            applyRealtimeLoadPatch(queryClient, userId, loadId, row);
          }
          handler.onChange(loadId);
        },
      );

      nextChannel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'load_documents' },
        (payload: RealtimePostgresChangesPayload<LoadDocumentRealtimeRow>) => {
          const loadId = loadIdFromDocumentPayload(payload);
          if (loadId) {
            applyRealtimeDocumentPatch(queryClient, userId, loadId, payload);
            handler.onDocumentsChange(loadId);
          } else if (documentIdFromPayload(payload)) {
            handler.onDocumentsChange('unknown');
          }
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
          detachChannel();
          scheduleReconnect();
        }
      });
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
