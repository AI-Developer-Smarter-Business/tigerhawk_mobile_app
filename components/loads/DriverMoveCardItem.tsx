import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DriverMoveOfferActions } from '@/components/loads/DriverMoveOfferActions';
import { DriverStartMoveAction } from '@/components/loads/DriverStartMoveAction';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { formatReference } from '@/lib/loads/format';
import type { DriverMoveCard } from '@/lib/loads/driver-move-card';
import {
  formatMoveStopLocation,
  formatMoveStopStage,
} from '@/lib/loads/format-move-stop';
import type { DriverMoveOfferAction } from '@/lib/tms/mutate-driver-move-offer';

type MoveOfferProps = {
  pendingAction: DriverMoveOfferAction | null;
  disabled?: boolean;
  onAccept: (moveId: string) => void;
  onReject: (moveId: string) => void;
};

type StartMoveProps = {
  loading: boolean;
  disabled?: boolean;
  onStart: (moveId: string) => void;
};

type DriverMoveCardItemProps = {
  card: DriverMoveCard;
  onPress: () => void;
  offer?: MoveOfferProps;
  startAction?: StartMoveProps;
};

function formatCardDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCardDateTime(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Move card for Active / Upcoming (TASKS B.2 · PortPro layout, PP2 tokens).
 * Unit of work = **move** (`move_id`), not a generic load row.
 */
export function DriverMoveCardItem({
  card,
  onPress,
  offer,
  startAction,
}: DriverMoveCardItemProps) {
  const ref = formatReference(card.reference_number?.trim() || card.move_id);
  const when =
    formatCardDate(card.assigned_date) ??
    formatCardDate(card.started_at) ??
    formatCardDate(card.accepted_at);
  const progressLabel = card.progress?.label?.trim() || null;
  const stops = card.stops ?? [];

  const acceptedLabel = formatCardDateTime(card.accepted_at);
  const startedLabel = formatCardDateTime(card.started_at);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${ref}. ${progressLabel ?? strings.loads.moveCardA11y}`}
      style={({ pressed }) => [
        styles.card,
        card.is_hot && styles.cardHot,
        pressed && styles.pressed,
      ]}>
      {card.is_hot ? <View style={styles.accentStrip} /> : null}

      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.ref}>{ref}</Text>
            {when ? <Text style={styles.when}>{when}</Text> : null}
          </View>
          <FontAwesome
            name="chevron-right"
            size={14}
            color={PP2Theme.colors.textMuted}
          />
        </View>

        {progressLabel ? (
          <View style={styles.progressPill}>
            <Text style={styles.progressPillText}>{progressLabel}</Text>
          </View>
        ) : null}

        {stops.length > 0 ? (
          <View style={styles.stops}>
            {stops.map((stop) => {
              const stage = formatMoveStopStage(stop.event_type);
              const place = formatMoveStopLocation(stop.location);
              return (
                <View key={stop.id} style={styles.stopBlock}>
                  <Text style={styles.stopStage}>{stage}</Text>
                  {place ? (
                    <Text style={styles.stopPlace}>{place}</Text>
                  ) : (
                    <Text style={styles.stopMissing}>
                      {strings.loads.noLocationContactDispatch}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.stops}>
            {card.pickup_location ? (
              <View style={styles.stopBlock}>
                <Text style={styles.stopStage}>
                  {formatMoveStopStage('pickup_container')}
                </Text>
                <Text style={styles.stopPlace}>{card.pickup_location}</Text>
              </View>
            ) : null}
            {card.delivery_location ? (
              <View style={styles.stopBlock}>
                <Text style={styles.stopStage}>
                  {formatMoveStopStage('deliver_container')}
                </Text>
                <Text style={styles.stopPlace}>{card.delivery_location}</Text>
              </View>
            ) : null}
            {card.return_location ? (
              <View style={styles.stopBlock}>
                <Text style={styles.stopStage}>
                  {formatMoveStopStage('return_container')}
                </Text>
                <Text style={styles.stopPlace}>{card.return_location}</Text>
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.grid}>
          <MetaCell
            label={strings.loads.loadType}
            value={card.load_type?.trim() || '—'}
          />
          <MetaCell
            label={strings.loads.container}
            value={card.container_number?.trim() || '—'}
          />
          <MetaCell
            label={strings.loads.nextAction}
            value={progressLabel || '—'}
          />
        </View>

        {(acceptedLabel || startedLabel) && (
          <View style={styles.timestamps}>
            {acceptedLabel ? (
              <Text style={styles.timestamp}>
                {strings.loads.acceptedAt}: {acceptedLabel}
              </Text>
            ) : null}
            {startedLabel ? (
              <Text style={styles.timestamp}>
                {strings.loads.startedAt}: {startedLabel}
              </Text>
            ) : null}
          </View>
        )}

        {(card.is_hazmat || card.is_hot) && (
          <View style={styles.flags}>
            {card.is_hot ? (
              <Text style={styles.flagHot}>{strings.loads.flagHot}</Text>
            ) : null}
            {card.is_hazmat ? (
              <Text style={styles.flagHazmat}>{strings.loads.flagHazmat}</Text>
            ) : null}
          </View>
        )}

        {offer ? (
          <DriverMoveOfferActions
            moveId={card.move_id}
            pendingAction={offer.pendingAction}
            disabled={offer.disabled}
            onAccept={offer.onAccept}
            onReject={offer.onReject}
          />
        ) : null}

        {startAction ? (
          <DriverStartMoveAction
            moveId={card.move_id}
            loading={startAction.loading}
            disabled={startAction.disabled}
            onStart={startAction.onStart}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaCell}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: PP2Theme.colors.surface,
    borderRadius: PP2Theme.radius.lg,
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    overflow: 'hidden',
    ...PP2Theme.shadow.sm,
  },
  cardHot: {
    backgroundColor: PP2Theme.colors.hotSurface,
    borderColor: PP2Theme.colors.hotBorder,
  },
  accentStrip: {
    width: 4,
    backgroundColor: PP2Theme.colors.accentStrip,
  },
  body: {
    flex: 1,
    padding: PP2Theme.spacing.md,
  },
  pressed: { opacity: 0.94 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: PP2Theme.spacing.sm,
  },
  headerText: { flex: 1, minWidth: 0 },
  ref: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '700',
    color: PP2Theme.colors.tms.navActive,
  },
  when: {
    marginTop: 2,
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
  },
  progressPill: {
    alignSelf: 'flex-start',
    marginTop: PP2Theme.spacing.sm,
    paddingHorizontal: PP2Theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: PP2Theme.radius.sm,
    backgroundColor: PP2Theme.colors.accentMuted,
  },
  progressPillText: {
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '700',
    color: PP2Theme.colors.tms.navActive,
  },
  stops: {
    marginTop: PP2Theme.spacing.md,
    gap: PP2Theme.spacing.sm,
  },
  stopBlock: {
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    borderRadius: PP2Theme.radius.md,
    padding: PP2Theme.spacing.sm,
    backgroundColor: PP2Theme.colors.background,
  },
  stopStage: {
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '700',
    letterSpacing: 0.4,
    color: PP2Theme.colors.text,
  },
  stopPlace: {
    marginTop: 4,
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.text,
    lineHeight: 20,
  },
  stopMissing: {
    marginTop: 4,
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
    fontStyle: 'italic',
  },
  grid: {
    marginTop: PP2Theme.spacing.md,
    paddingTop: PP2Theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: PP2Theme.colors.border,
    flexDirection: 'row',
    gap: PP2Theme.spacing.sm,
  },
  metaCell: { flex: 1, minWidth: 0 },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: PP2Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaValue: {
    marginTop: 2,
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '700',
    color: PP2Theme.colors.text,
  },
  timestamps: {
    marginTop: PP2Theme.spacing.sm,
    gap: 2,
  },
  timestamp: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
  },
  flags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PP2Theme.spacing.sm,
    marginTop: PP2Theme.spacing.sm,
  },
  flagHot: {
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '700',
    color: PP2Theme.colors.hotText,
  },
  flagHazmat: {
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '700',
    color: PP2Theme.colors.error,
  },
});
