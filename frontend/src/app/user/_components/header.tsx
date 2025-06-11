'use client';

import { usePathname } from 'next/navigation';
import { navigationItems } from './navigation';
import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { ThemeToggle } from '~/components/ui/theme-toggle';

export function UserHeader() {
  const pathname = usePathname();
  const title =
    navigationItems.find((item) => item.url === pathname)?.title || 'Dashboard';
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background">
      <SidebarTrigger className="-ml-1 size-10 p-2 cursor-pointer rounded-md transition-colors hover:!bg-transparent" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
