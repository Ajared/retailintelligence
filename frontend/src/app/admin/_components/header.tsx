import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { ThemeToggle } from '~/components/ui/theme-toggle';

export function AdminHeader({ title }: { title: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1 size-10 p-2 cursor-pointer rounded-md transition-colors hover:!bg-transparent" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex flex-1 items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
