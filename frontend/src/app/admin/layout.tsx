'use client';

import type React from 'react';

import { AppSidebar } from './_components/sidebar';
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="!m-0 !rounded-none md:!m-0 md:!rounded-none">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
