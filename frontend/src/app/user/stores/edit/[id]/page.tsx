import React from 'react';
import { getAllLocations, getPhases } from '~/app/actions';
import EditStoreForm from './form';

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
  return (
    <div className="p-4">
      {id}
      <EditStoreForm locations={locations} phases={phases}/>
    </div>
  );
};

export default EditStorePage;
