/** Normalizes Expo Router dynamic params (may be `string` or `string[]`). */
export function resolveRouteParam(
  value: string | string[] | undefined,
): string | undefined {
  if (value == null) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}
