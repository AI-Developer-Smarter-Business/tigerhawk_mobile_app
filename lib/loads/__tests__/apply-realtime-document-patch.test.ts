import { patchDocumentsFromRealtimePayload } from '@/lib/loads/apply-realtime-document-patch';
import type { LoadDocument } from '@/types/load-document';

const docs: LoadDocument[] = [
  {
    id: 'doc-1',
    load_id: 'load-1',
    filename: 'test.jpeg',
    document_type: 'Other',
    file_size: 56000,
    url: 'https://example.com/doc',
    uploaded_at: '2026-05-25T11:30:00Z',
  },
];

describe('patchDocumentsFromRealtimePayload', () => {
  it('removes document on DELETE payload', () => {
    const next = patchDocumentsFromRealtimePayload(docs, {
      eventType: 'DELETE',
      new: {},
      old: { id: 'doc-1', load_id: 'load-1' },
    } as never);

    expect(next).toEqual([]);
  });

  it('keeps list unchanged when DELETE id is unknown', () => {
    const next = patchDocumentsFromRealtimePayload(docs, {
      eventType: 'DELETE',
      new: {},
      old: { id: 'doc-99', load_id: 'load-1' },
    } as never);

    expect(next).toEqual(docs);
  });
});
