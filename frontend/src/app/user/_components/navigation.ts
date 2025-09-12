import type { LucideIcon } from 'lucide-react';
import { Home, Store, MapPin } from 'lucide-react';

interface NavigationItem {
  title: string;
  icon: LucideIcon;
  url: string;
}

export const navigationItems: NavigationItem[] = [
  {
    title: 'Home',
    icon: Home,
    url: '/user',
  },
  {
    title: 'Stores',
    icon: Store,
    url: '/user/stores',
  },
];
