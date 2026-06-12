export type MockWaitRecord = {
  loadId: string;
  startTimeIso: string;
  stoppedAtIso: string | null;
  exceededNotified: boolean;
};

const mockStore = new Map<string, MockWaitRecord>();

function storageKey(loadId: string): string {
  return `@pp2/wait-time/mock/${loadId}`;
}

export async function readMockWaitRecord(
  loadId: string,
): Promise<MockWaitRecord | null> {
  return mockStore.get(storageKey(loadId)) ?? null;
}

export async function writeMockWaitRecord(record: MockWaitRecord): Promise<void> {
  mockStore.set(storageKey(record.loadId), record);
}

export async function startMockWait(loadId: string): Promise<MockWaitRecord> {
  const existing = await readMockWaitRecord(loadId);
  if (existing && !existing.stoppedAtIso) {
    return existing;
  }
  const record: MockWaitRecord = {
    loadId,
    startTimeIso: new Date().toISOString(),
    stoppedAtIso: null,
    exceededNotified: false,
  };
  await writeMockWaitRecord(record);
  return record;
}

export async function stopMockWait(loadId: string): Promise<MockWaitRecord | null> {
  const existing = await readMockWaitRecord(loadId);
  if (!existing || existing.stoppedAtIso) {
    return existing;
  }
  const updated: MockWaitRecord = {
    ...existing,
    stoppedAtIso: new Date().toISOString(),
  };
  await writeMockWaitRecord(updated);
  return updated;
}

export async function markMockExceededNotified(loadId: string): Promise<void> {
  const existing = await readMockWaitRecord(loadId);
  if (!existing) return;
  await writeMockWaitRecord({ ...existing, exceededNotified: true });
}
