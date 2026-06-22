import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { env } from '@/lib/config/env';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

const tms = PP2Theme.colors.tms;

function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'DR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

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
    <Screen scroll>
      <Text style={styles.heading}>{strings.account.title}</Text>
      <Text style={styles.subheading}>{strings.app.tagline}</Text>

      <Card elevated>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profileInitials(displayName)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>
                {profile?.role ?? strings.account.driverRole}
              </Text>
            </View>
          </View>
        </View>
        {profile ? (
          <>
            <Text style={[styles.label, styles.mt]}>{strings.account.emailLabel}</Text>
            <Text style={styles.value}>{profile.email ?? session?.user.email}</Text>
          </>
        ) : profileLoading ? (
          <Text style={[styles.muted, styles.mt]}>{strings.account.loadingProfile}</Text>
        ) : (
          <Text style={[styles.muted, styles.mt]}>
            {profileError ?? strings.account.noProfile}
          </Text>
        )}
      </Card>

      <Card title={strings.auth.supabaseLabel} elevated>
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

      <Card title={strings.account.environment} elevated>
        <Text style={styles.envValue}>{supabaseHost}…</Text>
      </Card>

      <Button title={strings.auth.signOut} variant="accent" onPress={handleLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: PP2Theme.typography.sizes.headline,
    fontWeight: '700',
    color: PP2Theme.colors.text,
    marginBottom: PP2Theme.spacing.xs,
  },
  subheading: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
    marginBottom: PP2Theme.spacing.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PP2Theme.spacing.md,
    marginBottom: PP2Theme.spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PP2Theme.colors.accentMuted,
    borderWidth: 2,
    borderColor: tms.navActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '700',
    color: tms.navActive,
  },
  profileInfo: {
    flex: 1,
    gap: PP2Theme.spacing.xs,
  },
  profileName: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '700',
    color: PP2Theme.colors.text,
  },
  rolePill: {
    alignSelf: 'flex-start',
    backgroundColor: PP2Theme.colors.accentMuted,
    borderWidth: 1,
    borderColor: tms.navActive,
    borderRadius: PP2Theme.radius.sm,
    paddingHorizontal: PP2Theme.spacing.sm,
    paddingVertical: 2,
  },
  rolePillText: {
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '700',
    color: tms.navActive,
    textTransform: 'capitalize',
  },
  label: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.text,
    marginTop: PP2Theme.spacing.xs,
  },
  envValue: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    fontFamily: 'monospace',
  },
  muted: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
  },
  error: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.error,
    marginTop: PP2Theme.spacing.xs,
  },
  mt: { marginTop: PP2Theme.spacing.md },
});
