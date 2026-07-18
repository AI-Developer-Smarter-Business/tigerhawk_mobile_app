import { mutateMobileDriverMoveOffer } from '@/lib/tms/mutate-driver-move-offer';
import {
  mobileLoadAcceptPath,
  mobileLoadRejectPath,
} from '@/lib/tms/mobile-api-routes';

jest.mock('@/lib/tms/client', () => ({
  tmsApiPath: (path: string) => `https://tms.test${path}`,
}));

jest.mock('@/lib/tms/resolve-access-token', () => ({
  resolveSupabaseAccessToken: jest.fn(async () => 'token-abc'),
}));

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: () => 'application/json' },
    json: async () => body,
  } as unknown as Response;
}

describe('mutateMobileDriverMoveOffer (C.1)', () => {
  it('accepts one move with start false', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ ok: true, move_id: 'move-1', accepted: true }),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverMoveOffer({
      action: 'accept',
      loadId: 'load/1',
      moveId: 'move-1',
      start: false,
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${mobileLoadAcceptPath('load/1')}`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-abc',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ move_id: 'move-1', start: false }),
      }),
    );
    expect(result).toEqual({ ok: true, moveId: 'move-1' });
  });

  it('accepts and starts in one request with start true', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({
        ok: true,
        move_id: 'move-start',
        accepted: true,
        started: true,
      }),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverMoveOffer({
      action: 'accept',
      loadId: 'load-start',
      moveId: 'move-start',
      start: true,
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${mobileLoadAcceptPath('load-start')}`,
      expect.objectContaining({
        body: JSON.stringify({ move_id: 'move-start', start: true }),
      }),
    );
    expect(result).toEqual({ ok: true, moveId: 'move-start' });
  });

  it('rejects one move and always sends move_id', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ ok: true, move_id: 'move-2', rejected: true }),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverMoveOffer({
      action: 'reject',
      loadId: 'load-2',
      moveId: 'move-2',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${mobileLoadRejectPath('load-2')}`,
      expect.objectContaining({
        body: JSON.stringify({ move_id: 'move-2' }),
      }),
    );
    expect(result).toEqual({ ok: true, moveId: 'move-2' });
  });

  it('trims and sends the rejection reason', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ ok: true, move_id: 'move-reject', rejected: true }),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverMoveOffer({
      action: 'reject',
      loadId: 'load-reject',
      moveId: 'move-reject',
      reason: '  Schedule conflict  ',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${mobileLoadRejectPath('load-reject')}`,
      expect.objectContaining({
        body: JSON.stringify({
          move_id: 'move-reject',
          reason: 'Schedule conflict',
        }),
      }),
    );
    expect(result).toEqual({ ok: true, moveId: 'move-reject' });
  });

  it('rejects a success response for a different move', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ ok: true, move_id: 'wrong-move' }),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverMoveOffer({
      action: 'accept',
      loadId: 'load-1',
      moveId: 'move-1',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(result).toEqual({
      ok: false,
      error: 'Move response did not match the requested move.',
    });
  });

  it('preserves MOVE_ALREADY_STARTED for driver-safe handling', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(
        {
          error: 'Started moves cannot be rejected',
          code: 'MOVE_ALREADY_STARTED',
        },
        409,
      ),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverMoveOffer({
      action: 'reject',
      loadId: 'load-1',
      moveId: 'move-1',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.mobileError?.code).toBe('MOVE_ALREADY_STARTED');
    expect(result.mobileError?.appAction).toBe('call_dispatch');
  });
});
