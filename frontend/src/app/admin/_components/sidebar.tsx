'use client';

import Link from 'next/link';
import type { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { logoutAction } from '~/app/(auth)/actions';
import { ChevronsUpDown, Key, Loader2, Undo } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useProgress } from '@bprogress/next';
import { navigationItems } from './navigation';
import { useActionState, useEffect } from 'react';

export function AppSidebar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const { start, stop } = useProgress();
  const [, action, isPending] = useActionState(logoutAction, null);

  useEffect(() => {
    if (isPending) {
      start();
    } else {
      stop();
    }
  }, [isPending, start, stop]);

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="p-0 hover:bg-transparent bg-transparent data-[state=active]:bg-transparent data-[state=open]:bg-transparent focus:bg-transparent focus-visible:bg-transparent active:bg-transparent"
              size="lg"
              asChild
            >
              <Link href="/" className="flex items-center gap-2">
                <span className="truncate font-semibold text-foreground">
                  Retailytics
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.url)}
                    className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground"
                  >
                    <Link
                      href={item.url as string}
                      className="flex items-center gap-2"
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {session?.user && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground focus:outline-none focus-visible:ring-0 focus-visible:bg-sidebar-accent"
                  >
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {session.user.email}
                      </span>
                      <span className="truncate text-xs text-muted-foreground capitalize">
                        {session.user.role || 'User'}
                      </span>
                    </div>
                    <ChevronsUpDown className="ml-auto size-4" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="rounded-lg mb-1"
                  side="bottom"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuItem className="cursor-pointer">
                    <Link
                      href="/forgot-password"
                      className="flex items-center gap-2"
                    >
                      <Key className="size-4" />
                      Change Password
                    </Link>
                  </DropdownMenuItem>
                  <form action={action}>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2"
                      >
                        {isPending ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Undo className="size-4" />
                        )}
                        {isPending ? 'Processing' : 'Sign Out'}
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
