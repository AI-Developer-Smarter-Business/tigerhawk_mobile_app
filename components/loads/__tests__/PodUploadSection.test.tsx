import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { PodUploadSection } from '@/components/loads/PodUploadSection';
import { strings } from '@/constants/strings';
import { prepareDriverUploadImage } from '@/lib/media/prepare-driver-upload-image';
import { pickLoadPhotoFromCamera } from '@/lib/media/pick-load-photo';
import { writeSignatureUploadFile } from '@/lib/media/signature-export';
import { validateDriverUploadFile } from '@/lib/media/validate-driver-upload-file';

jest.mock('@/context/NetworkContext', () => ({
  useNetwork: jest.fn(() => ({ isOffline: false, isReady: true })),
}));

jest.mock('@/components/loads/SignatureCaptureModal', () => {
  const React = require('react');
  const { Pressable } = require('react-native');
  return {
    SignatureCaptureModal: ({
      visible,
      onConfirm,
    }: {
      visible: boolean;
      onConfirm: (payload: string) => void;
    }) =>
      visible
        ? React.createElement(Pressable, {
            testID: 'mock-signature-confirm',
            onPress: () => onConfirm('data:image/png;base64,abc'),
          })
        : null,
  };
});

jest.mock('@/lib/media/pick-load-photo', () => ({
  pickLoadPhotoFromCamera: jest.fn(),
  pickLoadPhotoFromLibrary: jest.fn(),
}));

jest.mock('@/lib/media/prepare-driver-upload-image', () => ({
  prepareDriverUploadImage: jest.fn(),
}));

jest.mock('@/lib/media/signature-export', () => ({
  writeSignatureUploadFile: jest.fn(),
}));

jest.mock('@/lib/media/validate-driver-upload-file', () => ({
  validateDriverUploadFile: jest.fn(),
}));

const mockUseNetwork = jest.requireMock('@/context/NetworkContext').useNetwork as jest.Mock;
const mockPickCamera = pickLoadPhotoFromCamera as jest.MockedFunction<
  typeof pickLoadPhotoFromCamera
>;
const mockPrepare = prepareDriverUploadImage as jest.MockedFunction<
  typeof prepareDriverUploadImage
>;
const mockValidate = validateDriverUploadFile as jest.MockedFunction<typeof validateDriverUploadFile>;
const mockWriteSignature = writeSignatureUploadFile as jest.MockedFunction<
  typeof writeSignatureUploadFile
>;

const mappedFile = {
  uri: 'file:///picked.jpg',
  name: 'picked.jpg',
  type: 'image/jpeg',
  size: 2048,
};

const signatureFile = {
  uri: 'file:///signature.png',
  name: 'signature_load.png',
  type: 'image/png',
  size: 4096,
};

describe('PodUploadSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNetwork.mockReturnValue({ isOffline: false, isReady: true });
    mockPickCamera.mockResolvedValue({
      ok: true,
      asset: {
        uri: 'file:///picked.jpg',
        fileName: 'picked.jpg',
        mimeType: 'image/jpeg',
        width: 100,
        height: 100,
      },
    } as never);
    mockPrepare.mockResolvedValue(mappedFile);
    mockValidate.mockImplementation(() => undefined);
    mockWriteSignature.mockResolvedValue(signatureFile);
  });

  it('renders document type picker, Add photo, and Sign on device when online', () => {
    render(<PodUploadSection onUpload={jest.fn()} />);
    expect(screen.getByText(strings.loadDetail.documentTypeLabel)).toBeTruthy();
    expect(screen.getByText(strings.loadDetail.podAddPhoto)).toBeTruthy();
    expect(screen.getByText(strings.loadDetail.podSignOnDevice)).toBeTruthy();
  });

  it('shows offline queue hint when offline', () => {
    mockUseNetwork.mockReturnValue({ isOffline: true, isReady: true });

    render(<PodUploadSection onUpload={jest.fn()} />);

    expect(screen.getByText(strings.loadDetail.podOfflineQueueHint)).toBeTruthy();
    expect(screen.getByText(strings.loadDetail.podAddPhoto)).toBeTruthy();
    expect(screen.getByText(strings.loadDetail.podSignOnDevice)).toBeTruthy();
  });

  it('uploads selected document type after preview confirm', async () => {
    const onUpload = jest.fn().mockResolvedValue(undefined);

    render(<PodUploadSection onUpload={onUpload} />);

    fireEvent.press(screen.getByText(strings.loadDetail.documentTypePod));
    fireEvent.press(screen.getByText(strings.loadDetail.podAddPhoto));
    fireEvent.press(screen.getByText(strings.loadDetail.podPickCamera));

    await waitFor(() => {
      expect(screen.getByText(strings.loadDetail.podUpload)).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByText(strings.loadDetail.podUpload));
    });

    expect(mockValidate).toHaveBeenCalledWith(mappedFile);
    expect(onUpload).toHaveBeenCalledWith(mappedFile, 'POD');
    expect(screen.getByText(strings.loadDetail.podUploadSuccess)).toBeTruthy();
  });

  it('selects POD when Sign on device is opened', () => {
    render(<PodUploadSection onUpload={jest.fn()} />);

    fireEvent.press(screen.getByText(strings.loadDetail.podSignOnDevice));

    const podChip = screen.getByLabelText(strings.loadDetail.documentTypePod);
    expect(podChip.props.accessibilityState?.selected).toBe(true);
  });

  it('uploads signature as POD even if another type was selected before signing', async () => {
    const onUpload = jest.fn().mockResolvedValue(undefined);

    render(<PodUploadSection onUpload={onUpload} />);

    fireEvent.press(screen.getByText(strings.loadDetail.documentTypeDriver));
    fireEvent.press(screen.getByText(strings.loadDetail.podSignOnDevice));

    await waitFor(() => {
      expect(screen.getByTestId('mock-signature-confirm')).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId('mock-signature-confirm'));

    await waitFor(() => {
      expect(screen.getByText(strings.loadDetail.podUpload)).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByText(strings.loadDetail.podUpload));
    });

    expect(onUpload).toHaveBeenCalledWith(signatureFile, 'POD');
    expect(screen.getByText(strings.loadDetail.signatureUploadSuccess)).toBeTruthy();
  });

  it('shows permission error with Open Settings action', async () => {
    mockPickCamera.mockResolvedValue({
      ok: false,
      reason: 'permission_denied',
      canAskAgain: false,
    });

    render(<PodUploadSection onUpload={jest.fn()} />);

    fireEvent.press(screen.getByText(strings.loadDetail.podAddPhoto));
    fireEvent.press(screen.getByText(strings.loadDetail.podPickCamera));

    await waitFor(() => {
      expect(screen.getByText(strings.loadDetail.mediaPermissionDeniedTitle)).toBeTruthy();
      expect(screen.getByText(strings.loadDetail.mediaPermissionOpenSettings)).toBeTruthy();
    });
  });

  it('discards pending photo when user confirms discard sheet', async () => {
    render(<PodUploadSection onUpload={jest.fn()} />);

    fireEvent.press(screen.getByText(strings.loadDetail.podAddPhoto));
    fireEvent.press(screen.getByText(strings.loadDetail.podPickCamera));

    await waitFor(() => {
      expect(screen.getByText(strings.loadDetail.podCancel)).toBeTruthy();
    });

    fireEvent.press(screen.getByText(strings.loadDetail.podCancel));

    await waitFor(() => {
      expect(screen.getByText(strings.loadDetail.podDiscardConfirm)).toBeTruthy();
    });

    fireEvent.press(screen.getByText(strings.loadDetail.podDiscardConfirm));

    await waitFor(() => {
      expect(screen.getByText(strings.loadDetail.podAddPhoto)).toBeTruthy();
    });
  });
});
