import {
  mergeFreshUrlsFromTms,
  reconcileLoadDocumentsWithTms,
} from '../merge-tms-documents';

describe('reconcileLoadDocumentsWithTms', () => {
  it('uses TMS list when GET succeeds (drops deleted rows)', () => {
    const supabase = [
      {
        id: 'old',
        load_id: 'load-1',
        filename: 'removed.pdf',
        document_type: 'Other',
        file_size: 1,
        url: 'https://stale',
        uploaded_at: null,
      },
      {
        id: 'keep',
        load_id: 'load-1',
        filename: 'keep.pdf',
        document_type: 'Other',
        file_size: 2,
        url: 'https://stale2',
        uploaded_at: null,
      },
    ];

    const result = reconcileLoadDocumentsWithTms(
      supabase,
      {
        ok: true,
        documents: [
          {
            id: 'keep',
            load_id: 'load-1',
            filename: 'keep.pdf',
            url: 'https://fresh',
            document_type: 'Other',
            file_size: 2,
          },
        ],
      },
      'load-1',
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('keep');
    expect(result[0].url).toBe('https://fresh');
  });

  it('keeps Supabase when TMS fails', () => {
    const supabase = [
      {
        id: 'a',
        load_id: 'load-1',
        filename: 'a.pdf',
        document_type: 'Other',
        file_size: null,
        url: 'https://a',
        uploaded_at: null,
      },
    ];
    const result = reconcileLoadDocumentsWithTms(
      supabase,
      { ok: false, documents: [] },
      'load-1',
    );
    expect(result).toEqual(supabase);
  });
});

describe('mergeFreshUrlsFromTms', () => {
  it('replaces url by document id', () => {
    const merged = mergeFreshUrlsFromTms(
      [
        {
          id: 'd1',
          load_id: 'load-1',
          filename: 'x.pdf',
          document_type: 'Other',
          file_size: null,
          url: 'https://old',
          uploaded_at: null,
        },
      ],
      [
        {
          id: 'd1',
          load_id: 'load-1',
          filename: 'x.pdf',
          url: 'https://new',
          document_type: 'Other',
        },
      ],
    );
    expect(merged[0].url).toBe('https://new');
  });
});
