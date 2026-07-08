import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { PodUploadSection } from '@/components/loads/PodUploadSection';
import {
  documentOpenFailureMessage,
  openLoadDocument,
} from '@/lib/loads/open-load-document';
import { isDriverUploadedDocument } from '@/lib/tms/assert-driver-document-type';

import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { formatAppointment } from '@/lib/loads';
import { formatFileSize } from '@/lib/loads/format-document';
import type { DriverUploadDocumentType } from '@/lib/tms/assert-driver-document-type';
import type { TmsUploadFileDescriptor } from '@/lib/tms/document-upload-request';
import type { LoadDocument } from '@/types/load-document';

type LoadDocumentsSectionProps = {
  documents: LoadDocument[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onRefreshDocuments: () => Promise<LoadDocument[]>;
  onUploadDocument: (
    file: TmsUploadFileDescriptor,
    documentType?: DriverUploadDocumentType,
  ) => Promise<void>;
  /** Optional load reference for signature file names (SIG.2). */
  loadReference?: string | null;
};

export function LoadDocumentsSection({
  documents,
  loading,
  error,
  onRetry,
  onRefreshDocuments,
  onUploadDocument,
  loadReference,
}: LoadDocumentsSectionProps) {
  const [openingId, setOpeningId] = useState<string | null>(null);

  const handleOpen = useCallback(
    async (doc: LoadDocument) => {
      setOpeningId(doc.id);
      try {
        const result = await openLoadDocument({
          doc,
          refreshDocuments: onRefreshDocuments,
        });
        if (!result.opened) {
          const { title, message } = documentOpenFailureMessage(result.reason);
          Alert.alert(title, message);
        }
      } finally {
        setOpeningId(null);
      }
    },
    [onRefreshDocuments],
  );

  return (
    <View accessibilityLabel={strings.loadDetail.pod}>
      <Text style={styles.note}>{strings.loadDetail.documentsNote}</Text>

      {error ? (
        <ErrorBanner
          message={error}
          actionLabel={strings.loads.retry}
          onAction={onRetry}
        />
      ) : null}

      {loading ? (
        <ActivityIndicator
          style={styles.spinner}
          color={PP2Theme.colors.primary}
          accessibilityLabel={strings.loadDetail.documentsLoading}
        />
      ) : null}

      {!loading && documents.length === 0 ? (
        <Text style={styles.empty}>{strings.loadDetail.noDocuments}</Text>
      ) : null}

      {documents.map((doc) => {
        const driverDoc = isDriverUploadedDocument(doc);
        return (
          <View
            key={doc.id}
            style={[styles.docRow, driverDoc ? styles.docRowDriver : null]}>
            <View style={styles.docMeta}>
              <Text style={styles.docName} numberOfLines={2}>
                {doc.filename}
              </Text>
              <Text style={[styles.docSub, driverDoc ? styles.docSubDriver : null]}>
                {doc.document_type}
                {driverDoc ? ` · ${strings.loadDetail.driverDocBadge}` : ''}
                {' · '}
                {formatFileSize(doc.file_size)}
                {doc.uploaded_at
                  ? ` · ${formatAppointment(doc.uploaded_at)}`
                  : ''}
              </Text>
            </View>
            <Button
              title={strings.loadDetail.documentView}
              variant="outline"
              loading={openingId === doc.id}
              disabled={openingId !== null}
              onPress={() => void handleOpen(doc)}
              style={styles.viewBtn}
              accessibilityLabel={`${strings.loadDetail.documentView} ${doc.filename}`}
            />
          </View>
        );
      })}

      <View style={styles.evidenceBlock}>
        <Text style={styles.evidenceTitle}>{strings.loadDetail.driverEvidenceTitle}</Text>
        <Text style={styles.evidenceHint}>{strings.loadDetail.driverEvidenceHint}</Text>
        <PodUploadSection onUpload={onUploadDocument} loadReference={loadReference} />
      </View>
    </View>
  );
}

const driverTint = 'rgba(232, 112, 10, 0.1)';

const styles = StyleSheet.create({
  note: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: PP2Theme.spacing.md,
  },
  spinner: { marginVertical: PP2Theme.spacing.md },
  empty: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.md,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PP2Theme.spacing.sm,
    marginBottom: PP2Theme.spacing.sm,
    paddingVertical: PP2Theme.spacing.xs,
    paddingHorizontal: PP2Theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: PP2Theme.colors.border,
  },
  docRowDriver: {
    backgroundColor: driverTint,
    borderBottomColor: 'rgba(232, 112, 10, 0.2)',
    borderRadius: PP2Theme.radius.sm,
  },
  docMeta: { flex: 1 },
  docName: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    color: PP2Theme.colors.text,
  },
  docSub: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginTop: 2,
  },
  docSubDriver: {
    color: PP2Theme.colors.tms.navActive,
  },
  viewBtn: { minWidth: 88 },
  evidenceBlock: {
    marginTop: PP2Theme.spacing.lg,
    paddingTop: PP2Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: PP2Theme.colors.border,
  },
  evidenceTitle: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.xs,
  },
  evidenceHint: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.md,
    lineHeight: 18,
  },
});
