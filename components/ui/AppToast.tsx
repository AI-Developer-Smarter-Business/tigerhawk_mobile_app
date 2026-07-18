import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';

type AppToastProps = {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
};

/** Accessible transient success notice. */
export function AppToast({
  message,
  onDismiss,
  durationMs = 3500,
}: AppToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, message, onDismiss]);

  if (!message) return null;

  return (
    <View style={styles.toast} accessibilityRole="alert">
      <FontAwesome
        name="check-circle"
        size={20}
        color={PP2Theme.colors.success}
      />
      <Text style={styles.message}>{message}</Text>
      <Pressable
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification"
        hitSlop={8}
        style={({ pressed }) => pressed && styles.pressed}>
        <FontAwesome
          name="times"
          size={18}
          color={PP2Theme.colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    minHeight: PP2Theme.layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: PP2Theme.spacing.sm,
    backgroundColor: PP2Theme.colors.surface,
    borderWidth: 1,
    borderColor: PP2Theme.colors.success,
    borderRadius: PP2Theme.radius.md,
    paddingHorizontal: PP2Theme.spacing.md,
    paddingVertical: PP2Theme.spacing.sm,
    marginBottom: PP2Theme.spacing.md,
    ...PP2Theme.shadow.sm,
  },
  message: {
    flex: 1,
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    color: PP2Theme.colors.success,
  },
  pressed: {
    opacity: 0.7,
  },
});
