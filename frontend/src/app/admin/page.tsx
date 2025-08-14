import { cache } from 'react';
import Content from './content';
import { auth } from '../(auth)/auth';
import { redirect } from 'next/navigation';
import EmptyState from './_components/empty';
import { getDashboardData } from '../actions';

const getSession = cache(() => auth());

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lng?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const storesResponse = await getDashboardData(1, 300, 'ASC');

  if ('error' in storesResponse) {
    return <EmptyState />;
  }

  const params = await searchParams;
  const latNum = parseFloat(params?.lat ?? '');
  const lngNum = parseFloat(params?.lng ?? '');
  const hasValidCenter = Number.isFinite(latNum) && Number.isFinite(lngNum);
  const center = hasValidCenter ? { lat: latNum, lng: lngNum } : undefined;
  const zoom = hasValidCenter ? 18 : undefined;

  return (
    <div className="h-full w-full">
      <Content
        zoom={zoom}
        center={center}
        session={session}
        stores={storesResponse.data}
      />
    </div>
  );
}
