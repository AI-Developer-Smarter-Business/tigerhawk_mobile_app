import type { SupabaseClient } from '@supabase/supabase-js';

import {
  mergeFreshUrlsFromTms,
  reconcileLoadDocumentsWithTms,
} from '@/lib/loads/merge-tms-documents';
import { assertOnlineForFetch } from '@/lib/network/assert-online';
import { fetchTmsLoadDocuments } from '@/lib/tms/fetch-load-documents';
import { resolveSupabaseAccessToken } from '@/lib/tms/resolve-access-token';

import {
  fetchLoadDocumentsForDriver,
  type LoadDocumentsQueryResult,
} from './fetch-load-documents';

/**
 * Driver document list: Supabase metadata + optional TMS GET for fresh signed URLs
 * and authoritative list when dispatch deletes a file in TMS.
 */
export async function fetchDriverLoadDocuments(
  supabase: SupabaseClient,
  loadId: string,
): Promise<LoadDocumentsQueryResult> {
  const expectedLoadId = loadId.trim();
  if (!expectedLoadId) {
    return { documents: [], errorMessage: 'Invalid load id' };
  }

  await assertOnlineForFetch();

  const base = await fetchLoadDocumentsForDriver(supabase, expectedLoadId);
  if (base.errorMessage) {
    return base;
  }

  try {
    const accessToken = await resolveSupabaseAccessToken();
    const tms = await fetchTmsLoadDocuments(expectedLoadId, accessToken);

    if (tms.ok) {
      const documents = reconcileLoadDocumentsWithTms(
        base.documents,
        tms,
        expectedLoadId,
      );
      return { documents, errorMessage: null };
    }

    const documents = mergeFreshUrlsFromTms(base.documents, tms.documents);
    return { documents, errorMessage: null };
  } catch {
    return base;
  }
}
