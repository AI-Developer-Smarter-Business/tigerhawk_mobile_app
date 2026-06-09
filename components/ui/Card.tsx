import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';

const tms = PP2Theme.colors.tms;

export type CardVariant = 'default' | 'chrome';

type CardProps = {
  title?: string;
  children: ReactNode;
  variant?: CardVariant;
  /** Subtle shadow on light surfaces (loads, load detail). */
  elevated?: boolean;
};

export function Card({
  title,
  children,
  variant = 'default',
  elevated = false,
}: CardProps) {
  const isChrome = variant === 'chrome';
  return (
    <View
      style={[
        styles.card,
        isChrome && styles.cardChrome,
        !isChrome && elevated && styles.cardElevated,
      ]}>
      {title ? (
        <View style={styles.titleRow}>
          {!isChrome ? <View style={styles.titleAccent} /> : null}
          <Text style={[styles.title, isChrome && styles.titleChrome]}>{title}</Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PP2Theme.colors.surface,
    borderRadius: PP2Theme.radius.md,
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    padding: PP2Theme.spacing.md,
    marginBottom: PP2Theme.spacing.md,
  },
  cardElevated: {
    borderColor: 'transparent',
    ...PP2Theme.shadow.sm,
  },
  cardChrome: {
    backgroundColor: tms.cardBackground,
    borderColor: tms.sidebarBorder,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: PP2Theme.spacing.sm,
    gap: PP2Theme.spacing.sm,
  },
  titleAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: PP2Theme.colors.accentStrip,
  },
  title: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '600',
    color: PP2Theme.colors.text,
    flex: 1,
  },
  titleChrome: {
    color: tms.navActiveText,
  },
});
