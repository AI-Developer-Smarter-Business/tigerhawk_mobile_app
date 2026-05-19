import { queryKeys } from '../query-keys';

describe('queryKeys', () => {
  it('builds stable hierarchical keys for loads', () => {
    const userId = 'user-1';
    const loadId = 'load-9';

    expect(queryKeys.loads.list(userId)).toEqual(['pp2', 'loads', userId, 'list']);
    expect(queryKeys.loads.detail(userId, loadId)).toEqual([
      'pp2',
      'loads',
      userId,
      'detail',
      loadId,
    ]);
    expect(queryKeys.loads.all(userId)).toEqual(['pp2', 'loads', userId]);
  });
});
