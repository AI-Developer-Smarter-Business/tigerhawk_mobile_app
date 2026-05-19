import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { formatAppointment, formatReference } from '@/lib/loads';
import type { LoadSummary } from '@/types';

type LoadListItemProps = {
  load: LoadSummary;
  onPress: () => void;
};

export function LoadListItem({ load, onPress }: LoadListItemProps) {
  const isHot = load.is_hot;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isHot && styles.cardHot,
        pressed && styles.pressed,
      ]}>
      <View style={styles.header}>
        <Text style={styles.ref}>{formatReference(load.reference_number)}</Text>
        <StatusBadge status={load.status} hot={load.is_hot} />
      </View>
      {load.container_number ? (
        <Text style={styles.meta}>
          {strings.loads.container}: {load.container_number}
        </Text>
      ) : null}
      <Text style={styles.location} numberOfLines={1}>
        {load.pickup_location ?? '—'} → {load.delivery_location ?? '—'}
      </Text>
      <Text style={styles.apt}>
        {strings.loads.delivery}: {formatAppointment(load.delivery_apt_from)}
      </Text>
      {load.active_holds.length > 0 ? (
        <Text style={styles.hold}>{strings.loads.activeHold}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PP2Theme.colors.surface,
    borderRadius: PP2Theme.radius.md,
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    padding: PP2Theme.spacing.md,
  },
  cardHot: {
    backgroundColor: PP2Theme.colors.hotSurface,
    borderColor: PP2Theme.colors.hotBorder,
  },
  pressed: { opacity: 0.92 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: PP2Theme.spacing.sm,
    gap: PP2Theme.spacing.sm,
  },
  ref: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    flex: 1,
  },
  meta: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: 4,
  },
  location: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.text,
    marginBottom: 4,
  },
  apt: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
  },
  hold: {
    marginTop: PP2Theme.spacing.sm,
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.warning,
    fontWeight: '600',
  },
});
