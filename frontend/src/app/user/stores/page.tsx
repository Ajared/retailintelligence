import Content from './content';
import { Suspense } from 'react';
import { StoresProvider } from './context';
import EmptyState from '../_components/empty';
import { getAllLocations } from '~/app/actions';
import { getAllStoresForUser } from '../actions';

export default async function StoresPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;
  const sort = (params.sort as string) || 'ASC';
  const stateId =
    typeof params.stateId === 'string' ? params.stateId : undefined;
  const localGovernmentId =
    typeof params.localGovernmentId === 'string'
      ? params.localGovernmentId
      : undefined;

  const [storesResponse, locationsResponse] = await Promise.all([
    getAllStoresForUser(page, limit, sort, stateId, localGovernmentId),
    getAllLocations(),
  ]);

  if ('error' in storesResponse || 'error' in locationsResponse) {
    return <EmptyState />;
  }

  return (
    <Suspense fallback={<EmptyState />}>
      <StoresProvider
        initialStores={storesResponse.data}
        currentStateId={stateId}
        currentLocalGovernmentId={localGovernmentId}
        metadata={storesResponse.meta}
        states={locationsResponse.data}
      >
        <Content />
      </StoresProvider>
    </Suspense>
  );
}
