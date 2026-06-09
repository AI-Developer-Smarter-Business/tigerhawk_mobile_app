import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, Text, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';

type EmptyStateProps = {
  title: string;
  message: string;
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
};

export function EmptyState({
  title,
  message,
  icon = 'inbox',
}: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconPlate}>
        <FontAwesome name={icon} size={40} color={PP2Theme.colors.tms.navActive} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: PP2Theme.spacing.xl,
    paddingHorizontal: PP2Theme.spacing.lg,
  },
  iconPlate: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: PP2Theme.colors.accentMuted,
    borderWidth: 1,
    borderColor: PP2Theme.colors.tms.navActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: PP2Theme.spacing.md,
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    textAlign: 'center',
  },
  message: {
    marginTop: PP2Theme.spacing.sm,
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
