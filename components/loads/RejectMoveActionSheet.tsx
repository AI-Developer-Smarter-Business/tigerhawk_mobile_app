import { useCallback, useEffect, useState } from 'react';

import { Input } from '@/components/ui/Input';
import { AppActionSheet } from '@/components/ui/AppActionSheet';
import { strings } from '@/constants/strings';

const MAX_REASON_LENGTH = 500;

type RejectMoveActionSheetProps = {
  visible: boolean;
  moveLabel: string;
  onConfirm: (reason: string | undefined) => void;
  onDismiss: () => void;
};

/** Collects the optional dispatch-facing rejection reason (TASKS C.4). */
export function RejectMoveActionSheet({
  visible,
  moveLabel,
  onConfirm,
  onDismiss,
}: RejectMoveActionSheetProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!visible) setReason('');
  }, [visible]);

  const handleDismiss = useCallback(() => {
    setReason('');
    onDismiss();
  }, [onDismiss]);

  const trimmedReason = reason.trim();

  return (
    <AppActionSheet
      visible={visible}
      title={strings.moveOffer.rejectSheetTitle}
      message={strings.moveOffer.rejectSheetMessage(moveLabel)}
      onDismiss={handleDismiss}
      testID="reject-move-action-sheet"
      actions={[
        {
          label: strings.moveOffer.confirmReject,
          variant: 'destructive',
          testID: 'confirm-reject-move',
          onPress: () => onConfirm(trimmedReason || undefined),
        },
        {
          label: strings.moveOffer.cancelReject,
          variant: 'cancel',
          testID: 'cancel-reject-move',
          onPress: () => undefined,
        },
      ]}>
      <Input
        label={strings.moveOffer.rejectReasonLabel}
        value={reason}
        onChangeText={setReason}
        placeholder={strings.moveOffer.rejectReasonPlaceholder}
        accessibilityLabel={strings.moveOffer.rejectReasonA11y}
        maxLength={MAX_REASON_LENGTH}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        returnKeyType="done"
      />
    </AppActionSheet>
  );
}
