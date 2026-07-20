import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import {
  formatCentralTime,
  formatElapsedClock,
  isCentralToday,
} from '@/lib/time/central';
import type { DriverClockState } from '@/lib/tms/parse-driver-clock';

type ClockHistorySectionProps = {
  state: DriverClockState | null;
  nowMs?: number;
};

/**
 * Day history when the API does not return event rows (I.1).
 * Shows an open “Working” session from GET fields, or the empty-day copy.
 */
export function ClockHistorySection({
  state,
  nowMs = Date.now(),
}: ClockHistorySectionProps) {
  const openToday =
    state?.isClockedIn &&
    state.lastClockInAt &&
    isCentralToday(state.lastClockInAt);

  if (openToday && state?.lastClockInAt) {
    return (
      <View style={styles.card} accessibilityLabel={strings.clock.workingLabel}>
        <Text style={styles.cardTitle}>{strings.clock.workingLabel}</Text>
        <Text style={styles.cardLine}>
          {strings.clock.sessionStarted}:{' '}
          {formatCentralTime(state.lastClockInAt)}
        </Text>
        <Text style={styles.cardLine}>
          {formatElapsedClock(state.lastClockInAt, nowMs)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{strings.clock.emptyHistory}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PP2Theme.colors.surface,
    borderRadius: PP2Theme.radius.md,
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    padding: PP2Theme.spacing.md,
    marginTop: PP2Theme.spacing.lg,
  },
  cardTitle: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.xs,
  },
  cardLine: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginTop: 2,
  },
  empty: {
    marginTop: PP2Theme.spacing.lg,
    paddingVertical: PP2Theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
