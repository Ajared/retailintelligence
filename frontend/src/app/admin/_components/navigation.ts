import { Users, Map, BarChart } from 'lucide-react';

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
  {
    title: 'Analytics',
    icon: BarChart,
    url: 'https://retailint.ajared.ng' as const,
  },
] as const;
