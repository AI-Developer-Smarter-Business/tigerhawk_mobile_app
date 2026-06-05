import type { LoadDetail } from '@/types';

/** HOT loads first, then newest `created_at` (matches TMS priority). */
export function sortAssignedLoadsByPriority(loads: LoadDetail[]): LoadDetail[] {
  return [...loads].sort((a, b) => {
    if (a.is_hot !== b.is_hot) {
      return a.is_hot ? -1 : 1;
    }
    const aCreated = a.created_at ?? '';
    const bCreated = b.created_at ?? '';
    if (aCreated !== bCreated) {
      return bCreated.localeCompare(aCreated);
    }
    return a.reference_number.localeCompare(b.reference_number);
  });
}
