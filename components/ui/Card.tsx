import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';

type CardProps = {
  title?: string;
  children: ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
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
  title: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '600',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.sm,
  },
});
