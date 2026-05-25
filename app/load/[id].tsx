import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { LoadDetailContent } from '@/components/loads/LoadDetailContent';
import { ErrorState, LoadingState } from '@/components/ui/ScreenState';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useLoads } from '@/context/LoadsContext';
import { useDriverStatusChange } from '@/hooks/useDriverStatusChange';
import { useLoadDetailQuery } from '@/hooks/useLoadDetailQuery';
import { useLoadDocumentsQuery } from '@/hooks/useLoadDocumentsQuery';
import { formatReference } from '@/lib/loads';
import { resolveRouteParam } from '@/lib/router/route-params';

export default function LoadDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const loadId = resolveRouteParam(rawId);
  const { upsertLoad } = useLoads();
  const { load, loading, refreshing, error, notFound, retry, refetch } =
    useLoadDetailQuery(loadId);
  const { refreshing: documentsRefreshing, ...documentsQuery } =
    useLoadDocumentsQuery(loadId);
  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
    retry: retryDocuments,
  } = documentsQuery;
  const handleStatusChange = useDriverStatusChange(load);
  const refreshDocumentsList = useCallback(
    () => refetchDocuments(),
    [refetchDocuments],
  );

  useFocusEffect(
    useCallback(() => {
      if (loadId) {
        void refetchDocuments();
      }
    }, [loadId, refetchDocuments]),
  );

  useEffect(() => {
    if (load) {
      upsertLoad(load);
    }
  }, [load, upsertLoad]);

  if (loading && !load) {
    return (
      <LoadingState
        message={strings.loadDetail.loading}
        spinnerColor={PP2Theme.colors.primary}
      />
    );
  }

  if (notFound || !load) {
    if (error) {
      return (
        <ErrorState
          message={error}
          actionLabel={strings.loads.retry}
          onAction={() => void retry()}
        />
      );
    }
    return <ErrorState message={strings.loadDetail.notFound} />;
  }

  return (
    <>
      <Stack.Screen
        options={{ title: formatReference(load.reference_number) }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || documentsRefreshing}
            onRefresh={() => void Promise.all([refetch(), refetchDocuments()])}
            tintColor={PP2Theme.colors.tms.navActive}
          />
        }
      >
        <LoadDetailContent
          load={load}
          error={error}
          onRetry={() => void retry()}
          onStatusChange={handleStatusChange}
          documents={documents}
          documentsLoading={documentsLoading}
          documentsError={documentsError}
          onDocumentsRetry={() => void retryDocuments()}
          onRefreshDocuments={refreshDocumentsList}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: PP2Theme.colors.background },
  content: { padding: PP2Theme.spacing.md, paddingBottom: PP2Theme.spacing.xl },
});
