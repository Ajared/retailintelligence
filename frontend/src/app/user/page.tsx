import Content from './content';
import EmptyState from './_components/empty';
import { getDashboardData } from '../actions';

export default async function UserPage() {
  const storesResponse = await getDashboardData(1, 50, 'ASC');

  if ('error' in storesResponse) {
    return <EmptyState />;
  }

  return (
    <div className="h-full w-full">
      <Content stores={storesResponse.data} />
    </div>
  );
}
