import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { PP2Theme } from '@/constants/theme';

const tms = PP2Theme.colors.tms;

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'outlineAccent'
  | 'danger'
  | 'accent';

type ButtonProps = Omit<PressableProps, 'style' | 'accessibilityLabel'> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const spinnerColor =
    variant === 'outline'
      ? PP2Theme.colors.primary
      : variant === 'outlineAccent'
        ? tms.navActive
        : variant === 'accent'
          ? tms.navActiveText
          : PP2Theme.colors.onPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style as ViewStyle,
      ]}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: PP2Theme.layout.minTouchTarget,
    borderRadius: PP2Theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PP2Theme.spacing.md,
  },
  primary: { backgroundColor: PP2Theme.colors.primary },
  secondary: { backgroundColor: PP2Theme.colors.secondary },
  accent: {
    backgroundColor: tms.navActive,
    shadowColor: tms.navActive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PP2Theme.colors.primary,
  },
  outlineAccent: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: tms.navActive,
  },
  danger: { backgroundColor: PP2Theme.colors.error },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  text: {
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
  },
  text_primary: { color: PP2Theme.colors.onPrimary },
  text_secondary: { color: PP2Theme.colors.onPrimary },
  text_accent: { color: tms.navActiveText },
  text_outline: { color: PP2Theme.colors.primary },
  text_outlineAccent: { color: tms.navActive },
  text_danger: { color: PP2Theme.colors.onPrimary },
});
