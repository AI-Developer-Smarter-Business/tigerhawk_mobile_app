import { Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { DeliveryWaitSection } from '@/components/loads/DeliveryWaitSection';
import { DriverProgressActions } from '@/components/loads/DriverProgressActions';
import { LoadDetailContent } from '@/components/loads/LoadDetailContent';
import { AppToast } from '@/components/ui/AppToast';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { ErrorState, LoadingState } from '@/components/ui/ScreenState';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useLoads } from '@/context/LoadsContext';
import { useDeliveryWaitTimer } from '@/hooks/useDeliveryWaitTimer';
import { useDriverLocationTracking } from '@/hooks/useDriverLocationTracking';
import { useDriverProgressAction } from '@/hooks/useDriverProgressAction';
import { useDriverProgressQuery } from '@/hooks/useDriverProgressQuery';
import { useLoadDetailQuery } from '@/hooks/useLoadDetailQuery';
import { useLoadDocumentUpload } from '@/hooks/useLoadDocumentUpload';
import { useLoadDocumentsQuery } from '@/hooks/useLoadDocumentsQuery';
import { useLoadPodQuery } from '@/hooks/useLoadPodQuery';
import { usePodSignatureSubmit } from '@/hooks/usePodSignatureSubmit';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { formatReference } from '@/lib/loads';
import { normalizeLoadIdParam } from '@/lib/loads/document-load-association';
import {
  FOCUS_DOCUMENTS_REFETCH_MIN_MS,
  shouldRunThrottledRefetch,
} from '@/lib/query/foreground-refetch-throttle';
import { resolveRouteParam } from '@/lib/router/route-params';

export default function LoadDetailScreen() {
  const { id: rawId, move: rawMoveId } = useLocalSearchParams<{
    id: string | string[];
    move?: string | string[];
  }>();
  const loadId = normalizeLoadIdParam(resolveRouteParam(rawId)) ?? undefined;
  const moveId = resolveRouteParam(rawMoveId) || undefined;
  const { upsertLoad } = useLoads();
  const { load, loading, error, notFound, retry, refetch } =
    useLoadDetailQuery(loadId, moveId);
  const progressQuery = useDriverProgressQuery(loadId);
  const progressAction = useDriverProgressAction({ loadId, moveId });
  const documentsQuery = useLoadDocumentsQuery(loadId);
  const podQuery = useLoadPodQuery(loadId);
  const podSignature = usePodSignatureSubmit({ loadId, moveId });
  const [forcePodSign, setForcePodSign] = useState(false);
  const [forceTirUpload, setForceTirUpload] = useState<
    'TIR Out' | 'TIR In' | null
  >(null);
  const {
    documents,
    loading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
    retry: retryDocuments,
  } = documentsQuery;
  const waitTimer = useDeliveryWaitTimer(load);
  const locationTracking = useDriverLocationTracking(load);
  const uploadDocumentRaw = useLoadDocumentUpload(load);
  const uploadDocument = useCallback(
    async (
      file: Parameters<typeof uploadDocumentRaw>[0],
      documentType?: Parameters<typeof uploadDocumentRaw>[1],
    ) => {
      await uploadDocumentRaw(file, documentType);
    },
    [uploadDocumentRaw],
  );
  const refreshDocumentsList = useCallback(
    () => refetchDocuments(),
    [refetchDocuments],
  );

  const pullRefresh = useMemo(
    () => () =>
      Promise.all([
        refetch(),
        refetchDocuments(),
        progressQuery.refetch(),
        podQuery.refetch(),
      ]),
    [podQuery.refetch, progressQuery.refetch, refetch, refetchDocuments],
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
      if (
        shouldRunThrottledRefetch(loadThrottleKey, FOCUS_DOCUMENTS_REFETCH_MIN_MS)
      ) {
        void refetch();
        void progressQuery.refetch();
        void podQuery.refetch();
      }
      const documentsThrottleKey = `documents-focus:${loadId}`;
      if (
        shouldRunThrottledRefetch(
          documentsThrottleKey,
          FOCUS_DOCUMENTS_REFETCH_MIN_MS,
        )
      ) {
        void refetchDocuments();
      }
    }, [
      loadId,
      podQuery.refetch,
      progressQuery.refetch,
      refetch,
      refetchDocuments,
      waitTimer.refresh,
    ]),
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

  const loadFinished = /^(completed|cancelled)$/i.test(load.status);
  const progressLocked =
    waitTimer.loading ||
    waitTimer.stopping ||
    progressAction.pendingAction != null ||
    podSignature.submitting;

  return (
    <>
      <Stack.Screen
        options={{
          title: formatReference(load.reference_number),
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={pullRefreshing}
            onRefresh={onPullRefresh}
            tintColor={PP2Theme.colors.tms.navActive}
            colors={[PP2Theme.colors.tms.navActive]}
          />
        }>
        <LoadDetailContent
          load={load}
          locationTracking={locationTracking}
          error={error}
          onRetry={() => void retry()}
          documents={documents}
          documentsLoading={documentsLoading}
          documentsError={documentsError}
          onDocumentsRetry={() => void retryDocuments()}
          onRefreshDocuments={refreshDocumentsList}
          onUploadDocument={uploadDocument}
          podPreview={podQuery.preview}
          podLoading={podQuery.loading}
          podError={podQuery.error}
          onPodRetry={() => void podQuery.refetch()}
          podSubmitting={podSignature.submitting}
          podSubmitError={podSignature.error}
          podSuccessMessage={podSignature.successMessage}
          onSubmitPodSignature={async (input) => {
            const ok = await podSignature.submit(input);
            if (ok) {
              progressAction.clearError();
              await Promise.all([podQuery.refetch(), progressQuery.refetch()]);
            }
            return ok;
          }}
          forcePodSign={forcePodSign}
          onForcePodSignHandled={() => setForcePodSign(false)}
          forceTirUpload={forceTirUpload}
          onForceTirUploadHandled={() => setForceTirUpload(null)}
        />
        <View style={styles.actionsSection}>
          <AppToast
            message={progressAction.successMessage}
            onDismiss={progressAction.clearSuccess}
          />
          <DeliveryWaitSection
            timer={waitTimer}
            fieldActionPending={progressAction.pendingAction != null}
          />
          {progressQuery.loading && !progressQuery.progress ? (
            <LoadingState
              message={strings.driverProgress.loading}
              spinnerColor={PP2Theme.colors.tms.navActive}
            />
          ) : progressQuery.error && !progressQuery.progress ? (
            <ErrorBanner
              message={progressQuery.error}
              actionLabel={strings.loads.retry}
              onAction={() => void progressQuery.retry()}
            />
          ) : progressQuery.progress ? (
            <DriverProgressActions
              progress={progressQuery.progress}
              loadCompleted={loadFinished}
              pendingAction={progressAction.pendingAction}
              error={progressAction.error}
              locked={progressLocked}
              onAction={progressAction.runAction}
              onDismissError={progressAction.clearError}
              onOpenSignature={() => setForcePodSign(true)}
              onOpenTirDocuments={(which) => setForceTirUpload(which)}
            />
          ) : null}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: PP2Theme.colors.background,
  },
  content: {
    padding: PP2Theme.spacing.md,
    paddingBottom: PP2Theme.spacing.xl,
    gap: PP2Theme.spacing.sm,
  },
  actionsSection: {
    marginTop: PP2Theme.spacing.md,
    gap: PP2Theme.spacing.md,
  },
});
