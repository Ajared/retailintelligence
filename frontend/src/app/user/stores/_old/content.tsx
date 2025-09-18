'use client';

import { useMemo, useState, useTransition } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import {
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  PackagePlus,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '~/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useIsMobile } from '~/hooks/use-mobile';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { StoreInterface } from '~/types/store';
import { StateInterface } from '~/types/state';
import { PaginationMeta } from '~/types/actions';

export default function Content({
  stores,
  pagination,
  states,
}: {
  stores: StoreInterface[];
  pagination: PaginationMeta;
  states: StateInterface[];
}) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [filterSearch, setFilterSearch] = useState({
    states: '',
    lgs: '',
  });
  const [searchMode, setSearchMode] = useState({
    states: false,
    lgs: false,
  });
  const selectedStateId = searchParams.get('stateId') || undefined;
  const selectedLocalGovernmentId =
    searchParams.get('localGovernmentId') || undefined;
  const initialName = searchParams.get('name') || '';
  const [searchTerm, setSearchTerm] = useState(initialName);

  const updateSearch = (
    updates: Record<string, string | number | boolean | null>,
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value.toString());
    });
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  const toggleSearchMode = () => setIsSearchActive((prev) => !prev);

  const toggleStateFilter = (stateId: string) => {
    const newStateId = selectedStateId === stateId ? null : stateId;
    updateSearch({ stateId: newStateId, localGovernmentId: null, page: 1 });
  };

  const toggleLocalGovernmentFilter = (lgId: string) => {
    const newLgId = selectedLocalGovernmentId === lgId ? null : lgId;
    updateSearch({ localGovernmentId: newLgId, page: 1 });
  };

  const currentStateLGs = useMemo(() => {
    if (!selectedStateId) return [];
    const state = states.find((s) => s.id === selectedStateId);
    return state?.local_governments || [];
  }, [selectedStateId, states]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const filteredStates = useMemo(() => {
    if (!filterSearch.states) return states;
    return states.filter((state) =>
      state.name.toLowerCase().includes(filterSearch.states.toLowerCase()),
    );
  }, [states, filterSearch.states]);

  const filteredLGs = useMemo(() => {
    if (!filterSearch.lgs) return currentStateLGs;
    return currentStateLGs.filter((lg) =>
      lg.name.toLowerCase().includes(filterSearch.lgs.toLowerCase()),
    );
  }, [currentStateLGs, filterSearch.lgs]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        {isSearchActive ? (
          <div className="flex items-center flex-1">
            <Search className="h-5 w-5 mr-2 text-muted-foreground" />
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="border-0 border-b border-input rounded-none shadow-none focus-visible:ring-0 pl-0 pr-8 text-base bg-transparent focus:bg-transparent dark:bg-transparent dark:focus:bg-transparent"
                autoFocus
              />
              {isPending && (
                <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearchMode}
              className="ml-2"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Clear search</span>
            </Button>
          </div>
        ) : (
          <div className="flex w-full items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              Store Management
            </h1>
            {!isMobile && (
              <div className="relative w-80 mx-4 hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 pr-8"
                />
                {isPending && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center space-x-2">
          {isMobile && !isSearchActive && (
            <Button variant="ghost" size="icon" onClick={toggleSearchMode}>
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Filter className="h-5 w-5" />
                <span className="sr-only">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="font-medium" disabled>
                Filter Stores
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="font-medium flex items-center justify-between">
                {searchMode.states ? (
                  <Input
                    autoFocus
                    value={filterSearch.states}
                    onChange={(e) =>
                      setFilterSearch({
                        ...filterSearch,
                        states: e.target.value,
                      })
                    }
                    placeholder="Search states..."
                    className="h-7 text-xs px-2 py-1"
                  />
                ) : (
                  <>
                    <span>States</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-5 w-5 p-0"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchMode({ ...searchMode, states: true });
                      }}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </DropdownMenuItem>
              {filteredStates.slice(0, 4).map((state) => (
                <DropdownMenuCheckboxItem
                  key={state.id}
                  checked={!!state.id && selectedStateId === state.id}
                  onCheckedChange={() =>
                    state.id && toggleStateFilter(state.id)
                  }
                >
                  {state.name}
                </DropdownMenuCheckboxItem>
              ))}

              <DropdownMenuSeparator />

              <DropdownMenuItem className="font-medium flex items-center justify-between">
                {searchMode.lgs ? (
                  <Input
                    autoFocus
                    value={filterSearch.lgs}
                    onChange={(e) =>
                      setFilterSearch({ ...filterSearch, lgs: e.target.value })
                    }
                    placeholder="Search LGAs..."
                    className="h-7 text-xs px-2 py-1"
                  />
                ) : (
                  <>
                    <span>Local Governments</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2 h-5 w-5 p-0"
                      tabIndex={-1}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchMode({ ...searchMode, lgs: true });
                      }}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </DropdownMenuItem>
              {filteredLGs.slice(0, 4).map((lg) => (
                <DropdownMenuCheckboxItem
                  key={lg.id}
                  checked={!!lg.id && selectedLocalGovernmentId === lg.id}
                  onCheckedChange={() =>
                    lg.id && toggleLocalGovernmentFilter(lg.id)
                  }
                >
                  {lg.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            asChild
            variant="default"
            size="sm"
            className="gap-2 cursor-pointer"
          >
            <Link href="/user/stores/add">
              <PackagePlus className="h-4 w-4" />
              <span className="hidden md:block">Add Store</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border w-full">
        <div className="w-full">
          <div className="hidden md:grid grid-cols-[1.25fr_1fr_1fr_1fr_0.5fr_0.5fr] gap-4 p-4 border-b bg-muted/50 font-medium text-sm w-full overflow-x-auto">
            <div>Name</div>
            <div>Type</div>
            <div>Address</div>
            <div>Landmarks</div>
            <div>Enumerator</div>
            <div className="text-right">Actions</div>
          </div>
          <div className="md:hidden grid grid-cols-[1.5fr_1.25fr_0.5fr] gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
            <div>Name</div>
            <div>Address</div>
            <div className="text-right">Actions</div>
          </div>

          {stores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {stores.length === 0
                ? 'No stores found.'
                : 'No stores found matching your criteria.'}
            </div>
          ) : (
            stores.map((store) => (
              <div
                key={store.id}
                className="hidden md:grid grid-cols-[1.25fr_1fr_1fr_1fr_0.5fr_0.5fr] gap-4 p-4 border-b items-center w-full overflow-x-auto"
              >
                <div className="font-medium truncate" title={store.name}>
                  {store.name}
                </div>
                <div className="truncate">{store.store_type}</div>
                <div className="min-w-0">
                  <div className="font-medium truncate" title={store.address}>
                    {store.address}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{`${store?.state?.name}, ${store?.local_government?.name}`}</div>
                </div>
                <div className="truncate">{store.landmarks}</div>
                <div className="truncate">{store.enumerator?.email}</div>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 cursor-pointer"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-xs cursor-pointer"
                        asChild
                      >
                        <Link href={`/user/stores/${store.id}`}>View More</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}

          {stores.length > 0 &&
            stores.map((store) => (
              <div
                key={store.id + '-mobile'}
                className="md:hidden grid grid-cols-[1.5fr_1.25fr_0.5fr] gap-4 p-4 border-b bg-muted/50 font-medium text-sm"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate" title={store.name}>
                    {store.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {store.store_type}
                  </div>
                </div>
                <div className="min-w-0">
                  <div
                    className="font-medium capitalize truncate"
                    title={store.address}
                  >
                    {store.address}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{`${store?.state?.name}, ${store?.local_government?.name}`}</div>
                </div>
                <div className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 cursor-pointer"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-xs cursor-pointer"
                        asChild
                      >
                        <Link href={`/user/stores/${store.id}`}>View More</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 items-center justify-center md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 justify-between items-center w-full md:w-auto">
          <p className="text-sm text-muted-foreground">
            {pagination.total === 0 || stores.length === 0 ? (
              <>No results found</>
            ) : (
              <>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                of {pagination.total} results
              </>
            )}
          </p>
          {pagination.total !== 0 && stores.length !== 0 && (
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) =>
                updateSearch({ limit: Number(value), page: 1 })
              }
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSearch({ page: pagination.page - 1 })}
              disabled={!pagination.has_previous}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous page</span>
            </Button>
            <div className="text-sm text-muted-foreground whitespace-nowrap">
              Page {pagination.page} of {pagination.total_pages ?? 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSearch({ page: pagination.page + 1 })}
              disabled={!pagination.has_next}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
