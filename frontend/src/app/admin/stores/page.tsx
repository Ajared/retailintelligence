import Content from './content';
import { Suspense } from 'react';
import { getAllStores } from '../actions';
import { StoresProvider } from './context';
import EmptyState from '../_components/empty';
import { getAllLocations } from '~/app/actions';

export default async function StoresPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = await Promise.resolve(searchParams);
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 20;
  const sort = (params.sort as string) || 'ASC';
  const stateId = params.stateId as string;
  const localGovernmentId = params.localGovernmentId as string;
  const enumeratorId = params.enumeratorId as string;

  const [storesResponse, locationsResponse] = await Promise.all([
    getAllStores(page, limit, sort, stateId, localGovernmentId, enumeratorId),
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
        currentEnumeratorId={enumeratorId}
        metadata={storesResponse.meta}
        states={locationsResponse.data}
      >
        <Content />
      </StoresProvider>
    </Suspense>
  );
}
