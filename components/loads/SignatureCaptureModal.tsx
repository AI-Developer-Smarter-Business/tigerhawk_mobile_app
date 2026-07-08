import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SignaturePad } from '@/components/loads/SignaturePad';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';

type SignatureCaptureModalProps = {
  visible: boolean;
  confirming?: boolean;
  onConfirm: (base64Png: string) => void;
  onCancel: () => void;
};

/** Full-screen white pad for delivery receipt signature (SIG.1 / SIG.3). */
export function SignatureCaptureModal({
  visible,
  confirming = false,
  onConfirm,
  onCancel,
}: SignatureCaptureModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={confirming ? undefined : onCancel}>
      <View
        style={[
          styles.screen,
          {
            paddingTop: Math.max(insets.top, PP2Theme.spacing.md),
            paddingBottom: Math.max(insets.bottom, PP2Theme.spacing.md),
          },
        ]}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            {strings.loadDetail.signatureTitle}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={strings.loadDetail.signatureCancelA11y}
            disabled={confirming}
            onPress={onCancel}
            style={styles.closeHit}>
            <Text style={styles.closeText}>{strings.loadDetail.podCancel}</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>{strings.loadDetail.signatureHint}</Text>
        <SignaturePad
          confirming={confirming}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PP2Theme.colors.background,
    paddingHorizontal: PP2Theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: PP2Theme.spacing.xs,
    minHeight: PP2Theme.layout.minTouchTarget,
  },
  title: {
    flex: 1,
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '700',
    color: PP2Theme.colors.text,
  },
  closeHit: {
    minHeight: PP2Theme.layout.minTouchTarget,
    minWidth: PP2Theme.layout.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: PP2Theme.spacing.xs,
  },
  closeText: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    color: PP2Theme.colors.tms.navActive,
  },
  hint: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.sm,
    lineHeight: 18,
  },
});
