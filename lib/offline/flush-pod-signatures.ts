import { mutateMobilePodSignature } from '@/lib/tms/mutate-pod-signature';

import { readOfflineQueue, writeOfflineQueue } from './queue-storage';
import type { OfflinePodSignatureItem, OfflineQueueItem } from './types';
import { OFFLINE_QUEUE_MAX_ATTEMPTS } from './types';

/**
 * Flush pending legal POD stamps for a load before leave-delivery progress
 * (TASKS G.5). Retries keep the same `clientSignatureId`.
 */
export async function flushPodSignaturesForLoad(params: {
  loadId: string;
  userId: string;
  accessToken?: string;
}): Promise<{ flushed: number; remaining: number }> {
  const queue = await readOfflineQueue();
  if (queue.length === 0) {
    return { flushed: 0, remaining: 0 };
  }

  const remaining: OfflineQueueItem[] = [];
  let flushed = 0;

  for (const item of queue) {
    if (
      item.type !== 'pod_signature' ||
      item.userId !== params.userId ||
      item.loadId !== params.loadId
    ) {
      remaining.push(item);
      continue;
    }

    const ok = await submitPodSignatureItem(item, params.accessToken);
    if (ok) {
      flushed += 1;
      continue;
    }

    const nextAttempts = item.attempts + 1;
    if (nextAttempts < OFFLINE_QUEUE_MAX_ATTEMPTS) {
      remaining.push({ ...item, attempts: nextAttempts });
    }
  }

  await writeOfflineQueue(remaining);
  return { flushed, remaining: remaining.length };
}

async function submitPodSignatureItem(
  item: OfflinePodSignatureItem,
  accessToken?: string,
): Promise<boolean> {
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
  return result.ok;
}
