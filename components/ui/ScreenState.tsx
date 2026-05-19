import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { PP2Theme } from '@/constants/theme';

type ScreenStateProps = {
  style?: StyleProp<ViewStyle>;
};

type LoadingStateProps = ScreenStateProps & {
  message: string;
  spinnerColor?: string;
};

export function LoadingState({
  message,
  spinnerColor = PP2Theme.colors.primary,
  style,
}: LoadingStateProps) {
  return (
    <View style={[styles.centered, style]}>
      <ActivityIndicator size="large" color={spinnerColor} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

type ErrorStateProps = ScreenStateProps & {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  footer?: string;
};

export function ErrorState({
  message,
  actionLabel,
  onAction,
  footer,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.centered, style]}>
      <ErrorBanner message={message} actionLabel={actionLabel} onAction={onAction} />
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: PP2Theme.spacing.md,
    backgroundColor: PP2Theme.colors.background,
  },
  message: {
    marginTop: PP2Theme.spacing.md,
    color: PP2Theme.colors.textMuted,
    fontSize: PP2Theme.typography.sizes.body,
  },
  footer: {
    marginTop: PP2Theme.spacing.md,
    color: PP2Theme.colors.textMuted,
    fontSize: PP2Theme.typography.sizes.body,
    textAlign: 'center',
  },
});
