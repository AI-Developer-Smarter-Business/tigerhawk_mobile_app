import { isEmailLoginIdentifier } from '@/lib/auth/login-identifier';

describe('isEmailLoginIdentifier (A.2 bridge)', () => {
  it('treats values with @ as email path', () => {
    expect(isEmailLoginIdentifier('driver_test@test.com')).toBe(true);
    expect(isEmailLoginIdentifier(' thl-adacas ')).toBe(false);
  });
});
