import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { AppToast } from '@/components/ui/AppToast';

jest.mock('@expo/vector-icons/FontAwesome', () => () => null);

describe('AppToast', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows and dismisses a success notice automatically', () => {
    const onDismiss = jest.fn();
    render(
      <AppToast
        message="You have accepted this move."
        durationMs={1000}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByText('You have accepted this move.')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('can be dismissed manually', () => {
    const onDismiss = jest.fn();
    render(<AppToast message="Move started." onDismiss={onDismiss} />);

    fireEvent.press(screen.getByLabelText('Dismiss notification'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
