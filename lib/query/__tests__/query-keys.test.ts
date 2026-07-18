import { queryKeys } from '../query-keys';

describe('queryKeys', () => {
  it('builds stable hierarchical keys for loads', () => {
    const userId = 'user-1';
    const loadId = 'load-9';

    expect(queryKeys.loads.list(userId)).toEqual(['pp2', 'loads', userId, 'list']);
    expect(queryKeys.loads.mobileBuckets(userId)).toEqual([
      'pp2',
      'loads',
      userId,
      'mobile-buckets',
    ]);
    expect(queryKeys.loads.mobileHistory(userId, '2026-07-11', '2026-07-12', 'THWK')).toEqual([
      'pp2',
      'loads',
      userId,
      'mobile-history',
      '2026-07-11',
      '2026-07-12',
      'THWK',
    ]);
    expect(queryKeys.loads.detail(userId, loadId)).toEqual([
      'pp2',
      'loads',
      userId,
      'detail',
      loadId,
      '',
    ]);
    expect(queryKeys.loads.detail(userId, loadId, 'move-2')).toEqual([
      'pp2',
      'loads',
      userId,
      'detail',
      loadId,
      'move-2',
    ]);
    expect(queryKeys.loads.progress(userId, loadId)).toEqual([
      'pp2',
      'loads',
      userId,
      'progress',
      loadId,
    ]);
    expect(queryKeys.loads.all(userId)).toEqual(['pp2', 'loads', userId]);
  });
});
