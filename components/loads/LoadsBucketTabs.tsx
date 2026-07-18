import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';
import type { DriverLoadsTab } from '@/lib/loads/driver-move-card';

type LoadsBucketTabsProps = {
  value: DriverLoadsTab;
  onChange: (tab: DriverLoadsTab) => void;
  activeLabel: string;
  upcomingLabel: string;
  activeCount: number;
  upcomingCount: number;
};

/**
 * PortPro-style Active / Upcoming switcher (TASKS B.1).
 * Counts stay visible so empty tabs are still discoverable.
 */
export function LoadsBucketTabs({
  value,
  onChange,
  activeLabel,
  upcomingLabel,
  activeCount,
  upcomingCount,
}: LoadsBucketTabsProps) {
  return (
    <View
      style={styles.row}
      accessibilityRole="tablist"
      accessibilityLabel="Load lists">
      <TabButton
        selected={value === 'active'}
        label={activeLabel}
        count={activeCount}
        onPress={() => onChange('active')}
      />
      <TabButton
        selected={value === 'upcoming'}
        label={upcomingLabel}
        count={upcomingCount}
        onPress={() => onChange('upcoming')}
      />
    </View>
  );
}

function TabButton({
  selected,
  label,
  count,
  onPress,
}: {
  selected: boolean;
  label: string;
  count: number;
  onPress: () => void;
}) {
  const title = `${label} (${count})`;
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => [
        styles.tab,
        selected ? styles.tabSelected : styles.tabIdle,
        pressed && styles.tabPressed,
      ]}>
      <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
        {label}
      </Text>
      <View style={[styles.badge, selected && styles.badgeSelected]}>
        <Text style={[styles.badgeText, selected && styles.badgeTextSelected]}>
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: PP2Theme.spacing.sm,
    marginBottom: PP2Theme.spacing.md,
  },
  tab: {
    flex: 1,
    minHeight: PP2Theme.layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PP2Theme.spacing.sm,
    borderRadius: PP2Theme.radius.md,
    borderWidth: 1,
    paddingHorizontal: PP2Theme.spacing.md,
  },
  tabIdle: {
    backgroundColor: PP2Theme.colors.surface,
    borderColor: PP2Theme.colors.border,
  },
  tabSelected: {
    backgroundColor: PP2Theme.colors.accentMuted,
    borderColor: PP2Theme.colors.tms.navActive,
  },
  tabPressed: {
    opacity: 0.9,
  },
  tabText: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    color: PP2Theme.colors.textMuted,
  },
  tabTextSelected: {
    color: PP2Theme.colors.tms.navActive,
  },
  badge: {
    minWidth: 24,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: PP2Theme.colors.background,
    alignItems: 'center',
  },
  badgeSelected: {
    backgroundColor: PP2Theme.colors.tms.navActive,
  },
  badgeText: {
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '700',
    color: PP2Theme.colors.textMuted,
  },
  badgeTextSelected: {
    color: PP2Theme.colors.tms.navActiveText,
  },
});
