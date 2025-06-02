import Image from 'next/image';
import { Store, Users } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { ThemeToggle } from '~/components/ui/theme-toggle';

export default function AdminPage() {
  return (
    <main className="h-full flex flex-col border-l border-l-border">
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1 size-10 p-2 cursor-pointer rounded-md transition-colors hover:!bg-transparent" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex flex-1 items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <div className="flex items-center justify-center w-full flex-col gap-4 h-full">
        <Image src="/empty-box.png" alt="empty-box" width={350} height={350} />
        <div className="flex flex-col gap-2 items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold">
              Not enough data to display
            </h3>
            <p className="text-sm text-muted-foreground">
              Enumerate stores and add users to view application metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="cursor-pointer">
              <Store className="h-4 w-4" />
              View Stores
            </Button>
            <Button variant="outline" className="cursor-pointer">
              <Users className="h-4 w-4" />
              Invite Users
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
