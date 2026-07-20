import { strings } from '@/constants/strings';

/**
 * Human labels for TMS `missing[]` on REQUIREMENTS_NOT_MET (F.3 / H.2).
 * Unknown keys are returned as-is so the checklist stays exact to the server.
 */
export function formatMissingRequirement(key: string): string {
  switch (key) {
    case 'chassis_number':
      return strings.driverProgress.missingChassis;
    case 'container_number':
      return strings.driverProgress.missingContainer;
    case 'seal_number':
      return strings.driverProgress.missingSeal;
    case 'tir_out_photo':
      return strings.driverProgress.missingTirOut;
    case 'tir_in_photo':
      return strings.driverProgress.missingTirIn;
    default:
      return key;
  }
}

/**
 * H.2 display line: keep the server key visible so the UI list is exactly `missing[]`.
 * Example: `Seal number (seal_number)`.
 */
export function formatMissingRequirementLine(key: string): string {
  const label = formatMissingRequirement(key);
  if (label === key) return key;
  return `${label} (${key})`;
}

export function formatMissingRequirements(
  missing: readonly string[] | undefined,
): string[] | undefined {
  if (!missing || missing.length === 0) return undefined;
  return missing.map(formatMissingRequirementLine);
}

export function hasTirPhotoRequirement(
  missing: ReadonlySet<string> | readonly string[],
): boolean {
  const set = missing instanceof Set ? missing : new Set(missing);
  return set.has('tir_out_photo') || set.has('tir_in_photo');
}
