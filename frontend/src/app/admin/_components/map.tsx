'use client';

import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import { Session } from 'next-auth';
import 'leaflet-defaulticon-compatibility';
import { LatLngExpression } from 'leaflet';
import { StoreInterface } from '~/types/store';
import {
  Popup,
  Marker,
  TileLayer,
  MapContainer,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

const MapPlaceHolder = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <noscript>You need to enable JavaScript to see this map.</noscript>
    </div>
  );
};

const MapBoundsLogger = () => {
  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      const query = {
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      };
      console.log('Map bounds:', query);
    },
    zoomend: () => {
      const bounds = map.getBounds();
      const query = {
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      };
      console.log('Map bounds (after zoom):', query);
    },
  });
  return null;
};

export default function Map({
  stores,
  session,
  center,
  zoom,
}: {
  stores: StoreInterface[];
  session: Session;
  center?: LatLngExpression;
  zoom?: number;
}) {
  const mapZoom = zoom ?? 15;
  const mapCenter = center ?? {
    lat: 9.074426322081734,
    lng: 7.477762699127198,
  };

  return (
    <MapContainer
      zoom={mapZoom}
      center={mapCenter}
      style={{ width: '100%', height: '100%', zIndex: 0 }}
      placeholder={<MapPlaceHolder />}
    >
      <MapBoundsLogger />
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
