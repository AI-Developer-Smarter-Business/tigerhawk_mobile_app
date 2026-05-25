import { Redirect } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Dimensions } from 'react-native';

import { AppDrawerContent } from '@/components/navigation/AppDrawerContent';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import { useDriverLoadsRealtime } from '@/hooks/useDriverLoadsRealtime';

const tms = PP2Theme.colors.tms;
const drawerWidth = Math.min(
  Dimensions.get('window').width * PP2Theme.layout.drawerWidthPercent,
  PP2Theme.layout.drawerMaxWidth,
);

export default function DrawerLayout() {
  const { isSupabaseAuthenticated } = useAuth();
  useDriverLoadsRealtime();

  if (!isSupabaseAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        drawerType: 'front',
        drawerStyle: {
          width: drawerWidth,
          backgroundColor: tms.sidebarBackground,
        },
        overlayColor: PP2Theme.colors.overlay,
        headerStyle: {
          backgroundColor: tms.headerBackground,
          borderBottomWidth: 1,
          borderBottomColor: tms.headerBorder,
        },
        headerTintColor: tms.navActiveText,
        headerTitleStyle: { fontWeight: '600' },
      }}>
      <Drawer.Screen
        name="loads"
        options={{
          title: strings.nav.loads,
          headerTitle: strings.app.name,
        }}
      />
      <Drawer.Screen
        name="account"
        options={{
          title: strings.account.title,
        }}
      />
    </Drawer>
  );
}
