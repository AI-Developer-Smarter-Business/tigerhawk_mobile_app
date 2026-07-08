import {
  base64ToUint8Array,
  buildSignatureFileName,
  stripDataUrlBase64,
} from '@/lib/media/signature-export';

describe('signature-export (SIG.2)', () => {
  it('strips data URL prefix and whitespace', () => {
    expect(stripDataUrlBase64('data:image/png;base64,YWJj\n')).toBe('YWJj');
    expect(stripDataUrlBase64('  YWJj  ')).toBe('YWJj');
  });

  it('builds a safe signature file name with timestamp', () => {
    const name = buildSignatureFileName('TH-2026/0001');
    expect(name).toMatch(/^signature_TH-2026_0001_\d+\.png$/);
  });

  it('falls back when load ref is empty', () => {
    expect(buildSignatureFileName('')).toMatch(/^signature_load_\d+\.png$/);
  });

  it('decodes base64 to bytes', () => {
    const bytes = base64ToUint8Array('data:image/png;base64,QQ==');
    expect(bytes).toEqual(Uint8Array.from([0x41]));
  });

  it('rejects empty payload', () => {
    expect(() => base64ToUint8Array('')).toThrow(/Empty signature/i);
  });
});
