import { parseDriverLoadHistoryResponse } from '@/lib/tms/parse-driver-load-history';

describe('parseDriverLoadHistoryResponse (B.4)', () => {
  it('parses history array of move cards', () => {
    const result = parseDriverLoadHistoryResponse({
      ok: true,
      history: [
        {
          move_id: 'm1',
          load_id: 'l1',
          reference_number: 'THWK_1',
          status: 'Completed',
          started_at: '2026-07-10T12:00:00Z',
          accepted_at: null,
          stops: [],
          progress: { label: 'Completed', phase: 'done', active_move_id: null },
          is_hazmat: false,
          is_hot: false,
        },
      ],
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.history).toHaveLength(1);
    expect(result.history[0]?.reference_number).toBe('THWK_1');
  });

  it('rejects incomplete body', () => {
    expect(parseDriverLoadHistoryResponse({ ok: true })).toEqual({
      ok: false,
      error: 'Load history response was incomplete.',
    });
  });
});
