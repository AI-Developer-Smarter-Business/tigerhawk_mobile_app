import {
  assertUploadResponseMatchesLoad,
  documentBelongsToLoad,
  filterDocumentsForExpectedLoad,
  normalizeLoadIdParam,
  storagePathMatchesLoad,
} from '../document-load-association';

describe('normalizeLoadIdParam', () => {
  it('trims and returns id', () => {
    expect(normalizeLoadIdParam('  abc  ')).toBe('abc');
  });

  it('returns null for blank', () => {
    expect(normalizeLoadIdParam('')).toBeNull();
    expect(normalizeLoadIdParam(undefined)).toBeNull();
  });
});

describe('documentBelongsToLoad', () => {
  it('matches load_id', () => {
    expect(
      documentBelongsToLoad({ load_id: 'load-1' }, 'load-1'),
    ).toBe(true);
  });
});

describe('storagePathMatchesLoad', () => {
  it('accepts missing path', () => {
    expect(storagePathMatchesLoad(null, 'load-1')).toBe(true);
  });

  it('requires prefix', () => {
    expect(storagePathMatchesLoad('load-1/pod.jpg', 'load-1')).toBe(true);
    expect(storagePathMatchesLoad('other/pod.jpg', 'load-1')).toBe(false);
  });
});

describe('filterDocumentsForExpectedLoad', () => {
  it('drops rows for another load', () => {
    const result = filterDocumentsForExpectedLoad(
      [
        { id: 'a', load_id: 'load-1', storage_path: 'load-1/a.pdf' },
        { id: 'b', load_id: 'load-2', storage_path: 'load-2/b.pdf' },
      ],
      'load-1',
    );
    expect(result.documents).toHaveLength(1);
    expect(result.documents[0].id).toBe('a');
    expect(result.droppedCount).toBe(1);
  });
});

describe('assertUploadResponseMatchesLoad', () => {
  it('throws on mismatch', () => {
    expect(() =>
      assertUploadResponseMatchesLoad({ load_id: 'other' }, 'load-1'),
    ).toThrow(/does not match/);
  });
});
