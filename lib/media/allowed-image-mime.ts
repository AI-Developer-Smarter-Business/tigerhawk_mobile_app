/** Image MIME types accepted for driver POD uploads (task 4.2; full policy in 4.3). */
export const DRIVER_POD_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
  'image/webp',
] as const;

export function isAllowedPodImageMime(mimeType: string | null | undefined): boolean {
  if (!mimeType) return true;
  const normalized = mimeType.toLowerCase();
  return (DRIVER_POD_IMAGE_MIME_TYPES as readonly string[]).includes(normalized);
}
