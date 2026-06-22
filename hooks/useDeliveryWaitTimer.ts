import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { isWaitTimeMockMode } from '@/lib/wait-time/config';
import { isDeliveryWaitEligibleStatus } from '@/lib/wait-time/constants';
import { resolveHydratedTimerState } from '@/lib/wait-time/hydrate-timer-state';
import {
  markMockExceededNotified,
  readMockWaitRecord,
  startMockWait,
  stopMockWait,
} from '@/lib/wait-time/mock-storage';
import {
  computeWaitTimerSnapshot,
  formatWaitElapsed,
  type WaitTimerSnapshot,
} from '@/lib/wait-time/timer-math';
import {
  computeMockWaitPaySummary,
  computeWaitPaySummary,
  type WaitPaySummary,
} from '@/lib/wait-time/wait-pay-summary';
import {
  fetchWaitTimeEvents,
  endOpenDeliveryWaitEvent,
  startDeliveryWaitEvent,
  syncOpenDeliveryWaitDuration,
  type WaitTimeEvent,
} from '@/lib/tms/wait-time';
import { resolveSupabaseAccessToken } from '@/lib/tms';
import type { LoadDetail } from '@/types';

export type DeliveryWaitTimerState = {
  /** Section visible: eligible to start, running, stopped, or syncing. */
  visible: boolean;
  /** Timer running (started, not yet stopped). */
  active: boolean;
  /** Driver may tap Start wait time (WT.27). */
  canStart: boolean;
  mockMode: boolean;
  startTimeIso: string | null;
  stoppedAtIso: string | null;
  snapshot: WaitTimerSnapshot;
  formattedElapsed: string;
  paySummary: WaitPaySummary;
  eventId: string | null;
  usingFallbackStart: boolean;
  exceededNotified: boolean;
  loading: boolean;
  stopping: boolean;
  canStop: boolean;
  startTimer: () => Promise<void>;
  stopTimer: () => Promise<void>;
  refresh: () => Promise<void>;
  error: string | null;
};

function applyHydratedState(
  hydrated: ReturnType<typeof resolveHydratedTimerState>,
  setters: {
    setStartTimeIso: (value: string | null) => void;
    setStoppedAtIso: (value: string | null) => void;
    setEventId: (value: string | null) => void;
    setUsingFallbackStart: (value: boolean) => void;
  },
): boolean {
  setters.setStartTimeIso(hydrated.startTimeIso);
  setters.setStoppedAtIso(hydrated.stoppedAtIso);
  setters.setEventId(hydrated.eventId);
  setters.setUsingFallbackStart(hydrated.usingFallbackStart);
  return Boolean(hydrated.eventId || hydrated.startTimeIso);
}

export function useDeliveryWaitTimer(load: LoadDetail | null): DeliveryWaitTimerState {
  const mockMode = isWaitTimeMockMode();
  const [events, setEvents] = useState<WaitTimeEvent[]>([]);
  const [startTimeIso, setStartTimeIso] = useState<string | null>(null);
  const [stoppedAtIso, setStoppedAtIso] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [usingFallbackStart, setUsingFallbackStart] = useState(false);
  const [exceededNotified, setExceededNotified] = useState(false);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const syncLockRef = useRef(false);
  const startingRef = useRef(false);
  const stoppingRef = useRef(false);

  const applyHydrated = useCallback(
    (hydrated: ReturnType<typeof resolveHydratedTimerState>) =>
      applyHydratedState(hydrated, {
        setStartTimeIso,
        setStoppedAtIso,
        setEventId,
        setUsingFallbackStart,
      }),
    [],
  );

  const hydrateFromApi = useCallback(async (): Promise<boolean> => {
    if (!load || mockMode) return false;
    try {
      const token = await resolveSupabaseAccessToken();
      const data = await fetchWaitTimeEvents(load.id, token);
      setEvents(data.events);
      return applyHydrated(resolveHydratedTimerState(data.events, load));
    } catch {
      return false;
    }
  }, [applyHydrated, load, mockMode]);

  const refresh = useCallback(async () => {
    if (!load || mockMode) return;
    await hydrateFromApi();
  }, [hydrateFromApi, load, mockMode]);

  const startTimer = useCallback(async () => {
    if (!load || startingRef.current || stoppingRef.current) return;
    if (eventId && !stoppedAtIso) return;
    if (startTimeIso && !stoppedAtIso) return;

    startingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      if (mockMode) {
        const record = await startMockWait(load.id);
        setStartTimeIso(record.startTimeIso);
        setStoppedAtIso(record.stoppedAtIso);
        setExceededNotified(record.exceededNotified);
        setUsingFallbackStart(false);
        return;
      }
      const token = await resolveSupabaseAccessToken();
      const event = await startDeliveryWaitEvent({
        loadId: load.id,
        accessToken: token,
        location: load.delivery_location,
      });
      setStartTimeIso(event.start_time);
      setStoppedAtIso(event.end_time);
      setEventId(event.id);
      setUsingFallbackStart(false);
      await hydrateFromApi();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start wait timer');
      await hydrateFromApi();
    } finally {
      setLoading(false);
      startingRef.current = false;
    }
  }, [eventId, hydrateFromApi, load, mockMode, startTimeIso, stoppedAtIso]);

  const stopTimer = useCallback(async () => {
    if (!load || stoppingRef.current || stoppedAtIso) return;
    const effectiveStart = startTimeIso;
    if (!effectiveStart) return;

    stoppingRef.current = true;
    setStopping(true);
    setError(null);
    try {
      if (mockMode) {
        const record = await stopMockWait(load.id);
        setStoppedAtIso(record?.stoppedAtIso ?? new Date().toISOString());
        return;
      }
      const token = await resolveSupabaseAccessToken();
      await endOpenDeliveryWaitEvent({
        loadId: load.id,
        accessToken: token,
        eventId,
        startTimeIso: effectiveStart,
        location: load.delivery_location,
      });
      await hydrateFromApi();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not stop wait timer');
    } finally {
      setStopping(false);
      stoppingRef.current = false;
    }
  }, [applyHydrated, eventId, hydrateFromApi, load, mockMode, startTimeIso, stoppedAtIso]);

  useEffect(() => {
    setEvents([]);
    setStartTimeIso(null);
    setStoppedAtIso(null);
    setEventId(null);
    setUsingFallbackStart(false);
    setExceededNotified(false);
    setError(null);

    if (!load) return;

    if (mockMode) {
      void readMockWaitRecord(load.id).then((record) => {
        if (!record) return;
        setStartTimeIso(record.startTimeIso);
        setStoppedAtIso(record.stoppedAtIso);
        setExceededNotified(record.exceededNotified);
      });
      return;
    }

    void hydrateFromApi();
  }, [hydrateFromApi, load?.id, mockMode]);

  const effectiveStartIso = startTimeIso;
  const effectiveSnapshot = computeWaitTimerSnapshot(
    effectiveStartIso,
    stoppedAtIso,
    Date.now(),
  );
  void tick;

  useEffect(() => {
    if (!effectiveStartIso || stoppedAtIso) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [effectiveStartIso, stoppedAtIso]);

  useEffect(() => {
    if (!load || mockMode || !eventId || !startTimeIso || stoppedAtIso) return;
    if (syncLockRef.current) return;
    const id = setInterval(() => {
      void (async () => {
        syncLockRef.current = true;
        try {
          const token = await resolveSupabaseAccessToken();
          await syncOpenDeliveryWaitDuration({
            loadId: load.id,
            eventId,
            accessToken: token,
            startTimeIso,
          });
          const data = await fetchWaitTimeEvents(load.id, token);
          setEvents(data.events);
        } catch {
          // ignore periodic sync errors
        } finally {
          syncLockRef.current = false;
        }
      })();
    }, 60_000);
    return () => clearInterval(id);
  }, [load, mockMode, eventId, startTimeIso, stoppedAtIso]);

  const running = Boolean(effectiveStartIso && !stoppedAtIso);
  const active = running;
  const eligible =
    Boolean(load) && isDeliveryWaitEligibleStatus(load!.status);
  const canStart = eligible && !running && !loading && !stopping;
  const visible = Boolean(
    load &&
      (canStart || effectiveStartIso || loading || Boolean(error)),
  );

  useEffect(() => {
    if (!load || !effectiveSnapshot.exceededThreshold || exceededNotified) return;
    void (async () => {
      if (mockMode) {
        const record = await readMockWaitRecord(load.id);
        if (record?.exceededNotified) {
          setExceededNotified(true);
          return;
        }
        await markMockExceededNotified(load.id);
      }
      setExceededNotified(true);
    })();
  }, [load, mockMode, effectiveSnapshot.exceededThreshold, exceededNotified]);

  const canStop = Boolean(effectiveStartIso && !stoppedAtIso && !stopping);

  const paySummary = useMemo(() => {
    if (mockMode) {
      return computeMockWaitPaySummary(
        effectiveStartIso,
        stoppedAtIso,
        effectiveSnapshot.elapsedMinutes,
      );
    }
    return computeWaitPaySummary(events, {
      activeElapsedMinutes: running ? effectiveSnapshot.elapsedMinutes : undefined,
    });
  }, [
    mockMode,
    events,
    running,
    effectiveStartIso,
    stoppedAtIso,
    effectiveSnapshot.elapsedMinutes,
  ]);

  return {
    visible,
    active,
    canStart,
    mockMode,
    startTimeIso: effectiveStartIso,
    stoppedAtIso,
    snapshot: effectiveSnapshot,
    formattedElapsed: formatWaitElapsed(effectiveSnapshot.elapsedMs),
    paySummary,
    eventId,
    usingFallbackStart,
    exceededNotified,
    loading,
    stopping,
    canStop,
    startTimer,
    stopTimer,
    refresh,
    error,
  };
}

export type { WaitPaySummary, WaitTimeEvent, WaitTimerSnapshot };
