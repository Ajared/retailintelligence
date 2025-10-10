import { Store } from 'lucide-react';

export const navigationItems = [
  {
    title: 'Stores',
    icon: Store,
    url: '/user/stores' as const,
  },
] as const;
