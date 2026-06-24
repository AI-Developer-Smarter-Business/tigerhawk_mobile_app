import type { SupabaseClient } from '@supabase/supabase-js';

import type { LiveTrackingLoadUpdate } from '@/lib/location/tracking-policy';

import { getSupabase } from '../client';
import { LOADS_TABLE } from '../schema/driver-loads';

export type UpdateLoadLiveLocationParams = {
  loadId: string;
  update: LiveTrackingLoadUpdate;
};

export class LoadLiveLocationUpdateError extends Error {
  constructor(
    message: string,
    readonly code: 'not_found' | 'supabase',
  ) {
    super(message);
    this.name = 'LoadLiveLocationUpdateError';
  }
}

/**
 * Persists foreground GPS ping to `loads.current_*` (RLS 8.5 — driver assigned load only).
 */
export async function updateLoadLiveLocation(
  params: UpdateLoadLiveLocationParams,
  supabase: SupabaseClient = getSupabase(),
): Promise<void> {
  const { loadId, update } = params;

  const { data, error } = await supabase
    .from(LOADS_TABLE)
    .update({
      current_latitude: update.current_latitude,
      current_longitude: update.current_longitude,
      last_seen_at: update.last_seen_at,
      location_accuracy_m: update.location_accuracy_m,
    })
    .eq('id', loadId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw new LoadLiveLocationUpdateError(error.message, 'supabase');
  }

  if (!data) {
    throw new LoadLiveLocationUpdateError(
      'Load not found or not assigned to the signed-in driver.',
      'not_found',
    );
  }
}
