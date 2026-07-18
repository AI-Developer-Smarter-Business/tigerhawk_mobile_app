/**
 * PortPro-style stage titles for a driver's stop on a move card (TASKS B.2).
 * Prefer server `progress.label` for the next action; these label the stop list.
 */

const STAGE_BY_EVENT: Record<string, string> = {
  pickup_container: 'PULL CONTAINER',
  empty_pickup_container: 'PULL CONTAINER',
  deliver_container: 'DELIVER LOAD',
  return_container: 'RETURN CONTAINER',
  drop_container: 'DROP CONTAINER',
  hook_chassis: 'HOOK CHASSIS',
  hook_container: 'HOOK CONTAINER',
  loading_container: 'LOADING',
  stop_off: 'STOP OFF',
  terminate_chassis: 'RETURN CHASSIS',
  bobtail: 'BOBTAIL',
  lift_off: 'LIFT OFF',
  lift_on: 'LIFT ON',
  completed: 'COMPLETED',
};

export function formatMoveStopStage(eventType: string | null | undefined): string {
  const key = (eventType ?? '').trim().toLowerCase();
  if (!key) return 'STOP';
  if (STAGE_BY_EVENT[key]) return STAGE_BY_EVENT[key];
  return key.replace(/_/g, ' ').toUpperCase();
}

/** Best-effort place name from stop.location (string or JSON-ish object). */
export function formatMoveStopLocation(location: unknown): string {
  if (location == null) return '';
  if (typeof location === 'string') {
    const trimmed = location.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('{')) {
      try {
        return formatMoveStopLocation(JSON.parse(trimmed) as unknown);
      } catch {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof location === 'object') {
    const obj = location as Record<string, unknown>;
    const name =
      (typeof obj.name === 'string' && obj.name.trim()) ||
      (typeof obj.facility === 'string' && obj.facility.trim()) ||
      (typeof obj.label === 'string' && obj.label.trim()) ||
      '';
    const line1 =
      (typeof obj.address === 'string' && obj.address.trim()) ||
      (typeof obj.street === 'string' && obj.street.trim()) ||
      '';
    const city = typeof obj.city === 'string' ? obj.city.trim() : '';
    const state = typeof obj.state === 'string' ? obj.state.trim() : '';
    const zip = typeof obj.zip === 'string' ? obj.zip.trim() : '';
    const cityLine = [city, state].filter(Boolean).join(', ');
    const withZip = zip ? `${cityLine} ${zip}`.trim() : cityLine;
    return [name, line1, withZip].filter(Boolean).join('\n');
  }
  return '';
}
