import { StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';

type LoadsCountBadgeProps = {
  label: string;
};

export function LoadsCountBadge({ label }: LoadsCountBadgeProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    backgroundColor: PP2Theme.colors.surface,
    borderRadius: PP2Theme.radius.sm,
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    paddingHorizontal: PP2Theme.spacing.sm,
    paddingVertical: PP2Theme.spacing.xs,
    marginBottom: PP2Theme.spacing.md,
  },
  text: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    fontWeight: '600',
  },
});
