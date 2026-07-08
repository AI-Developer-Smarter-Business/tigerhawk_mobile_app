import * as fs from 'node:fs';
import * as path from 'node:path';

import { strings } from '../strings';

describe('strings loadDetail driver evidence (6.5)', () => {
  it('driverEvidenceHint covers delivery docs, photo and complementary signature', () => {
    const hint = strings.loadDetail.driverEvidenceHint.toLowerCase();
    expect(hint).toContain('photo');
    expect(hint).toContain('signature');
    expect(hint).toMatch(/complementary|both|or only one/);
    expect(hint).toMatch(/document/);
  });

  it('podConfirmHint mentions uploading again for additional files', () => {
    const hint = strings.loadDetail.podConfirmHint.toLowerCase();
    expect(hint).toMatch(/another file|photo or signature/);
  });

  it('exposes Sign on device copy for receipt signature (SIG.5)', () => {
    expect(strings.loadDetail.podSignOnDevice).toMatch(/sign on device/i);
    expect(strings.loadDetail.signatureLegalHint.length).toBeGreaterThan(20);
  });

  it('does not expose TMS patch pending placeholder keys or copy', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'strings.ts'), 'utf8');
    expect(source).not.toMatch(/patch pending/i);
    expect(source).not.toContain('driverUploadTmsRequired');
    expect(source).not.toContain('podNote');
  });
});
