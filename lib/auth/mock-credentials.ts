import { MOCK_LOGIN } from '@/mocks';

/** Dev demo user — not in Supabase Auth; skip remote sign-in to avoid noise. */
export function isMockCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === MOCK_LOGIN.email &&
    password === MOCK_LOGIN.password
  );
}
