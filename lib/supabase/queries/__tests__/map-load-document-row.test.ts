import { mapLoadDocumentRow } from '../map-load-document-row';

describe('mapLoadDocumentRow', () => {
  it('maps TMS row fields for driver list', () => {
    const doc = mapLoadDocumentRow({
      id: 'doc-1',
      load_id: 'load-1',
      filename: 'codigo de barras principal.jpeg',
      document_type: 'Other',
      file_size: 57344,
      url: 'https://example.com/signed',
      uploaded_at: '2026-05-22T12:00:00.000Z',
    });

    expect(doc).toEqual({
      id: 'doc-1',
      load_id: 'load-1',
      filename: 'codigo de barras principal.jpeg',
      document_type: 'Other',
      file_size: 57344,
      url: 'https://example.com/signed',
      uploaded_at: '2026-05-22T12:00:00.000Z',
    });
  });

  it('fills defaults for null metadata', () => {
    const doc = mapLoadDocumentRow({
      id: 'doc-2',
      load_id: 'load-1',
      filename: null,
      document_type: null,
      file_size: null,
      url: null,
      uploaded_at: null,
    });

    expect(doc.filename).toBe('Document');
    expect(doc.document_type).toBe('Other');
  });
});
