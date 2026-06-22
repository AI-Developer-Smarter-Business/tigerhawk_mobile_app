jest.mock('@/lib/config/env', () => ({
  env: { tmsApiUrl: 'https://tms.example.com' },
}));

import { MOCK_LOAD_TRANSITIONS } from '@/lib/loads/constants';
import { normalizeLoadTransitionMap } from '@/lib/tms/fetch-load-transitions';

describe('normalizeLoadTransitionMap', () => {
  it('keeps Arrived At Delivery from In Transit', () => {
    const map = normalizeLoadTransitionMap({
      'In Transit': ['Arrived At Delivery', 'Delivered', 'Unknown Status'],
    });
    expect(map['In Transit']).toContain('Arrived At Delivery');
    expect(map['In Transit']).not.toContain('Unknown Status' as never);
  });

  it('falls back to defaults for unknown from-status keys', () => {
    const map = normalizeLoadTransitionMap({
      Pending: ['In Transit'],
    });
    expect(map['In Transit']).toEqual(MOCK_LOAD_TRANSITIONS['In Transit']);
  });
});
