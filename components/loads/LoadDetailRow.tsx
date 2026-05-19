import { StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';

type LoadDetailRowProps = {
  label: string;
  value: string;
  last?: boolean;
};

export function LoadDetailRow({ label, value, last }: LoadDetailRowProps) {
  return (
    <View style={!last ? styles.block : undefined}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function LoadDetailMeta({ children }: { children: string }) {
  return <Text style={styles.meta}>{children}</Text>;
}

const styles = StyleSheet.create({
  block: { marginBottom: PP2Theme.spacing.md },
  label: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    fontWeight: '600',
  },
  value: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.text,
    marginTop: 2,
  },
  meta: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginTop: 2,
    marginBottom: PP2Theme.spacing.md,
  },
});
