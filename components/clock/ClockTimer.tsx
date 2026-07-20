import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { formatElapsedClock } from '@/lib/time/central';

type ClockTimerProps = {
  /** ISO start when on duty; null when off duty. */
  startedAt: string | null;
  active: boolean;
};

/**
 * Circular elapsed timer for duty clock (I.1). Duration is wall-clock absolute.
 */
export function ClockTimer({ startedAt, active }: ClockTimerProps) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!active || !startedAt) return;
    const id = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(id);
  }, [active, startedAt]);

  const display = active
    ? formatElapsedClock(startedAt, nowMs)
    : '0:00';

  return (
    <View
      style={styles.ring}
      accessibilityRole="text"
      accessibilityLabel={`${strings.clock.timerA11y}: ${display}`}>
      <Text style={styles.digits}>{display}</Text>
      <Text style={styles.caption}>
        {active ? strings.clock.statusOnDuty : strings.clock.statusOffDuty}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    alignSelf: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 4,
    borderColor: PP2Theme.colors.tms.navActive,
    backgroundColor: PP2Theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: PP2Theme.spacing.lg,
  },
  digits: {
    fontSize: 40,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  caption: {
    marginTop: PP2Theme.spacing.xs,
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    fontWeight: '600',
  },
});
