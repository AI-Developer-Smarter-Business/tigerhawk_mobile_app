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

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';

type ButtonProps = Omit<PressableProps, 'style'> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
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
        <ActivityIndicator
          color={variant === 'outline' ? PP2Theme.colors.primary : PP2Theme.colors.onPrimary}
        />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.textOutline]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: PP2Theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PP2Theme.spacing.md,
  },
  primary: { backgroundColor: PP2Theme.colors.primary },
  secondary: { backgroundColor: PP2Theme.colors.secondary },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: PP2Theme.colors.primary,
  },
  danger: { backgroundColor: PP2Theme.colors.error },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  text: {
    color: PP2Theme.colors.onPrimary,
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '600',
  },
  textOutline: { color: PP2Theme.colors.primary },
});
