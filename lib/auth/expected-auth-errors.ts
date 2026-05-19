/** Supabase Auth messages that are normal user mistakes — do not treat as app errors. */
const EXPECTED_AUTH_MESSAGE =
  /invalid login credentials|invalid email or password|email not confirmed|user not found/i;

export function isExpectedAuthError(message: string): boolean {
  return EXPECTED_AUTH_MESSAGE.test(message);
}
