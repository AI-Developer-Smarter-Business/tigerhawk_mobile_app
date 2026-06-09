import { StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { formatReference } from '@/lib/loads';
import type { LoadDetail } from '@/types';

type LoadDetailHeroProps = {
  load: LoadDetail;
};

export function LoadDetailHero({ load }: LoadDetailHeroProps) {
  const route = `${load.pickup_location ?? '—'} → ${load.delivery_location ?? '—'}`;

  return (
    <View style={[styles.hero, load.is_hot && styles.heroHot]}>
      {load.is_hot ? <View style={styles.accentStrip} /> : null}
      <Text style={styles.reference}>{formatReference(load.reference_number)}</Text>
      <View style={styles.badgeRow}>
        <StatusBadge status={load.status} hot={load.is_hot} />
      </View>
      <Text style={styles.route} numberOfLines={2}>
        {route}
      </Text>
      {load.container_number ? (
        <Text style={styles.meta}>
          {strings.loads.container}: {load.container_number}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: PP2Theme.colors.surface,
    borderRadius: PP2Theme.radius.lg,
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    padding: PP2Theme.spacing.lg,
    marginBottom: PP2Theme.spacing.lg,
    overflow: 'hidden',
    ...PP2Theme.shadow.sm,
  },
  heroHot: {
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
  reference: {
    fontSize: PP2Theme.typography.sizes.headline,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.sm,
  },
  badgeRow: {
    marginBottom: PP2Theme.spacing.md,
  },
  route: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    color: PP2Theme.colors.text,
    lineHeight: 22,
  },
  meta: {
    marginTop: PP2Theme.spacing.sm,
    fontSize: PP2Theme.typography.sizes.subhead,
    color: PP2Theme.colors.textMuted,
  },
});
