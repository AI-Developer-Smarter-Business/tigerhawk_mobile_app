import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useOfflineQueue } from '@/context/OfflineQueueContext';

/**
 * Shows pending offline actions waiting to sync (task 9.4).
 */
export function OfflineQueueBanner() {
  const { pendingCount } = useOfflineQueue();

  if (pendingCount <= 0) {
    return null;
  }

  return (
    <View
      style={styles.banner}
      accessibilityRole="alert"
      accessibilityLabel={strings.network.offlineQueueBannerA11y(pendingCount)}>
      <Text style={styles.text}>{strings.network.offlineQueueBanner(pendingCount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: PP2Theme.colors.tms.navActive,
    paddingVertical: PP2Theme.spacing.sm,
    paddingHorizontal: PP2Theme.spacing.md,
  },
  text: {
    color: PP2Theme.colors.tms.navActiveText,
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
});
