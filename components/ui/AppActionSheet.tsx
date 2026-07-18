import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ReactNode } from 'react';

import { PP2Theme } from '@/constants/theme';

export type AppActionSheetAction = {
  label: string;
  onPress: () => void;
  variant?: 'default' | 'cancel' | 'destructive';
  testID?: string;
  /** Keep the sheet open so the action can validate embedded form fields. */
  dismissOnPress?: boolean;
};

type AppActionSheetProps = {
  visible: boolean;
  title?: string;
  message?: string;
  actions: AppActionSheetAction[];
  onDismiss: () => void;
  testID?: string;
  children?: ReactNode;
};

/** Light-themed bottom sheet — replaces system Alert for in-app pickers and confirms. */
export function AppActionSheet({
  visible,
  title,
  message,
  actions,
  onDismiss,
  testID,
  children,
}: AppActionSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      testID={testID}>
      <Pressable
        style={styles.backdrop}
        accessibilityRole="button"
        accessibilityLabel="Dismiss"
        onPress={onDismiss}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          {title ? (
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          {children}
          <View style={styles.actions}>
            {actions.map((action) => (
              <Pressable
                key={action.label}
                testID={action.testID}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                onPress={() => {
                  if (action.dismissOnPress !== false) onDismiss();
                  action.onPress();
                }}
                style={({ pressed }) => [
                  styles.action,
                  action.variant === 'cancel' && styles.actionCancel,
                  action.variant === 'destructive' && styles.actionDestructive,
                  pressed && styles.actionPressed,
                ]}>
                <Text
                  style={[
                    styles.actionText,
                    action.variant === 'cancel' && styles.actionTextCancel,
                    action.variant === 'destructive' && styles.actionTextDestructive,
                  ]}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: PP2Theme.colors.overlay,
    padding: PP2Theme.spacing.md,
  },
  sheet: {
    backgroundColor: PP2Theme.colors.surface,
    borderRadius: PP2Theme.radius.lg,
    padding: PP2Theme.spacing.md,
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    ...PP2Theme.shadow.md,
  },
  title: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.xs,
  },
  message: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.md,
    lineHeight: 22,
  },
  actions: {
    gap: PP2Theme.spacing.sm,
  },
  action: {
    minHeight: PP2Theme.layout.minTouchTarget,
    borderRadius: PP2Theme.radius.md,
    backgroundColor: PP2Theme.colors.accentMuted,
    borderWidth: 1,
    borderColor: PP2Theme.colors.tms.navActive,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PP2Theme.spacing.md,
  },
  actionCancel: {
    backgroundColor: PP2Theme.colors.surface,
    borderColor: PP2Theme.colors.border,
  },
  actionDestructive: {
    backgroundColor: PP2Theme.colors.errorSurface,
    borderColor: PP2Theme.colors.errorBorder,
  },
  actionPressed: {
    opacity: 0.88,
  },
  actionText: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    color: PP2Theme.colors.tms.navActive,
  },
  actionTextCancel: {
    color: PP2Theme.colors.textMuted,
  },
  actionTextDestructive: {
    color: PP2Theme.colors.error,
  },
});
