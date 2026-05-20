import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { LoadListItem } from '@/components/loads/LoadListItem';
import { LoadsCountBadge } from '@/components/loads/LoadsCountBadge';
import { LoadsListFooter } from '@/components/loads/LoadsListFooter';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Screen } from '@/components/ui/Screen';
import { LoadingState } from '@/components/ui/ScreenState';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useLoads } from '@/context/LoadsContext';
import { useAssignedLoadsQuery } from '@/hooks/useAssignedLoadsQuery';

const LIST_SEPARATOR = PP2Theme.spacing.sm;

export default function LoadsScreen() {
  const { syncLoads } = useLoads();

  const {
    loads,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    totalCount,
    refetch,
    loadMore,
    retry,
  } = useAssignedLoadsQuery();

  const endReachedLock = useRef(false);

  useEffect(() => {
    syncLoads(loads);
  }, [loads, syncLoads]);

  useEffect(() => {
    if (!loadingMore) {
      endReachedLock.current = false;
    }
  }, [loadingMore]);

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (endReachedLock.current) return;
    if (!loading && !refreshing && !loadingMore && hasMore && !error) {
      endReachedLock.current = true;
      void loadMore();
    }
  }, [loading, refreshing, loadingMore, hasMore, error, loadMore]);

  const onMomentumScrollBegin = useCallback(() => {
    endReachedLock.current = false;
  }, []);

  const countLabel =
    totalCount != null
      ? strings.loads.showingCount(loads.length, totalCount)
      : loads.length > 0
        ? strings.loads.showingMany(loads.length)
        : null;

  return (
    <Screen>
      <Text style={styles.heading}>{strings.loads.title}</Text>
      {countLabel ? <LoadsCountBadge label={countLabel} /> : null}

      {error ? (
        <ErrorBanner
          message={error}
          actionLabel={strings.loads.retry}
          onAction={() => void retry()}
        />
      ) : null}

      {loading && loads.length === 0 ? (
        <LoadingState
          message={strings.loads.loading}
          spinnerColor={PP2Theme.colors.tms.navActive}
          style={styles.loadingWrap}
        />
      ) : (
        <FlatList
          data={loads}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PP2Theme.colors.tms.navActive}
              colors={[PP2Theme.colors.tms.navActive]}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.35}
          onMomentumScrollBegin={onMomentumScrollBegin}
          ItemSeparatorComponent={ListSeparator}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          windowSize={7}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          ListEmptyComponent={
            !loading && !error ? (
              <EmptyState
                title={strings.loads.emptyTitle}
                message={strings.loads.emptyMessage}
                icon="truck"
              />
            ) : null
          }
          ListFooterComponent={
            loads.length > 0 ? (
              <LoadsListFooter
                loadingMore={loadingMore}
                hasMore={hasMore}
                loadedCount={loads.length}
                loadingMoreLabel={strings.loads.loadingMore}
                scrollHintLabel={strings.loads.scrollForMore}
                endLabel={strings.loads.endOfList}
              />
            ) : null
          }
          renderItem={({ item }) => (
            <LoadListItem
              load={item}
              onPress={() => router.push(`/load/${item.id}` as Href)}
            />
          )}
          contentContainerStyle={
            loads.length === 0 ? styles.emptyList : styles.list
          }
        />
      )}
    </Screen>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  heading: {
    fontSize: PP2Theme.typography.sizes.headline,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.sm,
  },
  loadingWrap: {
    flex: 1,
    paddingVertical: PP2Theme.spacing.xl,
  },
  emptyList: { flexGrow: 1 },
  list: {
    paddingBottom: PP2Theme.spacing.md,
  },
  separator: {
    height: LIST_SEPARATOR,
  },
});
