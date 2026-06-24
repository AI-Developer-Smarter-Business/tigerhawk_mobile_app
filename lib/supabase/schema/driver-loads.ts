/**
 * Supabase schema map for driver-assigned loads (task 2.1).
 * Source of truth: TMS types + live queries; see docs/LOADS_DATA_MAP.md.
 */

/** Primary table for assignments (FK name legacy: shipments_driver_id_fkey). */
export const LOADS_TABLE = 'loads' as const;

/** Driver registry — `loads.driver_id` references `drivers.id`. */
export const DRIVERS_TABLE = 'drivers' as const;

export const USER_PROFILES_TABLE = 'user_profiles' as const;

/** Columns selected in `fetchLoadsForDriver` (list MVP). */
export const LOAD_LIST_COLUMNS = [
  'id',
  'reference_number',
  'status',
  'driver_id',
  'customer_id',
  'container_id',
  'pickup_location',
  'delivery_location',
  'return_location',
  'pickup_apt_from',
  'pickup_apt_to',
  'delivery_apt_from',
  'delivery_apt_to',
  'is_hot',
  'notes',
  'freight_hold',
  'customs_hold',
  'terminal_hold',
  'fees_hold',
  'other_hold',
  'carrier_hold',
  'created_at',
  'updated_at',
] as const;

/** PostgREST embeds on list query. */
export const LOAD_LIST_EMBEDS = {
  containers: 'container_number',
  customers: 'name',
} as const;

/** Related tables (detail / week 2+). */
export const LOAD_RELATED_TABLES = {
  load_messages: 'load_id',
  load_documents: 'load_id',
  containers: 'id',
  customers: 'id',
} as const;

/** Default page size for driver load list (task 2.2). */
export const LOAD_LIST_PAGE_SIZE = 20;

/** Columns for live GPS on load detail / Supabase UPDATE (Semana 8 — task 8.4). */
export const LOAD_LIVE_LOCATION_COLUMNS = [
  'current_latitude',
  'current_longitude',
  'last_seen_at',
  'location_accuracy_m',
] as const;

/** Filter for mobile driver list (must match RLS). */
export function driverLoadsFilter(driverUserId: string) {
  return {
    column: 'driver_id' as const,
    value: driverUserId,
  };
}
