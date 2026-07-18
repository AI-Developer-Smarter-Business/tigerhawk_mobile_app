import { fireEvent, render, screen } from '@testing-library/react-native';

import { AcceptMoveActionSheet } from '@/components/loads/AcceptMoveActionSheet';
import { strings } from '@/constants/strings';

describe('AcceptMoveActionSheet (C.2)', () => {
  it('maps Accept & Start to start true', () => {
    const onConfirm = jest.fn();
    const onDismiss = jest.fn();

    render(
      <AcceptMoveActionSheet
        visible
        moveLabel="THWK_123"
        onConfirm={onConfirm}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText(strings.moveOffer.acceptSheetTitle)).toBeTruthy();
    expect(screen.getByText(/THWK_123/)).toBeTruthy();

    fireEvent.press(screen.getByText(strings.moveOffer.acceptAndStart));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith(true);
  });

  it('maps Start Later to start false', () => {
    const onConfirm = jest.fn();

    render(
      <AcceptMoveActionSheet
        visible
        moveLabel="THWK_456"
        onConfirm={onConfirm}
        onDismiss={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText(strings.moveOffer.acceptStartLater));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith(false);
  });

  it('cancels without accepting', () => {
    const onConfirm = jest.fn();
    const onDismiss = jest.fn();

    render(
      <AcceptMoveActionSheet
        visible
        moveLabel="THWK_789"
        onConfirm={onConfirm}
        onDismiss={onDismiss}
      />,
    );

    fireEvent.press(screen.getByText(strings.moveOffer.cancelAccept));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
