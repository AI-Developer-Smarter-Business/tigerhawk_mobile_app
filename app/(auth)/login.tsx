import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { BrandHeader } from '@/components/brand/BrandHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { getAuthRedirectUri } from '@/lib/auth/redirect-uri';
import { useAuth } from '@/hooks/useAuth';

const tms = PP2Theme.colors.tms;

export default function LoginScreen() {
  const { authError } = useLocalSearchParams<{ authError?: string }>();
  const {
    signInWithPassword,
    signInWithMagicLink,
    isSupabaseAuthenticated,
    initError,
  } = useAuth();
  const [email, setEmail] = useState('driver_test@test.com');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(
    typeof authError === 'string' ? authError : null,
  );
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePasswordLogin = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);

    const result = await signInWithPassword(email, password);
    setLoading(false);

    if (result.ok) {
      router.replace('/(drawer)/loads');
      return;
    }

    setError(result.error ?? strings.auth.signInFailed);
  };

  const handleMagicLink = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);

    const result = await signInWithMagicLink(email);
    setLoading(false);

    if (!result.ok) {
      setError(result.error ?? strings.auth.signInFailed);
      return;
    }

    setInfo(strings.auth.magicLinkSent);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <BrandHeader variant="login" style={styles.header} />

        <Card title={strings.auth.signIn} elevated>
          <View style={styles.sessionPill}>
            <Text style={styles.sessionHint}>
              {strings.auth.driverSubtitle} ·{' '}
              {initError
                ? 'error'
                : isSupabaseAuthenticated
                  ? strings.auth.sessionActive
                  : strings.auth.sessionReady}
            </Text>
          </View>
          {initError ? <ErrorBanner message={initError} /> : null}
          {error ? <ErrorBanner message={error} /> : null}
          {info ? <Text style={styles.info}>{info}</Text> : null}
          <Input
            label={strings.auth.email}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            label={strings.auth.password}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />
          <Button
            title={strings.auth.signInButton}
            variant="accent"
            onPress={handlePasswordLogin}
            loading={loading}
          />
          <Button
            title={strings.auth.sendMagicLink}
            variant="outlineAccent"
            onPress={handleMagicLink}
            loading={loading}
            style={styles.mt}
          />
          {__DEV__ ? (
            <Text style={styles.redirect} numberOfLines={2}>
              Redirect: {getAuthRedirectUri()}
            </Text>
          ) : null}
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    marginBottom: PP2Theme.spacing.lg,
    marginTop: PP2Theme.spacing.lg,
  },
  sessionPill: {
    alignSelf: 'flex-start',
    backgroundColor: PP2Theme.colors.accentMuted,
    borderWidth: 1,
    borderColor: tms.navActive,
    borderRadius: PP2Theme.radius.sm,
    paddingHorizontal: PP2Theme.spacing.sm,
    paddingVertical: PP2Theme.spacing.xs,
    marginBottom: PP2Theme.spacing.md,
  },
  sessionHint: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: tms.navActive,
    fontWeight: '600',
  },
  redirect: {
    marginTop: PP2Theme.spacing.sm,
    fontSize: 10,
    color: PP2Theme.colors.textMuted,
    textAlign: 'center',
  },
  info: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.success,
    marginBottom: PP2Theme.spacing.sm,
  },
  mt: { marginTop: PP2Theme.spacing.sm },
});
