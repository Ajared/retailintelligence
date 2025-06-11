import Link from 'next/link';
import Image from 'next/image';
import { Button } from '~/components/ui/button';
import { PackagePlus, Store } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="flex items-center justify-center w-full flex-col gap-4 h-full p-4">
      <div className="relative w-60 sm:w-80 md:w-[350px] aspect-square">
        <Image
          src="/empty-box.png"
          alt="Empty state illustration showing no data available"
          fill
          sizes="(max-width: 640px) 240px, (max-width: 768px) 320px, 350px"
          className="object-contain"
        />
      </div>
      <div className="flex flex-col gap-5 items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold">Not enough data to display</h3>
          <p className="text-sm text-muted-foreground text-center">
            Add stores to view application metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="cursor-pointer">
            <Link href="/user/stores">
              <Store className="h-4 w-4" />
              View Stores
            </Link>
          </Button>
          <Button variant="outline" asChild className="cursor-pointer">
            <Link href="/user/stores/add">
              <PackagePlus className="h-4 w-4" />
              Add Stores
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
