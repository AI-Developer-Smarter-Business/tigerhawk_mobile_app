import { fetchLoadDocumentsForDriver } from '../fetch-load-documents';

const mockFrom = jest.fn();

jest.mock('@/lib/loads/resolve-load-document-url', () => ({
  resolveLoadDocumentUrlForDriver: jest.fn(
    async (_supabase: unknown, _path: unknown, fallback?: string | null) =>
      fallback?.trim() || null,
  ),
}));

jest.mock('@/lib/supabase/client', () => ({
  getSupabase: () => ({ from: mockFrom }),
}));

function mockQueryResult(rows: unknown[], error: { message: string } | null = null) {
  mockFrom.mockReturnValue({
    select: () => ({
      eq: () => ({
        order: async () => ({ data: rows, error }),
      }),
    }),
  });
}

describe('fetchLoadDocumentsForDriver', () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it('filters rows that do not belong to the requested load', async () => {
    mockQueryResult([
      {
        id: 'doc-1',
        load_id: 'load-a',
        filename: 'a.pdf',
        document_type: 'POD',
        file_size: 100,
        url: 'https://example/a',
        storage_path: 'load-a/a.pdf',
        uploaded_at: null,
      },
      {
        id: 'doc-2',
        load_id: 'load-b',
        filename: 'b.pdf',
        document_type: 'POD',
        file_size: 100,
        url: 'https://example/b',
        storage_path: 'load-b/b.pdf',
        uploaded_at: null,
      },
    ]);

    const supabase = { from: mockFrom } as never;
    const result = await fetchLoadDocumentsForDriver(supabase, 'load-a');

    expect(result.errorMessage).toBeNull();
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].id).toBe('doc-1');
  });
});
