import { StyleSheet, View, type GestureResponderEvent } from 'react-native';

import { Button } from '@/components/ui/Button';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import type { DriverMoveOfferAction } from '@/lib/tms/mutate-driver-move-offer';

type DriverMoveOfferActionsProps = {
  moveId: string;
  pendingAction: DriverMoveOfferAction | null;
  disabled?: boolean;
  onAccept: (moveId: string) => void;
  onReject: (moveId: string) => void;
};

/**
 * Offer controls for one unaccepted Upcoming move (TASKS C.1).
 * The move id is passed explicitly to prevent load-scoped action ambiguity.
 */
export function DriverMoveOfferActions({
  moveId,
  pendingAction,
  disabled = false,
  onAccept,
  onReject,
}: DriverMoveOfferActionsProps) {
  const handlePress = (
    event: GestureResponderEvent | undefined,
    action: DriverMoveOfferAction,
  ) => {
    event?.stopPropagation();
    if (action === 'accept') onAccept(moveId);
    else onReject(moveId);
  };

  return (
    <View style={styles.actions}>
      <Button
        title={strings.moveOffer.reject}
        variant="outlineAccent"
        disabled={disabled || pendingAction !== null}
        loading={pendingAction === 'reject'}
        onPress={(event) => handlePress(event, 'reject')}
        accessibilityLabel={strings.moveOffer.rejectA11y}
        style={styles.button}
      />
      <Button
        title={strings.moveOffer.accept}
        variant="accent"
        disabled={disabled || pendingAction !== null}
        loading={pendingAction === 'accept'}
        onPress={(event) => handlePress(event, 'accept')}
        accessibilityLabel={strings.moveOffer.acceptA11y}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: PP2Theme.spacing.sm,
    marginTop: PP2Theme.spacing.md,
    paddingTop: PP2Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: PP2Theme.colors.border,
  },
  button: {
    flex: 1,
  },
});
