import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { PP2Theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

/** Espera a que termine getSession antes de montar rutas. */
export function AuthBootstrapGate({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={PP2Theme.colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PP2Theme.colors.background,
  },
});
