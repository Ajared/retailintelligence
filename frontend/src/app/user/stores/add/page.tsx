import { AddStoreForm } from './form';
import { getAllLocations, getPhases } from '~/app/actions';

export default async function AddStorePage() {
  const phasesRes = await getPhases();
  const locationsRes = await getAllLocations();
  const phases = 'data' in phasesRes ? phasesRes.data : [];
  const locations = 'data' in locationsRes ? locationsRes.data : [];

  return (
    <div className="p-4">
      <AddStoreForm phases={phases} locations={locations} />
    </div>
  );
}
