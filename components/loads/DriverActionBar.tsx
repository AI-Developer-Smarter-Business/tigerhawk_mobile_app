import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import {
  mapActiveHoldsPreview,
  mapErrorToUserFacing,
  type UserFacingError,
} from '@/lib/errors';
import { errorStrings } from '@/lib/errors/strings';
import { canDriverTransition, formatLoadStatus, getDriverActionsForStatus } from '@/lib/loads';
import type { LoadStatus } from '@/types';

type DriverActionBarProps = {
  currentStatus: LoadStatus;
  activeHolds: string[];
  onStatusChange: (status: LoadStatus) => Promise<void>;
};

export function DriverActionBar({
  currentStatus,
  activeHolds,
  onStatusChange,
}: DriverActionBarProps) {
  const [pending, setPending] = useState<LoadStatus | null>(null);
  const [actionError, setActionError] = useState<UserFacingError | null>(null);
  const [lastChange, setLastChange] = useState<string | null>(null);

  const actions = getDriverActionsForStatus(currentStatus);
  const blocked = activeHolds.length > 0;

  const handleAction = async (next: LoadStatus) => {
    if (blocked) {
      setActionError(mapActiveHoldsPreview(activeHolds));
      return;
    }
    if (!canDriverTransition(currentStatus, next)) {
      setActionError({
        kind: 'validation',
        title: errorStrings.validationTitle,
        message: strings.driverActions.transitionDenied,
      });
      return;
    }
    setPending(next);
    setActionError(null);
    setLastChange(null);
    try {
      await onStatusChange(next);
      setLastChange(
        `${formatLoadStatus(currentStatus)} → ${formatLoadStatus(next)}`,
      );
    } catch (err) {
      setActionError(mapErrorToUserFacing(err));
    } finally {
      setPending(null);
    }
  };

  if (actions.length === 0) {
    return (
      <View
        style={styles.wrap}
        accessibilityRole="summary"
        accessibilityLabel={strings.driverActions.noActions}>
        <Text style={styles.done}>{strings.driverActions.noActions}</Text>
      </View>
    );
  }

  return (
    <View
      style={styles.wrap}
      accessibilityRole="menu"
      accessibilityLabel={strings.driverActions.title}>
      <View style={styles.titleRow}>
        <View style={styles.titleAccent} />
        <Text style={styles.title}>{strings.driverActions.title}</Text>
      </View>
      {actionError ? (
        <ErrorBanner
          title={actionError.title}
          message={actionError.message}
          details={actionError.details}
        />
      ) : null}
      {lastChange ? (
        <Text style={styles.success} accessibilityLiveRegion="polite">
          {strings.driverActions.updated}: {lastChange}
        </Text>
      ) : null}
      {actions.map((action) => {
        const label = formatLoadStatus(action);
        return (
          <Button
            key={action}
            title={label}
            variant="accent"
            loading={pending === action}
            disabled={blocked || (pending !== null && pending !== action)}
            onPress={() => handleAction(action)}
            style={styles.btn}
            accessibilityLabel={`${strings.driverActions.changeStatusA11y} ${label}`}
            accessibilityHint={
              blocked ? strings.driverActions.blockedByHoldsA11y : undefined
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 0 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PP2Theme.spacing.sm,
    marginBottom: PP2Theme.spacing.sm,
  },
  titleAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: PP2Theme.colors.accentStrip,
  },
  title: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '700',
    color: PP2Theme.colors.text,
  },
  btn: { marginBottom: PP2Theme.spacing.sm },
  done: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
    textAlign: 'center',
  },
  success: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.success,
    marginBottom: PP2Theme.spacing.sm,
    fontWeight: '600',
  },
});
