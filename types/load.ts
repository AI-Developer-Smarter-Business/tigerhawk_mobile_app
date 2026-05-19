/** Estados de carga alineados al TMS (`PROYECTO_MUESTRA/types/dispatcher.ts`). */
export type LoadStatus =
  | 'Assigned'
  | 'Dispatched'
  | 'In Transit'
  | 'Arrived At Pickup'
  | 'Arrived At Delivery'
  | 'Arrived At Return Empty'
  | 'Arrived To Hook Container'
  | 'At Warehouse'
  | 'Dropped - Empty'
  | 'Dropped - Loaded'
  | 'Enroute To Drop Container'
  | 'Enroute To Return Empty'
  | 'Delivered'
  | 'Completed'
  | 'Cancelled';

export type LoadSummary = {
  id: string;
  reference_number: string;
  status: LoadStatus;
  container_number: string | null;
  pickup_location: string | null;
  delivery_location: string | null;
  delivery_apt_from: string | null;
  is_hot: boolean;
  active_holds: string[];
};

/** Master data for list + detail (detail-only fields null on list rows). */
export type LoadDetail = LoadSummary & {
  return_location: string | null;
  pickup_apt_from: string | null;
  pickup_apt_to: string | null;
  delivery_apt_to: string | null;
  notes: string | null;
  customer_name: string | null;
  load_type: string | null;
  route_type: string | null;
  ssl: string | null;
  mbol: string | null;
  house_bol: string | null;
  seal_number: string | null;
  chassis_number: string | null;
  container_size: string | null;
  container_type: string | null;
  bol_number: string | null;
  scheduled_pickup: string | null;
  actual_pickup: string | null;
  actual_delivery: string | null;
  completed_date: string | null;
  created_at: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  driver_name: string | null;
  is_hazmat: boolean;
  is_overweight: boolean;
  is_bonded: boolean;
};
