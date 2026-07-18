import { fireEvent, render, screen } from '@testing-library/react-native';

import { DriverProgressActions } from '@/components/loads/DriverProgressActions';
import { strings } from '@/constants/strings';
import type {
  DriverLoadProgress,
  DriverProgressPhase,
} from '@/lib/loads/driver-progress';

function progress(phase: DriverProgressPhase): DriverLoadProgress {
  return {
    phase,
    label: 'Enroute To Deliver Load',
    activeMoveId: 'move-1',
    activeMoveIndex: 0,
    currentStop: null,
    nextStop: null,
    allMovesComplete: phase === 'load_complete',
    nextUnassignedMoveId: null,
    status: 'Enroute To Deliver Load',
    containerEmpty: false,
  };
}

describe('DriverProgressActions (D.1)', () => {
  it.each([
    ['not_started', 'start_move', 'Start Move'],
    ['enroute', 'arrived', 'Arrived'],
    ['arrived', 'enroute', 'Enroute'],
    ['load_complete', 'complete', 'Complete'],
  ] as const)(
    'confirms %s through semantic action %s',
    (phase, expectedAction, buttonLabel) => {
      const onAction = jest.fn();
      render(
        <DriverProgressActions
          progress={progress(phase)}
          loadCompleted={false}
          pendingAction={null}
          error={null}
          onAction={onAction}
          onDismissError={jest.fn()}
        />,
      );

      expect(screen.getByText('Enroute To Deliver Load')).toBeTruthy();
      fireEvent.press(screen.getByText(buttonLabel));
      expect(screen.getByText(strings.driverProgress.confirmTitle)).toBeTruthy();
      fireEvent.press(screen.getByTestId('confirm-driver-progress-action'));

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(onAction).toHaveBeenCalledWith({ action: expectedAction });
    },
  );

  it('cancel does not send an action', () => {
    const onAction = jest.fn();
    render(
      <DriverProgressActions
        progress={progress('enroute')}
        loadCompleted={false}
        pendingAction={null}
        error={null}
        onAction={onAction}
        onDismissError={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText(strings.driverProgress.arrived));
    fireEvent.press(screen.getByTestId('cancel-driver-progress-action'));
    expect(onAction).not.toHaveBeenCalled();
  });

  it('does not offer Complete after the load is already completed', () => {
    render(
      <DriverProgressActions
        progress={progress('load_complete')}
        loadCompleted
        pendingAction={null}
        error={null}
        onAction={jest.fn()}
        onDismissError={jest.fn()}
      />,
    );

    expect(
      screen.getByText(strings.driverProgress.alreadyCompleted),
    ).toBeTruthy();
    expect(screen.queryByText(strings.driverProgress.complete)).toBeNull();
  });

  it('renders the exact server requirements checklist', () => {
    render(
      <DriverProgressActions
        progress={progress('load_complete')}
        loadCompleted={false}
        pendingAction={null}
        error={{
          kind: 'validation',
          title: 'Requirements missing',
          message: 'Complete the following items.',
          details: ['seal_number', 'tir_in_photo'],
          code: 'REQUIREMENTS_NOT_MET',
          appAction: 'show_checklist',
        }}
        onAction={jest.fn()}
        onDismissError={jest.fn()}
      />,
    );

    expect(screen.getByText('Requirements missing')).toBeTruthy();
    expect(screen.getByText('· seal_number')).toBeTruthy();
    expect(screen.getByText('· tir_in_photo')).toBeTruthy();
  });

  it('requires and sends max-50 free-text chassis when arriving at pickup', () => {
    const onAction = jest.fn();
    const pickupProgress = {
      ...progress('enroute'),
      nextStop: {
        id: 'stop-1',
        event_type: 'pickup_container',
        sort_order: 1,
        started_at: null,
        arrived_at: null,
        departed_at: null,
        location: null,
      },
    };
    render(
      <DriverProgressActions
        progress={pickupProgress}
        loadCompleted={false}
        pendingAction={null}
        error={null}
        onAction={onAction}
        onDismissError={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText(strings.driverProgress.arrived));
    const input = screen.getByTestId('driver-progress-chassis-input');
    expect(input.props.maxLength).toBe(50);

    fireEvent.press(screen.getByTestId('confirm-driver-progress-action'));
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByText(strings.driverProgress.requiredField)).toBeTruthy();

    fireEvent.changeText(input, '  CHS-900  ');
    fireEvent.press(screen.getByTestId('confirm-driver-progress-action'));
    expect(onAction).toHaveBeenCalledWith({
      action: 'arrived',
      chassisNumber: 'CHS-900',
    });
  });

  it('prompts after CHASSIS_REQUIRED and retries Arrived with chassis', () => {
    const onAction = jest.fn();
    render(
      <DriverProgressActions
        progress={progress('enroute')}
        loadCompleted={false}
        pendingAction={null}
        error={{
          kind: 'validation',
          title: 'Chassis required',
          message: 'Enter chassis.',
          code: 'CHASSIS_REQUIRED',
          appAction: 'prompt_chassis',
        }}
        onAction={onAction}
        onDismissError={jest.fn()}
      />,
    );

    const input = screen.getByTestId('driver-progress-chassis-input');
    fireEvent.changeText(input, 'CHS-422');
    fireEvent.press(screen.getByTestId('confirm-driver-progress-action'));

    expect(onAction).toHaveBeenCalledWith({
      action: 'arrived',
      chassisNumber: 'CHS-422',
    });
  });

  it('submits only equipment fields requested by Complete missing[]', () => {
    const onAction = jest.fn();
    render(
      <DriverProgressActions
        progress={progress('load_complete')}
        loadCompleted={false}
        pendingAction={null}
        error={{
          kind: 'validation',
          title: 'Requirements missing',
          message: 'Complete the following items.',
          details: ['container_number', 'seal_number', 'tir_in_photo'],
          code: 'REQUIREMENTS_NOT_MET',
          appAction: 'show_checklist',
        }}
        onAction={onAction}
        onDismissError={jest.fn()}
      />,
    );

    const container = screen.getByTestId('driver-progress-container-input');
    const seal = screen.getByTestId('driver-progress-seal-input');
    expect(container.props.maxLength).toBe(20);
    expect(seal.props.maxLength).toBe(50);

    fireEvent.changeText(container, 'CONT-44');
    fireEvent.changeText(seal, 'SEAL-44');
    fireEvent.press(screen.getByTestId('confirm-driver-progress-action'));

    expect(onAction).toHaveBeenCalledWith({
      action: 'complete',
      containerNumber: 'CONT-44',
      sealNumber: 'SEAL-44',
    });
  });
});
