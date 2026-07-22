import type { ComponentProps } from 'react';
import type FontAwesome from '@expo/vector-icons/FontAwesome';

import { strings } from '@/constants/strings';

export type TabRouteName = 'loads' | 'clock' | 'account';

export type TabNavItem = {
  route: TabRouteName;
  label: string;
  icon: ComponentProps<typeof FontAwesome>['name'];
};

/** Bottom tabs (J.1) — Loads · Clock · Account. */
export const DRIVER_TAB_ITEMS: TabNavItem[] = [
  { route: 'loads', label: strings.tabs.loads, icon: 'truck' },
  { route: 'clock', label: strings.tabs.clock, icon: 'clock-o' },
  { route: 'account', label: strings.tabs.account, icon: 'user' },
];

/** Secondary route — not a tab; opened from Account (B.4 history). */
export const DRIVER_HISTORY_ROUTE = {
  route: 'history' as const,
  label: strings.nav.history,
  href: '/(drawer)/history' as const,
};

/** @deprecated Prefer DRIVER_TAB_ITEMS; kept for AppDrawerContent if re-enabled. */
export type DrawerRouteName = TabRouteName | 'history';

export type DrawerNavItem = {
  route: DrawerRouteName;
  label: string;
  icon: ComponentProps<typeof FontAwesome>['name'];
};

export const DRIVER_DRAWER_ITEMS: DrawerNavItem[] = [
  ...DRIVER_TAB_ITEMS.map((item) => ({
    route: item.route as DrawerRouteName,
    label: item.label,
    icon: item.icon,
  })),
  {
    route: DRIVER_HISTORY_ROUTE.route,
    label: DRIVER_HISTORY_ROUTE.label,
    icon: 'history',
  },
];
