import {
  Popup,
  Marker,
  TileLayer,
  useMapEvents,
  MapContainer,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import { LatLngExpression } from 'leaflet';
import { StoreInterface } from '~/types/store';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

const MapPlaceHolder = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <noscript>You need to enable JavaScript to see this map.</noscript>
    </div>
  );
};

function MapEvents() {
  useMapEvents({
    moveend: (e) => {
      const center = e.target.getCenter();
      console.log('Map center position:', {
        lat: center.lat,
        lng: center.lng,
      });
    },
  });
  return null;
}

export default function Map({ stores }: { stores: StoreInterface[] }) {
  const defaultZoom = 13;
  const defaultCenter: LatLngExpression = {
    lat: 9.061668914676945,
    lng: -352.5247478485108,
  };

  return (
    <MapContainer
      zoom={defaultZoom}
      center={defaultCenter}
      style={{ width: '100%', height: '100%', zIndex: 0 }}
      placeholder={<MapPlaceHolder />}
    >
      <MapEvents />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stores.map((store) => (
        <Marker key={store.id} position={[store.latitude, store.longitude]}>
          <Popup>
            {store.name}
            <br />
            {store.store_type}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
