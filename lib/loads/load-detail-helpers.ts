import { strings } from '@/constants/strings';
import type { LoadDetail } from '@/types';

export function formatDisplayValue(value: string | null | undefined): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : strings.loadDetail.emDash;
}

export function hasShipmentInfo(load: LoadDetail): boolean {
  return Boolean(
    load.load_type ||
      load.route_type ||
      load.ssl ||
      load.mbol ||
      load.house_bol,
  );
}

export function hasContainerInfo(load: LoadDetail): boolean {
  return Boolean(
    load.container_number ||
      load.container_size ||
      load.container_type ||
      load.bol_number ||
      load.seal_number ||
      load.chassis_number,
  );
}

export function hasTimeline(load: LoadDetail): boolean {
  return Boolean(
    load.scheduled_pickup ||
      load.actual_pickup ||
      load.actual_delivery ||
      load.completed_date,
  );
}

export function hasLoadFlags(load: LoadDetail): boolean {
  return load.is_hazmat || load.is_overweight || load.is_bonded;
}
