import { useCallback, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import SignatureCanvas, {
  type SignatureViewRef,
} from 'react-native-signature-canvas';

import { Button } from '@/components/ui/Button';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';

type SignaturePadProps = {
  onConfirm: (base64Png: string) => void;
  onCancel: () => void;
  confirming?: boolean;
};

const canvasWebStyle = `
  .m-signature-pad {
    box-shadow: none;
    border: none;
    margin: 0;
  }
  .m-signature-pad--body {
    border: none;
    background-color: #ffffff;
  }
  .m-signature-pad--footer {
    display: none;
  }
  body,html {
    background-color: #ffffff;
    margin: 0;
    height: 100%;
  }
`;

/**
 * DHL-style white pad: finger / stylus → PNG data URL on confirm (SIG.1).
 */
export function SignaturePad({
  onConfirm,
  onCancel,
  confirming = false,
}: SignaturePadProps) {
  const ref = useRef<SignatureViewRef>(null);
  const [padError, setPadError] = useState<string | null>(null);

  const handleClear = useCallback(() => {
    setPadError(null);
    ref.current?.clearSignature();
  }, []);

  const handleConfirmPress = useCallback(() => {
    if (confirming) return;
    setPadError(null);
    ref.current?.readSignature();
  }, [confirming]);

  const handleOK = useCallback(
    (signature: string) => {
      if (!signature?.trim()) {
        setPadError(strings.loadDetail.signatureEmptyError);
        return;
      }
      setPadError(null);
      onConfirm(signature);
    },
    [onConfirm],
  );

  if (Platform.OS === 'web') {
    return (
      <View style={styles.webFallback} accessibilityLabel={strings.loadDetail.signaturePadA11y}>
        <Text style={styles.webFallbackText}>{strings.loadDetail.signatureWebUnsupported}</Text>
        <Button
          title={strings.loadDetail.podCancel}
          variant="outline"
          onPress={onCancel}
          accessibilityLabel={strings.loadDetail.signatureCancelA11y}
        />
      </View>
    );
  }

  return (
    <View style={styles.root} accessibilityLabel={strings.loadDetail.signaturePadA11y}>
      <Text style={styles.legal}>{strings.loadDetail.signatureLegalHint}</Text>
      {padError ? (
        <Text style={styles.padError} accessibilityLiveRegion="polite">
          {padError}
        </Text>
      ) : null}
      <View style={styles.canvasWrap}>
        <SignatureCanvas
          ref={ref}
          onOK={handleOK}
          onEmpty={() => setPadError(strings.loadDetail.signatureEmptyError)}
          descriptionText=""
          clearText=""
          confirmText=""
          webStyle={canvasWebStyle}
          backgroundColor="#FFFFFF"
          penColor="#111827"
          autoClear={false}
          imageType="image/png"
          style={styles.canvas}
        />
      </View>
      <View style={styles.actions}>
        <Button
          title={strings.loadDetail.signatureClear}
          variant="outline"
          disabled={confirming}
          onPress={handleClear}
          style={styles.actionBtn}
          accessibilityLabel={strings.loadDetail.signatureClearA11y}
        />
        <Button
          title={strings.loadDetail.signatureConfirm}
          variant="accent"
          loading={confirming}
          disabled={confirming}
          onPress={handleConfirmPress}
          style={styles.actionBtn}
          accessibilityLabel={strings.loadDetail.signatureConfirmA11y}
        />
        <Button
          title={strings.loadDetail.podCancel}
          variant="outline"
          disabled={confirming}
          onPress={onCancel}
          style={styles.actionBtn}
          accessibilityLabel={strings.loadDetail.signatureCancelA11y}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 360,
  },
  legal: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.sm,
    lineHeight: 18,
  },
  padError: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.error,
    marginBottom: PP2Theme.spacing.sm,
    fontWeight: '600',
  },
  canvasWrap: {
    flex: 1,
    minHeight: 220,
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    borderRadius: PP2Theme.radius.md,
    overflow: 'hidden',
    backgroundColor: PP2Theme.colors.surface,
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  actions: {
    marginTop: PP2Theme.spacing.md,
    gap: PP2Theme.spacing.sm,
  },
  actionBtn: {
    minHeight: PP2Theme.layout.minTouchTarget,
  },
  webFallback: {
    padding: PP2Theme.spacing.md,
    gap: PP2Theme.spacing.md,
  },
  webFallbackText: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.text,
    lineHeight: 22,
  },
});
