import Constants from 'expo-constants';

/** Host part only — localhost or 127.0.0.1 */
export const LOCALHOST_HOST_PATTERN = /^(localhost|127\.0\.0\.1)$/i;

/** TMS base URL pointing at loopback on the dev machine */
export const LOCALHOST_TMS_URL_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/i;

/**
 * LAN IP of the PC running Metro, when the app is opened via Expo Go / dev client.
 * Same machine that should serve `npm run dev` for the TMS on port 3000.
 */
export function getExpoDevMachineHost(): string | null {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0]?.trim();
    if (host) return host;
  }

  const legacyDebuggerHost =
    Constants.expoGoConfig?.debuggerHost ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (legacyDebuggerHost) {
    return legacyDebuggerHost.split(':')[0]?.trim() ?? null;
  }

  return null;
}

/**
 * In dev, replace `localhost` in the TMS URL with the Metro host IP so a physical
 * phone on the same Wi‑Fi can reach the local Next.js server.
 */
export function resolveTmsApiUrlForDevice(
  configuredUrl: string,
  options?: { devMachineHost?: string | null; isDev?: boolean },
): string {
  const trimmed = configuredUrl.trim();
  if (!trimmed || !LOCALHOST_TMS_URL_PATTERN.test(trimmed)) {
    return trimmed;
  }

  const isDev = options?.isDev ?? (typeof __DEV__ !== 'undefined' && __DEV__);
  if (!isDev) return trimmed;

  const host = (options?.devMachineHost ?? getExpoDevMachineHost())?.trim();
  if (!host || LOCALHOST_HOST_PATTERN.test(host)) {
    return trimmed;
  }

  return trimmed.replace(
    /^(https?:\/\/)(localhost|127\.0\.0\.1)/i,
    `$1${host}`,
  );
}
