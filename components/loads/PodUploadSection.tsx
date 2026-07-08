import type { ImagePickerAsset } from 'expo-image-picker';
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { SignatureCaptureModal } from '@/components/loads/SignatureCaptureModal';
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
import { writeSignatureUploadFile } from '@/lib/media/signature-export';
import { validateDriverUploadFile } from '@/lib/media/validate-driver-upload-file';
import { isOfflineQueuedError } from '@/lib/offline/offline-queued-error';
import type { DriverUploadDocumentType } from '@/lib/tms/assert-driver-document-type';
import {
  DEFAULT_DRIVER_DOCUMENT_TYPE,
  DRIVER_DOCUMENT_TYPE_OPTIONS,
} from '@/lib/tms/driver-document-types';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';

type PodUploadSectionProps = {
  onUpload: (
    file: TmsUploadFileDescriptor,
    documentType: DriverUploadDocumentType,
  ) => Promise<void>;
  /** Optional load reference used in signature file names (SIG.2). */
  loadReference?: string | null;
};

type PendingPhoto = TmsUploadFileDescriptor & {
  previewUri: string;
  source: 'photo' | 'signature';
};

export function PodUploadSection({ onUpload, loadReference }: PodUploadSectionProps) {
  const { isOffline, isReady: networkReady } = useNetwork();
  const isOfflineReady = networkReady && isOffline;

  const [documentType, setDocumentType] =
    useState<DriverUploadDocumentType>(DEFAULT_DRIVER_DOCUMENT_TYPE);
  const [pending, setPending] = useState<PendingPhoto | null>(null);
  const [uploading, setUploading] = useState(false);
  const [picking, setPicking] = useState(false);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signatureBusy, setSignatureBusy] = useState(false);
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

        const prepared = await prepareDriverUploadImage(result.asset as ImagePickerAsset);
        validateDriverUploadFile(prepared);
        setPending({ ...prepared, previewUri: prepared.uri, source: 'photo' });
      } catch (err) {
        setUploadError(mapErrorToUserFacing(err));
      } finally {
        setPicking(false);
      }
    },
    [],
  );

  const startPick = useCallback(() => {
    setPickerSheetOpen(true);
  }, []);

  const startSignature = useCallback(() => {
    setUploadError(null);
    setSuccessMessage(null);
    setDocumentType('POD');
    setSignatureOpen(true);
  }, []);

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

  const handleSignatureCancel = useCallback(() => {
    if (signatureBusy) return;
    setSignatureOpen(false);
  }, [signatureBusy]);

  const handleSignatureConfirm = useCallback(
    async (base64Png: string) => {
      if (signatureBusy) return;
      setSignatureBusy(true);
      setUploadError(null);
      setSuccessMessage(null);
      try {
        const prepared = await writeSignatureUploadFile({
          base64Payload: base64Png,
          loadRef: loadReference,
        });
        validateDriverUploadFile(prepared);
        setDocumentType('POD');
        setPending({ ...prepared, previewUri: prepared.uri, source: 'signature' });
        setSignatureOpen(false);
      } catch (err) {
        setUploadError({
          kind: 'validation',
          title: strings.loadDetail.signatureExportError,
          message:
            err instanceof Error && err.message.trim()
              ? err.message
              : strings.loadDetail.signatureExportError,
        });
      } finally {
        setSignatureBusy(false);
      }
    },
    [loadReference, signatureBusy],
  );

  const handleConfirm = useCallback(async () => {
    if (!pending || uploading) return;

    const uploadDocumentType =
      pending.source === 'signature' ? 'POD' : documentType;

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
        uploadDocumentType,
      );
      const wasSignature = pending.source === 'signature';
      clearPending();
      setSuccessMessage(
        wasSignature
          ? strings.loadDetail.signatureUploadSuccess
          : strings.loadDetail.podUploadSuccess,
      );
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

  const handleDiscardPress = useCallback(() => {
    setDiscardSheetOpen(true);
  }, []);

  const actionsDisabled = picking || uploading || signatureBusy;
  const signatureTypeLocked = pending?.source === 'signature';

  return (
    <View accessibilityLabel={strings.loadDetail.podAddPhotoA11y}>
      {uploadError ? (
        <ErrorBanner
          title={uploadError.title}
          message={uploadError.message}
          details={uploadError.details}
          actionLabel={
            needsMediaSettings ? strings.loadDetail.mediaPermissionOpenSettings : undefined
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
        <Text style={styles.offlineHint}>{strings.loadDetail.podOfflineQueueHint}</Text>
      ) : null}

      <Text style={styles.typeLabel}>{strings.loadDetail.documentTypeLabel}</Text>
      <View style={styles.typeRow}>
        {DRIVER_DOCUMENT_TYPE_OPTIONS.map((option) => {
          const selected = documentType === option.value;
          const chipDisabled = signatureTypeLocked;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: chipDisabled }}
              accessibilityLabel={strings.loadDetail[option.labelKey]}
              disabled={chipDisabled}
              onPress={() => setDocumentType(option.value)}
              style={[
                styles.typeChip,
                selected ? styles.typeChipSelected : null,
                chipDisabled && !selected ? styles.typeChipDisabled : null,
              ]}>
              <Text style={[styles.typeChipText, selected ? styles.typeChipTextSelected : null]}>
                {strings.loadDetail[option.labelKey]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.typeHint}>
        {
          strings.loadDetail[
            DRIVER_DOCUMENT_TYPE_OPTIONS.find((option) => option.value === documentType)
              ?.hintKey ?? 'documentTypeDriverHint'
          ]
        }
      </Text>

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
            disabled={uploading}
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
        <View style={styles.entryActions}>
          <Button
            title={strings.loadDetail.podAddPhoto}
            variant="accent"
            loading={picking}
            disabled={actionsDisabled}
            onPress={startPick}
            accessibilityLabel={strings.loadDetail.podAddPhotoA11y}
          />
          <Button
            title={strings.loadDetail.podSignOnDevice}
            variant="outlineAccent"
            disabled={actionsDisabled}
            onPress={startSignature}
            style={styles.actionBtn}
            accessibilityLabel={strings.loadDetail.podSignOnDeviceA11y}
          />
        </View>
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

      <SignatureCaptureModal
        visible={signatureOpen}
        confirming={signatureBusy}
        onConfirm={(payload) => {
          void handleSignatureConfirm(payload);
        }}
        onCancel={handleSignatureCancel}
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
  entryActions: {
    gap: PP2Theme.spacing.sm,
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
  typeLabel: {
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '600',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PP2Theme.spacing.xs,
    marginBottom: PP2Theme.spacing.xs,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    borderRadius: PP2Theme.radius.sm,
    paddingHorizontal: PP2Theme.spacing.sm,
    paddingVertical: PP2Theme.spacing.xs,
    backgroundColor: PP2Theme.colors.surface,
  },
  typeChipSelected: {
    borderColor: PP2Theme.colors.tms.navActive,
    backgroundColor: 'rgba(232, 112, 10, 0.1)',
  },
  typeChipDisabled: {
    opacity: 0.45,
  },
  typeChipText: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    fontWeight: '600',
  },
  typeChipTextSelected: {
    color: PP2Theme.colors.tms.navActive,
  },
  typeHint: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.md,
    lineHeight: 18,
  },
});
