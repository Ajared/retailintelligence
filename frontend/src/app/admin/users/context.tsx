'use client';

import { toast } from 'sonner';
import { UserRole } from '~/types/user';
import { UserInterface } from '~/types/user';
import { PaginationMeta } from '~/types/actions';
import { deactivateUser, reactivateUser } from '../actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { createContext, useContext, useCallback, useState } from 'react';

interface UsersContextType {
  users: UserInterface[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterOptions: {
    roles: Record<UserRole, boolean>;
    status: {
      active: boolean;
      inactive: boolean;
    };
  };
  toggleRoleFilter: (role: UserRole) => void;
  toggleStatusFilter: (status: 'active' | 'inactive') => void;
  handleStatusChange: (
    user: UserInterface,
    action: 'activate' | 'deactivate',
  ) => void;
  isSearchActive: boolean;
  toggleSearchMode: () => void;
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  selectedUser: UserInterface | null;
  actionType: 'activate' | 'deactivate' | null;
  confirmStatusChange: () => void;
  isPending: boolean;
  pagination: PaginationMeta;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({
  children,
  initialUsers,
  currentRole,
  currentStatus,
  metadata,
}: {
  children: React.ReactNode;
  initialUsers: UserInterface[];
  currentRole?: string;
  currentStatus?: string;
  metadata: PaginationMeta;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTermState] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showDialog, setShowDialogState] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null);
  const [actionType, setActionType] = useState<
    'activate' | 'deactivate' | null
  >(null);
  const [isPending, setIsPending] = useState(false);

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
    roles: {
      [UserRole.SUPER_ADMIN]: currentRole === UserRole.SUPER_ADMIN,
      [UserRole.ADMIN]: currentRole === UserRole.ADMIN,
      [UserRole.USER]: currentRole === UserRole.USER,
    },
    status: {
      active: currentStatus === 'active',
      inactive: currentStatus === 'inactive',
    },
  };

  const setSearchTerm = useCallback((term: string) => {
    setSearchTermState(term);
  }, []);

  const toggleSearchMode = useCallback(() => {
    setIsSearchActive((prev) => !prev);
  }, []);

  const toggleRoleFilter = useCallback(
    (role: UserRole) => {
      const newRole = filterOptions.roles[role] ? null : role;
      updateSearchParams({ role: newRole });
    },
    [filterOptions.roles, updateSearchParams],
  );

  const toggleStatusFilter = useCallback(
    (status: 'active' | 'inactive') => {
      const newStatus = filterOptions.status[status] ? null : status;
      updateSearchParams({ status: newStatus });
    },
    [filterOptions.status, updateSearchParams],
  );

  const handleStatusChange = useCallback(
    (user: UserInterface, action: 'activate' | 'deactivate') => {
      if (!user.id) return;
      setSelectedUser(user);
      setActionType(action);
      setShowDialogState(true);
    },
    [],
  );

  const setShowDialog = useCallback((show: boolean) => {
    setShowDialogState(show);
    if (!show) {
      setSelectedUser(null);
      setActionType(null);
      setIsPending(false);
    }
  }, []);

  const confirmStatusChange = useCallback(async () => {
    if (!selectedUser?.id || !actionType) return;

    setIsPending(true);
    const toastId = toast.loading(
      `${actionType === 'activate' ? 'Reactivating' : 'Deactivating'} user...`,
    );

    try {
      const response =
        actionType === 'activate'
          ? await reactivateUser(selectedUser.id)
          : await deactivateUser(selectedUser.id);

      if ('error' in response) {
        toast.error(response.message, { id: toastId });
        return;
      }

      toast.success(
        `User ${actionType === 'activate' ? 'reactivated' : 'deactivated'} successfully`,
        { id: toastId },
      );

      router.refresh();
      setShowDialog(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update user status';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsPending(false);
    }
  }, [selectedUser, actionType, router, setShowDialog]);

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

  const value = {
    users: initialUsers,
    searchTerm,
    setSearchTerm,
    filterOptions,
    toggleRoleFilter,
    toggleStatusFilter,
    handleStatusChange,
    isSearchActive,
    toggleSearchMode,
    showDialog,
    setShowDialog,
    selectedUser,
    actionType,
    confirmStatusChange,
    isPending,
    pagination: metadata,
    setPage,
    setLimit,
  };

  return (
    <UsersContext.Provider value={value}>{children}</UsersContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UsersContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UsersProvider');
  }
  return context;
}
