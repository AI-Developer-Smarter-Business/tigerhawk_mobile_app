import { StyleSheet, Text, View } from 'react-native';

import { DocumentPhotoUploader } from '@/components/loads/DocumentPhotoUploader';
import { PodLegalSection } from '@/components/loads/PodLegalSection';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { findLatestDocumentByType } from '@/lib/loads/find-load-documents-by-type';
import type { LoadPodPreview } from '@/lib/loads/pod-preview';
import type { DriverUploadDocumentType } from '@/lib/tms/assert-driver-document-type';
import {
  TIR_IN_DOCUMENT_TYPE,
  TIR_OUT_DOCUMENT_TYPE,
} from '@/lib/tms/driver-document-types';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';
import type { LoadDocument } from '@/types/load-document';

export type TirForceUpload = 'TIR Out' | 'TIR In' | null;

type DocumentsPortProSectionProps = {
  documents: LoadDocument[];
  onUploadDocument: (
    file: TmsUploadFileDescriptor,
    documentType: DriverUploadDocumentType,
  ) => Promise<void>;
  podPreview: LoadPodPreview | null;
  podLoading: boolean;
  podError: string | null;
  onPodRetry: () => void;
  podSubmitting: boolean;
  podSubmitError: string | null;
  podSuccessMessage: string | null;
  onSubmitPodSignature: (input: {
    signaturePng: string;
    signerName: string;
  }) => Promise<boolean>;
  forcePodSign?: boolean;
  onForcePodSignHandled?: () => void;
  forceTirUpload?: TirForceUpload;
  onForceTirUploadHandled?: () => void;
};

function rowStatusLabel(uploaded: boolean, filename: string | null): string {
  if (!uploaded) return strings.loadDetail.docRowMissing;
  return filename
    ? strings.loadDetail.docRowUploadedWithName(filename)
    : strings.loadDetail.docRowUploaded;
}

/**
 * PortPro-style Documents block (F.1): TIR Out · Proof of Delivery (Sign) · TIR In.
 */
export function DocumentsPortProSection({
  documents,
  onUploadDocument,
  podPreview,
  podLoading,
  podError,
  onPodRetry,
  podSubmitting,
  podSubmitError,
  podSuccessMessage,
  onSubmitPodSignature,
  forcePodSign = false,
  onForcePodSignHandled,
  forceTirUpload = null,
  onForceTirUploadHandled,
}: DocumentsPortProSectionProps) {
  const tirOut = findLatestDocumentByType(documents, TIR_OUT_DOCUMENT_TYPE);
  const tirIn = findLatestDocumentByType(documents, TIR_IN_DOCUMENT_TYPE);
  const podSigned =
    podPreview?.state === 'signed' || podPreview?.state === 'pending';

  return (
    <View accessibilityLabel={strings.loadDetail.documentsBlockA11y}>
      <Text style={styles.intro}>{strings.loadDetail.documentsPortProHint}</Text>

      <View style={styles.row} testID="documents-row-tir-out">
        <Text style={styles.rowTitle}>{strings.loadDetail.tirOutRow}</Text>
        <Text style={styles.rowStatus}>
          {rowStatusLabel(Boolean(tirOut), tirOut?.filename ?? null)}
        </Text>
        <DocumentPhotoUploader
          documentType={TIR_OUT_DOCUMENT_TYPE}
          addButtonTitle={strings.loadDetail.tirOutAdd}
          addButtonA11y={strings.loadDetail.tirOutAddA11y}
          onUpload={onUploadDocument}
          forceOpenPicker={forceTirUpload === 'TIR Out'}
          onForceOpenHandled={onForceTirUploadHandled}
        />
      </View>

      <View style={styles.row} testID="documents-row-pod-sign">
        <Text style={styles.rowTitle}>{strings.loadDetail.podSignRow}</Text>
        <Text style={styles.rowStatus}>
          {podSigned
            ? strings.loadDetail.docRowPodCaptured
            : strings.loadDetail.docRowMissing}
        </Text>
        <PodLegalSection
          preview={podPreview}
          loading={podLoading}
          error={podError}
          onRetry={onPodRetry}
          submitting={podSubmitting}
          submitError={podSubmitError}
          successMessage={podSuccessMessage}
          onSubmitSignature={onSubmitPodSignature}
          forceOpen={forcePodSign}
          onForceOpenHandled={onForcePodSignHandled}
        />
      </View>

      <View style={styles.row} testID="documents-row-tir-in">
        <Text style={styles.rowTitle}>{strings.loadDetail.tirInRow}</Text>
        <Text style={styles.rowStatus}>
          {rowStatusLabel(Boolean(tirIn), tirIn?.filename ?? null)}
        </Text>
        <DocumentPhotoUploader
          documentType={TIR_IN_DOCUMENT_TYPE}
          addButtonTitle={strings.loadDetail.tirInAdd}
          addButtonA11y={strings.loadDetail.tirInAddA11y}
          onUpload={onUploadDocument}
          forceOpenPicker={forceTirUpload === 'TIR In'}
          onForceOpenHandled={onForceTirUploadHandled}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  intro: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: PP2Theme.spacing.md,
  },
  row: {
    marginBottom: PP2Theme.spacing.lg,
    paddingBottom: PP2Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: PP2Theme.colors.border,
  },
  rowTitle: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.xs,
  },
  rowStatus: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.sm,
  },
});
