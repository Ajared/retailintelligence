import { cache } from 'react';
import Content from './content';
import { auth } from '~/app/(auth)/auth';
import { redirect } from 'next/navigation';

const getSession = cache(() => auth());

export default async function UserMapPage({
  searchParams,
}: {
  searchParams: Promise<{ lat?: string; lng?: string; name?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const params = await searchParams;
  const latNum = parseFloat(params?.lat ?? '');
  const lngNum = parseFloat(params?.lng ?? '');
  const hasValidCenter = Number.isFinite(latNum) && Number.isFinite(lngNum);
  const center = hasValidCenter ? { lat: latNum, lng: lngNum } : undefined;
  const zoom = hasValidCenter ? 18 : undefined;
  const name = params?.name ?? '';

  return (
    <div className="h-full w-full">
      <Content zoom={zoom} center={center} initialName={name} />
    </div>
  );
}
