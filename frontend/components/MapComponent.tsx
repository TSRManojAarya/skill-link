import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { User } from '../types';
import { ShieldCheck, Star } from 'lucide-react';

// Fix Leaflet default icon issue in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const createCustomIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const blueIcon = createCustomIcon('blue'); // Seekers/Self
const greenIcon = createCustomIcon('green'); // Verified Providers
const orangeIcon = createCustomIcon('orange'); // Unverified Providers

interface MapComponentProps {
  center: { lat: number; lng: number };
  providers: User[];
  currentUserLocation?: { lat: number; lng: number };
  onSelectProvider?: (provider: User) => void;
  selectedProviderId?: string | null;
}

const MapUpdater = ({ center }: { center: { lat: number; lng: number } }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({
  center,
  providers,
  currentUserLocation,
  onSelectProvider,
  selectedProviderId
}) => {
  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      className="w-full h-full rounded-lg shadow-inner z-0"
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={center} />

      {/* Current User Location */}
      {currentUserLocation && (
        <Marker position={[currentUserLocation.lat, currentUserLocation.lng]} icon={blueIcon}>
          <Popup>
            <div className="font-semibold text-center">You are here</div>
          </Popup>
        </Marker>
      )}

      {/* Providers */}
      {providers.filter(p => p.location && p.location.lat && p.location.lng).map((provider) => (
        <Marker
          key={provider.id}
          position={[provider.location!.lat, provider.location!.lng]}
          icon={provider.isVerified ? greenIcon : orangeIcon}
          eventHandlers={{
            click: () => onSelectProvider && onSelectProvider(provider),
          }}
          opacity={selectedProviderId && selectedProviderId !== provider.id ? 0.6 : 1}
        >
          <Popup>
            <div className="p-1 min-w-[150px]">
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={provider.avatarUrl}
                  alt={provider.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{provider.name}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                    <span>4.8 (12)</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {provider.skills?.slice(0, 2).map(skill => (
                  <span key={skill} className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] rounded">
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{provider.bio}</p>
              {provider.isVerified && (
                <div className="mt-2 flex items-center text-green-600 text-xs font-medium">
                  <ShieldCheck className="w-3 h-3 mr-1" /> Verified Pro
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
