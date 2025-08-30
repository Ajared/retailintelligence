'use client';

import Link from 'next/link';
import { useEffect } from 'react';
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
  useMap,
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

const MapBoundsListener = ({
  onBoundsChange,
}: {
  onBoundsChange?: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
}) => {
  const map = useMapEvents({
    load: () => {
      if (!onBoundsChange) return;
      const bounds = map.getBounds();
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      });
    },
    moveend: () => {
      if (!onBoundsChange) return;
      const bounds = map.getBounds();
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      });
    },
    zoomend: () => {
      if (!onBoundsChange) return;
      const bounds = map.getBounds();
      onBoundsChange({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      });
    },
  });

  useEffect(() => {
    if (!onBoundsChange) return;
    const bounds = map.getBounds();
    onBoundsChange({
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

export default function Map({
  stores,
  session,
  center,
  zoom,
  disabled,
  onBoundsChange,
}: {
  stores: StoreInterface[];
  session: Session;
  center?: LatLngExpression;
  zoom?: number;
  disabled?: boolean;
  onBoundsChange?: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
}) {
  const mapZoom = zoom ?? 15;
  const mapCenter = center ?? {
    lat: 9.074426322081734,
    lng: 7.477762699127198,
  };

  const MapInteractivityController = ({
    isDisabled,
  }: {
    isDisabled?: boolean;
  }) => {
    const map = useMap();
    useEffect(() => {
      if (!map) return;
      if (isDisabled) {
        map.dragging.disable();
        map.scrollWheelZoom.disable();
        map.doubleClickZoom.disable();
        map.boxZoom.disable();
        map.keyboard.disable();
        if (
          (map as unknown as { touchZoom?: { disable: () => void } }).touchZoom
        ) {
          (
            map as unknown as { touchZoom?: { disable: () => void } }
          ).touchZoom?.disable();
        }
      } else {
        map.dragging.enable();
        map.scrollWheelZoom.enable();
        map.doubleClickZoom.enable();
        map.boxZoom.enable();
        map.keyboard.enable();
        if (
          (map as unknown as { touchZoom?: { enable: () => void } }).touchZoom
        ) {
          (
            map as unknown as { touchZoom?: { enable: () => void } }
          ).touchZoom?.enable();
        }
      }
    }, [map, isDisabled]);
    return null;
  };

  return (
    <MapContainer
      zoom={mapZoom}
      center={mapCenter}
      style={{ width: '100%', height: '100%', zIndex: 0 }}
      placeholder={<MapPlaceHolder />}
    >
      <MapInteractivityController isDisabled={disabled} />
      <MapBoundsListener onBoundsChange={onBoundsChange} />
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
