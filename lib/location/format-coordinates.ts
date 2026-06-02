import { strings } from '@/constants/strings';

import { buildGoogleMapsUrl } from './maps-url';

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

/** Load + driver context included in the share sheet message (option A — no TMS persist). */
export type LoadLocationShareContext = {
  loadReference: string;
  status?: string | null;
  containerNumber?: string | null;
  pickupLocation?: string | null;
  deliveryLocation?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  driverEmail?: string | null;
};

export type LoadLocationSharePayload = LoadLocationShareContext &
  CoordinatePair & {
    accuracyMeters: number | null;
    timestamp: number;
  };

function appendLine(lines: string[], label: string, value: string | null | undefined): void {
  const trimmed = value?.trim();
  if (trimmed) {
    lines.push(`${label}: ${trimmed}`);
  }
}

export function buildLoadLocationShareMessage(payload: LoadLocationSharePayload): string {
  const lines: string[] = [];

  appendLine(lines, strings.location.shareMessageLoadLabel, payload.loadReference);
  appendLine(lines, strings.location.shareMessageStatusLabel, payload.status);
  appendLine(lines, strings.location.shareMessageContainerLabel, payload.containerNumber);

  const pickup = payload.pickupLocation?.trim();
  const delivery = payload.deliveryLocation?.trim();
  if (pickup || delivery) {
    lines.push(
      `${strings.location.shareMessageRouteLabel}: ${pickup || strings.loadDetail.emDash} → ${delivery || strings.loadDetail.emDash}`,
    );
  }

  appendLine(lines, strings.location.shareMessageDriverLabel, payload.driverName);
  appendLine(lines, strings.location.shareMessageDriverPhoneLabel, payload.driverPhone);
  appendLine(lines, strings.location.shareMessageDriverEmailLabel, payload.driverEmail);

  lines.push(`${strings.location.coordinatesLabel}: ${formatCoordinates(payload)}`);

  const accuracy = formatAccuracyMeters(payload.accuracyMeters);
  if (accuracy) {
    lines.push(`${strings.location.accuracyLabel}: ${accuracy}`);
  }

  lines.push(
    `${strings.location.shareMessageMapsLabel}: ${buildGoogleMapsUrl(payload.latitude, payload.longitude)}`,
  );
  lines.push(strings.location.shareMessageFooter);

  return lines.join('\n');
}
