import type { ImagePickerAsset } from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useNetwork } from '@/context/NetworkContext';
import { AppActionSheet } from '@/components/ui/AppActionSheet';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { mapErrorToUserFacing, type UserFacingError } from '@/lib/errors';
import { prepareDriverUploadImage } from '@/lib/media/prepare-driver-upload-image';
import {
  pickLoadPhotoFromCamera,
  pickLoadPhotoFromLibrary,
} from '@/lib/media/pick-load-photo';
import { validateDriverUploadFile } from '@/lib/media/validate-driver-upload-file';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';

type PodUploadSectionProps = {
  onUpload: (file: TmsUploadFileDescriptor) => Promise<void>;
};

type PendingPhoto = TmsUploadFileDescriptor & {
  previewUri: string;
};

export function PodUploadSection({ onUpload }: PodUploadSectionProps) {
  const { isOffline, isReady: networkReady } = useNetwork();
  const uploadBlockedOffline = networkReady && isOffline;

  const [pending, setPending] = useState<PendingPhoto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [picking, setPicking] = useState(false);
  const [uploadError, setUploadError] = useState<UserFacingError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [pickerSheetOpen, setPickerSheetOpen] = useState(false);
  const [discardSheetOpen, setDiscardSheetOpen] = useState(false);

  const clearPending = useCallback(() => {
    setPending(null);
  }, []);

  const handlePickResult = useCallback(async (pick: () => Promise<ImagePickerAsset | null>) => {
    if (uploadBlockedOffline) {
      setUploadError({
        kind: 'network',
        title: strings.network.offlineTitle,
        message: strings.network.offlineUploadBlocked,
      });
      return;
    }

    setPicking(true);
    setUploadError(null);
    setSuccessMessage(null);
    try {
      const asset = await pick();
      if (!asset) return;

      const prepared = await prepareDriverUploadImage(asset);
      validateDriverUploadFile(prepared);
      setPending({ ...prepared, previewUri: prepared.uri });
    } catch (err) {
      setUploadError(mapErrorToUserFacing(err));
    } finally {
      setPicking(false);
    }
  }, [uploadBlockedOffline]);

  const startPick = useCallback(() => {
    if (uploadBlockedOffline) {
      setUploadError({
        kind: 'network',
        title: strings.network.offlineTitle,
        message: strings.network.offlineUploadBlocked,
      });
      return;
    }

    setPickerSheetOpen(true);
  }, [uploadBlockedOffline]);

  const handlePickFromCamera = useCallback(() => {
    void handlePickResult(pickLoadPhotoFromCamera);
  }, [handlePickResult]);

  const handlePickFromLibrary = useCallback(() => {
    void handlePickResult(pickLoadPhotoFromLibrary);
  }, [handlePickResult]);

  const handleCancel = useCallback(() => {
    if (uploading) return;
    clearPending();
    setUploadError(null);
  }, [uploading, clearPending]);

  const handleConfirm = useCallback(async () => {
    if (!pending || uploading) return;

    if (uploadBlockedOffline) {
      setUploadError({
        kind: 'network',
        title: strings.network.offlineTitle,
        message: strings.network.offlineUploadBlocked,
      });
      return;
    }

    setUploading(true);
    setUploadError(null);
    setSuccessMessage(null);
    try {
      await onUpload({
        uri: pending.uri,
        name: pending.name,
        type: pending.type,
        size: pending.size,
      });
      clearPending();
      setSuccessMessage(strings.loadDetail.podUploadSuccess);
    } catch (err) {
      setUploadError(mapErrorToUserFacing(err));
    } finally {
      setUploading(false);
    }
  }, [pending, uploading, onUpload, clearPending, uploadBlockedOffline]);

  const handleDiscardPress = useCallback(() => {
    setDiscardSheetOpen(true);
  }, []);

  return (
    <View accessibilityLabel={strings.loadDetail.podAddPhotoA11y}>
      {uploadError ? (
        <ErrorBanner
          title={uploadError.title}
          message={uploadError.message}
          details={uploadError.details}
        />
      ) : null}

      {successMessage ? (
        <Text style={styles.success} accessibilityLiveRegion="polite">
          {successMessage}
        </Text>
      ) : null}

      {uploadBlockedOffline ? (
        <Text style={styles.offlineHint}>{strings.loadDetail.podOfflineHint}</Text>
      ) : null}

      {pending ? (
        <View style={styles.previewBlock}>
          <Image
            source={{ uri: pending.previewUri }}
            style={styles.previewImage}
            accessibilityLabel={strings.loadDetail.podPreviewA11y}
          />
          <Text style={styles.fileName} numberOfLines={1}>
            {pending.name}
          </Text>
          <Text style={styles.confirmHint}>{strings.loadDetail.podConfirmHint}</Text>
          <Button
            title={strings.loadDetail.podUpload}
            variant="accent"
            loading={uploading}
            disabled={uploading || uploadBlockedOffline}
            onPress={() => void handleConfirm()}
            style={styles.actionBtn}
            accessibilityLabel={strings.loadDetail.podUploadA11y}
          />
          <Button
            title={strings.loadDetail.podCancel}
            variant="outline"
            disabled={uploading}
            onPress={handleDiscardPress}
            style={styles.actionBtn}
            accessibilityLabel={strings.loadDetail.podCancelA11y}
          />
        </View>
      ) : (
        <Button
          title={strings.loadDetail.podAddPhoto}
          variant="accent"
          loading={picking}
          disabled={picking || uploading || uploadBlockedOffline}
          onPress={startPick}
          accessibilityLabel={strings.loadDetail.podAddPhotoA11y}
        />
      )}

      <AppActionSheet
        visible={pickerSheetOpen}
        title={strings.loadDetail.podPickTitle}
        message={strings.loadDetail.podPickMessage}
        onDismiss={() => setPickerSheetOpen(false)}
        actions={[
          { label: strings.loadDetail.podPickCamera, onPress: handlePickFromCamera },
          { label: strings.loadDetail.podPickGallery, onPress: handlePickFromLibrary },
          { label: strings.loadDetail.podCancel, onPress: () => undefined, variant: 'cancel' },
        ]}
      />

      <AppActionSheet
        visible={discardSheetOpen}
        title={strings.loadDetail.podDiscardTitle}
        message={strings.loadDetail.podDiscardMessage}
        onDismiss={() => setDiscardSheetOpen(false)}
        actions={[
          { label: strings.loadDetail.podKeepEditing, onPress: () => undefined, variant: 'cancel' },
          {
            label: strings.loadDetail.podDiscardConfirm,
            onPress: handleCancel,
            variant: 'destructive',
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  previewBlock: {
    marginTop: PP2Theme.spacing.xs,
  },
  previewImage: {
    width: '100%',
    height: 160,
    borderRadius: PP2Theme.radius.md,
    backgroundColor: PP2Theme.colors.border,
    marginBottom: PP2Theme.spacing.sm,
  },
  fileName: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.sm,
  },
  confirmHint: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.md,
  },
  actionBtn: {
    marginBottom: PP2Theme.spacing.sm,
  },
  success: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.success,
    marginBottom: PP2Theme.spacing.sm,
    fontWeight: '600',
  },
  offlineHint: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.sm,
  },
});
