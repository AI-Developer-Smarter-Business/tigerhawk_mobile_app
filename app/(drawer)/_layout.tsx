import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Redirect, Tabs } from 'expo-router';

import { strings } from '@/constants/strings';
import { PP2Theme } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';

const tms = PP2Theme.colors.tms;

/**
 * Driver shell (J.1): bottom tabs Loads · Clock · Account.
 * Load History stays as a stack-style route (hidden from the tab bar; opened from Account).
 * Route group stays `(drawer)` so existing `/(drawer)/…` redirects keep working.
 */
export default function DriverTabsLayout() {
  const { isSupabaseAuthenticated } = useAuth();

  if (!isSupabaseAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: tms.headerBackground,
          borderBottomWidth: 1,
          borderBottomColor: tms.headerBorder,
        },
        headerTintColor: tms.headerText,
        headerTitleStyle: { fontWeight: '600' },
        tabBarActiveTintColor: tms.navActive,
        tabBarInactiveTintColor: tms.navItem,
        tabBarStyle: {
          backgroundColor: tms.sidebarBackground,
          borderTopColor: tms.sidebarBorder,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="loads"
        options={{
          title: strings.tabs.loads,
          headerTitle: strings.app.name,
          tabBarLabel: strings.tabs.loads,
          tabBarAccessibilityLabel: strings.tabs.loads,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="truck" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clock"
        options={{
          title: strings.clock.title,
          tabBarLabel: strings.tabs.clock,
          tabBarAccessibilityLabel: strings.tabs.clock,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="clock-o" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: strings.account.title,
          tabBarLabel: strings.tabs.account,
          tabBarAccessibilityLabel: strings.tabs.account,
          tabBarIcon: ({ color }) => (
            <FontAwesome name="user" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: strings.loadHistory.title,
          href: null,
        }}
      />
    </Tabs>
  );
}
