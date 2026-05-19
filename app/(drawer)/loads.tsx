import { router, type Href } from 'expo-router';
import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { LoadListItem } from '@/components/loads/LoadListItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Screen } from '@/components/ui/Screen';
import { LoadingState } from '@/components/ui/ScreenState';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useLoads } from '@/context/LoadsContext';
import { useAssignedLoadsQuery } from '@/hooks/useAssignedLoadsQuery';

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

  useEffect(() => {
    syncLoads(loads);
  }, [loads, syncLoads]);

  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const onEndReached = useCallback(() => {
    if (!loading && !refreshing && !loadingMore && hasMore && !error) {
      void loadMore();
    }
  }, [loading, refreshing, loadingMore, hasMore, error, loadMore]);

  const countLabel =
    totalCount != null
      ? strings.loads.showingCount(loads.length, totalCount)
      : loads.length > 0
        ? strings.loads.showingMany(loads.length)
        : null;

  return (
    <Screen>
      <Text style={styles.heading}>{strings.loads.title}</Text>
      {countLabel ? <Text style={styles.subheading}>{countLabel}</Text> : null}

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
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.35}
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
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator color={PP2Theme.colors.tms.navActive} />
                <Text style={styles.footerText}>{strings.loads.loadingMore}</Text>
              </View>
            ) : hasMore && loads.length > 0 && !error ? (
              <Text style={styles.footerHint}>{strings.loads.scrollForMore}</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <LoadListItem
              load={item}
              onPress={() => router.push(`/load/${item.id}` as Href)}
            />
          )}
          contentContainerStyle={loads.length === 0 ? styles.emptyList : styles.list}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: PP2Theme.typography.sizes.headline,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.xs,
  },
  subheading: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.md,
  },
  loadingWrap: {
    flex: 1,
    paddingVertical: PP2Theme.spacing.xl,
  },
  emptyList: { flexGrow: 1 },
  list: { paddingBottom: PP2Theme.spacing.lg },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PP2Theme.spacing.sm,
    paddingVertical: PP2Theme.spacing.lg,
  },
  footerText: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
  },
  footerHint: {
    textAlign: 'center',
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    paddingVertical: PP2Theme.spacing.md,
  },
});
