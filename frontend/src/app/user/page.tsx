import { cache } from 'react';
import Content from './content';
import { auth } from '../(auth)/auth';
import EmptyState from './_components/empty';
import { getDashboardData } from '../actions';
import { redirect } from 'next/navigation';

const getSession = cache(() => auth());

export default async function UserPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const storesResponse = await getDashboardData(1, 50, 'ASC');

  if ('error' in storesResponse) {
    return <EmptyState />;
  }

  return (
    <div className="h-full w-full">
      <Content stores={storesResponse.data} session={session} />
    </div>
  );
}
