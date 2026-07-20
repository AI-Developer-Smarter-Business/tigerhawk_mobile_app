import type { ImagePickerAsset } from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useNetwork } from '@/context/NetworkContext';
import { AppActionSheet } from '@/components/ui/AppActionSheet';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { mapErrorToUserFacing, type UserFacingError } from '@/lib/errors';
import { openAppSettings } from '@/lib/media/media-permission';
import { prepareDriverUploadImage } from '@/lib/media/prepare-driver-upload-image';
import {
  pickLoadPhotoFromCamera,
  pickLoadPhotoFromLibrary,
  type PickLoadPhotoResult,
} from '@/lib/media/pick-load-photo';
import { validateDriverUploadFile } from '@/lib/media/validate-driver-upload-file';
import { isOfflineQueuedError } from '@/lib/offline/offline-queued-error';
import type { DriverUploadDocumentType } from '@/lib/tms/assert-driver-document-type';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';

type DocumentPhotoUploaderProps = {
  documentType: DriverUploadDocumentType;
  addButtonTitle: string;
  addButtonA11y: string;
  onUpload: (
    file: TmsUploadFileDescriptor,
    documentType: DriverUploadDocumentType,
  ) => Promise<void>;
  /** When true, open the camera/gallery sheet once (F.3 checklist CTA). */
  forceOpenPicker?: boolean;
  onForceOpenHandled?: () => void;
};

type PendingPhoto = TmsUploadFileDescriptor & {
  previewUri: string;
};

/**
 * Shared camera/gallery capture for a fixed `document_type` (F.2 TIR rows).
 */
export function DocumentPhotoUploader({
  documentType,
  addButtonTitle,
  addButtonA11y,
  onUpload,
  forceOpenPicker = false,
  onForceOpenHandled,
}: DocumentPhotoUploaderProps) {
  const { isOffline, isReady: networkReady } = useNetwork();
  const isOfflineReady = networkReady && isOffline;

  const [pending, setPending] = useState<PendingPhoto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [picking, setPicking] = useState(false);
  const [uploadError, setUploadError] = useState<UserFacingError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [needsMediaSettings, setNeedsMediaSettings] = useState(false);
  const [pickerSheetOpen, setPickerSheetOpen] = useState(false);
  const [discardSheetOpen, setDiscardSheetOpen] = useState(false);

  const clearPending = useCallback(() => {
    setPending(null);
  }, []);

  const handlePickResult = useCallback(
    async (pick: () => Promise<PickLoadPhotoResult>) => {
      setPicking(true);
      setUploadError(null);
      setSuccessMessage(null);
      setNeedsMediaSettings(false);

      try {
        const result = await pick();
        if (!result.ok) {
          if (result.reason === 'permission_denied') {
            setNeedsMediaSettings(true);
            setUploadError({
              kind: 'validation',
              title: strings.loadDetail.mediaPermissionDeniedTitle,
              message: strings.loadDetail.mediaPermissionDeniedMessage,
            });
          }
          return;
        }

        const prepared = await prepareDriverUploadImage(
          result.asset as ImagePickerAsset,
        );
        validateDriverUploadFile(prepared);
        setPending({ ...prepared, previewUri: prepared.uri });
      } catch (err) {
        setUploadError(mapErrorToUserFacing(err));
      } finally {
        setPicking(false);
      }
    },
    [],
  );

  const handleConfirm = useCallback(async () => {
    if (!pending || uploading) return;

    setUploading(true);
    setUploadError(null);
    setSuccessMessage(null);
    try {
      await onUpload(
        {
          uri: pending.uri,
          name: pending.name,
          type: pending.type,
          size: pending.size,
        },
        documentType,
      );
      clearPending();
      setSuccessMessage(strings.loadDetail.podUploadSuccess);
    } catch (err) {
      if (isOfflineQueuedError(err)) {
        clearPending();
        setSuccessMessage(err.message);
        return;
      }
      setUploadError(mapErrorToUserFacing(err));
    } finally {
      setUploading(false);
    }
  }, [clearPending, documentType, onUpload, pending, uploading]);

  useEffect(() => {
    if (!forceOpenPicker) return;
    setPickerSheetOpen(true);
    onForceOpenHandled?.();
  }, [forceOpenPicker, onForceOpenHandled]);

  return (
    <View>
      {uploadError ? (
        <ErrorBanner
          title={uploadError.title}
          message={uploadError.message}
          details={uploadError.details}
          actionLabel={
            needsMediaSettings
              ? strings.loadDetail.mediaPermissionOpenSettings
              : undefined
          }
          onAction={needsMediaSettings ? openAppSettings : undefined}
        />
      ) : null}

      {successMessage ? (
        <Text style={styles.success} accessibilityLiveRegion="polite">
          {successMessage}
        </Text>
      ) : null}

      {isOfflineReady ? (
        <Text style={styles.offlineHint}>
          {strings.loadDetail.podOfflineQueueHint}
        </Text>
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
          <Button
            title={strings.loadDetail.podUpload}
            variant="accent"
            loading={uploading}
            disabled={uploading}
            onPress={() => void handleConfirm()}
            style={styles.actionBtn}
            accessibilityLabel={strings.loadDetail.podUploadA11y}
          />
          <Button
            title={strings.loadDetail.podCancel}
            variant="outline"
            disabled={uploading}
            onPress={() => setDiscardSheetOpen(true)}
            style={styles.actionBtn}
            accessibilityLabel={strings.loadDetail.podCancelA11y}
          />
        </View>
      ) : (
        <Button
          title={addButtonTitle}
          variant="outlineAccent"
          loading={picking}
          disabled={picking || uploading}
          onPress={() => setPickerSheetOpen(true)}
          accessibilityLabel={addButtonA11y}
        />
      )}

      <AppActionSheet
        visible={pickerSheetOpen}
        title={strings.loadDetail.podPickTitle}
        message={strings.loadDetail.tirPickMessage}
        onDismiss={() => setPickerSheetOpen(false)}
        actions={[
          {
            label: strings.loadDetail.podPickCamera,
            onPress: () => {
              void handlePickResult(pickLoadPhotoFromCamera);
            },
          },
          {
            label: strings.loadDetail.podPickGallery,
            onPress: () => {
              void handlePickResult(pickLoadPhotoFromLibrary);
            },
          },
          {
            label: strings.loadDetail.podCancel,
            onPress: () => undefined,
            variant: 'cancel',
          },
        ]}
      />

      <AppActionSheet
        visible={discardSheetOpen}
        title={strings.loadDetail.podDiscardTitle}
        message={strings.loadDetail.podDiscardMessage}
        onDismiss={() => setDiscardSheetOpen(false)}
        actions={[
          {
            label: strings.loadDetail.podKeepEditing,
            onPress: () => undefined,
            variant: 'cancel',
          },
          {
            label: strings.loadDetail.podDiscardConfirm,
            onPress: clearPending,
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
    height: 140,
    borderRadius: PP2Theme.radius.md,
    backgroundColor: PP2Theme.colors.border,
    marginBottom: PP2Theme.spacing.sm,
  },
  fileName: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.sm,
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
