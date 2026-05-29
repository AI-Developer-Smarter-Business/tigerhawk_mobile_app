import { useDriverLoadsRealtime } from '@/hooks/useDriverLoadsRealtime';

/** Keeps Supabase Realtime active for the whole app session (not only inside the drawer). */
export function DriverLoadsRealtimeBridge() {
  useDriverLoadsRealtime();
  return null;
}
