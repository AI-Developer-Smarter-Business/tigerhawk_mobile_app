import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { canDriverTransition, formatLoadStatus, getDriverActionsForStatus } from '@/lib/loads';
import type { LoadStatus } from '@/types';

type DriverActionBarProps = {
  currentStatus: LoadStatus;
  activeHolds: string[];
  onStatusChange: (status: LoadStatus) => void;
};

export function DriverActionBar({
  currentStatus,
  activeHolds,
  onStatusChange,
}: DriverActionBarProps) {
  const [pending, setPending] = useState<LoadStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChange, setLastChange] = useState<string | null>(null);

  const actions = getDriverActionsForStatus(currentStatus);
  const blocked = activeHolds.length > 0;

  const handleAction = async (next: LoadStatus) => {
    if (blocked) {
      setError(strings.driverActions.holdsBlock);
      return;
    }
    if (!canDriverTransition(currentStatus, next)) {
      setError(strings.driverActions.transitionDenied);
      return;
    }
    setPending(next);
    setError(null);
    await new Promise((r) => setTimeout(r, 400));
    onStatusChange(next);
    setLastChange(
      `${formatLoadStatus(currentStatus)} → ${formatLoadStatus(next)}`,
    );
    setPending(null);
  };

  if (actions.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.done}>{strings.driverActions.noActions}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{strings.driverActions.title}</Text>
      {error ? <ErrorBanner message={error} /> : null}
      {lastChange ? (
        <Text style={styles.success}>
          {strings.driverActions.updated}: {lastChange}
        </Text>
      ) : null}
      {actions.map((action) => (
        <Button
          key={action}
          title={formatLoadStatus(action)}
          variant="primary"
          loading={pending === action}
          disabled={blocked || (pending !== null && pending !== action)}
          onPress={() => handleAction(action)}
          style={styles.btn}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: PP2Theme.spacing.md },
  title: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '600',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.sm,
  },
  btn: { marginBottom: PP2Theme.spacing.sm },
  done: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
  },
  success: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.success,
    marginBottom: PP2Theme.spacing.sm,
  },
});
