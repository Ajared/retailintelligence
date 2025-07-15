import { AddStoreForm } from './form';
import { auth } from '~/app/(auth)/auth';
import { getAllLocations, getPhases } from '~/app/actions';

export default async function AddStorePage() {
  const phasesRes = await getPhases();
  const locationsRes = await getAllLocations();
  const phases = 'data' in phasesRes ? phasesRes.data : [];
  const locations = 'data' in locationsRes ? locationsRes.data : [];

  const session = await auth();

  return (
    <div className="p-4">
      <AddStoreForm phases={phases} locations={locations} user={session?.user} />
    </div>
  );
}
