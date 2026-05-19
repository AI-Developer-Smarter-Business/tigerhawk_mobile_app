import type { LoadStatus } from '@/types';

const STATUS_LABELS: Partial<Record<LoadStatus, string>> = {
  'In Transit': 'In transit',
  'Arrived At Pickup': 'At pickup',
  'Arrived At Delivery': 'At delivery',
  Delivered: 'Delivered',
  Dispatched: 'Dispatched',
  Assigned: 'Assigned',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

export function formatLoadStatus(status: LoadStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function formatAppointment(iso: string | null): string {
  if (!iso) return 'No appointment';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'No appointment';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatAppointmentRange(
  from: string | null,
  to: string | null,
): string {
  if (!from && !to) return formatAppointment(null);
  if (from && to) {
    const start = formatAppointment(from);
    const end = formatAppointment(to);
    return start === end ? start : `${start} – ${end}`;
  }
  return formatAppointment(from ?? to);
}

export function formatReference(reference: string): string {
  return reference.startsWith('#') ? reference : `#${reference}`;
}
