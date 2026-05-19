/**
 * Session hook — implementation lives in `AuthProvider` (React context).
 * Re-export keeps imports under `lib/supabase/hooks` alongside `useProfile`.
 */
export { useAuth } from '@/context/AuthContext';
export type { AuthContextValue } from '@/context/AuthContext';
