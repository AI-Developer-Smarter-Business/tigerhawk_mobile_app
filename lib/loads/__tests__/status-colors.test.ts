import { PP2Theme } from '@/constants/theme';
import type { LoadStatus } from '@/types';

import { getLoadStatusColors } from '../status-colors';

describe('getLoadStatusColors', () => {
  it('uses light green for Completed (success-style pill)', () => {
    const colors = getLoadStatusColors('Completed');
    expect(colors.background).toBe('#DCFCE7');
    expect(colors.text).toBe('#15803D');
    expect(colors.border).toBe('#86EFAC');
  });

  it('uses soft red for Cancelled', () => {
    const colors = getLoadStatusColors('Cancelled');
    expect(colors.background).toBe(PP2Theme.colors.errorSurface);
    expect(colors.text).toBe(PP2Theme.colors.error);
    expect(colors.border).toBe(PP2Theme.colors.errorBorder);
  });

  it('uses purple tones for Dispatched', () => {
    const colors = getLoadStatusColors('Dispatched');
    expect(colors.text).toBe('#6D28D9');
    expect(colors.background).toContain('F5F3FF');
  });

  it('uses blue tones for Assigned', () => {
    const colors = getLoadStatusColors('Assigned');
    expect(colors.text).toBe('#1D4ED8');
  });

  it('uses orange accent for In Transit', () => {
    const colors = getLoadStatusColors('In Transit');
    expect(colors.background).toBe(PP2Theme.colors.accentMuted);
    expect(colors.text).toBe('#C2410C');
  });

  it('returns neutral fallback for unknown status at runtime', () => {
    const colors = getLoadStatusColors('Unknown Status' as LoadStatus);
    expect(colors.text).toBe(PP2Theme.colors.textMuted);
  });
});
