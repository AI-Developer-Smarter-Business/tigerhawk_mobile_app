import { StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';
import { formatLoadStatus } from '@/lib/loads';
import type { LoadStatus } from '@/types';

type StatusBadgeProps = {
  status: LoadStatus;
  hot?: boolean;
};

export function StatusBadge({ status, hot }: StatusBadgeProps) {
  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <Text style={styles.text}>{formatLoadStatus(status)}</Text>
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
    backgroundColor: PP2Theme.colors.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: PP2Theme.radius.sm,
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
  },
  text: {
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '600',
    color: PP2Theme.colors.primary,
  },
  hot: {
    backgroundColor: PP2Theme.colors.hotSurface,
    borderColor: PP2Theme.colors.hotBorder,
  },
  hotText: { color: PP2Theme.colors.hotText },
});
