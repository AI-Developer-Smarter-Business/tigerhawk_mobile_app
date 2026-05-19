import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';

type ErrorBannerProps = {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorBanner({ message, actionLabel, onAction }: ErrorBannerProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: PP2Theme.colors.errorSurface,
    borderRadius: PP2Theme.radius.sm,
    padding: PP2Theme.spacing.md,
    marginBottom: PP2Theme.spacing.md,
    borderWidth: 1,
    borderColor: PP2Theme.colors.errorBorder,
  },
  text: {
    color: PP2Theme.colors.error,
    fontSize: PP2Theme.typography.sizes.body,
  },
  action: {
    marginTop: PP2Theme.spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: PP2Theme.spacing.xs,
    paddingHorizontal: PP2Theme.spacing.sm,
  },
  actionPressed: { opacity: 0.7 },
  actionText: {
    color: PP2Theme.colors.error,
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
