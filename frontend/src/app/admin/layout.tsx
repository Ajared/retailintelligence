'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AdminHeader } from './_components/header';
import { AppSidebar, navigationItems } from './_components/sidebar';
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const getTitle = () => {
    const currentItem = navigationItems.find((item) =>
      item.url === '/admin'
        ? pathname === item.url
        : pathname.startsWith(item.url),
    );
    return currentItem?.title || 'Dashboard';
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="!m-0 !rounded-none md:!m-0 md:!rounded-none">
        <main className="h-full flex flex-col border-l border-l-border">
          <AdminHeader title={getTitle()} />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
