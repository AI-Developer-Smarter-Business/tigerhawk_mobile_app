import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';

type ErrorBannerProps = {
  title?: string;
  message: string;
  details?: string[];
  actionLabel?: string;
  onAction?: () => void;
};

export function ErrorBanner({
  title,
  message,
  details,
  actionLabel,
  onAction,
}: ErrorBannerProps) {
  return (
    <View style={styles.banner}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <Text style={styles.text}>{message}</Text>
      {details?.map((line) => (
        <Text key={line} style={styles.detail}>
          · {line}
        </Text>
      ))}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
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
  title: {
    color: PP2Theme.colors.error,
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '700',
    marginBottom: PP2Theme.spacing.xs,
  },
  text: {
    color: PP2Theme.colors.error,
    fontSize: PP2Theme.typography.sizes.body,
  },
  detail: {
    color: PP2Theme.colors.error,
    fontSize: PP2Theme.typography.sizes.caption,
    marginTop: PP2Theme.spacing.xs,
  },
  action: {
    marginTop: PP2Theme.spacing.sm,
    alignSelf: 'flex-start',
    minHeight: PP2Theme.accessibility.minTouchTargetSmall,
    justifyContent: 'center',
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
