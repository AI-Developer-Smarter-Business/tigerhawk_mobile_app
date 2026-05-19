import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { handleAuthCallbackUrl } from '@/lib/supabase/auth-callback';

function isAuthCallbackUrl(url: string): boolean {
  return url.includes('auth/callback');
}

async function processAuthUrl(url: string): Promise<void> {
  if (!isAuthCallbackUrl(url)) return;

  const result = await handleAuthCallbackUrl(url);
  if (result.ok) {
    router.replace('/(drawer)/loads');
    return;
  }

  router.replace({
    pathname: '/(auth)/login',
    params: {
      authError: result.error,
    },
  });
}

/** Handles cold start and warm deep links for Supabase auth (`pp2://auth/callback`). */
export function AuthDeepLinkHandler() {
  const url = Linking.useURL();

  useEffect(() => {
    if (url) {
      void processAuthUrl(url);
    }
  }, [url]);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url: nextUrl }) => {
      void processAuthUrl(nextUrl);
    });
    return () => subscription.remove();
  }, []);

  return null;
}
