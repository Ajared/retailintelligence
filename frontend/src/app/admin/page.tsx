import Image from 'next/image';
import { Store, Users } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function AdminPage() {
  return (
    <div className="flex items-center justify-center w-full flex-col gap-4 h-full p-4">
      <Image
        src="/empty-box.png"
        alt="empty-box"
        width={350}
        height={350}
        priority
        className="w-60 sm:w-80 md:w-[350px] h-auto"
        style={{ height: 'auto' }}
      />
      <div className="flex flex-col gap-5 items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold">Not enough data to display</h3>
          <p className="text-sm text-muted-foreground text-center">
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
  );
}
