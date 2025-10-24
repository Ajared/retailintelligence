import React from 'react';
import { getAllLocations, getPhases } from '~/app/actions';
import EditStoreForm from './form';
import { getStoreById } from '~/app/user/actions';

const EditStorePage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  const phasesRes = await getPhases();
  const locationsRes = await getAllLocations();
  const phases = 'data' in phasesRes ? phasesRes.data : [];
  const locations = 'data' in locationsRes ? locationsRes.data : [];
  const store = await getStoreById(id);
  return (
    <div className="p-4">
      <EditStoreForm locations={locations} phases={phases} store={store} />
    </div>
  );
};

export default EditStorePage;
