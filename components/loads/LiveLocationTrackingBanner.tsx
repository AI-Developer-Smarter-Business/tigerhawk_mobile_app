import { ActivityIndicator, Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useNetwork } from '@/hooks/useNetwork';
import type { DriverLocationTrackingState } from '@/hooks/useDriverLocationTracking';
import { formatLastSentAt } from '@/lib/location/format-last-sent-at';
import { isLiveTrackingActiveStatus } from '@/lib/location/tracking-policy';
import type { LoadStatus } from '@/types';

type LiveLocationTrackingBannerProps = {
  tracking: DriverLocationTrackingState;
  loadStatus: LoadStatus;
};

export function LiveLocationTrackingBanner({
  tracking,
  loadStatus,
}: LiveLocationTrackingBannerProps) {
  const { isOffline, isReady: networkReady } = useNetwork();

  if (Platform.OS === 'web' || !isLiveTrackingActiveStatus(loadStatus)) {
    return null;
  }

  if (tracking.needsLocationSettings) {
    return (
      <View style={[styles.banner, styles.bannerWarning]} accessibilityRole="alert">
        <Text style={styles.title}>{strings.location.liveTrackingSettingsTitle}</Text>
        <Text style={styles.meta}>{strings.location.liveTrackingSettingsHint}</Text>
        <Button
          title={strings.location.openSettings}
          variant="outlineAccent"
          onPress={() => void Linking.openSettings()}
          accessibilityLabel={strings.location.openSettings}
        />
      </View>
    );
  }

  if (!tracking.isTracking && !tracking.lastSentAtMs) {
    return null;
  }

  const lastSentLabel =
    tracking.lastSentAtMs != null
      ? strings.location.liveTrackingLastSent(formatLastSentAt(tracking.lastSentAtMs))
      : strings.location.liveTrackingSending;

  const meta = networkReady && isOffline
    ? strings.location.liveTrackingPausedOffline
    : lastSentLabel;

  return (
    <View
      style={[styles.banner, styles.bannerActive]}
      accessibilityRole="text"
      accessibilityLabel={strings.location.liveTrackingBannerA11y}
    >
      <View style={styles.row}>
        {tracking.isTracking && !tracking.lastSentAtMs ? (
          <ActivityIndicator
            size="small"
            color={PP2Theme.colors.tms.navActive}
            style={styles.spinner}
          />
        ) : null}
        <View style={styles.textBlock}>
          <Text style={styles.title}>{strings.location.liveTrackingBanner}</Text>
          <Text style={styles.meta}>{meta}</Text>
        </View>
      </View>
      {tracking.error ? (
        <Text style={styles.error} accessibilityRole="alert">
          {tracking.error.message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    borderRadius: PP2Theme.radius.sm,
    padding: PP2Theme.spacing.sm,
    marginBottom: PP2Theme.spacing.md,
  },
  bannerActive: {
    backgroundColor: PP2Theme.colors.accentMuted,
    borderColor: PP2Theme.colors.tms.navActive,
  },
  bannerWarning: {
    backgroundColor: PP2Theme.colors.surface,
    borderColor: PP2Theme.colors.tms.navActive,
    gap: PP2Theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PP2Theme.spacing.sm,
  },
  spinner: {
    marginRight: PP2Theme.spacing.xs,
  },
  textBlock: {
    flex: 1,
    gap: PP2Theme.spacing.xs,
  },
  title: {
    fontSize: PP2Theme.typography.sizes.subhead,
    fontWeight: '700',
    color: PP2Theme.colors.text,
  },
  meta: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
  },
  error: {
    marginTop: PP2Theme.spacing.xs,
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.error,
  },
});
