import * as fs from 'node:fs';
import * as path from 'node:path';

import { strings } from '../strings';

describe('strings loadDetail driver evidence (F.5)', () => {
  it('driverEvidenceHint covers optional photos and points legal POD to Sign on device', () => {
    const hint = strings.loadDetail.driverEvidenceHint.toLowerCase();
    expect(hint).toContain('photo');
    expect(hint).toContain('sign on device');
    expect(hint).toMatch(/legal|pod/);
  });

  it('exposes PortPro document row labels (F.1)', () => {
    expect(strings.loadDetail.tirOutRow).toBe('TIR Out');
    expect(strings.loadDetail.tirInRow).toBe('TIR In');
    expect(strings.loadDetail.podSignRow).toMatch(/Proof of Delivery/i);
  });

  it('exposes Sign on device copy for receipt signature', () => {
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
