import { mutateMobileDriverProgress } from '@/lib/tms/mutate-driver-progress';
import { mobileLoadProgressPath } from '@/lib/tms/mobile-api-routes';

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

const validProgress = {
  phase: 'enroute',
  label: 'Enroute To Pick Container',
  activeMoveId: 'move-1',
  activeMoveIndex: 0,
  currentStop: null,
  nextStop: {
    id: 'stop-1',
    event_type: 'pickup_container',
    sort_order: 0,
    started_at: '2026-07-16T10:00:00Z',
    arrived_at: null,
    departed_at: null,
    location: 'Port',
  },
  allMovesComplete: false,
  nextUnassignedMoveId: null,
  status: 'Enroute To Pick Container',
  containerEmpty: false,
};

describe('mutateMobileDriverProgress (C.3 · D.3)', () => {
  it('starts the exact move through the progress route', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({
        ok: true,
        progress: validProgress,
      }),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverProgress({
      action: 'start_move',
      loadId: 'load/1',
      moveId: 'move-1',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${mobileLoadProgressPath('load/1')}`,
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-abc',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          action: 'start_move',
          move_id: 'move-1',
        }),
      }),
    );
    expect(result.ok).toBe(true);
  });

  it('sends trimmed optional equipment fields and note', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ ok: true, progress: validProgress }),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverProgress({
      action: 'arrived',
      loadId: 'load-1',
      moveId: 'move-1',
      chassisNumber: '  CH-42  ',
      containerNumber: '  CONT-42  ',
      sealNumber: '  SEAL-42  ',
      note: '  Gate 3  ',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${mobileLoadProgressPath('load-1')}`,
      expect.objectContaining({
        body: JSON.stringify({
          action: 'arrived',
          move_id: 'move-1',
          chassis_number: 'CH-42',
          container_number: 'CONT-42',
          seal_number: 'SEAL-42',
          note: 'Gate 3',
        }),
      }),
    );
    expect(result.ok).toBe(true);
  });

  it('preserves NOT_ASSIGNED for list refresh handling', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(
        { error: 'You are not assigned to this move', code: 'NOT_ASSIGNED' },
        403,
      ),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverProgress({
      action: 'start_move',
      loadId: 'load-1',
      moveId: 'move-1',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.mobileError?.code).toBe('NOT_ASSIGNED');
    expect(result.mobileError?.appAction).toBe('refresh_list');
  });

  it('posts Complete Load as action complete with equipment fields (H.1)', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({
        ok: true,
        progress: {
          ...validProgress,
          phase: 'load_complete',
          allMovesComplete: true,
          label: 'Load Complete',
          status: 'Load Complete',
        },
      }),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverProgress({
      action: 'complete',
      loadId: 'load/1',
      chassisNumber: ' CHS-1 ',
      containerNumber: 'CONT-1',
      sealNumber: 'SEAL-1',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      `https://tms.test${mobileLoadProgressPath('load/1')}`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          action: 'complete',
          chassis_number: 'CHS-1',
          container_number: 'CONT-1',
          seal_number: 'SEAL-1',
        }),
      }),
    );
    expect(result.ok).toBe(true);
  });

  it('preserves REQUIREMENTS_NOT_MET missing[] checklist on Complete (H.2)', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse(
        {
          error: 'Load cannot be completed until the required items are supplied',
          code: 'REQUIREMENTS_NOT_MET',
          missing: ['seal_number', 'tir_out_photo', 'tir_in_photo'],
        },
        422,
      ),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverProgress({
      action: 'complete',
      loadId: 'load-1',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.mobileError?.code).toBe('REQUIREMENTS_NOT_MET');
    expect(result.mobileError?.appAction).toBe('show_checklist');
    expect(result.mobileError?.missing).toEqual([
      'seal_number',
      'tir_out_photo',
      'tir_in_photo',
    ]);
  });

  it('rejects an incomplete success response', async () => {
    const fetchImpl = jest.fn(async () =>
      jsonResponse({ ok: true }),
    ) as unknown as typeof fetch;

    const result = await mutateMobileDriverProgress({
      action: 'start_move',
      loadId: 'load-1',
      moveId: 'move-1',
      accessToken: 'token-abc',
      fetchImpl,
    });

    expect(result).toEqual({
      ok: false,
      error: 'Move progress response was incomplete.',
    });
  });
});
