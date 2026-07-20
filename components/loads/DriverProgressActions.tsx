import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppActionSheet } from '@/components/ui/AppActionSheet';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Input } from '@/components/ui/Input';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import {
  getNextDriverProgressAction,
  type DriverLoadProgress,
  type DriverProgressAction,
  type DriverProgressActionInput,
} from '@/lib/loads/driver-progress';
import type { DriverProgressError } from '@/lib/loads/driver-progress-error';
import {
  formatMissingRequirements,
  hasTirPhotoRequirement,
} from '@/lib/loads/missing-requirement-labels';

type DriverProgressActionsProps = {
  progress: DriverLoadProgress;
  loadCompleted: boolean;
  pendingAction: DriverProgressAction | null;
  error: DriverProgressError | null;
  locked?: boolean;
  onAction: (input: DriverProgressActionInput) => void;
  onDismissError: () => void;
  /** G.4 — open legal POD signature when TMS returns POD_SIGNATURE_REQUIRED. */
  onOpenSignature?: () => void;
  /** F.3 — jump to TIR photo capture when Complete missing includes tir_*_photo. */
  onOpenTirDocuments?: (which: 'TIR Out' | 'TIR In') => void;
};

function actionLabel(action: DriverProgressAction): string {
  switch (action) {
    case 'start_move':
      return strings.driverProgress.startMove;
    case 'enroute':
      return strings.driverProgress.enroute;
    case 'arrived':
      return strings.driverProgress.arrived;
    case 'complete':
      return strings.driverProgress.complete;
  }
}

const PICKUP_EVENTS = new Set(['pickup_container', 'empty_pickup_container']);
const EQUIPMENT_REQUIREMENTS = new Set([
  'chassis_number',
  'container_number',
  'seal_number',
]);

/**
 * PortPro-style next action driven only by TMS `progress` (TASKS D.1).
 */
export function DriverProgressActions({
  progress,
  loadCompleted,
  pendingAction,
  error,
  locked = false,
  onAction,
  onDismissError,
  onOpenSignature,
  onOpenTirDocuments,
}: DriverProgressActionsProps) {
  const [confirmAction, setConfirmAction] =
    useState<DriverProgressAction | null>(null);
  const [chassisNumber, setChassisNumber] = useState('');
  const [containerNumber, setContainerNumber] = useState('');
  const [sealNumber, setSealNumber] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  /** Avoid re-opening the pad on every render while POD_SIGNATURE_REQUIRED stays set. */
  const openedSignatureForErrorRef = useRef(false);
  const nextAction = useMemo(
    () => getNextDriverProgressAction(progress),
    [progress],
  );
  const nextLabel = actionLabel(nextAction);
  const actionsDisabled = locked || pendingAction !== null;
  const missing = useMemo(() => new Set(error?.details ?? []), [error?.details]);
  const checklistDetails = useMemo(
    () => formatMissingRequirements(error?.details),
    [error?.details],
  );
  const arrivedAtPickup =
    confirmAction === 'arrived' &&
    PICKUP_EVENTS.has(progress.nextStop?.event_type ?? '');
  const needsChassis =
    (confirmAction === 'arrived' &&
      (arrivedAtPickup || error?.appAction === 'prompt_chassis')) ||
    (confirmAction === 'complete' && missing.has('chassis_number'));
  const needsContainer =
    confirmAction === 'complete' && missing.has('container_number');
  const needsSeal =
    confirmAction === 'complete' && missing.has('seal_number');
  const hasEquipmentRequirements = [...missing].some((item) =>
    EQUIPMENT_REQUIREMENTS.has(item),
  );
  const hasTirRequirements = hasTirPhotoRequirement(missing);

  useEffect(() => {
    if (pendingAction) return;
    if (error?.appAction === 'prompt_chassis') {
      openedSignatureForErrorRef.current = false;
      setConfirmAction('arrived');
    } else if (
      error?.appAction === 'show_checklist' &&
      hasEquipmentRequirements
    ) {
      openedSignatureForErrorRef.current = false;
      setConfirmAction('complete');
    } else if (error?.appAction === 'open_signature') {
      if (!openedSignatureForErrorRef.current) {
        openedSignatureForErrorRef.current = true;
        onOpenSignature?.();
      }
    } else {
      openedSignatureForErrorRef.current = false;
    }
  }, [
    error?.appAction,
    hasEquipmentRequirements,
    onOpenSignature,
    pendingAction,
  ]);

  const openConfirmation = (action: DriverProgressAction) => {
    setFieldErrors({});
    setConfirmAction(action);
  };

  const openTirFromChecklist = () => {
    if (missing.has('tir_out_photo')) {
      onOpenTirDocuments?.('TIR Out');
      return;
    }
    if (missing.has('tir_in_photo')) {
      onOpenTirDocuments?.('TIR In');
    }
  };

  const submitAction = () => {
    if (!confirmAction || actionsDisabled) return;

    const nextErrors: Record<string, string> = {};
    if (needsChassis && !chassisNumber.trim()) {
      nextErrors.chassis = strings.driverProgress.requiredField;
    }
    if (needsContainer && !containerNumber.trim()) {
      nextErrors.container = strings.driverProgress.requiredField;
    }
    if (needsSeal && !sealNumber.trim()) {
      nextErrors.seal = strings.driverProgress.requiredField;
    }
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onAction({
      action: confirmAction,
      chassisNumber: chassisNumber.trim() || undefined,
      containerNumber: containerNumber.trim() || undefined,
      sealNumber: sealNumber.trim() || undefined,
    });
    setConfirmAction(null);
  };

  const errorAction =
    error?.appAction === 'prompt_chassis'
      ? {
          label: strings.driverProgress.enterChassis,
          onPress: () => openConfirmation('arrived'),
        }
      : error?.appAction === 'show_checklist' && hasEquipmentRequirements
        ? {
            label: strings.driverProgress.provideMissingInfo,
            onPress: () => openConfirmation('complete'),
          }
        : error?.appAction === 'show_checklist' && hasTirRequirements
          ? {
              label: strings.driverProgress.addRequiredDocuments,
              onPress: openTirFromChecklist,
            }
          : error?.appAction === 'open_signature'
            ? {
                label: strings.loadDetail.podSignOnDevice,
                onPress: () => onOpenSignature?.(),
              }
            : {
                label: strings.moveOffer.dismissError,
                onPress: onDismissError,
              };

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={styles.titleAccent} />
        <Text style={styles.title}>{strings.driverProgress.title}</Text>
      </View>

      <View style={styles.progressPill}>
        <Text style={styles.progressPillText}>{progress.label}</Text>
      </View>

      {error ? (
        <ErrorBanner
          title={
            error.appAction === 'show_checklist'
              ? strings.driverProgress.checklistTitle
              : error.title
          }
          message={
            error.appAction === 'show_checklist'
              ? strings.driverProgress.checklistExactHint
              : error.message
          }
          details={checklistDetails ?? error.details}
          actionLabel={errorAction.label}
          onAction={errorAction.onPress}
        />
      ) : null}

      {loadCompleted ? (
        <Text style={styles.done}>{strings.driverProgress.alreadyCompleted}</Text>
      ) : (
        <Button
          title={nextLabel}
          variant="accent"
          loading={pendingAction === nextAction}
          disabled={actionsDisabled}
          onPress={() => openConfirmation(nextAction)}
          accessibilityLabel={
            nextAction === 'complete'
              ? strings.driverProgress.completeA11y
              : strings.driverProgress.actionA11y(nextLabel)
          }
          testID={
            nextAction === 'complete'
              ? 'driver-progress-complete-load'
              : undefined
          }
        />
      )}

      <AppActionSheet
        visible={confirmAction != null}
        title={
          needsChassis && confirmAction === 'arrived'
            ? strings.driverProgress.chassisPromptTitle
            : (needsContainer || needsSeal || needsChassis) &&
                confirmAction === 'complete'
              ? strings.driverProgress.requirementsTitle
              : strings.driverProgress.confirmTitle
        }
        message={
          needsChassis && confirmAction === 'arrived'
            ? strings.driverProgress.chassisPromptMessage
            : (needsContainer || needsSeal || needsChassis) &&
                confirmAction === 'complete'
              ? strings.driverProgress.requirementsMessage
              : strings.driverProgress.confirmMessage(
                  confirmAction ? actionLabel(confirmAction) : nextLabel,
                  progress.label,
                )
        }
        onDismiss={() => {
          setFieldErrors({});
          setConfirmAction(null);
        }}
        testID="driver-progress-confirm-sheet"
        actions={[
          {
            label:
              needsChassis || needsContainer || needsSeal
                ? strings.driverProgress.saveAndContinue
                : strings.driverProgress.confirm,
            testID: 'confirm-driver-progress-action',
            dismissOnPress: false,
            onPress: submitAction,
          },
          {
            label: strings.driverProgress.cancel,
            variant: 'cancel',
            testID: 'cancel-driver-progress-action',
            onPress: () => undefined,
          },
        ]}>
        {needsChassis ? (
          <Input
            label={strings.driverProgress.chassisNumber}
            placeholder={strings.driverProgress.chassisPlaceholder}
            value={chassisNumber}
            onChangeText={setChassisNumber}
            maxLength={50}
            autoCapitalize="characters"
            error={fieldErrors.chassis}
            testID="driver-progress-chassis-input"
          />
        ) : null}
        {needsContainer ? (
          <Input
            label={strings.driverProgress.containerNumber}
            placeholder={strings.driverProgress.containerPlaceholder}
            value={containerNumber}
            onChangeText={setContainerNumber}
            maxLength={20}
            autoCapitalize="characters"
            error={fieldErrors.container}
            testID="driver-progress-container-input"
          />
        ) : null}
        {needsSeal ? (
          <Input
            label={strings.driverProgress.sealNumber}
            placeholder={strings.driverProgress.sealPlaceholder}
            value={sealNumber}
            onChangeText={setSealNumber}
            maxLength={50}
            autoCapitalize="characters"
            error={fieldErrors.seal}
            testID="driver-progress-seal-input"
          />
        ) : null}
        {confirmAction === 'complete' && hasTirRequirements ? (
          <Text style={styles.tirHint}>
            {strings.driverProgress.addRequiredDocuments}:{' '}
            {[
              missing.has('tir_out_photo')
                ? strings.driverProgress.missingTirOut
                : null,
              missing.has('tir_in_photo')
                ? strings.driverProgress.missingTirIn
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        ) : null}
      </AppActionSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: PP2Theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PP2Theme.spacing.sm,
    marginBottom: PP2Theme.spacing.sm,
  },
  titleAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: PP2Theme.colors.accentStrip,
  },
  title: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '700',
    color: PP2Theme.colors.text,
  },
  progressPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: PP2Theme.spacing.sm,
    paddingVertical: PP2Theme.spacing.xs,
    marginBottom: PP2Theme.spacing.md,
    borderRadius: PP2Theme.radius.sm,
    backgroundColor: PP2Theme.colors.accentMuted,
  },
  progressPillText: {
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '700',
    color: PP2Theme.colors.tms.navActive,
  },
  done: {
    color: PP2Theme.colors.success,
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
  },
  tirHint: {
    marginTop: PP2Theme.spacing.sm,
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    lineHeight: 18,
  },
});
