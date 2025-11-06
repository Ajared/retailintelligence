import Content from './content';
import { Suspense } from 'react';
import EmptyState from '../../_components/empty';
import { getAllLocations } from '~/app/actions';
import { getAllStoresForUser } from '../../actions';

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
  const name = typeof params.name === 'string' ? params.name : undefined;

  const [storesResponse, locationsResponse] = await Promise.all([
    getAllStoresForUser(page, limit, sort, stateId, localGovernmentId, name),
    getAllLocations(),
  ]);

  if ('error' in storesResponse || 'error' in locationsResponse) {
    return <EmptyState />;
  }

  return (
    <Suspense fallback={<EmptyState />}>
      <Content
        stores={storesResponse.data}
        pagination={storesResponse.meta}
        states={locationsResponse.data}
      />
    </Suspense>
  );
}
