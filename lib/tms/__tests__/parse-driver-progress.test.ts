import { parseDriverProgressResponse } from '@/lib/tms/parse-driver-progress';

const stop = {
  id: 'stop-1',
  event_type: 'deliver_container',
  sort_order: 2,
  started_at: '2026-07-16T10:00:00Z',
  arrived_at: null,
  departed_at: null,
  location: 'Customer dock',
};

const progress = {
  phase: 'enroute',
  label: 'Enroute To Deliver Load',
  activeMoveId: 'move-1',
  activeMoveIndex: 0,
  currentStop: null,
  nextStop: stop,
  allMovesComplete: false,
  nextUnassignedMoveId: null,
  status: 'Enroute To Deliver Load',
  containerEmpty: false,
};

describe('parseDriverProgressResponse (D.3)', () => {
  it('parses the TMS camelCase progress shape', () => {
    const result = parseDriverProgressResponse({ ok: true, progress });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.progress.activeMoveId).toBe('move-1');
    expect(result.progress.nextStop).toEqual(stop);
    expect(result.progress.phase).toBe('enroute');
  });

  it('accepts nullable route context fields', () => {
    const result = parseDriverProgressResponse({
      ok: true,
      progress: {
        ...progress,
        phase: 'not_started',
        activeMoveId: null,
        activeMoveIndex: null,
        currentStop: null,
        nextStop: null,
        containerEmpty: null,
      },
    });

    expect(result.ok).toBe(true);
  });

  it.each([
    [{ ok: true }],
    [{ ok: true, progress: { ...progress, phase: 'unknown' } }],
    [{ ok: true, progress: { ...progress, nextStop: { id: 'bad' } } }],
    [{ ok: true, progress: { ...progress, allMovesComplete: 'false' } }],
  ])('rejects malformed progress %#', (body) => {
    expect(parseDriverProgressResponse(body)).toEqual({
      ok: false,
      error: 'Move progress response was incomplete.',
    });
  });
});
