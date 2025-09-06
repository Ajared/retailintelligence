'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
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
  onBoundsChangeAction,
  shouldSuppress,
  consumeSuppress,
}: {
  onBoundsChangeAction?: (bounds: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  }) => void;
  shouldSuppress?: () => boolean;
  consumeSuppress?: () => void;
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
      if (shouldSuppress?.()) {
        consumeSuppress?.();
        return;
      }
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
      if (shouldSuppress?.()) {
        consumeSuppress?.();
        return;
      }
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
  activateSuppress,
}: {
  target?: { lat: number; lng: number; zoom?: number };
  onComplete?: () => void;
  activateSuppress?: () => void;
}) => {
  const map = useMap();
  useEffect(() => {
    if (!map || !target) return;
    const z = typeof target.zoom === 'number' ? target.zoom : map.getZoom();
    activateSuppress?.();
    map.flyTo([target.lat, target.lng], z, { animate: true });
    const handler = () => {
      onComplete?.();
    };
    map.once('moveend', handler);
    return () => {
      map.off('moveend', handler);
    };
  }, [map, target, onComplete, activateSuppress]);
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
  highlightedStore,
  activeStoreId,
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
  highlightedStore?: StoreInterface | null;
  activeStoreId?: string | number | null;
}) {
  const mapZoom = zoom ?? 15;
  const mapCenter = center ?? {
    lat: 9.074426322081734,
    lng: 7.477762699127198,
  };

  type MarkerInstance = {
    openPopup?: () => void;
  } | null;
  const markerRefs = useRef(new Map<string | number, MarkerInstance>());
  const suppressEventTokensRef = useRef(0);
  const shouldSuppressNextBounds = () => suppressEventTokensRef.current > 0;
  const consumeSuppressNextBounds = () => {
    if (suppressEventTokensRef.current > 0) {
      suppressEventTokensRef.current -= 1;
    }
  };
  const activateSuppressNextBounds = () => {
    // Suppress both moveend and zoomend that can be triggered by flyTo
    suppressEventTokensRef.current = 2;
  };

  useEffect(() => {
    if (activeStoreId == null) return;
    const ref = markerRefs.current.get(activeStoreId);
    if (ref && typeof ref.openPopup === 'function') {
      ref.openPopup();
    }
  }, [activeStoreId]);

  const FocusedMarker = ({ store }: { store: StoreInterface }) => {
    const ref = useRef<MarkerInstance>(null);
    useEffect(() => {
      if (ref.current && typeof ref.current.openPopup === 'function') {
        ref.current.openPopup();
      }
    }, [store?.id]);
    return (
      <Marker ref={ref} position={[store.latitude, store.longitude]}>
        {session.user.role === 'admin' ||
        session.user.role === 'super_admin' ? (
          <Popup>
            <Link href={`/admin/stores/${store.id}`} className="cursor-pointer">
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
    );
  };

  return (
    <MapContainer
      zoom={mapZoom}
      center={mapCenter}
      style={{ width: '100%', height: '100%', zIndex: 0 }}
      placeholder={<MapPlaceHolder />}
    >
      <MapBoundsListener
        onBoundsChangeAction={onBoundsChangeAction}
        shouldSuppress={shouldSuppressNextBounds}
        consumeSuppress={consumeSuppressNextBounds}
      />
      <MapFlyToController
        target={focus}
        onComplete={onFocusComplete}
        activateSuppress={activateSuppressNextBounds}
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stores.map((store) => (
        <Marker
          key={store.id}
          ref={(instance) => {
            if (instance) {
              markerRefs.current.set(store.id as string | number, instance);
            } else {
              markerRefs.current.delete(store.id as string | number);
            }
          }}
          position={[store.latitude, store.longitude]}
        >
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
      {highlightedStore &&
        !stores.some((s) => s.id === highlightedStore.id) && (
          <FocusedMarker store={highlightedStore} />
        )}
    </MapContainer>
  );
}
