import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { LoadDetail, LoadStatus } from '@/types';

type LoadsContextValue = {
  loads: LoadDetail[];
  getLoadById: (id: string) => LoadDetail | undefined;
  updateLoadStatus: (id: string, status: LoadStatus) => void;
  syncLoads: (next: LoadDetail[]) => void;
  upsertLoad: (load: LoadDetail) => void;
};

const LoadsContext = createContext<LoadsContextValue | null>(null);

type LoadsProviderProps = {
  children: ReactNode;
  /** Optional seed data (tests / Storybook). */
  initialLoads?: LoadDetail[];
};

export function LoadsProvider({ children, initialLoads = [] }: LoadsProviderProps) {
  const [loads, setLoads] = useState<LoadDetail[]>(initialLoads);

  const getLoadById = useCallback(
    (id: string) => loads.find((l) => l.id === id),
    [loads],
  );

  const updateLoadStatus = useCallback((id: string, status: LoadStatus) => {
    setLoads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l)),
    );
  }, []);

  const syncLoads = useCallback((next: LoadDetail[]) => {
    setLoads(next);
  }, []);

  const upsertLoad = useCallback((load: LoadDetail) => {
    setLoads((prev) => {
      const index = prev.findIndex((l) => l.id === load.id);
      if (index === -1) return [...prev, load];
      const next = [...prev];
      next[index] = load;
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      loads,
      getLoadById,
      updateLoadStatus,
      syncLoads,
      upsertLoad,
    }),
    [loads, getLoadById, updateLoadStatus, syncLoads, upsertLoad],
  );

  return <LoadsContext.Provider value={value}>{children}</LoadsContext.Provider>;
}

export function useLoads(): LoadsContextValue {
  const ctx = useContext(LoadsContext);
  if (!ctx) {
    throw new Error('useLoads must be used within LoadsProvider');
  }
  return ctx;
}
