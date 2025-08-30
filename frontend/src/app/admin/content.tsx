'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Session } from 'next-auth';
import { Store } from 'lucide-react';
import { LatLngExpression } from 'leaflet';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { StoreInterface } from '~/types/store';
import { Button } from '~/components/ui/button';
import { getAdminMapData } from './actions';

const Map = dynamic(() => import('./_components/map'), {
  ssr: false,
});

type BoundsQuery = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export default function Content({
  session,
  center,
  zoom,
}: {
  session: Session;
  center?: LatLngExpression;
  zoom?: number;
}) {
  const [stores, setStores] = useState<StoreInterface[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const debounceTimerRef = useRef<number | null>(null);
  const latestRequestIdRef = useRef(0);

  const handleBoundsChange = useCallback((bounds: BoundsQuery) => {
    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      latestRequestIdRef.current += 1;
      const requestId = latestRequestIdRef.current;
      setError(null);

      startTransition(() => {
        getAdminMapData(
          1,
          300,
          'ASC',
          bounds.minLat,
          bounds.maxLat,
          bounds.minLng,
          bounds.maxLng,
        )
          .then((response) => {
            if (requestId !== latestRequestIdRef.current) return;
            if ('error' in response) {
              setError(response.message ?? 'Failed to load data');
              setStores([]);
              return;
            }
            setStores(response.data);
          })
          .catch((err: unknown) => {
            if (requestId !== latestRequestIdRef.current) return;
            setError(
              err instanceof Error ? err.message : 'Failed to load data',
            );
            setStores([]);
          });
      });
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

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
      <div style={{ aspectRatio: '16/9' }} className="relative">
        <Map
          stores={stores}
          session={session}
          center={center}
          zoom={zoom}
          onBoundsChange={handleBoundsChange}
        />
        {isPending ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-background/40">
            <div className="rounded-md bg-background px-3 py-1 text-sm shadow">
              Loading map data...
            </div>
          </div>
        ) : null}
      </div>
      {error ? (
        <div className="text-sm text-red-600" role="status" aria-live="polite">
          {error}
        </div>
      ) : null}
    </div>
  );
}
