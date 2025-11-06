import { Users, Map } from 'lucide-react';

export const navigationItems = [
  {
    title: 'Users',
    icon: Users,
    url: '/admin/users' as const,
  },
  {
    title: 'Locations',
    icon: Map,
    url: '/admin/locations' as const,
  },
] as const;
