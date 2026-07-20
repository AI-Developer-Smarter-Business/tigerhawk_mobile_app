import {
  formatMissingRequirement,
  formatMissingRequirementLine,
  formatMissingRequirements,
  hasTirPhotoRequirement,
} from '@/lib/loads/missing-requirement-labels';

describe('missing-requirement-labels (F.3 / H.2)', () => {
  it('maps known Complete missing keys to human labels', () => {
    expect(formatMissingRequirement('tir_out_photo')).toMatch(/TIR Out/i);
    expect(formatMissingRequirement('tir_in_photo')).toMatch(/TIR In/i);
    expect(formatMissingRequirement('chassis_number')).toMatch(/Chassis/i);
  });

  it('keeps unknown keys as-is for an exact checklist', () => {
    expect(formatMissingRequirement('custom_gate')).toBe('custom_gate');
  });

  it('includes the server key on each checklist line (H.2)', () => {
    expect(formatMissingRequirementLine('seal_number')).toBe(
      'Seal number (seal_number)',
    );
    expect(formatMissingRequirementLine('custom_gate')).toBe('custom_gate');
  });

  it('formats lists and detects TIR photo gaps', () => {
    expect(
      formatMissingRequirements(['seal_number', 'tir_in_photo']),
    ).toEqual([
      'Seal number (seal_number)',
      'TIR In photo (tir_in_photo)',
    ]);
    expect(hasTirPhotoRequirement(['tir_out_photo'])).toBe(true);
    expect(hasTirPhotoRequirement(['chassis_number'])).toBe(false);
  });
});
