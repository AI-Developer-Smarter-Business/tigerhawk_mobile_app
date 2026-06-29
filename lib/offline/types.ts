import type { DriverUploadDocumentType } from '@/lib/tms/assert-driver-document-type';
import type { LoadStatus } from '@/types';

export type OfflineStatusChangeItem = {
  id: string;
  type: 'status_change';
  loadId: string;
  previousStatus: LoadStatus;
  targetStatus: LoadStatus;
  activeHolds: string[];
  userId: string;
  createdAt: string;
  attempts: number;
};

export type OfflineDocumentUploadItem = {
  id: string;
  type: 'document_upload';
  loadId: string;
  userId: string;
  documentType: DriverUploadDocumentType;
  file: {
    uri: string;
    name: string;
    type: string;
    size: number | null;
  };
  createdAt: string;
  attempts: number;
};

export type OfflineQueueItem = OfflineStatusChangeItem | OfflineDocumentUploadItem;

export const OFFLINE_QUEUE_MAX_ATTEMPTS = 5;

export function createQueueItemId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
