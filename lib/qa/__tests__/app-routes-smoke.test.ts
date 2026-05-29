import * as fs from 'node:fs';
import * as path from 'node:path';

const ROOT = path.join(__dirname, '..', '..', '..');

const REQUIRED_ROUTES = [
  'app/index.tsx',
  'app/(auth)/login.tsx',
  'app/(auth)/_layout.tsx',
  'app/(drawer)/loads.tsx',
  'app/(drawer)/account.tsx',
  'app/(drawer)/_layout.tsx',
  'app/load/[id].tsx',
  'app/auth/callback.tsx',
  'app/_layout.tsx',
] as const;

describe('app routes smoke (5.7)', () => {
  it.each(REQUIRED_ROUTES)('exists %s', (routePath) => {
    expect(fs.existsSync(path.join(ROOT, routePath))).toBe(true);
  });

  it('drawer layout wires auth redirect and screens', () => {
    const source = fs.readFileSync(
      path.join(ROOT, 'app', '(drawer)', '_layout.tsx'),
      'utf8',
    );
    expect(source).toContain('Redirect');
    expect(source).toContain('loads');
    expect(source).toContain('account');
  });

  it('root layout wires driver loads realtime bridge after auth bootstrap', () => {
    const source = fs.readFileSync(path.join(ROOT, 'app', '_layout.tsx'), 'utf8');
    expect(source).toContain('DriverLoadsRealtimeBridge');
    expect(source).toContain('AuthBootstrapGate');
  });

  it('root index redirects authenticated users to loads', () => {
    const source = fs.readFileSync(path.join(ROOT, 'app', 'index.tsx'), 'utf8');
    expect(source).toContain('/(drawer)/loads');
  });
});
