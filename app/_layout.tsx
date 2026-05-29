import 'react-native-gesture-handler';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { AuthBootstrapGate } from '@/components/auth/AuthBootstrapGate';
import { AuthDeepLinkHandler } from '@/components/auth/AuthDeepLinkHandler';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { strings } from '@/constants/strings';
import { AuthProvider } from '@/context/AuthContext';
import { LoadsProvider } from '@/context/LoadsContext';
import { NetworkProvider } from '@/context/NetworkContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { PP2Theme } from '@/constants/theme';
import { DriverLoadsRealtimeBridge } from '@/components/query/DriverLoadsRealtimeBridge';
import { QueryProvider } from '@/lib/query/QueryProvider';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const PP2NavigationTheme = {
  dark: false,
  colors: {
    primary: PP2Theme.colors.primary,
    background: PP2Theme.colors.background,
    card: PP2Theme.colors.surface,
    text: PP2Theme.colors.text,
    border: PP2Theme.colors.border,
    notification: PP2Theme.colors.secondary,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <NetworkProvider>
        <ProfileProvider>
          <QueryProvider>
            <LoadsProvider>
            <AuthBootstrapGate>
              <DriverLoadsRealtimeBridge />
              <AuthDeepLinkHandler />
              <ThemeProvider value={PP2NavigationTheme}>
                <View style={{ flex: 1 }}>
                  <OfflineBanner />
                  <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="auth/callback"
                  options={{ headerShown: false, title: 'Signing in' }}
                />
                <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="load/[id]"
                  options={{
                    title: strings.loadDetail.screenTitle,
                    headerStyle: {
                      backgroundColor: PP2Theme.colors.tms.headerBackground,
                    },
                    headerTintColor: PP2Theme.colors.tms.navActiveText,
                  }}
                />
                  </Stack>
                </View>
              </ThemeProvider>
            </AuthBootstrapGate>
            </LoadsProvider>
          </QueryProvider>
        </ProfileProvider>
      </NetworkProvider>
    </AuthProvider>
  );
}
