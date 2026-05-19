import { assertDriverFieldStatusTarget } from '../assert-driver-status';
import { TmsStatusChangeError } from '../errors';

describe('assertDriverFieldStatusTarget', () => {
  it('allows driver field status', () => {
    expect(() => assertDriverFieldStatusTarget('In Transit')).not.toThrow();
  });

  it('rejects Completed', () => {
    expect(() => assertDriverFieldStatusTarget('Completed')).toThrow(
      TmsStatusChangeError,
    );
    try {
      assertDriverFieldStatusTarget('Completed');
    } catch (error) {
      expect((error as TmsStatusChangeError).code).toBe('FORBIDDEN');
    }
  });

  it('rejects Dispatched', () => {
    expect(() => assertDriverFieldStatusTarget('Dispatched')).toThrow(
      TmsStatusChangeError,
    );
  });
});
