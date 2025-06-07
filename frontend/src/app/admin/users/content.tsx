'use client';

import { useState, use } from 'react';
import { useActionState } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Search, Filter, X, MoreHorizontal } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '~/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Response } from '~/types/actions';
import { useIsMobile } from '~/hooks/use-mobile';
import { UserInterface, UserRole } from '~/types/user';
import { deactivateUser, reactivateUser } from '../actions';
import { toast } from 'sonner';
import { useEffect, startTransition } from 'react';
import EmptyState from '../_components/empty';

type ActionState = {
  loading: boolean;
  error?: string;
  updatedUser?: UserInterface;
};

export default function Content({
  users,
}: {
  users: Promise<Response<UserInterface[]>>;
}) {
  const response = use(users);
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [userList, setUserList] = useState<UserInterface[]>(
    'error' in response ? [] : (response.data ?? []),
  );
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null);
  const [actionType, setActionType] = useState<'activate' | 'deactivate'>(
    'deactivate',
  );
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    roles: {
      [UserRole.SUPER_ADMIN]: true,
      [UserRole.ADMIN]: true,
      [UserRole.USER]: true,
    },
    status: {
      active: true,
      inactive: true,
    },
  });

  const userStatusAction = async (
    prevState: ActionState,
    payload: { userId: string; actionType: 'activate' | 'deactivate' },
  ): Promise<ActionState> => {
    let response: Response<UserInterface>;
    if (payload.actionType === 'activate') {
      response = await reactivateUser(payload.userId);
    } else {
      response = await deactivateUser(payload.userId);
    }
    if ('error' in response) {
      toast.error(response.message || 'Failed to update user');
      return {
        ...prevState,
        error: response.message,
        loading: false,
      };
    }
    toast.success(
      `${payload.actionType === 'activate' ? 'Reactivated' : 'Deactivated'} user successfully`,
    );
    return {
      loading: false,
      updatedUser: response.data,
    };
  };

  const [actionState, dispatchAction, isPending] = useActionState(
    userStatusAction,
    { loading: false },
  );

  useEffect(() => {
    if (actionState && actionState.updatedUser) {
      setUserList((prevUsers) =>
        prevUsers.map((user) =>
          user.id === actionState.updatedUser!.id
            ? { ...user, status: actionState.updatedUser!.status }
            : user,
        ),
      );
      setShowDialog(false);
      setSelectedUser(null);
    }
  }, [actionState]);

  if ('error' in response) {
    return <EmptyState />;
  }

  const filteredUsers = userList.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterOptions.roles[user.role as UserRole];
    const matchesStatus =
      filterOptions.status[user.status as keyof typeof filterOptions.status];
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleStatusChange = (
    user: UserInterface,
    action: 'activate' | 'deactivate',
  ) => {
    setSelectedUser(user);
    setActionType(action);
    setShowDialog(true);
  };

  const confirmStatusChange = () => {
    if (!selectedUser || !selectedUser.id) return;
    startTransition(() => {
      dispatchAction({ userId: selectedUser.id as string, actionType });
    });
  };

  const toggleSearchMode = () => {
    setIsSearchActive(!isSearchActive);
    if (isSearchActive) {
      setSearchTerm('');
    }
  };

  const toggleRoleFilter = (role: UserRole) => {
    setFilterOptions((prev) => ({
      ...prev,
      roles: {
        ...prev.roles,
        [role]: !prev.roles[role],
      },
    }));
  };

  const toggleStatusFilter = (status: keyof FilterOptions['status']) => {
    setFilterOptions((prev) => ({
      ...prev,
      status: {
        ...prev.status,
        [status]: !prev.status[status],
      },
    }));
  };

  if (userList.length === 0 && !isPending) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        {isSearchActive ? (
          <div className="flex items-center flex-1">
            <Search className="h-5 w-5 mr-2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 border-b border-input rounded-none shadow-none focus-visible:ring-0 pl-0 text-base bg-transparent focus:bg-transparent dark:bg-transparent dark:focus:bg-transparent"
              autoFocus
            />
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
              User Management
            </h1>
            {!isMobile && (
              <div className="relative w-80 mx-4 hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
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
                Filter Users
              </DropdownMenuItem>
              <DropdownMenuSeparator />

              <DropdownMenuItem className="font-medium">Roles</DropdownMenuItem>
              <DropdownMenuCheckboxItem
                checked={filterOptions.roles[UserRole.SUPER_ADMIN]}
                onCheckedChange={() => toggleRoleFilter(UserRole.SUPER_ADMIN)}
              >
                Super Admin
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterOptions.roles[UserRole.ADMIN]}
                onCheckedChange={() => toggleRoleFilter(UserRole.ADMIN)}
              >
                Admin
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterOptions.roles[UserRole.USER]}
                onCheckedChange={() => toggleRoleFilter(UserRole.USER)}
              >
                User
              </DropdownMenuCheckboxItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="font-medium">
                Status
              </DropdownMenuItem>
              <DropdownMenuCheckboxItem
                checked={filterOptions.status.active}
                onCheckedChange={() => toggleStatusFilter('active')}
              >
                Active
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterOptions.status.inactive}
                onCheckedChange={() => toggleStatusFilter('inactive')}
              >
                Inactive
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No users found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className={`cursor-pointer ${
                      user.status === 'inactive' ? 'bg-muted/30' : ''
                    }`}
                  >
                    <TableCell className="font-medium">
                      <span
                        className={
                          user.status === 'inactive'
                            ? 'line-through opacity-70'
                            : ''
                        }
                      >
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell className="capitalize">{user.status}</TableCell>
                    <TableCell className="text-right">
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
                          {user.status === 'active' ? (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(user, 'deactivate')
                              }
                              className="cursor-pointer"
                            >
                              Deactivate User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(user, 'activate')
                              }
                              className="cursor-pointer"
                            >
                              Reactivate User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="md:hidden">
          <div className="grid grid-cols-[2fr_1fr_0.5fr] gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
            <div>Email</div>
            <div>Role</div>
            <div className="text-right">Actions</div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`grid grid-cols-[2fr_1fr_0.5fr] gap-4 p-4 border-b items-center ${
                  user.status === 'inactive' ? 'bg-muted/30' : ''
                }`}
              >
                <div className="min-w-0">
                  <div
                    className={`font-medium truncate ${user.status === 'inactive' ? 'line-through opacity-70' : ''}`}
                    title={user.email}
                  >
                    {user.email}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="text-xs">{user.role}</div>
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
                      <DropdownMenuItem disabled className="text-xs">
                        Status: {user.status}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === 'active' ? (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(user, 'deactivate')}
                          className="cursor-pointer"
                        >
                          Deactivate User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(user, 'activate')}
                          className="cursor-pointer"
                        >
                          Reactivate User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'activate' ? 'Reactivate' : 'Deactivate'} User
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{' '}
              {actionType === 'activate' ? 'reactivate' : 'deactivate'}{' '}
              <span className="font-medium">{selectedUser?.email}</span>?{' '}
              {actionType === 'deactivate'
                ? 'This will prevent the user from accessing their account.'
                : "This will restore the user's access to their account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              autoFocus={false}
              className="focus-visible:ring-0 cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              autoFocus
              onClick={confirmStatusChange}
              className={
                actionType === 'deactivate'
                  ? 'bg-destructive hover:bg-destructive/90 text-white cursor-pointer'
                  : ''
              }
              disabled={isPending}
            >
              {actionType === 'activate' ? 'Reactivate' : 'Deactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type FilterOptions = {
  roles: {
    [UserRole.SUPER_ADMIN]: boolean;
    [UserRole.ADMIN]: boolean;
    [UserRole.USER]: boolean;
  };
  status: {
    active: boolean;
    inactive: boolean;
  };
};
