import * as fs from 'node:fs';
import * as path from 'node:path';

const root = path.join(__dirname, '..', '..', '..');

function read(relativePath: string): string {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('release QA preflight (7.1 / 7.2)', () => {
  it('documents release sign-off and release notes exist', () => {
    expect(fs.existsSync(path.join(root, 'docs', 'QA_RELEASE_SIGNOFF_7_1.md'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'docs', 'RELEASE_NOTES_0_1_0.md'))).toBe(true);
  });

  it('package.json exposes qa:7.1 and Android EAS build scripts', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.scripts['qa:7.1']).toContain('qa-preflight-7-1');
    expect(pkg.scripts['build:preflight']).toContain('eas-build-preflight');
    expect(pkg.scripts['build:android:preview']).toContain('eas build');
    expect(pkg.scripts['build:android:production']).toContain('eas build');
  });

  it('eas.json defines preview and production Android APK profiles', () => {
    const eas = JSON.parse(read('eas.json'));
    expect(eas.build.preview.android.buildType).toBe('apk');
    expect(eas.build.production.android.buildType).toBe('apk');
    expect(eas.build.preview.env).toBeUndefined();
  });

  it('app.json version aligns with package and driver routes exist', () => {
    const pkg = JSON.parse(read('package.json'));
    const app = JSON.parse(read('app.json'));
    expect(app.expo.version).toBe(pkg.version);
    expect(app.expo.android.package).toBe('com.tigerhawk.mobile');
    expect(fs.existsSync(path.join(root, 'app', 'load', '[id].tsx'))).toBe(true);
  });

  it('MOBILE_BUILDS references 7.1 sign-off and 7.2 release notes', () => {
    const doc = read('docs/MOBILE_BUILDS.md');
    expect(doc).toContain('QA_RELEASE_SIGNOFF_7_1');
    expect(doc).toContain('RELEASE_NOTES_0_1_0');
  });

  it('release handoff docs exist for 7.3–7.5', () => {
    expect(fs.existsSync(path.join(root, 'CHANGELOG.md'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'docs', 'VERSIONING.md'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'docs', 'BUG_REPORTING.md'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'docs', 'ROLLBACK_PP2.md'))).toBe(true);
    expect(fs.existsSync(path.join(root, 'docs', 'EAS_CREDENTIALS_HANDOFF_7_5.md'))).toBe(true);
  });
});
