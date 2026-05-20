import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';

const tms = PP2Theme.colors.tms;

export type CardVariant = 'default' | 'chrome';

type CardProps = {
  title?: string;
  children: ReactNode;
  variant?: CardVariant;
};

export function Card({ title, children, variant = 'default' }: CardProps) {
  const isChrome = variant === 'chrome';
  return (
    <View style={[styles.card, isChrome && styles.cardChrome]}>
      {title ? (
        <Text style={[styles.title, isChrome && styles.titleChrome]}>{title}</Text>
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
  cardChrome: {
    backgroundColor: tms.cardBackground,
    borderColor: tms.sidebarBorder,
  },
  title: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '600',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.sm,
  },
  titleChrome: {
    color: tms.navActiveText,
  },
});
