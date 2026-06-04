import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { PodUploadSection } from '@/components/loads/PodUploadSection';
import { strings } from '@/constants/strings';
import { prepareDriverUploadImage } from '@/lib/media/prepare-driver-upload-image';
import {
  pickLoadPhotoFromCamera,
  showLoadPhotoSourcePicker,
} from '@/lib/media/pick-load-photo';
import { validateDriverUploadFile } from '@/lib/media/validate-driver-upload-file';

jest.mock('@/context/NetworkContext', () => ({
  useNetwork: jest.fn(() => ({ isOffline: false, isReady: true })),
}));

jest.mock('@/lib/media/pick-load-photo', () => ({
  pickLoadPhotoFromCamera: jest.fn(),
  pickLoadPhotoFromLibrary: jest.fn(),
  showLoadPhotoSourcePicker: jest.fn(),
}));

jest.mock('@/lib/media/prepare-driver-upload-image', () => ({
  prepareDriverUploadImage: jest.fn(),
}));

jest.mock('@/lib/media/validate-driver-upload-file', () => ({
  validateDriverUploadFile: jest.fn(),
}));

const mockUseNetwork = jest.requireMock('@/context/NetworkContext').useNetwork as jest.Mock;
const mockShowPicker = showLoadPhotoSourcePicker as jest.MockedFunction<
  typeof showLoadPhotoSourcePicker
>;
const mockPickCamera = pickLoadPhotoFromCamera as jest.MockedFunction<
  typeof pickLoadPhotoFromCamera
>;
const mockPrepare = prepareDriverUploadImage as jest.MockedFunction<
  typeof prepareDriverUploadImage
>;
const mockValidate = validateDriverUploadFile as jest.MockedFunction<typeof validateDriverUploadFile>;

const mappedFile = {
  uri: 'file:///picked.jpg',
  name: 'picked.jpg',
  type: 'image/jpeg',
  size: 2048,
};

describe('PodUploadSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNetwork.mockReturnValue({ isOffline: false, isReady: true });
    mockShowPicker.mockImplementation(({ onCamera }) => {
      onCamera();
    });
    mockPickCamera.mockResolvedValue({
      uri: 'file:///picked.jpg',
      fileName: 'picked.jpg',
      mimeType: 'image/jpeg',
      width: 100,
      height: 100,
    } as never);
    mockPrepare.mockResolvedValue(mappedFile);
    mockValidate.mockImplementation(() => undefined);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders Add driver photo when online', () => {
    render(<PodUploadSection onUpload={jest.fn()} />);
    expect(screen.getByText(strings.loadDetail.podAddPhoto)).toBeTruthy();
  });

  it('shows offline hint and disables add when offline', () => {
    mockUseNetwork.mockReturnValue({ isOffline: true, isReady: true });

    render(<PodUploadSection onUpload={jest.fn()} />);

    expect(screen.getByText(strings.loadDetail.podOfflineHint)).toBeTruthy();
    const addButtons = screen.getAllByLabelText(strings.loadDetail.podAddPhotoA11y);
    expect(addButtons.some((node) => node.props.accessibilityState?.disabled === true)).toBe(
      true,
    );
    expect(mockShowPicker).not.toHaveBeenCalled();
  });

  it('uploads after preview confirm', async () => {
    const onUpload = jest.fn().mockResolvedValue(undefined);

    render(<PodUploadSection onUpload={onUpload} />);

    fireEvent.press(screen.getByText(strings.loadDetail.podAddPhoto));

    await waitFor(() => {
      expect(screen.getByText(strings.loadDetail.podUpload)).toBeTruthy();
    });

    await act(async () => {
      fireEvent.press(screen.getByText(strings.loadDetail.podUpload));
    });

    expect(mockValidate).toHaveBeenCalledWith(mappedFile);
    expect(onUpload).toHaveBeenCalledWith(mappedFile);
    expect(screen.getByText(strings.loadDetail.podUploadSuccess)).toBeTruthy();
  });

  it('discards pending photo when user confirms discard alert', async () => {
    render(<PodUploadSection onUpload={jest.fn()} />);

    fireEvent.press(screen.getByText(strings.loadDetail.podAddPhoto));

    await waitFor(() => {
      expect(screen.getByText(strings.loadDetail.podCancel)).toBeTruthy();
    });

    fireEvent.press(screen.getByText(strings.loadDetail.podCancel));

    expect(Alert.alert).toHaveBeenCalled();
    const discardButton = (Alert.alert as jest.Mock).mock.calls[0][2].find(
      (btn: { text: string }) => btn.text === strings.loadDetail.podDiscardConfirm,
    );

    await act(async () => {
      discardButton.onPress();
    });

    await waitFor(() => {
      expect(screen.getByText(strings.loadDetail.podAddPhoto)).toBeTruthy();
    });
  });
});
