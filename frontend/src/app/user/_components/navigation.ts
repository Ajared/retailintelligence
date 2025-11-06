import { Map } from 'lucide-react';

export const navigationItems = [
  {
    title: 'Locations',
    icon: Map,
    url: '/user/locations' as const,
  },
] as const;
