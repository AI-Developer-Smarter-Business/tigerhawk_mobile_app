import { isNetworkFailure, isOfflineFromNetInfo } from '../network-state';

describe('isOfflineFromNetInfo', () => {
  it('is offline when not connected', () => {
    expect(
      isOfflineFromNetInfo({
        isConnected: false,
        isInternetReachable: true,
      } as never),
    ).toBe(true);
  });

  it('is offline when internet is not reachable', () => {
    expect(
      isOfflineFromNetInfo({
        isConnected: true,
        isInternetReachable: false,
      } as never),
    ).toBe(true);
  });

  it('is online when connected and reachable', () => {
    expect(
      isOfflineFromNetInfo({
        isConnected: true,
        isInternetReachable: true,
      } as never),
    ).toBe(false);
  });
});

describe('isNetworkFailure', () => {
  it('detects React Native fetch failures', () => {
    expect(isNetworkFailure(new Error('Network request failed'))).toBe(true);
  });

  it('ignores unrelated errors', () => {
    expect(isNetworkFailure(new Error('permission denied'))).toBe(false);
  });
});
