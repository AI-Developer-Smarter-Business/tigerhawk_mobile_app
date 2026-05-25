import { strings } from '@/constants/strings';

export type CoordinatePair = {
  latitude: number;
  longitude: number;
};

/** Human-readable lat/lng for dispatch (6 decimal places ≈ 0.1 m). */
export function formatCoordinates({ latitude, longitude }: CoordinatePair): string {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

/** Accuracy radius in meters, e.g. "±12 m". */
export function formatAccuracyMeters(accuracyMeters: number | null | undefined): string | null {
  if (accuracyMeters == null || !Number.isFinite(accuracyMeters)) {
    return null;
  }
  const rounded = Math.round(accuracyMeters);
  return `±${rounded} m`;
}

export type LoadLocationSharePayload = CoordinatePair & {
  accuracyMeters: number | null;
  loadReference: string;
  timestamp: number;
};

export function buildLoadLocationShareMessage(payload: LoadLocationSharePayload): string {
  const accuracy = formatAccuracyMeters(payload.accuracyMeters);
  const lines = [
    `${strings.location.shareMessageLoadLabel}: ${payload.loadReference}`,
    `${strings.location.coordinatesLabel}: ${formatCoordinates(payload)}`,
  ];
  if (accuracy) {
    lines.push(`${strings.location.accuracyLabel}: ${accuracy}`);
  }
  lines.push(strings.location.shareMessageFooter);
  return lines.join('\n');
}
