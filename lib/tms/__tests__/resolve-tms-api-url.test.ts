import {
  getExpoDevMachineHost,
  LOCALHOST_TMS_URL_PATTERN,
  resolveTmsApiUrlForDevice,
} from '../resolve-tms-api-url';

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: { hostUri: '192.168.0.42:8081' },
    expoGoConfig: undefined,
    manifest2: undefined,
  },
}));

describe('resolveTmsApiUrlForDevice', () => {
  it('rewrites localhost to Metro host IP in dev', () => {
    expect(
      resolveTmsApiUrlForDevice('http://localhost:3000', {
        isDev: true,
        devMachineHost: '192.168.0.42',
      }),
    ).toBe('http://192.168.0.42:3000');
  });

  it('leaves non-localhost URLs unchanged', () => {
    expect(
      resolveTmsApiUrlForDevice('https://tms.example.com', { isDev: true }),
    ).toBe('https://tms.example.com');
  });

  it('does not rewrite in production builds', () => {
    expect(
      resolveTmsApiUrlForDevice('http://localhost:3000', {
        isDev: false,
        devMachineHost: '192.168.0.42',
      }),
    ).toBe('http://localhost:3000');
  });

  it('uses expo hostUri when devMachineHost omitted', () => {
    expect(resolveTmsApiUrlForDevice('http://localhost:3000', { isDev: true })).toBe(
      'http://192.168.0.42:3000',
    );
  });
});

describe('getExpoDevMachineHost', () => {
  it('reads host from expoConfig.hostUri', () => {
    expect(getExpoDevMachineHost()).toBe('192.168.0.42');
  });
});

describe('LOCALHOST_TMS_URL_PATTERN', () => {
  it('matches localhost TMS bases', () => {
    expect(LOCALHOST_TMS_URL_PATTERN.test('http://localhost:3000')).toBe(true);
    expect(LOCALHOST_TMS_URL_PATTERN.test('http://192.168.1.1:3000')).toBe(false);
  });
});
