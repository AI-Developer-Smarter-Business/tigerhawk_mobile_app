import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { PP2Theme } from '@/constants/theme';

type InputProps = TextInputProps & {
  label: string;
  error?: string;
};

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={PP2Theme.colors.textMuted}
        style={[styles.input, error ? styles.inputError : null, style]}
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
  inputError: { borderColor: PP2Theme.colors.error },
  error: {
    marginTop: PP2Theme.spacing.xs,
    color: PP2Theme.colors.error,
    fontSize: PP2Theme.typography.sizes.caption,
  },
});
