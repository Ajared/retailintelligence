'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Session } from 'next-auth';
import { Store } from 'lucide-react';
import { LatLngExpression } from 'leaflet';
import { getAdminMapData } from './actions';
import { StoreInterface } from '~/types/store';
import { Button } from '~/components/ui/button';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';

const Map = dynamic(() => import('~/components/map'), {
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
  const lastFetchedBoundsRef = useRef<BoundsQuery | null>(null);
  const lastFetchedStoresRef = useRef<StoreInterface[] | null>(null);
  const isPendingRef = useRef<boolean>(false);
  const MAX_CACHE_ENTRIES = 20;
  const cacheRef = useRef<Map<string, StoreInterface[]>>(
    new globalThis.Map<string, StoreInterface[]>(),
  );

  useEffect(() => {
    isPendingRef.current = isPending;
  }, [isPending]);

  const normalizeBounds = useCallback((b: BoundsQuery): BoundsQuery => {
    const round = (n: number) => Math.round(n * 10000) / 10000;
    return {
      minLat: round(b.minLat),
      maxLat: round(b.maxLat),
      minLng: round(b.minLng),
      maxLng: round(b.maxLng),
    };
  }, []);

  const boundsKey = useCallback(
    (b: BoundsQuery) => {
      const n = normalizeBounds(b);
      return `${n.minLat}:${n.maxLat}:${n.minLng}:${n.maxLng}`;
    },
    [normalizeBounds],
  );

  const isSubsetBounds = useCallback(
    (inner: BoundsQuery, outer: BoundsQuery) => {
      return (
        inner.minLat >= outer.minLat &&
        inner.maxLat <= outer.maxLat &&
        inner.minLng >= outer.minLng &&
        inner.maxLng <= outer.maxLng
      );
    },
    [],
  );

  const filterStoresByBounds = useCallback(
    (data: StoreInterface[], b: BoundsQuery): StoreInterface[] => {
      return data.filter(
        (s) =>
          s.latitude >= b.minLat &&
          s.latitude <= b.maxLat &&
          s.longitude >= b.minLng &&
          s.longitude <= b.maxLng,
      );
    },
    [],
  );

  const setCache = useCallback((key: string, data: StoreInterface[]) => {
    if (!(cacheRef.current instanceof globalThis.Map)) {
      cacheRef.current = new globalThis.Map<string, StoreInterface[]>();
    }
    const cache = cacheRef.current as Map<string, StoreInterface[]>;
    if (cache.has(key)) cache.delete(key);
    cache.set(key, data);
    if (cache.size > MAX_CACHE_ENTRIES) {
      const firstKey = cache.keys().next().value as string | undefined;
      if (firstKey !== undefined) cache.delete(firstKey);
    }
  }, []);

  const handleBoundsChange = useCallback(
    (bounds: BoundsQuery) => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }

      const delay = isPendingRef.current ? 800 : 500;
      debounceTimerRef.current = window.setTimeout(() => {
        latestRequestIdRef.current += 1;
        const requestId = latestRequestIdRef.current;
        setError(null);

        const key = boundsKey(bounds);

        if (lastFetchedBoundsRef.current && lastFetchedStoresRef.current) {
          if (isSubsetBounds(bounds, lastFetchedBoundsRef.current)) {
            const filtered = filterStoresByBounds(
              lastFetchedStoresRef.current,
              bounds,
            );
            setStores(filtered);
            return;
          }
        }

        if (!(cacheRef.current instanceof globalThis.Map)) {
          cacheRef.current = new globalThis.Map<string, StoreInterface[]>();
        }
        const cached = cacheRef.current.get(key);
        if (cached) {
          setStores(cached);
          return;
        }

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
              lastFetchedBoundsRef.current = { ...bounds };
              lastFetchedStoresRef.current = response.data;
              setCache(key, response.data);
            })
            .catch((err: unknown) => {
              if (requestId !== latestRequestIdRef.current) return;
              setError(
                err instanceof Error ? err.message : 'Failed to load data',
              );
              setStores([]);
            });
        });
      }, delay);
    },
    [boundsKey, filterStoresByBounds, isSubsetBounds, setCache],
  );

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
          disabled={isPending}
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
