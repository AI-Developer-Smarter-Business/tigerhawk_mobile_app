import { applyProfileFetchResult } from '../apply-profile-fetch-result';
import type { UserProfile } from '@/types/profile';

const driverProfile: UserProfile = {
  id: 'user-1',
  role: 'driver',
  full_name: 'Test Driver',
  email: 'driver@test.com',
  phone: null,
};

describe('applyProfileFetchResult', () => {
  it('replaces profile on success', () => {
    const applied = applyProfileFetchResult(null, {
      profile: driverProfile,
      errorMessage: null,
    });
    expect(applied.profile).toEqual(driverProfile);
    expect(applied.error).toBeNull();
  });

  it('keeps previous profile on network failure without surfacing error', () => {
    const applied = applyProfileFetchResult(driverProfile, {
      profile: null,
      errorMessage: 'Network request failed',
    });
    expect(applied.profile).toEqual(driverProfile);
    expect(applied.error).toBeNull();
  });

  it('clears profile on non-network errors', () => {
    const applied = applyProfileFetchResult(driverProfile, {
      profile: null,
      errorMessage: 'Profile not found in user_profiles.',
    });
    expect(applied.profile).toBeNull();
    expect(applied.error).toContain('Profile not found');
  });
});
