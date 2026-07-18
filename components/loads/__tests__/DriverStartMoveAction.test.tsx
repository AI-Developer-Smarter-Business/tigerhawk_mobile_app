import { fireEvent, render, screen } from '@testing-library/react-native';

import { DriverStartMoveAction } from '@/components/loads/DriverStartMoveAction';
import { strings } from '@/constants/strings';

describe('DriverStartMoveAction (C.3)', () => {
  it('passes the exact accepted move id', () => {
    const onStart = jest.fn();

    render(
      <DriverStartMoveAction
        moveId="move-accepted"
        loading={false}
        onStart={onStart}
      />,
    );

    fireEvent.press(screen.getByText(strings.moveOffer.startMove));
    expect(onStart).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledWith('move-accepted');
  });

  it('is disabled while starting', () => {
    render(
      <DriverStartMoveAction
        moveId="move-accepted"
        loading
        onStart={jest.fn()}
      />,
    );

    expect(
      screen.getByLabelText(strings.moveOffer.startMoveA11y).props
        .accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: true, busy: true }));
  });
});
