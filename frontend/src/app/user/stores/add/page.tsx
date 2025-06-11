import { AddStoreForm } from './form';
import { getAllLocations } from '~/app/actions';

export default async function AddStorePage() {
  const locationsRes = await getAllLocations();
  const locations = 'data' in locationsRes ? locationsRes.data : [];

  return (
    <div className="p-4">
      <AddStoreForm locations={locations} />
    </div>
  );
}
