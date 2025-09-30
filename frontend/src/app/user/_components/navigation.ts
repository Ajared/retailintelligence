import type { LucideIcon } from 'lucide-react';
import { Store } from 'lucide-react';

interface NavigationItem {
  title: string;
  icon: LucideIcon;
  url: string;
}

export const navigationItems: NavigationItem[] = [
  {
    title: 'Stores',
    icon: Store,
    url: '/user/stores',
  },
];
