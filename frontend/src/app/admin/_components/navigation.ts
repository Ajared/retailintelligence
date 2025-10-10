import { Users, Store } from 'lucide-react';

export const navigationItems = [
  {
    title: 'Users',
    icon: Users,
    url: '/admin/users' as const,
  },
  {
    title: 'Stores',
    icon: Store,
    url: '/admin/stores' as const,
  },
] as const;
