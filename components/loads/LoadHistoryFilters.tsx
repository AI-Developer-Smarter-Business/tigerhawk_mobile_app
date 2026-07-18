import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppActionSheet } from '@/components/ui/AppActionSheet';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import {
  formatLoadHistoryDateRangeLabel,
  loadHistoryPresetRange,
  type LoadHistoryDateRange,
} from '@/lib/loads/load-history-date-range';

type LoadHistoryFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  dateRange: LoadHistoryDateRange;
  onDateRangeChange: (range: LoadHistoryDateRange) => void;
};

export function LoadHistoryFilters({
  search,
  onSearchChange,
  dateRange,
  onDateRangeChange,
}: LoadHistoryFiltersProps) {
  const [rangeSheetOpen, setRangeSheetOpen] = useState(false);
  const rangeLabel = formatLoadHistoryDateRangeLabel(dateRange);

  return (
    <>
      <View style={styles.row}>
        <View style={styles.searchWrap}>
          <FontAwesome
            name="search"
            size={16}
            color={PP2Theme.colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            value={search}
            onChangeText={onSearchChange}
            placeholder={strings.loadHistory.searchPlaceholder}
            placeholderTextColor={PP2Theme.colors.textMuted}
            style={styles.searchInput}
            accessibilityLabel={strings.loadHistory.searchA11y}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>

        <Pressable
          onPress={() => setRangeSheetOpen(true)}
          style={({ pressed }) => [styles.rangeButton, pressed && styles.rangePressed]}
          accessibilityRole="button"
          accessibilityLabel={strings.loadHistory.dateRangeA11y(rangeLabel)}>
          <Text style={styles.rangeText} numberOfLines={1}>
            {rangeLabel}
          </Text>
          <FontAwesome
            name="calendar"
            size={16}
            color={PP2Theme.colors.textMuted}
            style={styles.calendarIcon}
          />
        </Pressable>
      </View>

      <AppActionSheet
        visible={rangeSheetOpen}
        title={strings.loadHistory.dateRangeTitle}
        onDismiss={() => setRangeSheetOpen(false)}
        actions={[
          {
            label: strings.loadHistory.presetYesterdayToday,
            onPress: () => {
              onDateRangeChange(loadHistoryPresetRange('yesterdayToday'));
              setRangeSheetOpen(false);
            },
          },
          {
            label: strings.loadHistory.presetLast7Days,
            onPress: () => {
              onDateRangeChange(loadHistoryPresetRange('last7Days'));
              setRangeSheetOpen(false);
            },
          },
          {
            label: strings.loadHistory.presetLast30Days,
            onPress: () => {
              onDateRangeChange(loadHistoryPresetRange('last30Days'));
              setRangeSheetOpen(false);
            },
          },
          {
            label: strings.loadHistory.cancelRange,
            variant: 'cancel',
            onPress: () => setRangeSheetOpen(false),
          },
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: PP2Theme.spacing.sm,
    marginBottom: PP2Theme.spacing.md,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    borderRadius: PP2Theme.radius.md,
    backgroundColor: PP2Theme.colors.surface,
    minHeight: PP2Theme.layout.minTouchTarget,
    paddingHorizontal: PP2Theme.spacing.sm,
  },
  searchIcon: {
    marginRight: PP2Theme.spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.text,
    paddingVertical: PP2Theme.spacing.sm,
  },
  rangeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    borderRadius: PP2Theme.radius.md,
    backgroundColor: PP2Theme.colors.surface,
    minHeight: PP2Theme.layout.minTouchTarget,
    paddingHorizontal: PP2Theme.spacing.sm,
    maxWidth: '46%',
  },
  rangePressed: {
    backgroundColor: PP2Theme.colors.accentMuted,
  },
  rangeText: {
    flexShrink: 1,
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.text,
    fontWeight: '600',
  },
  calendarIcon: {
    marginLeft: PP2Theme.spacing.xs,
  },
});
