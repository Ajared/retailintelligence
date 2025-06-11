'use client';

import { StoreInterface } from '~/types/store';
import { StateInterface } from '~/types/state';
import { PaginationMeta } from '~/types/actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { createContext, useContext, useCallback, useState } from 'react';

interface StoresContextType {
  stores: StoreInterface[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterSearch: {
    states: string;
    lgs: string;
  };
  setFilterSearch: (s: { states: string; lgs: string }) => void;
  searchMode: {
    states: boolean;
    lgs: boolean;
  };
  setSearchMode: (m: { states: boolean; lgs: boolean }) => void;
  filterOptions: {
    states: Record<string, boolean>;
    localGovernments: Record<string, boolean>;
  };
  toggleStateFilter: (stateId: string) => void;
  toggleLocalGovernmentFilter: (lgId: string) => void;
  isSearchActive: boolean;
  toggleSearchMode: () => void;
  pagination: PaginationMeta;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  states: StateInterface[];
}

const StoresContext = createContext<StoresContextType | undefined>(undefined);

export function StoresProvider({
  children,
  initialStores,
  currentStateId,
  currentLocalGovernmentId,
  metadata,
  states: initialStates,
}: {
  children: React.ReactNode;
  initialStores: StoreInterface[];
  currentStateId?: string;
  currentLocalGovernmentId?: string;
  metadata: PaginationMeta;
  states: StateInterface[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [filterSearch, setFilterSearch] = useState({
    states: '',
    lgs: '',
  });
  const [searchMode, setSearchMode] = useState({
    states: false,
    lgs: false,
  });

  const updateSearchParams = useCallback(
    (updates: Record<string, string | number | boolean | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value.toString());
        }
      });

      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const filterOptions = {
    states: {
      [currentStateId || '']: !!currentStateId,
    },
    localGovernments: {
      [currentLocalGovernmentId || '']: !!currentLocalGovernmentId,
    },
  };

  const toggleSearchMode = () => setIsSearchActive((prev) => !prev);

  const toggleStateFilter = useCallback(
    (stateId: string) => {
      const newStateId = filterOptions.states[stateId] ? null : stateId;
      updateSearchParams({
        stateId: newStateId,
        localGovernmentId: null,
      });
    },
    [filterOptions.states, updateSearchParams],
  );

  const toggleLocalGovernmentFilter = useCallback(
    (lgId: string) => {
      const newLgId = filterOptions.localGovernments[lgId] ? null : lgId;
      updateSearchParams({ localGovernmentId: newLgId });
    },
    [filterOptions.localGovernments, updateSearchParams],
  );

  const setPage = useCallback(
    (page: number) => {
      updateSearchParams({ page });
    },
    [updateSearchParams],
  );

  const setLimit = useCallback(
    (limit: number) => {
      updateSearchParams({ limit, page: 1 });
    },
    [updateSearchParams],
  );

  const value: StoresContextType = {
    stores: initialStores,
    searchTerm,
    setSearchTerm,
    filterSearch,
    setFilterSearch,
    searchMode,
    setSearchMode,
    filterOptions,
    toggleStateFilter,
    toggleLocalGovernmentFilter,
    isSearchActive,
    toggleSearchMode,
    pagination: metadata,
    setPage,
    setLimit,
    states: initialStates,
  };

  return (
    <StoresContext.Provider value={value}>{children}</StoresContext.Provider>
  );
}

export function useStores() {
  const context = useContext(StoresContext);
  if (context === undefined) {
    throw new Error('useStores must be used within a StoresProvider');
  }
  return context;
}
