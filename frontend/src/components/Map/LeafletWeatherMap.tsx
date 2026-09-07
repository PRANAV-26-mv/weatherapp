import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polygon } from 'react-leaflet';
import L from 'leaflet';
import type { WeatherCoordinates, DisasterAlertEvent } from '../../types';
import { ShieldAlert, Navigation, Globe } from 'lucide-react';

const customMarkerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface LeafletWeatherMapProps {
  center: WeatherCoordinates;
  locationName: string;
  alerts?: DisasterAlertEvent[];
  height?: string;
}

export const LeafletWeatherMap: React.FC<LeafletWeatherMapProps> = ({
  center,
  locationName,
  alerts = [],
  height = '400px',
}) => {
  const [activeLayer, setActiveLayer] = useState<'temp' | 'rain' | 'wind' | 'emergency'>('emergency');
  const [baseMap, setBaseMap] = useState<'satellite' | 'dark' | 'street'>('satellite');

  const mumbaiPolygon: [number, number][] = [
    [19.25, 72.75],
    [19.30, 72.95],
    [18.90, 73.05],
    [18.85, 72.80],
  ];

  // Map Tile URL configuration
  const tileConfig = {
    satellite: {
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', // Google Maps Satellite Hybrid (Satellite + Labels)
      attribution: '&copy; Google Maps Satellite Imagery',
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    },
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap contributors',
    },
  };

  return (
    <div className="glass-card p-4 relative overflow-hidden flex flex-col">
      {/* Map Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 z-10 bg-black/50 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
        {/* Base Map Switcher: Satellite / Dark / Street */}
        <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setBaseMap('satellite')}
            className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
              baseMap === 'satellite' ? 'bg-saffron text-black shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Google Satellite View 🛰️</span>
          </button>

          <button
            onClick={() => setBaseMap('dark')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              baseMap === 'dark' ? 'bg-saffron text-black shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            Dark GIS
          </button>

          <button
            onClick={() => setBaseMap('street')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              baseMap === 'street' ? 'bg-saffron text-black shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            Street Map
          </button>
        </div>

        {/* Meteorological Layer Selector */}
        <div className="flex gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveLayer('emergency')}
            className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              activeLayer === 'emergency'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                : 'bg-white/5 text-gray-300 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Active Emergencies</span>
          </button>

          <button
            onClick={() => setActiveLayer('temp')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeLayer === 'temp' ? 'bg-saffron text-black font-bold' : 'bg-white/5 text-gray-300 hover:text-white'
            }`}
          >
            Temperature Heatmap
          </button>

          <button
            onClick={() => setActiveLayer('rain')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeLayer === 'rain' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-300 hover:text-white'
            }`}
          >
            Rainfall / Radar
          </button>

          <button
            onClick={() => setActiveLayer('wind')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              activeLayer === 'wind' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-gray-300 hover:text-white'
            }`}
          >
            Wind Vectors
          </button>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div style={{ height, width: '100%' }} className="rounded-xl overflow-hidden z-0 relative shadow-2xl">
        <MapContainer
          key={baseMap} // Force tile re-render on base map toggle
          center={[center.lat, center.lon]}
          zoom={9}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          {/* Active Base Map Tile Layer */}
          <TileLayer
            attribution={tileConfig[baseMap].attribution}
            url={tileConfig[baseMap].url}
          />

          {/* Current Monitored Location Marker */}
          <Marker position={[center.lat, center.lon]} icon={customMarkerIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <strong className="text-saffron block text-sm font-bold">{locationName}</strong>
                <div>Monitored Location Coordinates:</div>
                <div className="font-mono text-gray-300">{center.lat.toFixed(4)}° N, {center.lon.toFixed(4)}° E</div>
                <div className="mt-1 text-[10px] text-emerald-400 font-semibold">Live Open-Meteo Satellite Feed Active ({alerts.length} Warnings)</div>
              </div>
            </Popup>
          </Marker>

          {activeLayer === 'emergency' && (
            <>
              <Circle
                center={[center.lat, center.lon]}
                radius={50000}
                pathOptions={{
                  color: '#EF4444',
                  fillColor: '#EF4444',
                  fillOpacity: 0.25,
                  dashArray: '8 8',
                }}
              />
              <Polygon
                positions={mumbaiPolygon}
                pathOptions={{
                  color: '#DC2626',
                  fillColor: '#DC2626',
                  fillOpacity: 0.45,
                  weight: 3,
                }}
              >
                <Popup>
                  <div className="text-xs">
                    <strong className="text-red-500 block font-bold text-sm">IMD Severe Warning Polygon</strong>
                    <div>Heavy Rainfall & Coastal Surge Threat Zone</div>
                    <div className="text-[10px] text-gray-400 mt-1">Severity: WARNING 🔴</div>
                  </div>
                </Popup>
              </Polygon>
            </>
          )}

          {activeLayer === 'temp' && (
            <Circle
              center={[center.lat, center.lon]}
              radius={80000}
              pathOptions={{
                color: '#FF9933',
                fillColor: '#FF9933',
                fillOpacity: 0.35,
              }}
            />
          )}

          {activeLayer === 'rain' && (
            <Circle
              center={[center.lat, center.lon]}
              radius={60000}
              pathOptions={{
                color: '#3B82F6',
                fillColor: '#3B82F6',
                fillOpacity: 0.4,
              }}
            />
          )}
        </MapContainer>
      </div>

      {/* Map Legend Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-gray-400 px-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping inline-block" />
            <span>Emergency Zone</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-saffron inline-block" />
            <span>50km Radial Radius</span>
          </span>
          <span className="text-saffron font-bold">Base: {baseMap.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Navigation className="w-3 h-3 text-saffron" />
          <span>Coordinates: {center.lat.toFixed(2)}°N, {center.lon.toFixed(2)}°E</span>
        </div>
      </div>
    </div>
  );
};
