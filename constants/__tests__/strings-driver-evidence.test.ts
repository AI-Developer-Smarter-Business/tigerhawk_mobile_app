import * as fs from 'node:fs';
import * as path from 'node:path';

import { strings } from '../strings';

describe('strings loadDetail driver evidence (6.5)', () => {
  it('driverEvidenceHint covers delivery, seal, delay, incidents, and one-at-a-time uploads', () => {
    const hint = strings.loadDetail.driverEvidenceHint.toLowerCase();
    expect(hint).toContain('delivery');
    expect(hint).toContain('seal');
    expect(hint).toContain('delay');
    expect(hint).toMatch(/incident|damage/);
    expect(hint).toMatch(/document/);
    expect(hint).toMatch(/one file at a time|one at a time/);
  });

  it('podConfirmHint mentions uploading again for additional files', () => {
    const hint = strings.loadDetail.podConfirmHint.toLowerCase();
    expect(hint).toMatch(/upload again|another file/);
  });

  it('does not expose TMS patch pending placeholder keys or copy', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'strings.ts'), 'utf8');
    expect(source).not.toMatch(/patch pending/i);
    expect(source).not.toContain('driverUploadTmsRequired');
    expect(source).not.toContain('podNote');
  });
});
