'use client';

import { usePathname } from 'next/navigation';
import { navigationItems } from './navigation';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { ThemeToggle } from '~/components/ui/theme-toggle';

export function UserHeader() {
  const pathname = usePathname();

  let title: string;
  if (pathname.startsWith('/user/stores/add')) {
    title = 'Add Store';
  }else if(pathname.startsWith('/user/stores/edit')){
    title = "Edit Store"
  } else {
    const matched = navigationItems.find((item) =>
      pathname.startsWith(item.url),
    );
    title = matched?.title ?? 'Dashboard';
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-10 bg-background">
      <SidebarTrigger
        aria-label="Toggle sidebar"
        className="-ml-1 size-10 p-2 cursor-pointer rounded-md transition-colors hover:!bg-transparent"
      />
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold">{title}</h1>
        <ThemeToggle />
      </div>
    </header>
  );
}
