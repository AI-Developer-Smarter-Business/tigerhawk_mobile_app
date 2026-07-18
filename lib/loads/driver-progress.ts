/** Semantic actions accepted by `POST /api/mobile/loads/{id}/progress`. */
export const DRIVER_PROGRESS_ACTIONS = [
  'start_move',
  'enroute',
  'arrived',
  'complete',
] as const;

export type DriverProgressAction = (typeof DRIVER_PROGRESS_ACTIONS)[number];

export type DriverProgressActionInput = {
  action: DriverProgressAction;
  chassisNumber?: string;
  containerNumber?: string;
  sealNumber?: string;
  note?: string;
};

export const DRIVER_PROGRESS_PHASES = [
  'not_started',
  'enroute',
  'arrived',
  'between_moves',
  'load_complete',
] as const;

export type DriverProgressPhase = (typeof DRIVER_PROGRESS_PHASES)[number];

export type DriverProgressStop = {
  id: string;
  event_type: string;
  sort_order: number;
  started_at: string | null;
  arrived_at: string | null;
  departed_at: string | null;
  /** Supabase may return a string or structured place payload. */
  location: unknown;
};

/** Exact mobile representation of TMS `LoadProgress`. */
export type DriverLoadProgress = {
  phase: DriverProgressPhase;
  label: string;
  activeMoveId: string | null;
  activeMoveIndex: number | null;
  currentStop: DriverProgressStop | null;
  nextStop: DriverProgressStop | null;
  allMovesComplete: boolean;
  nextUnassignedMoveId: string | null;
  status: string;
  containerEmpty: boolean | null;
};

/**
 * Maps server phase to the one semantic button the driver can press next.
 * The phone never derives or sends a status name.
 */
export function getNextDriverProgressAction(
  progress: DriverLoadProgress,
): DriverProgressAction {
  switch (progress.phase) {
    case 'not_started':
    case 'between_moves':
      return 'start_move';
    case 'enroute':
      return 'arrived';
    case 'arrived':
      return 'enroute';
    case 'load_complete':
      return 'complete';
  }
}
