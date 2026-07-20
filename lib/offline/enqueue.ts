import type { DriverUploadDocumentType } from '@/lib/tms/assert-driver-document-type';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';
import type { LoadStatus } from '@/types';

import {
  persistQueueFile,
  readOfflineQueue,
  writeOfflineQueue,
} from './queue-storage';
import { createQueueItemId, type OfflineQueueItem } from './types';

export async function enqueueStatusChange(params: {
  loadId: string;
  userId: string;
  previousStatus: LoadStatus;
  targetStatus: LoadStatus;
  activeHolds: string[];
}): Promise<OfflineQueueItem> {
  const item: OfflineQueueItem = {
    id: createQueueItemId(),
    type: 'status_change',
    loadId: params.loadId,
    userId: params.userId,
    previousStatus: params.previousStatus,
    targetStatus: params.targetStatus,
    activeHolds: params.activeHolds,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  const queue = await readOfflineQueue();
  queue.push(item);
  await writeOfflineQueue(queue);
  return item;
}

export async function enqueueDocumentUpload(params: {
  loadId: string;
  userId: string;
  documentType: DriverUploadDocumentType;
  file: TmsUploadFileDescriptor;
}): Promise<OfflineQueueItem> {
  const id = createQueueItemId();
  const persistedUri = await persistQueueFile(params.file.uri, id, params.file.name);

  const item: OfflineQueueItem = {
    id,
    type: 'document_upload',
    loadId: params.loadId,
    userId: params.userId,
    documentType: params.documentType,
    file: {
      uri: persistedUri,
      name: params.file.name,
      type: params.file.type,
      size: params.file.size,
    },
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  const queue = await readOfflineQueue();
  queue.push(item);
  await writeOfflineQueue(queue);
  return item;
}

export async function enqueuePodSignature(params: {
  loadId: string;
  userId: string;
  clientSignatureId: string;
  signerName: string;
  signedAt: string;
  signaturePng: string;
  latitude?: number | null;
  longitude?: number | null;
  moveId?: string | null;
}): Promise<OfflineQueueItem> {
  const item: OfflineQueueItem = {
    id: createQueueItemId(),
    type: 'pod_signature',
    loadId: params.loadId,
    userId: params.userId,
    clientSignatureId: params.clientSignatureId.trim(),
    signerName: params.signerName.trim(),
    signedAt: params.signedAt.trim(),
    signaturePng: params.signaturePng,
    latitude:
      typeof params.latitude === 'number' && Number.isFinite(params.latitude)
        ? params.latitude
        : null,
    longitude:
      typeof params.longitude === 'number' && Number.isFinite(params.longitude)
        ? params.longitude
        : null,
    moveId: params.moveId?.trim() || null,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  const queue = await readOfflineQueue();
  queue.push(item);
  await writeOfflineQueue(queue);
  return item;
}

export async function getOfflineQueueLength(): Promise<number> {
  const queue = await readOfflineQueue();
  return queue.length;
}

export async function replaceOfflineQueue(items: OfflineQueueItem[]): Promise<void> {
  await writeOfflineQueue(items);
}
