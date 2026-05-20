import { orderLoadListRowsByIds } from '../fetch-driver-loads-page';
import { createLoadListRow } from './fixtures/load-list-row';

describe('orderLoadListRowsByIds', () => {
  it('returns one row per id in page order', () => {
    const rows = [
      createLoadListRow({ id: 'b', reference_number: 'B' }),
      createLoadListRow({ id: 'a', reference_number: 'A' }),
      createLoadListRow({ id: 'a', reference_number: 'A_DUP' }),
    ];
    const ordered = orderLoadListRowsByIds(['a', 'b'], rows);
    expect(ordered).toHaveLength(2);
    expect(ordered[0].id).toBe('a');
    expect(ordered[0].reference_number).toBe('A');
    expect(ordered[1].id).toBe('b');
  });
});
