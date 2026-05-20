import { canOptimisticallyUpdateLoadStatus } from '@/lib/loads/optimistic-status';
import type { LoadStatus } from '@/types';

describe('canOptimisticallyUpdateLoadStatus', () => {
  it('allows valid driver-field transitions without holds', () => {
    expect(
      canOptimisticallyUpdateLoadStatus({
        from: 'Dispatched',
        to: 'In Transit',
        activeHolds: [],
      }),
    ).toBe(true);
  });

  it('blocks when active holds are present', () => {
    expect(
      canOptimisticallyUpdateLoadStatus({
        from: 'Dispatched',
        to: 'In Transit',
        activeHolds: ['freight_hold'],
      }),
    ).toBe(false);
  });

  it('blocks invalid transitions', () => {
    expect(
      canOptimisticallyUpdateLoadStatus({
        from: 'Assigned',
        to: 'In Transit',
        activeHolds: [],
      }),
    ).toBe(false);
  });

  it('blocks non–driver-field targets', () => {
    expect(
      canOptimisticallyUpdateLoadStatus({
        from: 'Arrived At Pickup',
        to: 'Dispatched' as LoadStatus,
        activeHolds: [],
      }),
    ).toBe(false);
  });
});
