import { router, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { DriverMoveCardItem } from '@/components/loads/DriverMoveCardItem';
import { LoadHistoryFilters } from '@/components/loads/LoadHistoryFilters';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Screen } from '@/components/ui/Screen';
import { LoadingState } from '@/components/ui/ScreenState';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useDriverLoadHistoryQuery } from '@/hooks/useDriverLoadHistoryQuery';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import {
  defaultLoadHistoryDateRange,
  formatLoadHistoryDateRangeLabel,
  type LoadHistoryDateRange,
} from '@/lib/loads/load-history-date-range';
import type { DriverMoveCard } from '@/lib/loads/driver-move-card';

/**
 * Load History — search, date range, completed move cards (TASKS B.4).
 * Data: `GET /api/mobile/driver/loads/history`.
 */
export default function LoadHistoryScreen() {
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState<LoadHistoryDateRange>(() =>
    defaultLoadHistoryDateRange(),
  );
  const debouncedSearch = useDebouncedValue(search, 300);

  const { history, loading, error, refetch, retry } = useDriverLoadHistoryQuery({
    dateRange,
    search: debouncedSearch,
  });

  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const rangeLabel = useMemo(
    () => formatLoadHistoryDateRangeLabel(dateRange),
    [dateRange],
  );

  const openMove = useCallback((card: DriverMoveCard) => {
    const href =
      `/load/${encodeURIComponent(card.load_id)}?move=${encodeURIComponent(card.move_id)}` as Href;
    router.push(href);
  }, []);

  return (
    <Screen>
      <LoadHistoryFilters
        search={search}
        onSearchChange={setSearch}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {error ? (
        <ErrorBanner
          message={error}
          actionLabel={strings.loads.retry}
          onAction={() => void retry()}
        />
      ) : null}

      {loading && history.length === 0 ? (
        <LoadingState
          message={strings.loadHistory.loading}
          spinnerColor={PP2Theme.colors.tms.navActive}
          style={styles.loadingWrap}
        />
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.move_id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PP2Theme.colors.tms.navActive}
              colors={[PP2Theme.colors.tms.navActive]}
            />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            !loading && !error ? (
              <View style={styles.emptyWrap}>
                <EmptyState
                  title={strings.loadHistory.emptyTitle}
                  message={strings.loadHistory.emptyMessage(rangeLabel)}
                  icon="search"
                />
                <Button
                  title={strings.loadHistory.reload}
                  variant="outlineAccent"
                  onPress={() => void refetch()}
                  accessibilityLabel={strings.loadHistory.reloadA11y}
                  style={styles.reloadButton}
                />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <DriverMoveCardItem card={item} onPress={() => openMove(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={
            history.length === 0 ? styles.emptyList : styles.list
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    paddingVertical: PP2Theme.spacing.xl,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyList: { flexGrow: 1 },
  list: {
    paddingBottom: PP2Theme.spacing.md,
  },
  separator: {
    height: PP2Theme.spacing.sm,
  },
  reloadButton: {
    alignSelf: 'center',
    minWidth: 200,
    marginTop: PP2Theme.spacing.md,
  },
});
