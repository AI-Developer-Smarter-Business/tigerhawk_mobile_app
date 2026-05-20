import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { BrandHeader } from '@/components/brand/BrandHeader';
import { PP2Theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

/** Espera a que termine getSession antes de montar rutas. */
export function AuthBootstrapGate({ children }: { children: React.ReactNode }) {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return (
      <View style={styles.center}>
        <BrandHeader variant="bootstrap" style={styles.brand} />
        <ActivityIndicator
          size="large"
          color={PP2Theme.colors.tms.navActive}
          style={styles.spinner}
        />
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
    backgroundColor: PP2Theme.colors.tms.pageBackground,
  },
  brand: {
    marginBottom: PP2Theme.spacing.xl,
  },
  spinner: {
    marginTop: PP2Theme.spacing.md,
  },
});
