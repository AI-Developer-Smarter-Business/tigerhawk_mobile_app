import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { invalidateLoadDocuments } from '@/lib/query/invalidate-loads';
import {
  rethrowIfTmsApiUnauthorized,
  resolveSupabaseAccessToken,
  uploadLoadDocument,
} from '@/lib/tms';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';
import type { LoadDetail } from '@/types';

/**
 * Uploads a POD image for the current load via the TMS documents API (task 4.1 contract).
 */
export function useLoadDocumentUpload(load: LoadDetail | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id ?? '';

  return useCallback(
    async (file: TmsUploadFileDescriptor) => {
      if (!load?.id) return;

      const accessToken = await resolveSupabaseAccessToken();

      try {
        await uploadLoadDocument({
          loadId: load.id,
          file,
          documentType: 'POD',
          accessToken,
        });
        if (userId) {
          await invalidateLoadDocuments(queryClient, userId, load.id);
        }
      } catch (err) {
        rethrowIfTmsApiUnauthorized(err);
      }
    },
    [load?.id, queryClient, userId],
  );
}
