import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { LoadDetailContent } from '@/components/loads/LoadDetailContent';
import { ErrorState, LoadingState } from '@/components/ui/ScreenState';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useLoads } from '@/context/LoadsContext';
import { useAuth } from '@/hooks/useAuth';
import { useLoadDetailQuery } from '@/hooks/useLoadDetailQuery';
import { formatReference } from '@/lib/loads';
import {
  invalidateDriverLoads,
  invalidateLoadDetail,
  setLoadStatusInCache,
} from '@/lib/query';
import { resolveRouteParam } from '@/lib/router/route-params';
import { patchLoadStatus, TmsStatusChangeError } from '@/lib/tms';
import type { LoadStatus } from '@/types';

export default function LoadDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string | string[] }>();
  const loadId = resolveRouteParam(rawId);
  const queryClient = useQueryClient();
  const { user, session } = useAuth();
  const { updateLoadStatus, upsertLoad } = useLoads();
  const { load, loading, refreshing, error, notFound, retry, refetch } =
    useLoadDetailQuery(loadId);

  useEffect(() => {
    if (load) {
      upsertLoad(load);
    }
  }, [load, upsertLoad]);

  const handleStatusChange = async (status: LoadStatus) => {
    if (!load || !user?.id) return;

    const accessToken = session?.access_token;
    if (!accessToken) {
      throw new TmsStatusChangeError(
        'Session expired. Sign in again.',
        'UNAUTHORIZED',
      );
    }

    const previousStatus = load.status;
    setLoadStatusInCache(queryClient, user.id, load.id, status);
    updateLoadStatus(load.id, status);

    try {
      await patchLoadStatus({
        loadId: load.id,
        status,
        accessToken,
      });
      await Promise.all([
        invalidateLoadDetail(queryClient, user.id, load.id),
        invalidateDriverLoads(queryClient, user.id),
      ]);
    } catch (error) {
      setLoadStatusInCache(queryClient, user.id, load.id, previousStatus);
      updateLoadStatus(load.id, previousStatus);
      throw error;
    }
  };

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
      <Stack.Screen options={{ title: formatReference(load.reference_number) }} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void refetch()}
            tintColor={PP2Theme.colors.tms.navActive}
          />
        }>
        <LoadDetailContent
          load={load}
          error={error}
          onRetry={() => void retry()}
          onStatusChange={handleStatusChange}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: PP2Theme.colors.background },
  content: { padding: PP2Theme.spacing.md, paddingBottom: PP2Theme.spacing.xl },
});
