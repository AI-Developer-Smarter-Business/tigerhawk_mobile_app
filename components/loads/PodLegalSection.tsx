import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SignatureCaptureModal } from '@/components/loads/SignatureCaptureModal';
import { LoadDetailRow } from '@/components/loads/LoadDetailRow';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Input } from '@/components/ui/Input';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { formatDisplayValue } from '@/lib/loads/load-detail-helpers';
import type { LoadPodPreview } from '@/lib/loads/pod-preview';

type PodLegalSectionProps = {
  preview: LoadPodPreview | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  submitting: boolean;
  submitError: string | null;
  successMessage: string | null;
  onSubmitSignature: (input: {
    signaturePng: string;
    signerName: string;
  }) => Promise<boolean>;
  /** When true, prompt/open signature after POD_SIGNATURE_REQUIRED (G.4). */
  forceOpen?: boolean;
  onForceOpenHandled?: () => void;
};

function stateLabel(state: LoadPodPreview['state']): string {
  switch (state) {
    case 'signed':
      return strings.loadDetail.podStateSigned;
    case 'pending':
      return strings.loadDetail.podStatePending;
    default:
      return strings.loadDetail.podStateUnsigned;
  }
}

/**
 * Legal POD preview + stamp capture (TASKS G.1–G.3). No on-device PDF.
 */
export function PodLegalSection({
  preview,
  loading,
  error,
  onRetry,
  submitting,
  submitError,
  successMessage,
  onSubmitSignature,
  forceOpen = false,
  onForceOpenHandled,
}: PodLegalSectionProps) {
  const [signerName, setSignerName] = useState('');
  const [padOpen, setPadOpen] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    if (!forceOpen) return;
    // G.4: require signer name before pad; never Skip.
    if (signerName.trim()) {
      setFieldError(null);
      setPadOpen(true);
    } else {
      setFieldError(strings.loadDetail.podSignerRequired);
    }
    onForceOpenHandled?.();
    // Intentionally omit signerName — only react to a new forceOpen pulse.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- G.4 one-shot open
  }, [forceOpen, onForceOpenHandled]);

  const openPad = useCallback(() => {
    const trimmed = signerName.trim();
    if (!trimmed) {
      setFieldError(strings.loadDetail.podSignerRequired);
      return;
    }
    setFieldError(null);
    setPadOpen(true);
  }, [signerName]);

  const handleConfirm = useCallback(
    async (signaturePng: string) => {
      const ok = await onSubmitSignature({
        signaturePng,
        signerName: signerName.trim(),
      });
      if (ok) {
        setPadOpen(false);
        setSignerName('');
      }
    },
    [onSubmitSignature, signerName],
  );

  // Pending = signature already on TMS; do not ask the driver to sign again (G.3 / G.4).
  const canSign = !loading && (!preview || preview.state === 'unsigned');

  return (
    <View>
      <Text style={styles.hint}>{strings.loadDetail.podLegalHint}</Text>

      {error ? (
        <ErrorBanner
          message={error}
          actionLabel={strings.loads.retry}
          onAction={onRetry}
        />
      ) : null}

      {submitError ? <ErrorBanner message={submitError} /> : null}

      {successMessage ? (
        <Text style={styles.success} accessibilityLiveRegion="polite">
          {successMessage}
        </Text>
      ) : null}

      {loading && !preview ? (
        <Text style={styles.muted}>{strings.loadDetail.podLoading}</Text>
      ) : null}

      {preview ? (
        <View style={styles.previewBlock}>
          <LoadDetailRow
            label={strings.loadDetail.podState}
            value={stateLabel(preview.state)}
          />
          <LoadDetailRow
            label={strings.loadDetail.reference}
            value={formatDisplayValue(preview.pod.referenceNumber)}
          />
          <LoadDetailRow
            label={strings.loadDetail.customer}
            value={formatDisplayValue(preview.pod.customerName)}
          />
          <LoadDetailRow
            label={strings.loadDetail.container}
            value={formatDisplayValue(preview.pod.containerNumber)}
          />
          <LoadDetailRow
            label={strings.loadDetail.sealNumber}
            value={formatDisplayValue(preview.pod.sealNumber)}
          />
          <LoadDetailRow
            label={strings.loadDetail.chassis}
            value={formatDisplayValue(preview.pod.chassisNumber)}
          />
          <LoadDetailRow
            label={strings.loadDetail.delivery}
            value={formatDisplayValue(preview.pod.deliveryLocation)}
          />
          <LoadDetailRow
            label={strings.loadDetail.podDeliveryAddress}
            value={formatDisplayValue(preview.pod.deliveryAddress)}
            last={!preview.signature?.signerName}
          />
          {preview.signature?.signerName ? (
            <LoadDetailRow
              label={strings.loadDetail.podSignerName}
              value={formatDisplayValue(preview.signature.signerName)}
              last
            />
          ) : null}
        </View>
      ) : null}

      {canSign ? (
        <View style={styles.signBlock}>
          <Input
            label={strings.loadDetail.podSignerName}
            value={signerName}
            onChangeText={setSignerName}
            autoCapitalize="words"
            error={fieldError ?? undefined}
            accessibilityLabel={strings.loadDetail.podSignerName}
          />
          <Button
            title={strings.loadDetail.podSignOnDevice}
            variant="accent"
            disabled={submitting}
            loading={submitting}
            onPress={openPad}
            accessibilityLabel={strings.loadDetail.podSignOnDeviceA11y}
          />
          <Text style={styles.muted}>{strings.loadDetail.podNoSkipHint}</Text>
        </View>
      ) : null}

      <SignatureCaptureModal
        visible={padOpen}
        confirming={submitting}
        onConfirm={(png) => {
          void handleConfirm(png);
        }}
        onCancel={() => {
          if (!submitting) setPadOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.sm,
    lineHeight: 18,
  },
  muted: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginTop: PP2Theme.spacing.xs,
  },
  success: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.success,
    fontWeight: '600',
    marginBottom: PP2Theme.spacing.sm,
  },
  previewBlock: {
    marginBottom: PP2Theme.spacing.md,
  },
  signBlock: {
    marginTop: PP2Theme.spacing.sm,
  },
});
