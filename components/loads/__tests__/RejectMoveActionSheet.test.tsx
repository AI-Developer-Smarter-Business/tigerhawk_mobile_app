import { fireEvent, render, screen } from '@testing-library/react-native';

import { RejectMoveActionSheet } from '@/components/loads/RejectMoveActionSheet';
import { strings } from '@/constants/strings';

describe('RejectMoveActionSheet (C.4)', () => {
  it('submits a trimmed reason for the selected move', () => {
    const onConfirm = jest.fn();
    const onDismiss = jest.fn();

    render(
      <RejectMoveActionSheet
        visible
        moveLabel="THWK_123"
        onConfirm={onConfirm}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.changeText(
      screen.getByLabelText(strings.moveOffer.rejectReasonA11y),
      '  Schedule conflict  ',
    );
    fireEvent.press(screen.getByTestId('confirm-reject-move'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith('Schedule conflict');
  });

  it('allows the API-contract optional reason', () => {
    const onConfirm = jest.fn();

    render(
      <RejectMoveActionSheet
        visible
        moveLabel="move-2"
        onConfirm={onConfirm}
        onDismiss={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByTestId('confirm-reject-move'));

    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it('cancels without rejecting', () => {
    const onConfirm = jest.fn();
    const onDismiss = jest.fn();

    render(
      <RejectMoveActionSheet
        visible
        moveLabel="move-3"
        onConfirm={onConfirm}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.press(screen.getByTestId('cancel-reject-move'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('matches the TMS 500-character limit', () => {
    render(
      <RejectMoveActionSheet
        visible
        moveLabel="move-4"
        onConfirm={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );

    expect(
      screen.getByLabelText(strings.moveOffer.rejectReasonA11y).props.maxLength,
    ).toBe(500);
  });
});
