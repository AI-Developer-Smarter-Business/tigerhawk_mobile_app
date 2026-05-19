import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';

type EmptyStateProps = {
  title: string;
  message: string;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
};

export function EmptyState({
  title,
  message,
  icon = 'inbox',
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <FontAwesome name={icon} size={48} color={PP2Theme.colors.border} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: PP2Theme.spacing.xl,
    paddingHorizontal: PP2Theme.spacing.lg,
  },
  title: {
    marginTop: PP2Theme.spacing.md,
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '600',
    color: PP2Theme.colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: PP2Theme.spacing.sm,
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
