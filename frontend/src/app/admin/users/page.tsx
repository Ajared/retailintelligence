import Content from './content';
import { Suspense } from 'react';
import { getAllUsers } from '../actions';
import { getAllLocations, getPhases } from '~/app/actions';
import EmptyState from '../_components/empty';
import { UsersProvider } from './context';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = await Promise.resolve(searchParams);
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;
  const sort = (params.sort as string) || 'ASC';
  const role = params.role as string;
  const status = params.status as string;

  const usersResponse = await getAllUsers(page, limit, sort, role, status);

  const phasesRes = await getPhases();
  const locationsRes = await getAllLocations();
  const phases = 'data' in phasesRes ? phasesRes.data : [];
  const locations = 'data' in locationsRes ? locationsRes.data : [];

  if ('error' in usersResponse) {
    return <EmptyState />;
  }

  return (
    <Suspense fallback={<EmptyState />}>
      <UsersProvider
        initialUsers={usersResponse.data}
        currentRole={role}
        currentStatus={status}
        metadata={usersResponse.meta}
      >
        <Content phases={phases} locations={locations} />
      </UsersProvider>
    </Suspense>
  );
}
