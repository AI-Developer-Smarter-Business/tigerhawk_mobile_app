import { router, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AcceptMoveActionSheet } from '@/components/loads/AcceptMoveActionSheet';
import { DriverMoveCardItem } from '@/components/loads/DriverMoveCardItem';
import { RejectMoveActionSheet } from '@/components/loads/RejectMoveActionSheet';
import { LoadsBucketTabs } from '@/components/loads/LoadsBucketTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { AppToast } from '@/components/ui/AppToast';
import { Screen } from '@/components/ui/Screen';
import { LoadingState } from '@/components/ui/ScreenState';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useDriverLoadsBuckets } from '@/hooks/useDriverLoadsBuckets';
import { useDriverMoveOfferActions } from '@/hooks/useDriverMoveOfferActions';
import { useDriverStartMoveAction } from '@/hooks/useDriverStartMoveAction';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import type {
  DriverLoadsTab,
  DriverMoveCard,
} from '@/lib/loads/driver-move-card';

/**
 * Driver home: Active / Upcoming (B.1) + move cards (B.2).
 * Data: B.3 → `GET /api/mobile/driver/loads`.
 */
export default function LoadsScreen() {
  const [tab, setTab] = useState<DriverLoadsTab>('active');
  const [acceptCard, setAcceptCard] = useState<DriverMoveCard | null>(null);
  const [rejectCard, setRejectCard] = useState<DriverMoveCard | null>(null);
  const {
    active,
    upcoming,
    loading,
    error,
    refetch,
    retry,
  } = useDriverLoadsBuckets();
  const {
    pending: pendingOffer,
    error: offerError,
    successMessage: offerSuccess,
    acceptMove,
    rejectMove,
    clearError: clearOfferError,
    clearSuccess: clearOfferSuccess,
  } = useDriverMoveOfferActions();
  const {
    pendingMoveId: pendingStartMoveId,
    error: startMoveError,
    successMessage: startMoveSuccess,
    startMove,
    clearError: clearStartMoveError,
    clearSuccess: clearStartMoveSuccess,
  } = useDriverStartMoveAction();

  const { refreshing, onRefresh } = usePullToRefresh(refetch);

  const cards = tab === 'active' ? active : upcoming;
  const emptyCopy = useMemo(
    () =>
      tab === 'active'
        ? {
            title: strings.loads.activeEmptyTitle,
            message: strings.loads.activeEmptyMessage,
          }
        : {
            title: strings.loads.upcomingEmptyTitle,
            message: strings.loads.upcomingEmptyMessage,
          },
    [tab],
  );

  const openMove = useCallback((card: DriverMoveCard) => {
    // Detail is load-scoped (`/load/[id]`); move id selects the card fallback when
    // Supabase `loads.driver_id` does not match this driver's move assignment.
    const href =
      `/load/${encodeURIComponent(card.load_id)}?move=${encodeURIComponent(card.move_id)}` as Href;
    router.push(href);
  }, []);

  const clearMoveNotice = useCallback(() => {
    clearOfferSuccess();
    clearStartMoveSuccess();
  }, [clearOfferSuccess, clearStartMoveSuccess]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.heading}>{strings.loads.title}</Text>
        <Text style={styles.subheading}>{strings.loads.subtitle}</Text>
      </View>

      <LoadsBucketTabs
        value={tab}
        onChange={setTab}
        activeLabel={strings.loads.tabActive}
        upcomingLabel={strings.loads.tabUpcoming}
        activeCount={active.length}
        upcomingCount={upcoming.length}
      />

      <AppToast
        message={startMoveSuccess ?? offerSuccess}
        onDismiss={clearMoveNotice}
      />

      {error ? (
        <ErrorBanner
          message={error}
          actionLabel={strings.loads.retry}
          onAction={() => void retry()}
        />
      ) : null}

      {offerError ? (
        <ErrorBanner
          message={offerError}
          actionLabel={strings.moveOffer.dismissError}
          onAction={clearOfferError}
        />
      ) : null}

      {startMoveError ? (
        <ErrorBanner
          message={startMoveError}
          actionLabel={strings.moveOffer.dismissError}
          onAction={clearStartMoveError}
        />
      ) : null}

      {loading && cards.length === 0 ? (
        <LoadingState
          message={strings.loads.loading}
          spinnerColor={PP2Theme.colors.tms.navActive}
          style={styles.loadingWrap}
        />
      ) : (
        <FlatList
          data={cards}
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
              <EmptyState
                title={emptyCopy.title}
                message={emptyCopy.message}
                icon={tab === 'active' ? 'road' : 'calendar'}
              />
            ) : null
          }
          renderItem={({ item }) => {
            const showOffer =
              tab === 'upcoming' &&
              item.accepted_at == null &&
              item.started_at == null;
            const showStart =
              tab === 'upcoming' &&
              item.accepted_at != null &&
              item.started_at == null;
            const pendingAction =
              pendingOffer?.moveId === item.move_id
                ? pendingOffer.action
                : null;

            return (
              <DriverMoveCardItem
                card={item}
                onPress={() => openMove(item)}
                offer={
                  showOffer
                    ? {
                        pendingAction,
                        disabled:
                          pendingOffer != null &&
                          pendingOffer.moveId !== item.move_id,
                        onAccept: (moveId) => {
                          if (moveId === item.move_id) setAcceptCard(item);
                        },
                        onReject: (moveId) => {
                          if (moveId === item.move_id) setRejectCard(item);
                        },
                      }
                    : undefined
                }
                startAction={
                  showStart
                    ? {
                        loading: pendingStartMoveId === item.move_id,
                        disabled:
                          pendingOffer != null ||
                          (pendingStartMoveId != null &&
                            pendingStartMoveId !== item.move_id),
                        onStart: (moveId) => {
                          if (moveId === item.move_id) startMove(item);
                        },
                      }
                    : undefined
                }
              />
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={
            cards.length === 0 ? styles.emptyList : styles.list
          }
        />
      )}

      <AcceptMoveActionSheet
        visible={acceptCard != null}
        moveLabel={
          acceptCard?.reference_number?.trim() ||
          acceptCard?.move_id ||
          strings.moveOffer.fallbackMoveLabel
        }
        onDismiss={() => setAcceptCard(null)}
        onConfirm={(start) => {
          if (acceptCard) acceptMove(acceptCard, start);
        }}
      />

      <RejectMoveActionSheet
        visible={rejectCard != null}
        moveLabel={
          rejectCard?.reference_number?.trim() ||
          rejectCard?.move_id ||
          strings.moveOffer.fallbackMoveLabel
        }
        onDismiss={() => setRejectCard(null)}
        onConfirm={(reason) => {
          if (rejectCard) rejectMove(rejectCard, reason);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: PP2Theme.spacing.sm,
  },
  heading: {
    fontSize: PP2Theme.typography.sizes.headline,
    fontWeight: '700',
    color: PP2Theme.colors.text,
  },
  subheading: {
    marginTop: PP2Theme.spacing.xs,
    fontSize: PP2Theme.typography.sizes.subhead,
    color: PP2Theme.colors.textMuted,
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
    height: PP2Theme.spacing.sm,
  },
});
