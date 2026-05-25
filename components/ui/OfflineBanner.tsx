import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useNetwork } from '@/context/NetworkContext';

/**
 * Global banner when the device is offline (task 4.5). No upload queue in v1.
 */
export function OfflineBanner() {
  const { isOffline, isReady } = useNetwork();

  if (!isReady || !isOffline) {
    return null;
  }

  return (
    <View
      style={styles.banner}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite">
      <Text style={styles.title}>{strings.network.offlineTitle}</Text>
      <Text style={styles.message}>{strings.network.offlineMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: PP2Theme.colors.hotSurface,
    borderBottomWidth: 1,
    borderBottomColor: PP2Theme.colors.hotBorder,
    paddingHorizontal: PP2Theme.spacing.md,
    paddingVertical: PP2Theme.spacing.sm,
  },
  title: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    color: PP2Theme.colors.hotText,
  },
  message: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.hotText,
    marginTop: 2,
    lineHeight: 18,
  },
});
