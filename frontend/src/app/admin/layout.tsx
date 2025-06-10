import type { ReactNode } from 'react';
import { auth } from '~/app/(auth)/auth';
import { AdminHeader } from './_components/header';
import { AppSidebar } from './_components/sidebar';
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar';

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();

  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <SidebarInset className="!m-0 !rounded-none md:!m-0 md:!rounded-none">
        <main className="h-full flex flex-col border-l border-l-border">
          <AdminHeader />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
