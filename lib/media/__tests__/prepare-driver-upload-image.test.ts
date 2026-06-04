import type { ImagePickerAsset } from 'expo-image-picker';
import { Platform } from 'react-native';

import {
  prepareDriverUploadImage,
  shouldPrepareDriverUploadImage,
} from '../prepare-driver-upload-image';
import { resolveUploadFileSize } from '../resolve-upload-file-size';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(async (uri: string) => ({
    uri: `${uri}?compressed`,
    width: 1200,
    height: 900,
  })),
  SaveFormat: { JPEG: 'jpeg' },
}));

jest.mock('../resolve-upload-file-size', () => ({
  resolveUploadFileSize: jest.fn(async (file: { size: number }) => ({
    ...file,
    size: file.size > 0 ? file.size : 500_000,
  })),
}));

const mockManipulate = jest.requireMock('expo-image-manipulator')
  .manipulateAsync as jest.Mock;

function asset(overrides: Partial<ImagePickerAsset> = {}): ImagePickerAsset {
  return {
    uri: 'file:///photo.jpg',
    width: 800,
    height: 600,
    mimeType: 'image/jpeg',
    fileName: 'photo.jpg',
    fileSize: 400_000,
    ...overrides,
  } as ImagePickerAsset;
}

describe('shouldPrepareDriverUploadImage', () => {
  const originalOS = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('returns false on web', () => {
    Platform.OS = 'web';
    expect(shouldPrepareDriverUploadImage(asset({ width: 4000, height: 3000 }), 5_000_000)).toBe(
      false,
    );
  });

  it('returns true for HEIC', () => {
    Platform.OS = 'ios';
    expect(shouldPrepareDriverUploadImage(asset({ mimeType: 'image/heic' }), 100_000)).toBe(true);
  });

  it('returns true when edge exceeds max', () => {
    Platform.OS = 'android';
    expect(
      shouldPrepareDriverUploadImage(asset({ width: 3000, height: 2000 }), 100_000),
    ).toBe(true);
  });

  it('returns true when file is large without huge dimensions', () => {
    Platform.OS = 'android';
    expect(shouldPrepareDriverUploadImage(asset(), 2_000_000)).toBe(true);
  });

  it('returns false for small JPEG within limits', () => {
    Platform.OS = 'android';
    expect(shouldPrepareDriverUploadImage(asset(), 400_000)).toBe(false);
  });
});

describe('prepareDriverUploadImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Platform.OS = 'android';
  });

  it('skips manipulator for small images', async () => {
    const result = await prepareDriverUploadImage(asset());

    expect(mockManipulate).not.toHaveBeenCalled();
    expect(result.uri).toBe('file:///photo.jpg');
    expect(result.type).toBe('image/jpeg');
    expect(resolveUploadFileSize).toHaveBeenCalled();
  });

  it('resizes and re-encodes large images', async () => {
    const result = await prepareDriverUploadImage(
      asset({ width: 4032, height: 3024, fileSize: 4_000_000 }),
    );

    expect(mockManipulate).toHaveBeenCalled();
    expect(result.uri).toContain('compressed');
    expect(result.type).toBe('image/jpeg');
    expect(result.name).toMatch(/\.jpg$/i);
  });
});
