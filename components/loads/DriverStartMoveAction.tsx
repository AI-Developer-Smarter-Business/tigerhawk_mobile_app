import {
  StyleSheet,
  View,
  type GestureResponderEvent,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';

type DriverStartMoveActionProps = {
  moveId: string;
  loading: boolean;
  disabled?: boolean;
  onStart: (moveId: string) => void;
};

/** CTA shown only for accepted, not-yet-started Upcoming moves (C.3). */
export function DriverStartMoveAction({
  moveId,
  loading,
  disabled = false,
  onStart,
}: DriverStartMoveActionProps) {
  const handlePress = (event?: GestureResponderEvent) => {
    event?.stopPropagation();
    onStart(moveId);
  };

  return (
    <View style={styles.wrap}>
      <Button
        title={strings.moveOffer.startMove}
        variant="accent"
        loading={loading}
        disabled={disabled || loading}
        onPress={handlePress}
        accessibilityLabel={strings.moveOffer.startMoveA11y}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: PP2Theme.spacing.md,
    paddingTop: PP2Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: PP2Theme.colors.border,
  },
});
