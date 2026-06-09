import { StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';

type LoadsCountBadgeProps = {
  label: string;
};

export function LoadsCountBadge({ label }: LoadsCountBadgeProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.dot} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: PP2Theme.spacing.sm,
    backgroundColor: PP2Theme.colors.accentMuted,
    borderRadius: PP2Theme.radius.sm,
    borderWidth: 1,
    borderColor: PP2Theme.colors.tms.navActive,
    paddingHorizontal: PP2Theme.spacing.sm,
    paddingVertical: PP2Theme.spacing.xs,
    marginBottom: PP2Theme.spacing.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PP2Theme.colors.tms.navActive,
  },
  text: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.tms.navActive,
    fontWeight: '700',
  },
});
