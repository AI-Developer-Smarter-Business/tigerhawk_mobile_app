import type { ComponentProps } from 'react';
import type FontAwesome from '@expo/vector-icons/FontAwesome';

import { strings } from '@/constants/strings';

export type DrawerRouteName = 'loads' | 'account';

export type DrawerNavItem = {
  route: DrawerRouteName;
  label: string;
  icon: ComponentProps<typeof FontAwesome>['name'];
};

/** Driver app drawer — TMS visual style (`nav_lateral.png`), driver scope only. */
export const DRIVER_DRAWER_ITEMS: DrawerNavItem[] = [
  { route: 'loads', label: strings.nav.loads, icon: 'truck' },
  { route: 'account', label: strings.nav.account, icon: 'user' },
];
