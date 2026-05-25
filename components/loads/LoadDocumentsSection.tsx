import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import {
  documentOpenFailureMessage,
  openLoadDocument,
} from '@/lib/loads/open-load-document';

import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { formatAppointment } from '@/lib/loads';
import { formatFileSize } from '@/lib/loads/format-document';
import type { LoadDocument } from '@/types/load-document';

type LoadDocumentsSectionProps = {
  documents: LoadDocument[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onRefreshDocuments: () => Promise<LoadDocument[]>;
};

export function LoadDocumentsSection({
  documents,
  loading,
  error,
  onRetry,
  onRefreshDocuments,
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

      {documents.map((doc) => (
        <View key={doc.id} style={styles.docRow}>
          <View style={styles.docMeta}>
            <Text style={styles.docName} numberOfLines={2}>
              {doc.filename}
            </Text>
            <Text style={styles.docSub}>
              {doc.document_type} · {formatFileSize(doc.file_size)}
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
      ))}

      <View style={styles.evidenceBlock}>
        <Text style={styles.evidenceTitleMuted}>
          {strings.loadDetail.driverEvidenceTitle}
        </Text>
        <Text style={styles.evidenceHintMuted}>
          {strings.loadDetail.driverEvidenceHint}
        </Text>
        <Text style={styles.tmsNote}>{strings.loadDetail.driverUploadTmsRequired}</Text>
        <Text style={styles.tmsBullet}>{strings.loadDetail.driverUploadTmsPatchBearer}</Text>
        <Text style={styles.tmsBullet}>{strings.loadDetail.driverUploadTmsPatchDriverDocs}</Text>
        <Text style={styles.tmsContact}>{strings.loadDetail.driverUploadTmsContact}</Text>
        <View
          style={styles.disabledUploadBtn}
          accessibilityRole="button"
          accessibilityLabel={strings.loadDetail.podAddPhotoA11y}
          accessibilityState={{ disabled: true }}>
          <Text style={styles.disabledUploadBtnText}>
            {strings.loadDetail.podAddPhoto}
          </Text>
        </View>
      </View>
    </View>
  );
}

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
    borderBottomWidth: 1,
    borderBottomColor: PP2Theme.colors.border,
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
  viewBtn: { minWidth: 88 },
  evidenceBlock: {
    marginTop: PP2Theme.spacing.lg,
    paddingTop: PP2Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: PP2Theme.colors.border,
  },
  evidenceTitleMuted: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.xs,
  },
  evidenceHintMuted: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.sm,
    lineHeight: 18,
  },
  tmsNote: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: PP2Theme.spacing.xs,
  },
  tmsBullet: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: PP2Theme.spacing.xs,
    paddingLeft: PP2Theme.spacing.xs,
  },
  tmsContact: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: PP2Theme.spacing.md,
    fontStyle: 'italic',
  },
  disabledUploadBtn: {
    minHeight: PP2Theme.layout.minTouchTarget,
    borderRadius: PP2Theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PP2Theme.spacing.md,
    backgroundColor: PP2Theme.colors.border,
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
  },
  disabledUploadBtnText: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    color: PP2Theme.colors.textMuted,
  },
});
