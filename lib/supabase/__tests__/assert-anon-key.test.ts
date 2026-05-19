import { assertSupabaseAnonKey } from '../assert-anon-key';

/** Minimal JWT: header.payload.signature (payload base64url). */
function fakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return `${header}.${body}.signature`;
}

describe('assertSupabaseAnonKey', () => {
  it('allows anon role', () => {
    expect(() =>
      assertSupabaseAnonKey(fakeJwt({ role: 'anon', iss: 'supabase' })),
    ).not.toThrow();
  });

  it('rejects service_role key', () => {
    expect(() =>
      assertSupabaseAnonKey(fakeJwt({ role: 'service_role', iss: 'supabase' })),
    ).toThrow(/SERVICE_ROLE/);
  });

  it('ignores non-JWT strings', () => {
    expect(() => assertSupabaseAnonKey('not-a-jwt')).not.toThrow();
  });
});
