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

export async function getOfflineQueueLength(): Promise<number> {
  const queue = await readOfflineQueue();
  return queue.length;
}

export async function replaceOfflineQueue(items: OfflineQueueItem[]): Promise<void> {
  await writeOfflineQueue(items);
}
