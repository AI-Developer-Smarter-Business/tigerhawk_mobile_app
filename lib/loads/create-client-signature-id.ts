/** Idempotency key for one POD signature capture (TASKS G.3 / Q9). */
export function createClientSignatureId(): string {
  const cryptoApi = globalThis.crypto as
    | { randomUUID?: () => string }
    | undefined;
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  // Fallback UUID v4 for environments without crypto.randomUUID.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const nibble = (Math.random() * 16) | 0;
    const value = char === 'x' ? nibble : (nibble & 0x3) | 0x8;
    return value.toString(16);
  });
}
