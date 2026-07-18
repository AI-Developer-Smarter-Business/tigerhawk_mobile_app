import { fireEvent, render, screen } from '@testing-library/react-native';

import { DriverMoveOfferActions } from '@/components/loads/DriverMoveOfferActions';
import { strings } from '@/constants/strings';

describe('DriverMoveOfferActions (C.1)', () => {
  it('passes the exact move id to Accept and Reject', () => {
    const onAccept = jest.fn();
    const onReject = jest.fn();

    render(
      <DriverMoveOfferActions
        moveId="move-42"
        pendingAction={null}
        onAccept={onAccept}
        onReject={onReject}
      />,
    );

    fireEvent.press(screen.getByText(strings.moveOffer.accept));
    fireEvent.press(screen.getByText(strings.moveOffer.reject));

    expect(onAccept).toHaveBeenCalledWith('move-42');
    expect(onReject).toHaveBeenCalledWith('move-42');
  });

  it('disables both choices while this move is being accepted', () => {
    render(
      <DriverMoveOfferActions
        moveId="move-42"
        pendingAction="accept"
        onAccept={jest.fn()}
        onReject={jest.fn()}
      />,
    );

    expect(
      screen.getByLabelText(strings.moveOffer.acceptA11y).props
        .accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: true, busy: true }));
    expect(
      screen.getByLabelText(strings.moveOffer.rejectA11y).props
        .accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: true, busy: false }));
  });
});
