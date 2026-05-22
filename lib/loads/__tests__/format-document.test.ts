import { formatFileSize } from '../format-document';

describe('formatFileSize', () => {
  it('formats bytes and kilobytes', () => {
    expect(formatFileSize(null)).toBe('—');
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(57344)).toBe('56.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});
