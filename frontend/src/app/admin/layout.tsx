import Loader from '~/components/loader';
import { auth } from '~/app/(auth)/auth';
import { AdminHeader } from './_components/header';
import { AppSidebar } from './_components/sidebar';
import { cache, Suspense, type ReactNode } from 'react';
import { SidebarProvider, SidebarInset } from '~/components/ui/sidebar';

const getSession = cache(() => auth());
export default async function AdminLayout({
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
          <AdminHeader />
          <Suspense fallback={<Loader />}>{children}</Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
