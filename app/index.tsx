import { Redirect } from 'expo-router';

import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { isSupabaseAuthenticated, isInitialized } = useAuth();

  if (!isInitialized) {
    return null;
  }

  return (
    <Redirect
      href={isSupabaseAuthenticated ? '/(drawer)/loads' : '/(auth)/login'}
    />
  );
}
