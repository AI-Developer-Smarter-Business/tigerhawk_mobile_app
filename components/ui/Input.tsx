import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { PP2Theme } from '@/constants/theme';

const tms = PP2Theme.colors.tms;

export type InputVariant = 'default' | 'chrome';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
  variant?: InputVariant;
};

export function Input({ label, error, style, variant = 'default', ...rest }: InputProps) {
  const isChrome = variant === 'chrome';
  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, isChrome && styles.labelChrome]}>{label}</Text>
      <TextInput
        placeholderTextColor={isChrome ? tms.navItem : PP2Theme.colors.textMuted}
        style={[
          styles.input,
          isChrome && styles.inputChrome,
          error ? styles.inputError : null,
          style,
        ]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: PP2Theme.spacing.md },
  label: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.xs,
    fontWeight: '600',
  },
  labelChrome: {
    color: PP2Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: PP2Theme.colors.border,
    borderRadius: PP2Theme.radius.md,
    paddingHorizontal: PP2Theme.spacing.md,
    paddingVertical: 12,
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.text,
    backgroundColor: PP2Theme.colors.surface,
  },
  inputChrome: {
    borderColor: tms.inputBorder,
    backgroundColor: tms.inputBackground,
    color: PP2Theme.colors.text,
  },
  inputError: { borderColor: PP2Theme.colors.error },
  error: {
    marginTop: PP2Theme.spacing.xs,
    color: PP2Theme.colors.error,
    fontSize: PP2Theme.typography.sizes.caption,
  },
});
