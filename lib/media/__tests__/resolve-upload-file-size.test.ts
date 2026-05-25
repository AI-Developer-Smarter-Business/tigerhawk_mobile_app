import { resolveUploadFileSize } from '../resolve-upload-file-size';

const mockFileCtor = jest.fn();

jest.mock('expo-file-system', () => ({
  File: (...args: unknown[]) => mockFileCtor(...args),
}));

describe('resolveUploadFileSize', () => {
  beforeEach(() => {
    mockFileCtor.mockReset();
  });

  it('returns the descriptor unchanged when size is already set', async () => {
    const file = {
      uri: 'file:///pod.jpg',
      name: 'pod.jpg',
      type: 'image/jpeg',
      size: 4096,
    };

    await expect(resolveUploadFileSize(file)).resolves.toEqual(file);
    expect(mockFileCtor).not.toHaveBeenCalled();
  });

  it('reads size from expo File when picker omitted fileSize', async () => {
    mockFileCtor.mockImplementation((uri: string) => ({
      uri,
      exists: true,
      size: 8192,
    }));

    const result = await resolveUploadFileSize({
      uri: 'file:///photo.jpg',
      name: 'photo.jpg',
      type: 'image/jpeg',
      size: 0,
    });

    expect(mockFileCtor).toHaveBeenCalledWith('file:///photo.jpg');
    expect(result.size).toBe(8192);
  });

  it('keeps size 0 when File is missing or unreadable', async () => {
    mockFileCtor.mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const file = {
      uri: 'file:///missing.jpg',
      name: 'missing.jpg',
      type: 'image/jpeg',
      size: 0,
    };

    await expect(resolveUploadFileSize(file)).resolves.toEqual(file);
  });
});
