'use client';

import Link from 'next/link';
import type { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { ChevronsUpDown, Key, Undo } from 'lucide-react';
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
import { navigationItems } from './navigation';

export function AppSidebar({ session }: { session: Session | null }) {
  const pathname = usePathname();

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
                  Retail
                  <br />
                  Intelligence
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
                    isActive={
                      item.url === '/admin'
                        ? pathname === item.url
                        : pathname.startsWith(item.url)
                    }
                    className="data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground"
                  >
                    <Link href={item.url} className="flex items-center gap-2">
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
                    <Key className="mr-2 size-4" />
                    Change Password
                  </DropdownMenuItem>
                  <form>
                    <DropdownMenuItem className="cursor-pointer">
                      <Undo className="mr-2 size-4" />
                      Sign Out
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
