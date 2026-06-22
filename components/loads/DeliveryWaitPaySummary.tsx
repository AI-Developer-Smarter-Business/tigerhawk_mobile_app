import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import type { WaitPaySummary } from '@/lib/wait-time/wait-pay-summary';
import {
  formatAccruedWaitMinutes,
  formatUsdAmount,
} from '@/lib/wait-time/wait-pay-summary';

type DeliveryWaitPaySummaryProps = {
  summary: WaitPaySummary;
};

export function DeliveryWaitPaySummary({ summary }: DeliveryWaitPaySummaryProps) {
  if (!summary.visible) {
    return null;
  }

  return (
    <View
      style={styles.wrap}
      accessibilityRole="summary"
      accessibilityLabel={strings.waitTime.paySummaryA11y}
    >
      <Text style={styles.title}>{strings.waitTime.paySummaryTitle}</Text>
      <View style={styles.row}>
        <Text style={styles.label}>{strings.waitTime.accruedTimeLabel}</Text>
        <Text style={styles.value}>
          {formatAccruedWaitMinutes(summary.totalMinutes)}
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{strings.waitTime.estimatedPayLabel}</Text>
        <Text style={styles.payValue}>{formatUsdAmount(summary.totalDriverPay)}</Text>
      </View>
      {summary.isActiveEstimate ? (
        <Text style={styles.hint}>{strings.waitTime.payEstimateHint}</Text>
      ) : (
        <Text style={styles.hint}>{strings.waitTime.payReadOnlyHint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: PP2Theme.spacing.md,
    paddingTop: PP2Theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: PP2Theme.colors.border,
    gap: PP2Theme.spacing.xs,
  },
  title: {
    fontSize: PP2Theme.typography.sizes.subhead,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: PP2Theme.spacing.sm,
  },
  label: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
    flex: 1,
  },
  value: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
    color: PP2Theme.colors.text,
    fontVariant: ['tabular-nums'],
  },
  payValue: {
    fontSize: PP2Theme.typography.sizes.headline,
    fontWeight: '700',
    color: PP2Theme.colors.tms.navActive,
    fontVariant: ['tabular-nums'],
  },
  hint: {
    marginTop: PP2Theme.spacing.xs,
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    lineHeight: 18,
  },
});
