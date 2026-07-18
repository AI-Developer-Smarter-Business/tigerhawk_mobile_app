import { AppActionSheet } from '@/components/ui/AppActionSheet';
import { strings } from '@/constants/strings';

type AcceptMoveActionSheetProps = {
  visible: boolean;
  moveLabel: string;
  onConfirm: (start: boolean) => void;
  onDismiss: () => void;
};

/**
 * C.2 acceptance choice. Each confirmation maps to exactly one `/accept`
 * request; starting is part of that same payload, never a second request.
 */
export function AcceptMoveActionSheet({
  visible,
  moveLabel,
  onConfirm,
  onDismiss,
}: AcceptMoveActionSheetProps) {
  return (
    <AppActionSheet
      visible={visible}
      title={strings.moveOffer.acceptSheetTitle}
      message={strings.moveOffer.acceptSheetMessage(moveLabel)}
      onDismiss={onDismiss}
      testID="accept-move-action-sheet"
      actions={[
        {
          label: strings.moveOffer.acceptAndStart,
          onPress: () => onConfirm(true),
        },
        {
          label: strings.moveOffer.acceptStartLater,
          onPress: () => onConfirm(false),
        },
        {
          label: strings.moveOffer.cancelAccept,
          variant: 'cancel',
          onPress: () => undefined,
        },
      ]}
    />
  );
}
