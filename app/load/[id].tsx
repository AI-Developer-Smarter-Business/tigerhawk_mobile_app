import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { DriverActionBar } from '@/components/loads/DriverActionBar';
import { LoadDetailContent } from '@/components/loads/LoadDetailContent';
import { ErrorState, LoadingState } from '@/components/ui/ScreenState';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useLoads } from '@/context/LoadsContext';
import { useDeliveryWaitTimer } from '@/hooks/useDeliveryWaitTimer';
import { useDriverStatusChange } from '@/hooks/useDriverStatusChange';
import { useLoadDetailQuery } from '@/hooks/useLoadDetailQuery';
import { useLoadTransitionsQuery } from '@/hooks/useLoadTransitionsQuery';
import { useLoadDocumentUpload } from '@/hooks/useLoadDocumentUpload';
import { useLoadDocumentsQuery } from '@/hooks/useLoadDocumentsQuery';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatReference } from '@/lib/loads';
import { normalizeLoadIdParam } from '@/lib/loads/document-load-association';
import {
  FOCUS_DOCUMENTS_REFETCH_MIN_MS,
  shouldRunThrottledRefetch,
} from '@/lib/query/foreground-refetch-throttle';
import { resolveRouteParam } from '@/lib/router/route-params';
import type { LoadStatus } from '@/types';

export default function LoadDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const loadId = normalizeLoadIdParam(resolveRouteParam(rawId)) ?? undefined;
  const { upsertLoad } = useLoads();
  const { load, loading, error, notFound, retry, refetch } =
    useLoadDetailQuery(loadId);
  const documentsQuery = useLoadDocumentsQuery(loadId);
  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
    retry: retryDocuments,
  } = documentsQuery;
  const { transitionMap } = useLoadTransitionsQuery();
  const handleStatusChangeRaw = useDriverStatusChange(load, transitionMap);
  const [fieldActionPending, setFieldActionPending] = useState(false);
  const handleStatusChange = useCallback(
    async (status: LoadStatus) => {
      setFieldActionPending(true);
      try {
        await handleStatusChangeRaw(status);
      } finally {
        setFieldActionPending(false);
      }
    },
    [handleStatusChangeRaw],
  );
  const waitTimer = useDeliveryWaitTimer(load);
  const uploadDocument = useLoadDocumentUpload(load);
  const refreshDocumentsList = useCallback(
    () => refetchDocuments(),
    [refetchDocuments],
  );

  const pullRefresh = useMemo(
    () => () => Promise.all([refetch(), refetchDocuments()]),
    [refetch, refetchDocuments],
  );
  const { refreshing: pullRefreshing, onRefresh: onPullRefresh } =
    usePullToRefresh(pullRefresh);

  useFocusEffect(
    useCallback(() => {
      if (!loadId) {
        return;
      }
      void waitTimer.refresh();
      const loadThrottleKey = `load-focus:${loadId}`;
      if (shouldRunThrottledRefetch(loadThrottleKey, FOCUS_DOCUMENTS_REFETCH_MIN_MS)) {
        void refetch();
      }
      const documentsThrottleKey = `documents-focus:${loadId}`;
      if (shouldRunThrottledRefetch(documentsThrottleKey, FOCUS_DOCUMENTS_REFETCH_MIN_MS)) {
        void refetchDocuments();
      }
    }, [loadId, refetch, refetchDocuments, waitTimer.refresh]),
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
        spinnerColor={PP2Theme.colors.tms.navActive}
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
      <View style={styles.page}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={pullRefreshing}
              onRefresh={onPullRefresh}
              tintColor={PP2Theme.colors.tms.navActive}
              colors={[PP2Theme.colors.tms.navActive]}
            />
          }
        >
        <LoadDetailContent
          load={load}
          waitTimer={waitTimer}
          fieldActionPending={fieldActionPending}
          error={error}
            onRetry={() => void retry()}
            documents={documents}
            documentsLoading={documentsLoading}
            documentsError={documentsError}
            onDocumentsRetry={() => void retryDocuments()}
            onRefreshDocuments={refreshDocumentsList}
            onUploadDocument={uploadDocument}
          />
        </ScrollView>
        <View style={styles.actionFooter}>
          <DriverActionBar
            currentStatus={load.status}
            activeHolds={load.active_holds}
            onStatusChange={handleStatusChange}
            transitionMap={transitionMap}
            locked={waitTimer.loading || waitTimer.stopping || fieldActionPending}
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: PP2Theme.colors.background,
  },
  scroll: { flex: 1 },
  content: {
    padding: PP2Theme.spacing.md,
    paddingBottom: PP2Theme.spacing.md,
  },
  actionFooter: {
    backgroundColor: PP2Theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: PP2Theme.colors.border,
    paddingHorizontal: PP2Theme.spacing.md,
    paddingTop: PP2Theme.spacing.md,
    paddingBottom: PP2Theme.spacing.lg,
    ...PP2Theme.shadow.md,
  },
});
