/**
 * Move card from `GET /api/mobile/driver/loads` (RESPUESTAS Q14 · TASKS B.*).
 * Cards are **moves**, not loads.
 */

export type DriverMoveProgress = {
  label: string;
  phase: string;
  active_move_id: string | null;
};

export type DriverMoveStop = {
  id: string;
  event_type: string;
  /** Server may send a string or a place object. */
  location: unknown;
  arrived_at: string | null;
  departed_at: string | null;
};

export type DriverMoveCard = {
  move_id: string;
  load_id: string;
  reference_number: string | null;
  load_type: string | null;
  status: string;
  customer: string | null;
  container_number: string | null;
  seal_number: string | null;
  container_size: string | null;
  container_type: string | null;
  chassis_number: string | null;
  pickup_location: string | null;
  delivery_location: string | null;
  return_location: string | null;
  is_hazmat: boolean;
  is_hot: boolean;
  last_free_day: string | null;
  per_diem_free_day: string | null;
  cut_off_date: string | null;
  accepted_at: string | null;
  started_at: string | null;
  assigned_date: string | null;
  stops: DriverMoveStop[];
  progress: DriverMoveProgress;
};

export type DriverLoadsBuckets = {
  active: DriverMoveCard[];
  upcoming: DriverMoveCard[];
};

export type DriverLoadsTab = 'active' | 'upcoming';
