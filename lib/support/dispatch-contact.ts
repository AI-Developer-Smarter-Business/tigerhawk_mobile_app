import { Linking } from 'react-native';

/**
 * Public dispatch contacts (EAS / .env.local).
 * Phone is optional; email composer always opens so Contact dispatch can launch an app (J.5).
 */
export function getDispatchPhone(): string {
  return (process.env.EXPO_PUBLIC_DISPATCH_PHONE ?? '').trim();
}

export function getDispatchEmail(): string {
  return (process.env.EXPO_PUBLIC_DISPATCH_EMAIL ?? '').trim();
}

export function hasDispatchPhone(): boolean {
  return getDispatchPhone().length > 0;
}

function digitsForTel(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/** Opens the device dialer when `EXPO_PUBLIC_DISPATCH_PHONE` is set. */
export async function openDispatchPhone(): Promise<void> {
  const phone = getDispatchPhone();
  if (!phone) {
    throw new Error('DISPATCH_PHONE_MISSING');
  }
  await Linking.openURL(`tel:${digitsForTel(phone)}`);
}

/**
 * Opens the mail app. Uses `EXPO_PUBLIC_DISPATCH_EMAIL` as To when set;
 * otherwise opens a blank composer with subject/body so the driver can send to dispatch.
 */
export async function openDispatchEmail(
  subject?: string,
  body?: string,
): Promise<void> {
  const email = getDispatchEmail();
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString();
  const url = query ? `mailto:${email}?${query}` : `mailto:${email}`;
  await Linking.openURL(url);
}
