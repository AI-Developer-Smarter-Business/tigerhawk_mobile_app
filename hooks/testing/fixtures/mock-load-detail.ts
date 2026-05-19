import { createLoadListRow } from '@/lib/supabase/queries/__tests__/fixtures/load-list-row';
import { mapLoadRowToDetail } from '@/lib/supabase/queries/map-load-row';
import type { LoadDetail } from '@/types';

export function createMockLoadDetail(
  overrides: Parameters<typeof createLoadListRow>[0] = {},
): LoadDetail {
  return mapLoadRowToDetail(
    createLoadListRow({
      id: 'load-mock-1',
      reference_number: 'THWK_MOCK',
      ...overrides,
    }),
  );
}
