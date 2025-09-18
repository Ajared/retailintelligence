'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Session } from 'next-auth';
import { LatLngExpression } from 'leaflet';
import { Store as StoreIcon, Search, Loader2 } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from 'react';
import { getAdminMapData, getAllStores } from '../actions';
import { StoreInterface } from '~/types/store';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';
import StoreDetailsDialog from '~/components/store-dialog';

const InteractiveMap = dynamic(() => import('~/components/map'), {
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
  initialName,
}: {
  session: Session;
  center?: LatLngExpression;
  zoom?: number;
  initialName?: string;
}) {
  const [stores, setStores] = useState<StoreInterface[]>([]);
  const [allStores, setAllStores] = useState<StoreInterface[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isPendingRef = useRef(isPending);
  const [isPendingAllStores, startTransitionAllStores] = useTransition();
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<StoreInterface | null>(
    null,
  );
  const [focus, setFocus] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
  }>();
  const [name, setName] = useState<string>(initialName ?? '');

  const debounceTimerRef = useRef<number | null>(null);
  const searchDebounceRef = useRef<number | null>(null);
  const latestRequestIdRef = useRef(0);
  const lastFetchedBoundsRef = useRef<BoundsQuery | null>(null);
  const lastFetchedStoresRef = useRef<StoreInterface[] | null>(null);
  const allStoresQueryKeyRef = useRef<string>('');
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const [allStoresPage, setAllStoresPage] = useState<number>(0);
  const [allStoresHasNext, setAllStoresHasNext] = useState<boolean>(true);
  const MAX_CACHE_ENTRIES = 20;
  const cacheRef = useRef<Map<string, StoreInterface[]>>(
    new Map<string, StoreInterface[]>(),
  );

  useEffect(() => {
    isPendingRef.current = isPending;
  }, [isPending]);

  const normalizeBounds = useCallback((b: BoundsQuery): BoundsQuery => {
    const round = (n: number) => Math.round(n * 10000) / 10000;
    const rMinLat = round(b.minLat);
    const rMaxLat = round(b.maxLat);
    const rMinLng = round(b.minLng);
    const rMaxLng = round(b.maxLng);

    return {
      minLat: Math.min(rMinLat, rMaxLat),
      maxLat: Math.max(rMinLat, rMaxLat),
      minLng: rMinLng,
      maxLng: rMaxLng,
    };
  }, []);

  const sanitizedName = useMemo(() => name.trim().toLowerCase(), [name]);

  const boundsKey = useCallback(
    (b: BoundsQuery, n: string) => {
      const norm = normalizeBounds(b);
      return `${norm.minLat}:${norm.maxLat}:${norm.minLng}:${norm.maxLng}:name=${n}`;
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
    if (!(cacheRef.current instanceof Map)) {
      cacheRef.current = new Map<string, StoreInterface[]>();
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

        const key = boundsKey(bounds, sanitizedName);

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

        if (!(cacheRef.current instanceof Map)) {
          cacheRef.current = new Map<string, StoreInterface[]>();
        }
        const cached = cacheRef.current.get(key);
        if (cached) {
          setStores(cached);

          lastFetchedBoundsRef.current = { ...bounds };
          lastFetchedStoresRef.current = cached;

          setCache(key, cached);

          return;
        }

        startTransition(() => {
          getAdminMapData(bounds, {
            page: 1,
            limit: 300,
            sort: 'ASC',
            name: sanitizedName,
          })
            .then((response) => {
              if (requestId !== latestRequestIdRef.current) return;
              if ('error' in response) {
                setError(response.message ?? 'Failed to load data');
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
            });
        });
      }, delay);
    },
    [boundsKey, filterStoresByBounds, isSubsetBounds, setCache, sanitizedName],
  );

  const loadAllStoresPage = useCallback(
    (params: { page: number; name?: string; append: boolean; key: string }) => {
      const { page, name, append, key } = params;
      startTransitionAllStores(() => {
        const trimmed = name?.trim();
        const nameParam = trimmed && trimmed.length > 0 ? trimmed : undefined;
        getAllStores(
          page,
          50,
          'ASC',
          undefined,
          undefined,
          undefined,
          nameParam,
        )
          .then((response) => {
            if (allStoresQueryKeyRef.current !== key) return;
            if ('error' in response) {
              setError(response.message ?? 'Failed to load data');
              return;
            }
            const hasNext = Boolean(response.meta?.has_next);
            const incoming = response.data;
            setAllStores((prev) => {
              if (!append) return incoming;
              const existingIds = new Set(prev.map((s) => s.id));
              const deduped = incoming.filter((s) => !existingIds.has(s.id));
              return prev.concat(deduped);
            });
            setAllStoresPage(page);
            setAllStoresHasNext(hasNext);
          })
          .catch((err: unknown) => {
            if (allStoresQueryKeyRef.current !== key) return;
            setError(
              err instanceof Error ? err.message : 'Failed to load data',
            );
          });
      });
    },
    [],
  );

  const resetAndLoadAllStores = useCallback(
    (queryName?: string) => {
      const key = `${queryName ?? ''}:${Date.now()}`;
      allStoresQueryKeyRef.current = key;
      setAllStores([]);
      setAllStoresPage(0);
      setAllStoresHasNext(true);
      loadAllStoresPage({ page: 1, name: queryName, append: false, key });
    },
    [loadAllStoresPage],
  );

  const loadNextAllStoresPage = useCallback(() => {
    if (!allStoresHasNext || isPendingAllStores) return;
    const key = allStoresQueryKeyRef.current;
    loadAllStoresPage({ page: allStoresPage + 1, name, append: true, key });
  }, [
    allStoresHasNext,
    isPendingAllStores,
    allStoresPage,
    loadAllStoresPage,
    name,
  ]);

  useEffect(() => {
    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current);
    }
    searchDebounceRef.current = window.setTimeout(() => {
      if (lastFetchedBoundsRef.current) {
        handleBoundsChange(lastFetchedBoundsRef.current);
      }
      resetAndLoadAllStores(name);
    }, 400);
    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, [name, handleBoundsChange, resetAndLoadAllStores]);

  useEffect(() => {
    if (!sentinelRef.current || !listContainerRef.current) return;
    const root = listContainerRef.current;
    const sentinel = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          loadNextAllStoresPage();
        }
      },
      { root, rootMargin: '200px', threshold: 0 },
    );
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
    };
  }, [loadNextAllStoresPage, allStoresHasNext]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex w-full items-center justify-between gap-2">
        <h1 className="text-2xl font-bold tracking-tight">Admin Map</h1>
        <Button asChild className="cursor-pointer">
          <Link href="/admin/stores">
            <StoreIcon className="h-4 w-4" />
            View Stores
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="relative lg:col-span-9" style={{ aspectRatio: '16/9' }}>
          <InteractiveMap
            stores={stores}
            session={session}
            center={center}
            zoom={zoom}
            onBoundsChangeAction={handleBoundsChange}
            focus={focus}
            onFocusComplete={() => setFocus(undefined)}
          />
          {isPending && (
            <>
              <div
                className="pointer-events-none absolute top-0 right-0 z-[1000]"
                style={{
                  width: '140px',
                  height: '140px',
                  background:
                    'radial-gradient(circle at 100% 0%, rgba(0,0,0,0.14), rgba(0,0,0,0) 70%)',
                }}
                aria-hidden="true"
              />
              <div className="absolute top-4 right-4 z-[1001]">
                <Loader2
                  className="h-6 w-6 animate-spin text-black"
                  aria-label="Loading"
                />
              </div>
            </>
          )}
        </div>
        <div className="lg:col-span-3">
          <div className="rounded-lg border bg-background">
            <div className="flex items-center gap-2 p-3 border-b">
              <div className="relative w-full">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Search by name"
                  className="pl-8"
                />
              </div>
            </div>
            <div
              className="max-h-[420px] overflow-auto p-2"
              ref={listContainerRef}
            >
              {allStores.length === 0 && !isPendingAllStores ? (
                <div className="p-3 text-sm text-muted-foreground">
                  No stores found.
                </div>
              ) : (
                <div className="space-y-1">
                  {allStores.map((store) => (
                    <ContextMenu key={store.id}>
                      <ContextMenuTrigger
                        onClick={(e) => {
                          e.preventDefault();
                          setFocus({
                            lat: store.latitude,
                            lng: store.longitude,
                            zoom: 18,
                          });
                        }}
                        className="block rounded-md border p-2 hover:bg-muted cursor-pointer"
                      >
                        <div className="font-medium truncate">{store.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {store.store_type}, {store.address}
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent>
                        <ContextMenuItem
                          onClick={() => {
                            setFocus({
                              lat: store.latitude,
                              lng: store.longitude,
                              zoom: 18,
                            });
                          }}
                        >
                          View on Map
                        </ContextMenuItem>
                        <ContextMenuItem
                          onClick={() => {
                            setSelectedStore(store);
                            setIsDetailsOpen(true);
                          }}
                        >
                          View Store Details
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  ))}
                  <div ref={sentinelRef} />
                  {isPendingAllStores && (
                    <div className="flex items-center justify-center py-2">
                      <Loader2
                        className="h-4 w-4 animate-spin text-muted-foreground"
                        aria-label="Loading more"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {error ? (
            <div
              className="mt-2 text-sm text-red-600"
              role="status"
              aria-live="polite"
            >
              {error}
            </div>
          ) : null}
        </div>
      </div>
      <StoreDetailsDialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setSelectedStore(null);
        }}
        store={selectedStore}
      />
    </div>
  );
}
