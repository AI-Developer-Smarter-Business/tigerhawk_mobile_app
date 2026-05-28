import { isProfileGateLoading } from '../profile-gate-loading';
import type { UserProfile } from '@/types/profile';

const driver: UserProfile = {
  id: 'u1',
  role: 'driver',
  full_name: 'D',
  email: 'd@test.com',
  phone: null,
};

describe('isProfileGateLoading', () => {
  it('blocks when not initialized', () => {
    expect(isProfileGateLoading(false, false, null)).toBe(true);
  });

  it('blocks only when fetching without a cached profile', () => {
    expect(isProfileGateLoading(true, true, null)).toBe(true);
    expect(isProfileGateLoading(true, true, driver)).toBe(false);
  });

  it('does not block after profile is loaded', () => {
    expect(isProfileGateLoading(true, false, driver)).toBe(false);
  });
});
