import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BrandHeader } from '@/components/brand/BrandHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Input } from '@/components/ui/Input';
import { Screen } from '@/components/ui/Screen';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

const tms = PP2Theme.colors.tms;

export default function LoginScreen() {
  const { authError } = useLocalSearchParams<{ authError?: string }>();
  const { signInWithUsername, isSupabaseAuthenticated, initError } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    typeof authError === 'string' ? authError : null,
  );
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);

    const result = await signInWithUsername(identifier, password);
    setLoading(false);

    if (result.ok) {
      router.replace('/(drawer)/loads');
      return;
    }

    setError(result.error ?? strings.auth.signInFailed);
  };

  return (
    <Screen style={styles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}>
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
            <Input
              label={strings.auth.usernameOrEmail}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              keyboardType="email-address"
              accessibilityLabel={strings.auth.usernameOrEmail}
            />
            <Input
              label={strings.auth.password}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={handleSignIn}
              accessibilityLabel={strings.auth.password}
            />
            <Button
              title={strings.auth.signInButton}
              variant="accent"
              onPress={handleSignIn}
              loading={loading}
              accessibilityLabel={strings.auth.signInButton}
            />
            <Text style={styles.hint}>{strings.auth.usernameOrEmailHint}</Text>
            <Text style={styles.hint}>{strings.auth.contactDispatchPassword}</Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: 0 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: PP2Theme.spacing.md,
    paddingBottom: PP2Theme.spacing.xl,
  },
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
  hint: {
    marginTop: PP2Theme.spacing.sm,
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
