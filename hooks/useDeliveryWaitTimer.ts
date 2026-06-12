import { useCallback, useEffect, useRef, useState } from 'react';

import { isWaitTimeMockMode } from '@/lib/wait-time/config';
import {
  DELIVERY_WAIT_START_STATUS,
  shouldStopDeliveryWait,
} from '@/lib/wait-time/constants';
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
  fetchWaitTimeEvents,
  endOpenDeliveryWaitEvent,
  startDeliveryWaitEvent,
  syncOpenDeliveryWaitDuration,
  type WaitTimeEvent,
} from '@/lib/tms/wait-time';
import { resolveSupabaseAccessToken } from '@/lib/tms';
import type { LoadDetail, LoadStatus } from '@/types';

export type DeliveryWaitTimerState = {
  active: boolean;
  mockMode: boolean;
  startTimeIso: string | null;
  stoppedAtIso: string | null;
  snapshot: WaitTimerSnapshot;
  formattedElapsed: string;
  eventId: string | null;
  usingFallbackStart: boolean;
  exceededNotified: boolean;
  loading: boolean;
  stopping: boolean;
  canStop: boolean;
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
  const [startTimeIso, setStartTimeIso] = useState<string | null>(null);
  const [stoppedAtIso, setStoppedAtIso] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [usingFallbackStart, setUsingFallbackStart] = useState(false);
  const [exceededNotified, setExceededNotified] = useState(false);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previousStatusRef = useRef<LoadStatus | null>(load?.status ?? null);
  const syncLockRef = useRef(false);
  const ensureStartedRef = useRef(false);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start wait timer');
      await hydrateFromApi();
    } finally {
      setLoading(false);
      startingRef.current = false;
    }
  }, [eventId, hydrateFromApi, load, mockMode, stoppedAtIso]);

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
      const event = await endOpenDeliveryWaitEvent({
        loadId: load.id,
        accessToken: token,
        eventId,
        startTimeIso: effectiveStart,
        location: load.delivery_location,
      });
      applyHydrated(
        resolveHydratedTimerState([event], load),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not stop wait timer');
    } finally {
      setStopping(false);
      stoppingRef.current = false;
    }
  }, [applyHydrated, eventId, load, mockMode, startTimeIso, stoppedAtIso]);

  useEffect(() => {
    ensureStartedRef.current = false;
    void (async () => {
      const hasEvent = await hydrateFromApi();
      if (
        !mockMode &&
        load?.status === DELIVERY_WAIT_START_STATUS &&
        !hasEvent &&
        !ensureStartedRef.current &&
        !stoppedAtIso
      ) {
        ensureStartedRef.current = true;
        void startTimer();
      }
    })();
  }, [hydrateFromApi, load?.id, load?.status, mockMode, startTimer, stoppedAtIso]);

  useEffect(() => {
    if (!load) return;
    const prev = previousStatusRef.current;
    const next = load.status;
    if (next === DELIVERY_WAIT_START_STATUS && prev !== DELIVERY_WAIT_START_STATUS) {
      ensureStartedRef.current = true;
      void startTimer();
    }
    if (shouldStopDeliveryWait(next) && startTimeIso && !stoppedAtIso) {
      void stopTimer();
    }
    previousStatusRef.current = next;
  }, [load, load?.status, startTimeIso, stoppedAtIso, startTimer, stopTimer]);

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
        } catch {
          // ignore periodic sync errors
        } finally {
          syncLockRef.current = false;
        }
      })();
    }, 60_000);
    return () => clearInterval(id);
  }, [load, mockMode, eventId, startTimeIso, stoppedAtIso]);

  const active =
    load?.status === DELIVERY_WAIT_START_STATUS ||
    Boolean(effectiveStartIso && !stoppedAtIso);

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

  return {
    active,
    mockMode,
    startTimeIso: effectiveStartIso,
    stoppedAtIso,
    snapshot: effectiveSnapshot,
    formattedElapsed: formatWaitElapsed(effectiveSnapshot.elapsedMs),
    eventId,
    usingFallbackStart,
    exceededNotified,
    loading,
    stopping,
    canStop,
    stopTimer,
    refresh,
    error,
  };
}

export type { WaitTimeEvent, WaitTimerSnapshot };
