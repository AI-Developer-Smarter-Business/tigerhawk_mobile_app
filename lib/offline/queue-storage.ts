import { Directory, File, Paths } from 'expo-file-system';

import type { OfflineQueueItem } from './types';

const QUEUE_DIR = new Directory(Paths.document, 'pp2-offline-queue');
const INDEX_FILE = new File(QUEUE_DIR, 'index.json');

function ensureQueueDir(): void {
  if (!QUEUE_DIR.exists) {
    QUEUE_DIR.create({ intermediates: true, idempotent: true });
  }
}

export async function readOfflineQueue(): Promise<OfflineQueueItem[]> {
  ensureQueueDir();
  if (!INDEX_FILE.exists) {
    return [];
  }

  const raw = await INDEX_FILE.text();
  const parsed = JSON.parse(raw) as OfflineQueueItem[];
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeOfflineQueue(items: OfflineQueueItem[]): Promise<void> {
  ensureQueueDir();
  if (!INDEX_FILE.exists) {
    INDEX_FILE.create({ overwrite: true, intermediates: true });
  }
  INDEX_FILE.write(JSON.stringify(items));
}

export async function persistQueueFile(
  sourceUri: string,
  queueItemId: string,
  filename: string,
): Promise<string> {
  ensureQueueDir();
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const destFile = new File(QUEUE_DIR, `${queueItemId}_${safeName}`);
  const sourceFile = new File(sourceUri);

  if (destFile.exists) {
    destFile.delete();
  }

  sourceFile.copy(destFile);
  return destFile.uri;
}

export async function deleteQueueFile(uri: string): Promise<void> {
  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}

export function getOfflineQueueDir(): string {
  return QUEUE_DIR.uri;
}
