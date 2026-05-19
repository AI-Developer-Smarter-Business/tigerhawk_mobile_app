import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { handleAuthCallbackUrl } from '@/lib/supabase/auth-callback';

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<string>(strings.auth.callbackSigningIn);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const url = await Linking.getInitialURL();
      if (!url) {
        if (!cancelled) {
          router.replace({
            pathname: '/(auth)/login',
            params: { authError: strings.auth.callbackInvalid },
          });
        }
        return;
      }

      const result = await handleAuthCallbackUrl(url);
      if (cancelled) return;

      if (result.ok) {
        setStatus('Redirecting…');
        router.replace('/(drawer)/loads');
        return;
      }

      router.replace({
        pathname: '/(auth)/login',
        params: { authError: result.error },
      });
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={PP2Theme.colors.primary} />
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PP2Theme.colors.background,
    padding: PP2Theme.spacing.lg,
  },
  text: {
    marginTop: PP2Theme.spacing.md,
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
  },
});
