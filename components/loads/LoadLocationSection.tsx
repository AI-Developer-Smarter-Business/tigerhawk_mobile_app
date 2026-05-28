import { Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useLoadLocationShare } from '@/hooks/useLoadLocationShare';
import { formatAppointment } from '@/lib/loads/format';
import {
  formatAccuracyMeters,
  formatCoordinates,
} from '@/lib/location/format-coordinates';
import { buildGoogleMapsUrl } from '@/lib/location/maps-url';
import { canPersistLocationToTms } from '@/lib/location/tms-location-integration';

type LoadLocationSectionProps = {
  loadReference: string;
};

export function LoadLocationSection({ loadReference }: LoadLocationSectionProps) {
  const { position, loading, error, needsLocationSettings, lowPowerHint, shareLocation } =
    useLoadLocationShare({ loadReference });

  if (Platform.OS === 'web') {
    return (
      <Text style={styles.disclaimer} accessibilityRole="text">
        {strings.location.notAvailableOnWeb}
      </Text>
    );
  }

  const accuracyLabel = position ? formatAccuracyMeters(position.accuracyMeters) : null;

  return (
    <View accessibilityLabel={strings.location.sectionTitle}>
      <Text style={styles.disclaimer}>{strings.location.disclaimer}</Text>

      {!canPersistLocationToTms() ? (
        <Text style={styles.tmsHint}>{strings.location.tmsShareOnlyHint}</Text>
      ) : null}

      {error ? (
        <ErrorBanner title={error.title} message={error.message} />
      ) : null}

      {lowPowerHint ? (
        <Text style={styles.tmsHint}>{strings.location.lowPowerHint}</Text>
      ) : null}

      {position ? (
        <View style={styles.coordsBlock}>
          <Text style={styles.coordLabel}>{strings.location.coordinatesLabel}</Text>
          <Text style={styles.coordValue} selectable>
            {formatCoordinates(position)}
          </Text>
          {accuracyLabel ? (
            <Text style={styles.meta}>
              {strings.location.accuracyLabel}: {accuracyLabel}
            </Text>
          ) : null}
          <Text style={styles.meta}>
            {strings.location.lastUpdatedLabel}:{' '}
            {formatAppointment(new Date(position.timestamp).toISOString())}
          </Text>
          <Button
            title={strings.location.openInMaps}
            variant="outline"
            onPress={() =>
              void Linking.openURL(buildGoogleMapsUrl(position.latitude, position.longitude))
            }
            style={styles.secondaryBtn}
            accessibilityLabel={strings.location.mapsLinkA11y}
          />
        </View>
      ) : null}

      <Button
        title={strings.location.shareLocation}
        variant="accent"
        loading={loading}
        disabled={loading}
        onPress={() => void shareLocation()}
        style={styles.primaryBtn}
        accessibilityLabel={strings.location.shareLocationA11y}
      />

      {needsLocationSettings ? (
        <Button
          title={strings.location.openSettings}
          variant="outline"
          onPress={() => void Linking.openSettings()}
          style={styles.secondaryBtn}
          accessibilityLabel={strings.location.openSettings}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  disclaimer: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: PP2Theme.spacing.sm,
  },
  tmsHint: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    lineHeight: 18,
    marginBottom: PP2Theme.spacing.md,
    fontStyle: 'italic',
  },
  coordsBlock: {
    marginBottom: PP2Theme.spacing.md,
    paddingBottom: PP2Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: PP2Theme.colors.border,
  },
  coordLabel: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.xs,
  },
  coordValue: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    color: PP2Theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  meta: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginTop: PP2Theme.spacing.xs,
  },
  primaryBtn: {
    marginBottom: PP2Theme.spacing.sm,
  },
  secondaryBtn: {
    marginTop: PP2Theme.spacing.sm,
  },
});
