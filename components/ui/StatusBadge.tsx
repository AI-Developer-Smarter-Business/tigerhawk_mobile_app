import { StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';
import { formatLoadStatus, getLoadStatusColors } from '@/lib/loads';
import type { LoadStatus } from '@/types';

type StatusBadgeProps = {
  status: LoadStatus;
  hot?: boolean;
};

export function StatusBadge({ status, hot }: StatusBadgeProps) {
  const statusColors = getLoadStatusColors(status);

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: statusColors.background,
            borderColor: statusColors.border,
          },
        ]}>
        <Text style={[styles.text, { color: statusColors.text }]}>
          {formatLoadStatus(status)}
        </Text>
      </View>
      {hot ? (
        <View style={[styles.badge, styles.hot]}>
          <Text style={[styles.text, styles.hotText]}>HOT</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: PP2Theme.radius.md,
    borderWidth: 1,
    minHeight: 28,
    justifyContent: 'center',
  },
  text: {
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  hot: {
    backgroundColor: PP2Theme.colors.hotSurface,
    borderColor: PP2Theme.colors.hotBorder,
  },
  hotText: { color: PP2Theme.colors.hotText },
});
