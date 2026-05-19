import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DrawerContentScrollView,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DRIVER_DRAWER_ITEMS } from '@/constants/navigation';
import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

const tms = PP2Theme.colors.tms;

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const activeRoute = props.state.routes[props.state.index]?.name;

  const navigate = (route: string) => {
    props.navigation.navigate(route);
    props.navigation.closeDrawer();
  };

  const handleLogOut = async () => {
    props.navigation.closeDrawer();
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.brandBlock}>
        <Text style={styles.brandTitle}>{strings.nav.brandTitle}</Text>
        <Text style={styles.brandSubtitle}>{strings.nav.brandSubtitle}</Text>
        <Text style={styles.appTag}>PP2 · Driver</Text>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}>
        {DRIVER_DRAWER_ITEMS.map((item) => {
          const active = activeRoute === item.route;
          return (
            <Pressable
              key={item.route}
              onPress={() => navigate(item.route)}
              style={({ pressed }) => [
                styles.item,
                active && styles.itemActive,
                pressed && !active && styles.itemPressed,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}>
              <FontAwesome
                name={item.icon}
                size={20}
                color={active ? tms.navActiveText : tms.navItem}
                style={styles.itemIcon}
              />
              <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </DrawerContentScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + PP2Theme.spacing.md }]}>
        <Pressable
          onPress={() => void handleLogOut()}
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          accessibilityRole="button">
          <FontAwesome
            name="sign-out"
            size={20}
            color={tms.navItem}
            style={styles.itemIcon}
          />
          <Text style={styles.itemLabel}>{strings.nav.logOut}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tms.sidebarBackground,
    borderRightWidth: 1,
    borderRightColor: tms.sidebarBorder,
  },
  brandBlock: {
    paddingHorizontal: PP2Theme.spacing.md,
    paddingVertical: PP2Theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: tms.sidebarBorder,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: tms.navActiveText,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: PP2Theme.typography.sizes.caption,
    color: tms.navItem,
    marginTop: 2,
  },
  appTag: {
    marginTop: PP2Theme.spacing.sm,
    fontSize: 11,
    fontWeight: '600',
    color: tms.navActive,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scroll: {
    backgroundColor: tms.sidebarBackground,
  },
  scrollContent: {
    paddingTop: PP2Theme.spacing.sm,
    paddingHorizontal: PP2Theme.spacing.sm,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: PP2Theme.spacing.md,
    borderRadius: PP2Theme.radius.md,
    marginBottom: 4,
  },
  itemActive: {
    backgroundColor: tms.navActive,
    shadowColor: tms.navActive,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  itemPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  itemIcon: {
    width: 28,
  },
  itemLabel: {
    flex: 1,
    fontSize: PP2Theme.typography.sizes.body,
    fontWeight: '500',
    color: tms.navItem,
  },
  itemLabelActive: {
    color: tms.navActiveText,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: tms.sidebarBorder,
    paddingHorizontal: PP2Theme.spacing.sm,
    paddingTop: PP2Theme.spacing.sm,
  },
});
