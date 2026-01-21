'use client';

import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import {
  Search,
  Filter,
  X,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  UserPlus,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useIsMobile } from '~/hooks/use-mobile';
import { UserRole } from '~/types/user';
import { useUsers } from './context';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '~/components/ui/dialog';
import { Label } from '~/components/ui/label';
import { inviteUser } from '../actions';
import { useActionState } from 'react';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Response } from '~/types/actions';
import { InviteUserFormData } from '../schema';
import { assignLocation } from '../actions';
import { assignLocationFormSchema, AssignLocationFormData } from '../schema';
import { UserInterface } from '~/types/user';
import { StateInterface } from '~/types/state';
import { PhaseInterface } from '~/types/phase';

export default function Content({
  phases,
  locations,
}: {
  phases: PhaseInterface[];
  locations: StateInterface[];
}) {
  const isMobile = useIsMobile();
  const {
    users,
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
    pagination,
    setPage,
    setLimit,
  } = useUsers();

  const inviteInitialState: Response<{
    email: string;
    role: 'user' | 'admin';
  }> & {
    inputs: InviteUserFormData;
  } = {
    inputs: { email: '', role: 'user' },
    error: '',
    message: '',
    timestamp: '',
  };
  const [inviteState, inviteAction, invitePending] = useActionState(
    inviteUser,
    inviteInitialState,
  );

  const dialogRef = useRef<HTMLButtonElement>(null);

  const handleInviteSuccess = useEffectEvent(() => {
    if ('data' in inviteState && inviteState.data) {
      setTimeout(() => {
        dialogRef.current?.click();
      }, 1000);
    }
  });

  useEffect(() => {
    if ('data' in inviteState && inviteState.data) {
      handleInviteSuccess();
    }
  }, [inviteState]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        searchTerm === '' ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [users, searchTerm]);

  const handleSearch = useCallback(
    (value: string) => {
      setSearchTerm(value);
    },
    [setSearchTerm],
  );

  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
        {'No users found matching selected criteria.'}
      </TableCell>
    </TableRow>
  );

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assignUser, setAssignUser] = useState(null as UserInterface | null);
  const [assignState, setAssignState] = useState<AssignLocationFormData | null>(
    null,
  );
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);
  const [assignPending, setAssignPending] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const openAssignDialog = (user: UserInterface) => {
    setAssignUser(user);
    setAssignDialogOpen(true);
    setAssignState(null);
    setAssignError(null);
    setAssignSuccess(null);
  };
  const closeAssignDialog = () => {
    setAssignDialogOpen(false);
    setAssignUser(null);
    setAssignState(null);
    setAssignError(null);
    setAssignSuccess(null);
    setAssignPending(false);
  };

  const handleAssignLocation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAssignError(null);
    setAssignSuccess(null);
    setAssignPending(true);
    const formData = new FormData(e.currentTarget);
    const rawData = {
      stateId: (formData.get('stateId') as string) || '',
      localGovernmentId: (formData.get('localGovernmentId') as string) || '',
      phaseId: (formData.get('phaseId') as string) || '',
      districtId: (formData.get('districtId') as string) || '',
      enumeratorId: assignUser?.id || '',
    };
    const validated = assignLocationFormSchema.safeParse(rawData);
    if (!validated.success) {
      setAssignError('Please fill all required fields.');
      setAssignPending(false);
      return;
    }

    const { stateId, localGovernmentId, phaseId, districtId, enumeratorId } =
      validated.data;
    const result = await assignLocation({
      stateId: stateId || '',
      localGovernmentId: localGovernmentId || '',
      phaseId: phaseId || '',
      districtId: districtId || '',
      enumeratorId: enumeratorId || '',
    });
    if ('error' in result) {
      setAssignError(result.message);
    } else {
      setAssignSuccess('Location assigned successfully!');
      setTimeout(() => {
        closeAssignDialog();
      }, 1200);
    }
    setAssignPending(false);
  };

  const selectedState = locations.find((s) => s.id === assignState?.stateId);
  const localGovernments = selectedState?.local_governments || [];
  const selectedPhase = phases.find((p) => p.id === assignState?.phaseId);
  const districts = selectedPhase?.districts || [];

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
              onChange={(e) => handleSearch(e.target.value)}
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
                  onChange={(e) => handleSearch(e.target.value)}
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
                checked={filterOptions.status.verified}
                onCheckedChange={() => toggleStatusFilter('verified')}
              >
                Verified
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterOptions.status.unverified}
                onCheckedChange={() => toggleStatusFilter('unverified')}
              >
                Unverified
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden md:block">Invite User</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite User</DialogTitle>
                <DialogDescription>
                  Send an invitation by email and assign a role.
                </DialogDescription>
              </DialogHeader>
              <form action={inviteAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    defaultValue={
                      ('inputs' in inviteState && inviteState.inputs?.email) ||
                      ''
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <Select
                    defaultValue={
                      ('inputs' in inviteState && inviteState.inputs?.role) ||
                      'user'
                    }
                    name="role"
                  >
                    <SelectTrigger
                      id="invite-role"
                      className="w-full border rounded px-2 py-2"
                    >
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {inviteState?.message && inviteState.message !== '' && (
                  <Alert
                    variant={'data' in inviteState ? 'default' : 'destructive'}
                  >
                    {'data' in inviteState && (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {inviteState?.message ||
                        ('error' in inviteState &&
                          inviteState.error &&
                          (Array.isArray(inviteState.error)
                            ? (inviteState.error as string[]).join(', ')
                            : typeof inviteState.error === 'string'
                              ? inviteState.error
                              : 'Invalid form data'))}
                    </AlertDescription>
                  </Alert>
                )}
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" ref={dialogRef}>
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={invitePending}>
                    {invitePending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {invitePending ? 'Inviting...' : 'Send Invite'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
              {filteredUsers.length === 0
                ? renderEmptyState()
                : filteredUsers.map((user) => {
                    const isDeactivated = user.deactivated_at != null;
                    const isUnverified = user.status === 'unverified';

                    return (
                      <TableRow
                        key={user.id}
                        className={`cursor-pointer ${
                          isDeactivated || isUnverified ? 'bg-muted/30' : ''
                        }`}
                      >
                        <TableCell className="font-medium">
                          <span
                            className={
                              isDeactivated || isUnverified
                                ? 'line-through opacity-70'
                                : ''
                            }
                          >
                            {user.email}
                          </span>
                        </TableCell>
                        <TableCell className="capitalize">
                          {user.role}
                        </TableCell>
                        <TableCell className="capitalize">
                          {isDeactivated ? 'Deactivated' : user.status}
                        </TableCell>
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
                              {isUnverified ? (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(user, 'verify')
                                    }
                                    className="cursor-pointer"
                                  >
                                    Verify User
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user)}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    Delete User
                                  </DropdownMenuItem>
                                </>
                              ) : isDeactivated ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleStatusChange(user, 'reactivate')
                                  }
                                  className="cursor-pointer"
                                >
                                  Reactivate User
                                </DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleStatusChange(user, 'deactivate')
                                    }
                                    className="cursor-pointer"
                                  >
                                    Deactivate User
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleUpdateRole(user)}
                                    className="cursor-pointer"
                                  >
                                    Update Role
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openAssignDialog(user)}
                                    className="cursor-pointer"
                                  >
                                    Assign Location
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteUser(user)}
                                    className="cursor-pointer text-destructive focus:text-destructive"
                                  >
                                    Delete User
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
              {users.length === 0
                ? 'No users found.'
                : 'No users found matching your criteria.'}
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isDeactivated = user.deactivated_at != null;
              const isUnverified = user.status === 'unverified';

              return (
                <div
                  key={user.id}
                  className={`grid grid-cols-[2fr_1fr_0.5fr] gap-4 p-4 border-b items-center ${
                    isDeactivated || isUnverified ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <div
                      className={`font-medium truncate ${isDeactivated || isUnverified ? 'line-through opacity-70' : ''}`}
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
                          Status: {isDeactivated ? 'Deactivated' : user.status}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {isUnverified ? (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user, 'verify')}
                              className="cursor-pointer"
                            >
                              Verify User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              Delete User
                            </DropdownMenuItem>
                          </>
                        ) : isDeactivated ? (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(user, 'reactivate')
                            }
                            className="cursor-pointer"
                          >
                            Reactivate User
                          </DropdownMenuItem>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(user, 'deactivate')
                              }
                              className="cursor-pointer"
                            >
                              Deactivate User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(user)}
                              className="cursor-pointer"
                            >
                              Update Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openAssignDialog(user)}
                              className="cursor-pointer"
                            >
                              Assign Location
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 items-center justify-center md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 justify-between items-center w-full md:w-auto">
          <p className="text-sm text-muted-foreground">
            {pagination.total === 0 || filteredUsers.length === 0 ? (
              <>No results found</>
            ) : (
              <>
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                of {pagination.total} results
              </>
            )}
          </p>
          {pagination.total !== 0 && filteredUsers.length !== 0 && (
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => setLimit(Number(value))}
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
              onClick={() => setPage(pagination.page - 1)}
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
              onClick={() => setPage(pagination.page + 1)}
              disabled={!pagination.has_next}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next page</span>
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) {
            setSelectedRole(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'verify' && 'Verify User'}
              {actionType === 'deactivate' && 'Deactivate User'}
              {actionType === 'reactivate' && 'Reactivate User'}
              {actionType === 'delete' && 'Delete User'}
              {actionType === 'updateRole' && 'Update User Role'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'delete' ? (
                <>
                  Are you sure you want to delete{' '}
                  <span className="font-medium">{selectedUser?.email}</span>?
                  This action cannot be undone and will permanently remove the
                  user from the system.
                </>
              ) : actionType === 'updateRole' ? (
                <>
                  Select a new role for{' '}
                  <span className="font-medium">{selectedUser?.email}</span>.
                  Current role:{' '}
                  <span className="font-medium capitalize">
                    {selectedUser?.role}
                  </span>
                </>
              ) : (
                <>
                  Are you sure you want to {actionType === 'verify' && 'verify'}
                  {actionType === 'deactivate' && 'deactivate'}
                  {actionType === 'reactivate' && 'reactivate'}{' '}
                  <span className="font-medium">{selectedUser?.email}</span>?{' '}
                  {actionType === 'verify' &&
                    'This will verify the user and grant them full access to their account.'}
                  {actionType === 'deactivate' &&
                    'This will deactivate the user and restrict their access.'}
                  {actionType === 'reactivate' &&
                    "This will restore the user's access to their account."}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionType === 'updateRole' ? (
            <div className="space-y-4 py-4">
              <Select
                onValueChange={(value) => {
                  const role = value as UserRole;
                  setSelectedRole(role);
                }}
                value={selectedRole || selectedUser?.role}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.USER}>User</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.SUPER_ADMIN}>
                    Super Admin
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel
              autoFocus={false}
              className="focus-visible:ring-0 cursor-pointer"
              disabled={isPending}
              onClick={() => {
                setSelectedRole(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            {actionType === 'updateRole' ? (
              <AlertDialogAction
                autoFocus
                onClick={() => {
                  if (selectedRole) {
                    confirmUpdateRole(selectedRole);
                    setSelectedRole(null);
                  }
                }}
                className="cursor-pointer"
                disabled={
                  isPending ||
                  !selectedRole ||
                  selectedRole === selectedUser?.role
                }
              >
                Update Role
              </AlertDialogAction>
            ) : (
              <AlertDialogAction
                autoFocus
                onClick={
                  actionType === 'delete'
                    ? confirmDeleteUser
                    : confirmStatusChange
                }
                className={`cursor-pointer ${
                  actionType === 'deactivate' || actionType === 'delete'
                    ? 'bg-destructive hover:bg-destructive/90 text-white'
                    : ''
                }`}
                disabled={isPending}
              >
                {actionType === 'verify' && 'Verify'}
                {actionType === 'deactivate' && 'Deactivate'}
                {actionType === 'reactivate' && 'Reactivate'}
                {actionType === 'delete' && 'Delete'}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Location</DialogTitle>
            <DialogDescription>
              Assign a location to{' '}
              <span className="font-medium">{assignUser?.email}</span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAssignLocation} className="space-y-4">
            <div className="flex gap-4 w-full">
              <div className="space-y-2 w-full">
                <Label htmlFor="stateId">State</Label>
                <Select
                  name="stateId"
                  onValueChange={(v) =>
                    setAssignState(() => ({
                      stateId: v,
                      localGovernmentId: '',
                      phaseId: '',
                      districtId: '',
                      enumeratorId: assignUser?.id || '',
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((state) => (
                      <SelectItem key={state.id} value={state.id || ''}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="localGovernmentId">Local Government</Label>
                <Select
                  name="localGovernmentId"
                  disabled={!assignState?.stateId}
                  onValueChange={(v) =>
                    setAssignState((prev) => ({
                      stateId: prev?.stateId || '',
                      localGovernmentId: v,
                      phaseId: prev?.phaseId || '',
                      districtId: prev?.districtId || '',
                      enumeratorId: assignUser?.id || '',
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a local government" />
                  </SelectTrigger>
                  <SelectContent>
                    {localGovernments.map((lg) => (
                      <SelectItem key={lg.id} value={lg.id || ''}>
                        {lg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(() => {
              const selectedState = locations.find(
                (l) => l.id === assignState?.stateId,
              );
              const selectedLG = selectedState?.local_governments?.find(
                (lg) => lg.id === assignState?.localGovernmentId,
              );
              if (
                selectedState?.name === 'FCT Abuja' &&
                selectedLG?.name === 'Municipal Area Council'
              ) {
                return (
                  <div className="flex gap-4 w-full">
                    <div className="space-y-2 w-full">
                      <Label htmlFor="phaseId">Phase</Label>
                      <Select
                        name="phaseId"
                        onValueChange={(v) =>
                          setAssignState((prev) => ({
                            stateId: prev?.stateId || '',
                            localGovernmentId: prev?.localGovernmentId || '',
                            phaseId: v,
                            districtId: '',
                            enumeratorId: assignUser?.id || '',
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a phase" />
                        </SelectTrigger>
                        <SelectContent>
                          {phases.map((phase) => (
                            <SelectItem key={phase.id} value={phase.id || ''}>
                              {phase.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 w-full">
                      <Label htmlFor="districtId">District</Label>
                      <Select
                        name="districtId"
                        disabled={!assignState?.phaseId}
                        onValueChange={(v) =>
                          setAssignState((prev) => ({
                            stateId: prev?.stateId || '',
                            localGovernmentId: prev?.localGovernmentId || '',
                            phaseId: prev?.phaseId || '',
                            districtId: v,
                            enumeratorId: assignUser?.id || '',
                          }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a district" />
                        </SelectTrigger>
                        <SelectContent>
                          {districts.map((d) => (
                            <SelectItem key={d.id} value={d.id || ''}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAssignDialog}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={assignPending}>
                {assignPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Assign
              </Button>
            </DialogFooter>
            {assignError && (
              <Alert variant="destructive">
                <AlertDescription>{assignError}</AlertDescription>
              </Alert>
            )}
            {assignSuccess && (
              <Alert variant="default">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{assignSuccess}</AlertDescription>
              </Alert>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
