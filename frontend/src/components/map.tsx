'use client';

import { useEffect, useState } from 'react';
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
import StoreDetailsDialog from '~/components/store-dialog';

const MapPlaceHolder = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <noscript>You need to enable JavaScript to see this map.</noscript>
    </div>
  );
};

const MapBoundsListener = ({
  onBoundsChangeAction,
}: {
  onBoundsChangeAction?: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
}) => {
  const map = useMapEvents({
    load: () => {
      if (!onBoundsChangeAction) return;
      const bounds = map.getBounds();
      onBoundsChangeAction({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      });
    },
    moveend: () => {
      if (!onBoundsChangeAction) return;
      const bounds = map.getBounds();
      onBoundsChangeAction({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      });
    },
    zoomend: () => {
      if (!onBoundsChangeAction) return;
      const bounds = map.getBounds();
      onBoundsChangeAction({
        minLat: bounds.getSouth(),
        maxLat: bounds.getNorth(),
        minLng: bounds.getWest(),
        maxLng: bounds.getEast(),
      });
    },
  });

  useEffect(() => {
    if (!onBoundsChangeAction) return;
    const bounds = map.getBounds();
    onBoundsChangeAction({
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLng: bounds.getWest(),
      maxLng: bounds.getEast(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const MapFlyToController = ({
  target,
  onComplete,
}: {
  target?: { lat: number; lng: number; zoom?: number };
  onComplete?: () => void;
}) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !target) return;
    const z = typeof target.zoom === 'number' ? target.zoom : map.getZoom();
    map.flyTo([target.lat, target.lng], z, { animate: true });
    const handler = () => {
      onComplete?.();
    };
    map.once('moveend', handler);
    return () => {
      map.off('moveend', handler);
    };
  }, [map, target, onComplete]);
  return null;
};

export default function AppMap({
  stores,
  session,
  center,
  zoom,
  onBoundsChangeAction,
  focus,
  onFocusComplete,
}: {
  stores: StoreInterface[];
  session: Session;
  center?: LatLngExpression;
  zoom?: number;
  onBoundsChangeAction?: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
  focus?: { lat: number; lng: number; zoom?: number };
  onFocusComplete?: () => void;
}) {
  const mapZoom = zoom ?? 15;
  const mapCenter = center ?? {
    lat: 9.074426322081734,
    lng: 7.477762699127198,
  };

  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<StoreInterface | null>(
    null,
  );

  return (
    <>
      <MapContainer
        zoom={mapZoom}
        center={mapCenter}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        placeholder={<MapPlaceHolder />}
      >
        <MapBoundsListener onBoundsChangeAction={onBoundsChangeAction} />
        <MapFlyToController target={focus} onComplete={onFocusComplete} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {stores.map((store) => (
          <Marker key={store.id} position={[store.latitude, store.longitude]}>
            <Popup>
              <button
                onClick={() => {
                  setSelectedStore(store);
                  setIsDetailsOpen(true);
                }}
                className="cursor-pointer text-left"
              >
                {store.name}
                <br />
                {store.store_type}
              </button>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <StoreDetailsDialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setSelectedStore(null);
        }}
        store={selectedStore}
      />
    </>
  );
}
