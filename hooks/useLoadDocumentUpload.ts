import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useNetwork } from '@/context/NetworkContext';
import { useOfflineQueue } from '@/context/OfflineQueueContext';
import { useAuth } from '@/hooks/useAuth';
import { uploadDriverLoadDocument } from '@/lib/loads/upload-driver-load-document';
import { validateDriverUploadFile } from '@/lib/media/validate-driver-upload-file';
import { enqueueDocumentUpload } from '@/lib/offline/enqueue';
import { OfflineQueuedError } from '@/lib/offline/offline-queued-error';
import { strings } from '@/constants/strings';
import { invalidateLoadDocuments } from '@/lib/query/invalidate-loads';
import type { DriverUploadDocumentType } from '@/lib/tms/assert-driver-document-type';
import { TmsDocumentUploadError } from '@/lib/tms/document-errors';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';
import type { LoadDetail } from '@/types';

/**
 * Uploads a driver document for the current load.
 * POD → TMS only (WT.28 auto-stop); Driver/Photo → Supabase with TMS fallback.
 */
export function useLoadDocumentUpload(load: LoadDetail | null) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { isOffline, isReady: networkReady } = useNetwork();
  const { refreshPendingCount } = useOfflineQueue();
  const userId = user?.id ?? '';

  return useCallback(
    async (file: TmsUploadFileDescriptor, documentType: DriverUploadDocumentType = 'Driver') => {
      if (!load?.id) return;

      try {
        if (!userId) {
          throw new TmsDocumentUploadError('Session expired. Sign in again.', 'UNAUTHORIZED');
        }

        validateDriverUploadFile(file);

        if (networkReady && isOffline) {
          await enqueueDocumentUpload({
            loadId: load.id,
            userId,
            documentType,
            file,
          });
          await refreshPendingCount();
          throw new OfflineQueuedError(strings.network.offlineUploadQueued);
        }

        await uploadDriverLoadDocument({
          loadId: load.id,
          file,
          userId,
          documentType,
        });

        await invalidateLoadDocuments(queryClient, userId, load.id);
      } catch (err) {
        if (err instanceof OfflineQueuedError) {
          throw err;
        }
        if (err instanceof TmsDocumentUploadError) {
          throw err;
        }
        throw new TmsDocumentUploadError(
          err instanceof Error ? err.message : 'Upload failed.',
          'UNKNOWN',
        );
      }
    },
    [isOffline, load?.id, networkReady, queryClient, refreshPendingCount, userId],
  );
}
