import type { SupabaseClient } from '@supabase/supabase-js';

import { fetchInitialSession, subscribeToAuthChanges } from '../auth-session';

describe('fetchInitialSession', () => {
  it('returns session when getSession succeeds', async () => {
    const mockSession = { user: { id: 'u1' } };
    const supabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: mockSession },
          error: null,
        }),
      },
    } as unknown as SupabaseClient;

    const result = await fetchInitialSession(supabase);
    expect(result.session).toBe(mockSession);
    expect(result.errorMessage).toBeNull();
  });

  it('returns error message when getSession fails', async () => {
    const supabase = {
      auth: {
        getSession: jest.fn().mockResolvedValue({
          data: { session: null },
          error: { message: 'Network error' },
        }),
      },
    } as unknown as SupabaseClient;

    const result = await fetchInitialSession(supabase);
    expect(result.session).toBeNull();
    expect(result.errorMessage).toBe('Network error');
  });
});

describe('subscribeToAuthChanges', () => {
  it('registers onAuthStateChange and unsubscribes', () => {
    const unsubscribe = jest.fn();
    const handler = jest.fn();
    const supabase = {
      auth: {
        onAuthStateChange: jest.fn((cb) => {
          cb('SIGNED_IN', { user: { id: 'u1' } });
          return { data: { subscription: { unsubscribe } } };
        }),
      },
    } as unknown as SupabaseClient;

    const sub = subscribeToAuthChanges(supabase, handler);
    expect(handler).toHaveBeenCalledWith('SIGNED_IN', { user: { id: 'u1' } });
    sub.unsubscribe();
    expect(unsubscribe).toHaveBeenCalled();
  });
});
