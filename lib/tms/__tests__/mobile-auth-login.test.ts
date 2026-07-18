jest.mock('@/lib/config/env', () => ({
  env: { tmsApiUrl: 'https://tms.example.com' },
}));

import { loginMobileDriverWithUsername } from '../mobile-auth-login';

describe('loginMobileDriverWithUsername (A.2)', () => {
  const session = {
    access_token: 'access.jwt',
    refresh_token: 'refresh.token',
    expires_at: 1_900_000_000,
    token_type: 'bearer',
  };
  const driver = {
    id: 'drv-1',
    name: 'A. Dacas',
    username: 'thl-adacas',
  };

  it('posts username/password to the mobile auth path and returns session + driver', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ session, driver }),
    });

    const result = await loginMobileDriverWithUsername({
      username: ' thl-adacas ',
      password: 'secret',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.driver).toEqual(driver);
    expect(result.session.access_token).toBe('access.jwt');
    expect(fetchImpl).toHaveBeenCalledWith(
      'https://tms.example.com/api/mobile/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'thl-adacas', password: 'secret' }),
      }),
    );
  });

  it('maps 401 to a single incorrect-credentials style failure', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: { get: () => 'application/json' },
      json: async () => ({ error: 'Incorrect username or password.' }),
    });

    const result = await loginMobileDriverWithUsername({
      username: 'thl-adacas',
      password: 'wrong',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/Incorrect username or password/i);
    expect(result.mobileError?.appAction).toBe('drop_session_login');
  });

  it('rejects empty username/password without calling the network', async () => {
    const fetchImpl = jest.fn();
    const result = await loginMobileDriverWithUsername({
      username: '  ',
      password: '',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result.ok).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects 200 bodies missing session or driver', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ session }),
    });
    const result = await loginMobileDriverWithUsername({
      username: 'thl-adacas',
      password: 'secret',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(result.ok).toBe(false);
  });

  it('maps 404 to a missing-route message (TMS_fusion without auth/login)', async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      headers: { get: () => 'text/html' },
      json: async () => ({}),
    });

    const result = await loginMobileDriverWithUsername({
      username: 'thl-adacas',
      password: 'secret',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.mobileError?.httpStatus).toBe(404);
    expect(result.error).toMatch(/not deployed|auth\/login/i);
  });
});
