import FontAwesome from '@expo/vector-icons/FontAwesome';
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
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.card,
        isHot && styles.cardHot,
        pressed && styles.pressed,
      ]}>
      {isHot ? <View style={styles.accentStrip} /> : null}
      <View style={styles.body}>
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
      </View>
      <FontAwesome
        name="chevron-right"
        size={14}
        color={PP2Theme.colors.textMuted}
        style={styles.chevron}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
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
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: PP2Theme.colors.accentStrip,
  },
  body: {
    flex: 1,
    padding: PP2Theme.spacing.md,
    paddingLeft: PP2Theme.spacing.md + 2,
  },
  pressed: { opacity: 0.94 },
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
    marginBottom: PP2Theme.spacing.xs,
  },
  location: {
    fontSize: PP2Theme.typography.sizes.subhead,
    fontWeight: '600',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.xs,
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
  chevron: {
    marginRight: PP2Theme.spacing.md,
    opacity: 0.7,
  },
});
