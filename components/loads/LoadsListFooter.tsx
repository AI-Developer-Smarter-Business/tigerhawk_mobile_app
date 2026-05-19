import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';

type LoadsListFooterProps = {
  loadingMore: boolean;
  hasMore: boolean;
  loadedCount: number;
  loadingMoreLabel: string;
  scrollHintLabel: string;
  endLabel: string;
};

export function LoadsListFooter({
  loadingMore,
  hasMore,
  loadedCount,
  loadingMoreLabel,
  scrollHintLabel,
  endLabel,
}: LoadsListFooterProps) {
  if (loadingMore) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color={PP2Theme.colors.tms.navActive} size="small" />
        <Text style={styles.loadingText}>{loadingMoreLabel}</Text>
      </View>
    );
  }

  if (loadedCount === 0) {
    return null;
  }

  if (hasMore) {
    return (
      <View style={styles.hintBox}>
        <View style={styles.hintDot} />
        <Text style={styles.hintText}>{scrollHintLabel}</Text>
      </View>
    );
  }

  return (
    <View style={styles.endBox}>
      <Text style={styles.endText}>{endLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PP2Theme.spacing.sm,
    marginTop: PP2Theme.spacing.sm,
    marginBottom: PP2Theme.spacing.lg,
    paddingVertical: PP2Theme.spacing.md,
    paddingHorizontal: PP2Theme.spacing.md,
    backgroundColor: PP2Theme.colors.surface,
    borderRadius: PP2Theme.radius.md,
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
  },
  loadingText: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.text,
    fontWeight: '500',
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PP2Theme.spacing.sm,
    paddingVertical: PP2Theme.spacing.lg,
  },
  hintDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PP2Theme.colors.tms.navActive,
  },
  hintText: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
  },
  endBox: {
    alignItems: 'center',
    paddingVertical: PP2Theme.spacing.lg,
    marginBottom: PP2Theme.spacing.md,
  },
  endText: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    fontWeight: '500',
  },
});
