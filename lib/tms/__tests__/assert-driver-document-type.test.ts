import {
  normalizeDriverUploadDocumentType,
  assertDriverUploadDocumentType,
  isDriverUploadDocumentType,
} from '@/lib/tms/assert-driver-document-type';

describe('assert-driver-document-type (F.4 / F.5)', () => {
  it('allows TIR Out and TIR In exact strings', () => {
    expect(isDriverUploadDocumentType('TIR Out')).toBe(true);
    expect(isDriverUploadDocumentType('TIR In')).toBe(true);
    expect(() => assertDriverUploadDocumentType('TIR Out')).not.toThrow();
    expect(() => assertDriverUploadDocumentType('TIR In')).not.toThrow();
  });

  it('rejects staff-only types before network', () => {
    expect(() => assertDriverUploadDocumentType('Invoice')).toThrow(
      /TIR Out|TIR In|Driver|Photo/,
    );
  });

  it('normalizes POD photo label to Driver evidence', () => {
    expect(normalizeDriverUploadDocumentType('POD')).toBe('Driver');
    expect(normalizeDriverUploadDocumentType('TIR Out')).toBe('TIR Out');
    expect(normalizeDriverUploadDocumentType('TIR In')).toBe('TIR In');
  });
});
