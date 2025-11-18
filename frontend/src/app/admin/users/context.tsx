'use client';

import { toast } from 'sonner';
import { UserRole } from '~/types/user';
import { UserInterface } from '~/types/user';
import { PaginationMeta } from '~/types/actions';
import {
  deactivateUser,
  reactivateUser,
  verifyUser,
  deleteUser,
  updateUserRole,
} from '../actions';
import { useRouter, useSearchParams } from 'next/navigation';
import { createContext, useContext, useCallback, useState } from 'react';

interface UsersContextType {
  users: UserInterface[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterOptions: {
    roles: Record<UserRole, boolean>;
    status: {
      verified: boolean;
      unverified: boolean;
    };
  };
  toggleRoleFilter: (role: UserRole) => void;
  toggleStatusFilter: (status: 'verified' | 'unverified') => void;
  handleStatusChange: (
    user: UserInterface,
    action: 'verify' | 'deactivate' | 'reactivate',
  ) => void;
  handleDeleteUser: (user: UserInterface) => void;
  handleUpdateRole: (user: UserInterface) => void;
  isSearchActive: boolean;
  toggleSearchMode: () => void;
  showDialog: boolean;
  setShowDialog: (show: boolean) => void;
  selectedUser: UserInterface | null;
  actionType:
    | 'verify'
    | 'deactivate'
    | 'reactivate'
    | 'delete'
    | 'updateRole'
    | null;
  confirmStatusChange: () => void;
  confirmDeleteUser: () => void;
  confirmUpdateRole: (role: UserRole) => void;
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
    'verify' | 'deactivate' | 'reactivate' | 'delete' | 'updateRole' | null
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
      verified: currentStatus === 'verified',
      unverified: currentStatus === 'unverified',
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
    (status: 'verified' | 'unverified') => {
      const newStatus = filterOptions.status[status] ? null : status;
      updateSearchParams({ status: newStatus });
    },
    [filterOptions.status, updateSearchParams],
  );

  const handleStatusChange = useCallback(
    (user: UserInterface, action: 'verify' | 'deactivate' | 'reactivate') => {
      if (!user.id) return;
      setSelectedUser(user);
      setActionType(action);
      setShowDialogState(true);
    },
    [],
  );

  const handleDeleteUser = useCallback((user: UserInterface) => {
    if (!user.id) return;
    setSelectedUser(user);
    setActionType('delete');
    setShowDialogState(true);
  }, []);

  const handleUpdateRole = useCallback((user: UserInterface) => {
    if (!user.id) return;
    setSelectedUser(user);
    setActionType('updateRole');
    setShowDialogState(true);
  }, []);

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

    if (
      actionType !== 'verify' &&
      actionType !== 'deactivate' &&
      actionType !== 'reactivate'
    ) {
      return;
    }

    setIsPending(true);
    const actionMessages = {
      verify: {
        loading: 'Verifying user...',
        success: 'User verified successfully',
      },
      deactivate: {
        loading: 'Deactivating user...',
        success: 'User deactivated successfully',
      },
      reactivate: {
        loading: 'Reactivating user...',
        success: 'User reactivated successfully',
      },
    };

    const toastId = toast.loading(actionMessages[actionType].loading);

    try {
      let response;
      switch (actionType) {
        case 'verify':
          response = await verifyUser(selectedUser.id);
          break;
        case 'deactivate':
          response = await deactivateUser(selectedUser.id);
          break;
        case 'reactivate':
          response = await reactivateUser(selectedUser.id);
          break;
        default:
          return;
      }

      if ('error' in response) {
        toast.error(response.message, { id: toastId });
        return;
      }

      toast.success(actionMessages[actionType].success, { id: toastId });

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

  const confirmDeleteUser = useCallback(async () => {
    if (!selectedUser?.id) return;

    setIsPending(true);
    const toastId = toast.loading('Deleting user...');

    try {
      const response = await deleteUser(selectedUser.id);

      if ('error' in response) {
        toast.error(response.message, { id: toastId });
        return;
      }

      toast.success('User deleted successfully', { id: toastId });

      router.refresh();
      setShowDialog(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to delete user';
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsPending(false);
    }
  }, [selectedUser, router, setShowDialog]);

  const confirmUpdateRole = useCallback(
    async (role: UserRole) => {
      if (!selectedUser?.id) return;

      setIsPending(true);
      const toastId = toast.loading('Updating user role...');

      try {
        const response = await updateUserRole(selectedUser.id, role);

        if ('error' in response) {
          toast.error(response.message, { id: toastId });
          return;
        }

        toast.success('User role updated successfully', { id: toastId });

        router.refresh();
        setShowDialog(false);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update user role';
        toast.error(errorMessage, { id: toastId });
      } finally {
        setIsPending(false);
      }
    },
    [selectedUser, router, setShowDialog],
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

  const value = {
    users: initialUsers,
    searchTerm,
    setSearchTerm,
    filterOptions,
    toggleRoleFilter,
    toggleStatusFilter,
    handleStatusChange,
    handleDeleteUser,
    handleUpdateRole,
    isSearchActive,
    toggleSearchMode,
    showDialog,
    setShowDialog,
    selectedUser,
    actionType,
    confirmStatusChange,
    confirmDeleteUser,
    confirmUpdateRole,
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
