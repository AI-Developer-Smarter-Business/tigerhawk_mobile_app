/** Captures `FormData.append` calls for unit tests (task 4.6). */
export type CapturedFormDataEntry = {
  name: string;
  value: unknown;
};

export function captureFormDataAppends(build: () => FormData): {
  formData: FormData;
  entries: CapturedFormDataEntry[];
} {
  const entries: CapturedFormDataEntry[] = [];
  const originalAppend = FormData.prototype.append;

  const appendSpy = jest
    .spyOn(FormData.prototype, 'append')
    .mockImplementation(function (this: FormData, name: string, value: unknown) {
      entries.push({ name, value });
      return originalAppend.call(this, name, value as never);
    });

  try {
    const formData = build();
    return { formData, entries };
  } finally {
    appendSpy.mockRestore();
  }
}

/** React Native multipart file part shape for TMS document POST. */
export type CapturedRnFilePart = {
  uri: string;
  name: string;
  type: string;
};

export function getCapturedFilePart(
  entries: CapturedFormDataEntry[],
): CapturedRnFilePart | undefined {
  const part = entries.find((e) => e.name === 'file')?.value;
  if (!part || typeof part !== 'object') {
    return undefined;
  }
  const candidate = part as Partial<CapturedRnFilePart>;
  if (
    typeof candidate.uri === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.type === 'string'
  ) {
    return {
      uri: candidate.uri,
      name: candidate.name,
      type: candidate.type,
    };
  }
  return undefined;
}

export function getCapturedDocumentType(
  entries: CapturedFormDataEntry[],
): string | undefined {
  const value = entries.find((e) => e.name === 'document_type')?.value;
  return typeof value === 'string' ? value : undefined;
}

export function getCapturedAccessToken(
  entries: CapturedFormDataEntry[],
): string | undefined {
  const value = entries.find((e) => e.name === 'access_token')?.value;
  return typeof value === 'string' ? value : undefined;
}
