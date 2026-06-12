import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import type { DeliveryWaitTimerState } from '@/hooks/useDeliveryWaitTimer';

type DeliveryWaitSectionProps = {
  timer: DeliveryWaitTimerState;
  fieldActionPending?: boolean;
};

export function DeliveryWaitSection({
  timer,
  fieldActionPending = false,
}: DeliveryWaitSectionProps) {
  if (!timer.active && timer.snapshot.phase === 'idle') {
    return null;
  }

  const phaseLabel =
    timer.snapshot.phase === 'billable'
      ? strings.waitTime.phaseBillable
      : timer.snapshot.phase === 'free'
        ? strings.waitTime.phaseFree
        : timer.snapshot.phase === 'stopped'
          ? strings.waitTime.phaseStopped
          : strings.waitTime.phaseIdle;

  const phaseColor =
    timer.snapshot.phase === 'billable'
      ? PP2Theme.colors.error
      : timer.snapshot.phase === 'free'
        ? PP2Theme.colors.tms.navActive
        : PP2Theme.colors.textMuted;

  return (
    <Card title={strings.waitTime.sectionTitle} elevated>
      {timer.loading ? (
        <ActivityIndicator color={PP2Theme.colors.tms.navActive} />
      ) : null}
      {timer.error ? <Text style={styles.error}>{timer.error}</Text> : null}
      <View style={styles.row}>
        <Text style={styles.elapsed}>{timer.formattedElapsed}</Text>
        <View style={[styles.phasePill, { borderColor: phaseColor }]}>
          <Text style={[styles.phaseText, { color: phaseColor }]}>{phaseLabel}</Text>
        </View>
      </View>
      {timer.snapshot.phase === 'free' ? (
        <Text style={styles.meta}>
          {strings.waitTime.freeRemaining(timer.snapshot.freeMinutesRemaining)}
        </Text>
      ) : null}
      {timer.exceededNotified || timer.snapshot.phase === 'billable' ? (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>{strings.waitTime.exceededBanner}</Text>
        </View>
      ) : null}
      {timer.usingFallbackStart && !timer.eventId ? (
        <Text style={styles.syncHint}>{strings.waitTime.syncHint}</Text>
      ) : null}
      {timer.mockMode ? (
        <Text style={styles.mockHint}>{strings.waitTime.mockHint}</Text>
      ) : null}
      {timer.canStop ? (
        <View style={styles.stopWrap}>
          <Button
            title={strings.waitTime.endWaitTime}
            variant="outlineAccent"
            loading={timer.stopping}
            disabled={timer.stopping || fieldActionPending}
            onPress={() => void timer.stopTimer()}
            accessibilityLabel={strings.waitTime.endWaitTimeA11y}
          />
          <Text style={styles.stopHint}>{strings.waitTime.endWaitTimeHint}</Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: PP2Theme.spacing.sm,
    marginBottom: PP2Theme.spacing.sm,
  },
  elapsed: {
    fontSize: PP2Theme.typography.sizes.headline,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  phasePill: {
    borderWidth: 1,
    borderRadius: PP2Theme.radius.sm,
    paddingHorizontal: PP2Theme.spacing.sm,
    paddingVertical: PP2Theme.spacing.xs,
  },
  phaseText: {
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  meta: {
    fontSize: PP2Theme.typography.sizes.subhead,
    color: PP2Theme.colors.textMuted,
  },
  alertBox: {
    marginTop: PP2Theme.spacing.sm,
    backgroundColor: PP2Theme.colors.errorSurface,
    borderColor: PP2Theme.colors.errorBorder,
    borderWidth: 1,
    borderRadius: PP2Theme.radius.sm,
    padding: PP2Theme.spacing.sm,
  },
  alertText: {
    fontSize: PP2Theme.typography.sizes.subhead,
    color: PP2Theme.colors.error,
    fontWeight: '600',
  },
  mockHint: {
    marginTop: PP2Theme.spacing.sm,
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    fontStyle: 'italic',
  },
  syncHint: {
    marginTop: PP2Theme.spacing.sm,
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
  },
  error: {
    color: PP2Theme.colors.error,
    marginBottom: PP2Theme.spacing.sm,
  },
  stopWrap: {
    marginTop: PP2Theme.spacing.md,
    gap: PP2Theme.spacing.xs,
  },
  stopHint: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    textAlign: 'center',
  },
});
