import { cache } from 'react';
import type { ReactNode } from 'react';
import { auth } from '~/app/(auth)/auth';
import { UserHeader } from './_components/header';
import { AppSidebar } from './_components/sidebar';
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar';

const getSession = cache(() => auth());

export default async function UserLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();

  return (
    <SidebarProvider>
      <AppSidebar session={session} />
      <SidebarInset className="!m-0 !rounded-none md:!m-0 md:!rounded-none">
        <main className="h-full flex flex-col border-l border-l-border">
          <UserHeader />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
