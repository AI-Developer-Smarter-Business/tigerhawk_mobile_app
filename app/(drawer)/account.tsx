import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { env } from '@/lib/config/env';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const tms = PP2Theme.colors.tms;

export default function AccountScreen() {
  const {
    session,
    isSupabaseAuthenticated,
    lastAuthEvent,
    initError,
    refreshSession,
    signOut,
  } = useAuth();
  const { profile, loading: profileLoading, error: profileError, refetch } =
    useProfile();

  const supabaseHost = env.supabaseUrl.replace(/^https?:\/\//, '').split('.')[0];
  const displayName =
    profile?.full_name ?? session?.user.email ?? 'Driver';

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <Screen scroll variant="chrome">
      <Text style={styles.heading}>{strings.account.title}</Text>
      <Text style={styles.subheading}>{strings.app.tagline}</Text>

      <Card title={displayName} variant="chrome">
        {profile ? (
          <>
            <Text style={styles.label}>{strings.account.roleLabel}</Text>
            <Text style={styles.value}>{profile.role}</Text>
            <Text style={[styles.label, styles.mt]}>{strings.account.emailLabel}</Text>
            <Text style={styles.value}>{profile.email ?? session?.user.email}</Text>
          </>
        ) : profileLoading ? (
          <Text style={styles.muted}>{strings.account.loadingProfile}</Text>
        ) : (
          <Text style={styles.muted}>
            {profileError ?? strings.account.noProfile}
          </Text>
        )}
      </Card>

      <Card title={strings.auth.supabaseLabel} variant="chrome">
        <Text style={styles.label}>{strings.account.sessionLabel}</Text>
        <Text style={styles.value}>
          {isSupabaseAuthenticated
            ? strings.auth.sessionActive
            : strings.auth.sessionNone}
        </Text>
        {lastAuthEvent ? (
          <>
            <Text style={[styles.label, styles.mt]}>{strings.account.lastEvent}</Text>
            <Text style={styles.value}>{lastAuthEvent}</Text>
          </>
        ) : null}
        {initError ? (
          <>
            <Text style={[styles.label, styles.mt]}>{strings.account.errorLabel}</Text>
            <Text style={styles.error}>{initError}</Text>
          </>
        ) : null}
        <Button
          title={strings.account.refreshSession}
          variant="outlineAccent"
          onPress={async () => {
            await refreshSession();
            await refetch();
          }}
          style={styles.mt}
        />
      </Card>

      <Card title={strings.account.environment} variant="chrome">
        <Text style={styles.label}>{strings.account.projectLabel}</Text>
        <Text style={styles.value}>{supabaseHost}…</Text>
      </Card>

      <Button title={strings.auth.signOut} variant="accent" onPress={handleLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: PP2Theme.typography.sizes.headline,
    fontWeight: '700',
    color: tms.navActiveText,
    marginBottom: PP2Theme.spacing.xs,
  },
  subheading: {
    fontSize: PP2Theme.typography.sizes.body,
    color: tms.navItem,
    marginBottom: PP2Theme.spacing.lg,
  },
  label: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: tms.navItem,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: PP2Theme.typography.sizes.body,
    color: tms.navActiveText,
    marginTop: 4,
  },
  muted: {
    fontSize: PP2Theme.typography.sizes.body,
    color: tms.navItem,
  },
  error: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.error,
    marginTop: 4,
  },
  mt: { marginTop: PP2Theme.spacing.md },
});
