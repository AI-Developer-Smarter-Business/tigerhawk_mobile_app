import type { OfflineQueueItem } from '@/lib/offline/types';

const store: OfflineQueueItem[] = [];

jest.mock('@/lib/offline/queue-storage', () => ({
  readOfflineQueue: jest.fn(async () => [...store]),
  writeOfflineQueue: jest.fn(async (items: OfflineQueueItem[]) => {
    store.length = 0;
    store.push(...items);
  }),
  persistQueueFile: jest.fn(
    async (_sourceUri: string, queueItemId: string, filename: string) =>
      `file:///mock-queue/${queueItemId}_${filename}`,
  ),
  deleteQueueFile: jest.fn(async () => undefined),
  getOfflineQueueDir: jest.fn(() => 'file:///mock-queue/'),
}));

import {
  enqueueDocumentUpload,
  enqueueStatusChange,
  getOfflineQueueLength,
} from '@/lib/offline/enqueue';
import { readOfflineQueue } from '@/lib/offline/queue-storage';

describe('offline queue (9.4)', () => {
  beforeEach(() => {
    store.length = 0;
    jest.clearAllMocks();
  });

  it('enqueues a status change', async () => {
    await enqueueStatusChange({
      loadId: 'load-1',
      userId: 'user-1',
      previousStatus: 'In Transit',
      targetStatus: 'Arrived At Pickup',
      activeHolds: [],
    });

    const queue = await readOfflineQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      type: 'status_change',
      loadId: 'load-1',
      targetStatus: 'Arrived At Pickup',
    });
    expect(await getOfflineQueueLength()).toBe(1);
  });

  it('enqueues a document upload with persisted file path', async () => {
    await enqueueDocumentUpload({
      loadId: 'load-1',
      userId: 'user-1',
      documentType: 'POD',
      file: {
        uri: 'file:///tmp/photo.jpg',
        name: 'photo.jpg',
        type: 'image/jpeg',
        size: 1000,
      },
    });

    const queue = await readOfflineQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({
      type: 'document_upload',
      documentType: 'POD',
    });
    if (queue[0].type === 'document_upload') {
      expect(queue[0].file.uri).toContain('file:///mock-queue/');
    }
  });
});
