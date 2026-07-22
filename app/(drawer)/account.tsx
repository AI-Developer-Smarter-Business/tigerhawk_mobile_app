import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppActionSheet } from '@/components/ui/AppActionSheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Screen } from '@/components/ui/Screen';
import { DRIVER_HISTORY_ROUTE } from '@/constants/navigation';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { env } from '@/lib/config/env';
import { safeLog } from '@/lib/logging/safe-log';
import {
  hasDispatchPhone,
  openDispatchEmail,
  openDispatchPhone,
} from '@/lib/support/dispatch-contact';

const tms = PP2Theme.colors.tms;

function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'DR';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

function contactOpenErrorMessage(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  if (code === 'DISPATCH_PHONE_MISSING') {
    return strings.account.contactDispatchPhoneMissing;
  }
  return strings.account.contactDispatchOpenFailed;
}

export default function AccountScreen() {
  const {
    session,
    isSupabaseAuthenticated,
    lastAuthEvent,
    initError,
    refreshSession,
    mobileDriver,
    signOut,
  } = useAuth();
  const {
    profile,
    linkedDriver,
    isDriver,
    loading: profileLoading,
    error: profileError,
    refetch,
  } = useProfile();
  const [contactSheetVisible, setContactSheetVisible] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const supabaseHost = env.supabaseUrl.replace(/^https?:\/\//, '').split('.')[0];
  const driverIdentity = mobileDriver ?? linkedDriver;
  const displayName =
    driverIdentity?.name ??
    profile?.full_name ??
    session?.user.email ??
    'Driver';
  const username = driverIdentity?.username;

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const handleCallDispatch = async () => {
    setContactError(null);
    try {
      await openDispatchPhone();
    } catch (error) {
      safeLog.warn('account', contactOpenErrorMessage(error));
      setContactError(contactOpenErrorMessage(error));
    }
  };

  const handleEmailDispatch = async () => {
    setContactError(null);
    try {
      await openDispatchEmail(
        `${strings.app.name} — driver support`,
        strings.account.contactDispatchMessage,
      );
    } catch (error) {
      safeLog.warn('account', contactOpenErrorMessage(error));
      setContactError(contactOpenErrorMessage(error));
    }
  };

  const contactActions = [
    {
      label: strings.account.callDispatch,
      onPress: () => {
        void handleCallDispatch();
      },
    },
    {
      label: strings.account.emailDispatch,
      onPress: () => {
        void handleEmailDispatch();
      },
    },
    {
      label: strings.driverProgress.cancel,
      onPress: () => undefined,
      variant: 'cancel' as const,
    },
  ];

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
                {isDriver
                  ? strings.account.driverRole
                  : (profile?.role ?? strings.account.driverRole)}
              </Text>
            </View>
          </View>
        </View>
        {username ? (
          <>
            <Text style={[styles.label, styles.mt]}>{strings.account.usernameLabel}</Text>
            <Text style={styles.value}>{username}</Text>
          </>
        ) : null}
        {profile?.email || session?.user.email ? (
          <>
            <Text style={[styles.label, styles.mt]}>{strings.account.emailLabel}</Text>
            <Text style={styles.value}>{profile?.email ?? session?.user.email}</Text>
          </>
        ) : null}
        {profileLoading && !driverIdentity ? (
          <Text style={[styles.muted, styles.mt]}>{strings.account.loadingProfile}</Text>
        ) : null}
        {!profileLoading && !isDriver && profileError ? (
          <Text style={[styles.muted, styles.mt]}>{profileError}</Text>
        ) : null}
        {!profileLoading && !isDriver && !profileError ? (
          <Text style={[styles.muted, styles.mt]}>{strings.auth.notDriverRole}</Text>
        ) : null}
      </Card>

      <Card title={strings.account.supportTitle} elevated>
        <Text style={styles.muted}>{strings.account.contactDispatchMessage}</Text>
        <Text style={[styles.muted, styles.mt]}>{strings.auth.contactDispatchPassword}</Text>
        {!hasDispatchPhone() ? (
          <Text style={[styles.muted, styles.mt]}>
            {strings.account.contactDispatchPhoneMissing}
          </Text>
        ) : null}
        {contactError ? (
          <View style={styles.mt}>
            <ErrorBanner message={contactError} />
          </View>
        ) : null}
        <Button
          title={strings.account.contactDispatch}
          variant="accent"
          onPress={() => {
            setContactError(null);
            setContactSheetVisible(true);
          }}
          accessibilityLabel={strings.account.contactDispatchA11y}
          style={styles.mt}
        />
        <Button
          title={strings.account.loadHistory}
          variant="outlineAccent"
          onPress={() => router.push(DRIVER_HISTORY_ROUTE.href)}
          accessibilityLabel={strings.account.loadHistoryA11y}
          style={styles.mt}
        />
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

      <AppActionSheet
        visible={contactSheetVisible}
        title={strings.account.contactDispatch}
        message={strings.account.contactDispatchSheetHint}
        actions={contactActions}
        onDismiss={() => setContactSheetVisible(false)}
      />
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
    marginBottom: PP2Theme.spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: PP2Theme.spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: tms.navActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: PP2Theme.typography.sizes.body,
  },
  profileInfo: {
    flex: 1,
    minWidth: 0,
  },
  profileName: {
    fontSize: PP2Theme.typography.sizes.title,
    fontWeight: '700',
    color: PP2Theme.colors.text,
  },
  rolePill: {
    alignSelf: 'flex-start',
    marginTop: PP2Theme.spacing.xs,
    paddingHorizontal: PP2Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: PP2Theme.radius.sm,
    backgroundColor: `${tms.navActive}22`,
  },
  rolePillText: {
    fontSize: PP2Theme.typography.sizes.caption,
    fontWeight: '600',
    color: tms.navActive,
  },
  label: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: PP2Theme.colors.textMuted,
    fontWeight: '600',
  },
  value: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.text,
    marginTop: 2,
  },
  muted: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.textMuted,
  },
  error: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.error,
  },
  envValue: {
    fontSize: PP2Theme.typography.sizes.body,
    color: PP2Theme.colors.text,
  },
  mt: {
    marginTop: PP2Theme.spacing.md,
  },
});
