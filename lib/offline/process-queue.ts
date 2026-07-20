import type { QueryClient } from '@tanstack/react-query';

import { runDriverStatusChange } from '@/lib/driver-status';
import { invalidateLoadDocuments } from '@/lib/query/invalidate-loads';
import { uploadDriverLoadDocument } from '@/lib/loads/upload-driver-load-document';
import { mutateMobilePodSignature } from '@/lib/tms/mutate-pod-signature';
import { resolveSupabaseAccessToken } from '@/lib/tms';

import { deleteQueueFile, readOfflineQueue, writeOfflineQueue } from './queue-storage';
import { OFFLINE_QUEUE_MAX_ATTEMPTS, type OfflineQueueItem } from './types';

export type ProcessOfflineQueueParams = {
  queryClient: QueryClient;
  userId: string;
};

export type ProcessOfflineQueueResult = {
  processed: number;
  failed: number;
  remaining: number;
};

async function processStatusItem(
  item: Extract<OfflineQueueItem, { type: 'status_change' }>,
  params: ProcessOfflineQueueParams,
): Promise<void> {
  const accessToken = await resolveSupabaseAccessToken();
  await runDriverStatusChange({
    queryClient: params.queryClient,
    userId: params.userId,
    load: {
      id: item.loadId,
      status: item.previousStatus,
      active_holds: item.activeHolds,
    },
    targetStatus: item.targetStatus,
    accessToken,
  });
}

async function processDocumentItem(
  item: Extract<OfflineQueueItem, { type: 'document_upload' }>,
  params: ProcessOfflineQueueParams,
): Promise<void> {
  const file = {
    uri: item.file.uri,
    name: item.file.name,
    type: item.file.type,
    size: item.file.size ?? 0,
  };

  await uploadDriverLoadDocument({
    loadId: item.loadId,
    file,
    userId: item.userId,
    documentType: item.documentType,
  });

  await invalidateLoadDocuments(params.queryClient, params.userId, item.loadId);
  await deleteQueueFile(file.uri);
}

async function processPodSignatureItem(
  item: Extract<OfflineQueueItem, { type: 'pod_signature' }>,
): Promise<void> {
  const accessToken = await resolveSupabaseAccessToken();
  const result = await mutateMobilePodSignature({
    loadId: item.loadId,
    clientSignatureId: item.clientSignatureId,
    signerName: item.signerName,
    signedAt: item.signedAt,
    signaturePng: item.signaturePng,
    latitude: item.latitude,
    longitude: item.longitude,
    moveId: item.moveId,
    accessToken,
  });
  if (!result.ok) {
    throw result.mobileError ?? new Error(result.error);
  }
}

function queueProcessOrder(item: OfflineQueueItem): number {
  // G.5: drain legal POD stamps before other offline work.
  if (item.type === 'pod_signature') return 0;
  if (item.type === 'document_upload') return 1;
  return 2;
}

export async function processOfflineQueue(
  params: ProcessOfflineQueueParams,
): Promise<ProcessOfflineQueueResult> {
  const queue = await readOfflineQueue();
  if (queue.length === 0) {
    return { processed: 0, failed: 0, remaining: 0 };
  }

  const ordered = [...queue].sort(
    (a, b) => queueProcessOrder(a) - queueProcessOrder(b),
  );

  let processed = 0;
  let failed = 0;
  const remaining: OfflineQueueItem[] = [];

  for (const item of ordered) {
    if (item.userId !== params.userId) {
      remaining.push(item);
      continue;
    }

    try {
      if (item.type === 'status_change') {
        await processStatusItem(item, params);
      } else if (item.type === 'pod_signature') {
        await processPodSignatureItem(item);
      } else {
        await processDocumentItem(item, params);
      }
      processed += 1;
    } catch {
      const nextAttempts = item.attempts + 1;
      if (nextAttempts >= OFFLINE_QUEUE_MAX_ATTEMPTS) {
        if (item.type === 'document_upload') {
          await deleteQueueFile(item.file.uri);
        }
        failed += 1;
      } else {
        remaining.push({ ...item, attempts: nextAttempts });
      }
    }
  }

  await writeOfflineQueue(remaining);

  return {
    processed,
    failed,
    remaining: remaining.length,
  };
}
