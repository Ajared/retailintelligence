'use client';

import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import { Session } from 'next-auth';
import 'leaflet-defaulticon-compatibility';
import { LatLngExpression } from 'leaflet';
import { StoreInterface } from '~/types/store';
import { Popup, Marker, TileLayer, MapContainer } from 'react-leaflet';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

const MapPlaceHolder = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <noscript>You need to enable JavaScript to see this map.</noscript>
    </div>
  );
};

export default function Map({
  stores,
  session,
}: {
  stores: StoreInterface[];
  session: Session;
}) {
  const defaultZoom = 14;
  const defaultCenter: LatLngExpression = {
    lat: 7.470426284840235,
    lng: 9.070715904235842,
  };

  return (
    <MapContainer
      zoom={defaultZoom}
      center={defaultCenter}
      style={{ width: '100%', height: '100%', zIndex: 0 }}
      placeholder={<MapPlaceHolder />}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stores.map((store) => (
        <Marker key={store.id} position={[store.latitude, store.longitude]}>
          {session.user.role === 'admin' ||
          session.user.role === 'super_admin' ? (
            <Popup>
              <Link
                href={`/admin/stores/${store.id}`}
                className="cursor-pointer"
              >
                {store.name}
                <br />
                {store.store_type}
              </Link>
            </Popup>
          ) : (
            <Popup>
              {store.name}
              <br />
              {store.store_type}
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
