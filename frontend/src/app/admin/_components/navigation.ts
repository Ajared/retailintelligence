import { Home, Users, Store, MapPin } from 'lucide-react';

export const navigationItems = [
  {
    title: 'Home',
    icon: Home,
    url: '/admin',
  },
  {
    title: 'Map',
    icon: MapPin,
    url: '/admin/map',
  },
  {
    title: 'Users',
    icon: Users,
    url: '/admin/users',
  },
  {
    title: 'Stores',
    icon: Store,
    url: '/admin/stores',
  },
];
