import {
  DRIVER_PROGRESS_ACTIONS,
  getNextDriverProgressAction,
  type DriverLoadProgress,
  type DriverProgressPhase,
} from '@/lib/loads/driver-progress';

function progress(phase: DriverProgressPhase): DriverLoadProgress {
  return {
    phase,
    label: 'Server label',
    activeMoveId: 'move-1',
    activeMoveIndex: 0,
    currentStop: null,
    nextStop: null,
    allMovesComplete: phase === 'load_complete',
    nextUnassignedMoveId: null,
    status: 'Dispatched',
    containerEmpty: false,
  };
}

describe('driver progress contract (D.3)', () => {
  it('exposes only the four server semantic actions', () => {
    expect(DRIVER_PROGRESS_ACTIONS).toEqual([
      'start_move',
      'enroute',
      'arrived',
      'complete',
    ]);
    expect(DRIVER_PROGRESS_ACTIONS).not.toContain('status' as never);
  });

  it.each([
    ['not_started', 'start_move'],
    ['between_moves', 'start_move'],
    ['enroute', 'arrived'],
    ['arrived', 'enroute'],
    ['load_complete', 'complete'],
  ] as const)('maps %s to %s', (phase, action) => {
    expect(getNextDriverProgressAction(progress(phase))).toBe(action);
  });
});
