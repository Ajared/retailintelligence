'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Session } from 'next-auth';
import { Store } from 'lucide-react';
import { StoreInterface } from '~/types/store';
import { Button } from '~/components/ui/button';

const Map = dynamic(() => import('~/components/map'), {
  ssr: false,
});

export default function Content({
  stores,
  session,
}: {
  stores: StoreInterface[];
  session: Session;
}) {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Interactive Map</h1>
        <Button asChild className="cursor-pointer">
          <Link href="/admin/stores">
            <Store className="h-4 w-4" />
            View Stores
          </Link>
        </Button>
      </div>
      <div style={{ aspectRatio: '16/9' }}>
        <Map stores={stores} session={session} />
      </div>
    </div>
  );
}
