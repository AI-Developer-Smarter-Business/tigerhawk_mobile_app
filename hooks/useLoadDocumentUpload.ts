import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { invalidateLoadDocuments } from '@/lib/query/invalidate-loads';
import { uploadDriverLoadDocumentViaSupabase } from '@/lib/supabase/upload-driver-load-document';
import { getTmsApiUrl, resolveSupabaseAccessToken, uploadLoadDocument } from '@/lib/tms';
import { TmsDocumentUploadError } from '@/lib/tms/document-errors';
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

      try {
        if (!userId) {
          throw new TmsDocumentUploadError('Session expired. Sign in again.', 'UNAUTHORIZED');
        }

        try {
          await uploadDriverLoadDocumentViaSupabase({
            loadId: load.id,
            file,
            userId,
          });
        } catch (supabaseErr) {
          const tryTms =
            getTmsApiUrl().length > 0 &&
            supabaseErr instanceof TmsDocumentUploadError &&
            (supabaseErr.code === 'FORBIDDEN' || supabaseErr.code === 'UNKNOWN');

          if (!tryTms) {
            throw supabaseErr;
          }

          const accessToken = await resolveSupabaseAccessToken();
          await uploadLoadDocument({
            loadId: load.id,
            file,
            documentType: 'Driver',
            accessToken,
          });
        }

        await invalidateLoadDocuments(queryClient, userId, load.id);
      } catch (err) {
        if (err instanceof TmsDocumentUploadError) {
          throw err;
        }
        throw new TmsDocumentUploadError(
          err instanceof Error ? err.message : 'Upload failed.',
          'UNKNOWN',
        );
      }
    },
    [load?.id, queryClient, userId],
  );
}
