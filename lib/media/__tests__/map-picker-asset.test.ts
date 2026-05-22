import { TmsDocumentUploadError } from '@/lib/tms/document-errors';

import { isAllowedPodImageMime } from '../allowed-image-mime';
import { mapPickerAssetToUploadFile } from '../map-picker-asset';

describe('isAllowedPodImageMime', () => {
  it('allows common POD image types', () => {
    expect(isAllowedPodImageMime('image/jpeg')).toBe(true);
    expect(isAllowedPodImageMime('image/png')).toBe(true);
    expect(isAllowedPodImageMime(null)).toBe(true);
  });

  it('rejects non-image mime', () => {
    expect(isAllowedPodImageMime('application/pdf')).toBe(false);
  });
});

describe('mapPickerAssetToUploadFile', () => {
  it('maps picker asset to TMS upload descriptor', () => {
    expect(
      mapPickerAssetToUploadFile({
        uri: 'file:///photo.jpg',
        width: 100,
        height: 100,
        fileName: 'delivery.jpg',
        mimeType: 'image/jpeg',
        fileSize: 4096,
      }),
    ).toEqual({
      uri: 'file:///photo.jpg',
      name: 'delivery.jpg',
      type: 'image/jpeg',
      size: 4096,
    });
  });

  it('rejects disallowed mime before upload', () => {
    expect(() =>
      mapPickerAssetToUploadFile({
        uri: 'file:///doc.pdf',
        width: 0,
        height: 0,
        mimeType: 'application/pdf',
        fileSize: 100,
      }),
    ).toThrow(TmsDocumentUploadError);
  });
});
