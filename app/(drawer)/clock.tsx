import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ClockHistorySection } from '@/components/clock/ClockHistorySection';
import { ClockTimer } from '@/components/clock/ClockTimer';
import { AppToast } from '@/components/ui/AppToast';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Screen } from '@/components/ui/Screen';
import { ErrorState, LoadingState } from '@/components/ui/ScreenState';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useDriverClockAction } from '@/hooks/useDriverClockAction';
import { useDriverClockQuery } from '@/hooks/useDriverClockQuery';
import { formatCentralLongDate } from '@/lib/time/central';

/**
 * Duty Clock — separate from delivery Wait Check In/Out (TASKS I.1–I.4).
 */
export default function ClockScreen() {
  const clockQuery = useDriverClockQuery();
  const clockAction = useDriverClockAction();

  useFocusEffect(
    useCallback(() => {
      void clockQuery.refetch();
    }, [clockQuery.refetch]),
  );

  if (clockQuery.loading && !clockQuery.state) {
    return (
      <LoadingState
        message={strings.clock.loading}
        spinnerColor={PP2Theme.colors.tms.navActive}
      />
    );
  }

  if (clockQuery.error && !clockQuery.state) {
    return (
      <ErrorState
        message={clockQuery.error}
        actionLabel={strings.clock.retry}
        onAction={() => void clockQuery.refetch()}
      />
    );
  }

  const isClockedIn = clockQuery.state?.isClockedIn === true;
  const startedAt = isClockedIn
    ? (clockQuery.state?.lastClockInAt ?? null)
    : null;

  return (
    <Screen scroll>
      <AppToast
        message={clockAction.successMessage}
        onDismiss={clockAction.clearSuccess}
      />

      <Text
        style={styles.date}
        accessibilityLabel={strings.clock.dateA11y}>
        {formatCentralLongDate()}
      </Text>
      <Text style={styles.centralHint}>{strings.clock.centralHint}</Text>

      {clockQuery.error ? (
        <ErrorBanner
          message={clockQuery.error}
          actionLabel={strings.clock.retry}
          onAction={() => void clockQuery.refetch()}
        />
      ) : null}

      {clockAction.error ? (
        <ErrorBanner
          message={clockAction.error}
          actionLabel={strings.moveOffer.dismissError}
          onAction={clockAction.clearError}
        />
      ) : null}

      <ClockTimer startedAt={startedAt} active={isClockedIn} />

      <View style={styles.actions}>
        {isClockedIn ? (
          <Button
            title={strings.clock.clockOut}
            variant="accent"
            loading={clockAction.pending}
            disabled={clockAction.pending}
            onPress={() => clockAction.runEvent('out')}
            accessibilityLabel={strings.clock.clockOutA11y}
            testID="driver-clock-out"
          />
        ) : (
          <Button
            title={strings.clock.clockIn}
            variant="accent"
            loading={clockAction.pending}
            disabled={clockAction.pending}
            onPress={() => clockAction.runEvent('in')}
            accessibilityLabel={strings.clock.clockInA11y}
            testID="driver-clock-in"
          />
        )}
      </View>

      <ClockHistorySection state={clockQuery.state} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  date: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    textAlign: 'center',
  },
  centralHint: {
    marginTop: PP2Theme.spacing.xs,
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    marginTop: PP2Theme.spacing.md,
  },
});
