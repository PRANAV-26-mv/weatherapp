import React, { useState } from 'react';
import type { SavedLocation } from '../../types';
import { Bookmark, Plus, Trash2, Settings } from 'lucide-react';

interface LocationsSettingsPageProps {
  onSelectLocation: (name: string, lat: number, lon: number) => void;
  activeSubTab?: 'locations' | 'settings';
  onSelectTab?: (tabId: string) => void;
}

export const LocationsSettingsPage: React.FC<LocationsSettingsPageProps> = ({
  onSelectLocation,
  activeSubTab = 'locations',
  onSelectTab,
}) => {
  const [subTab, setSubTab] = useState<'locations' | 'settings' | 'all'>(activeSubTab);

  React.useEffect(() => {
    setSubTab(activeSubTab);
  }, [activeSubTab]);

  const handleTabChange = (newTab: 'locations' | 'settings' | 'all') => {
    setSubTab(newTab);
    if (onSelectTab && newTab !== 'all') {
      onSelectTab(newTab);
    }
  };

  const [locations, setLocations] = useState<SavedLocation[]>([
    { id: '1', name: 'Home (Mumbai)', category: 'Home', lat: 19.076, lon: 72.8777, alertRadiusKm: 50, currentTempC: 29, conditionText: 'Partly Cloudy ⛅' },
    { id: '2', name: 'College (Bengaluru)', category: 'College', lat: 12.9716, lon: 77.5946, alertRadiusKm: 25, currentTempC: 26, conditionText: 'Clear Sky ☀️' },
    { id: '3', name: 'Ancestral Farm (Punjab)', category: 'Farm', lat: 30.901, lon: 75.8573, alertRadiusKm: 100, currentTempC: 32, conditionText: 'Overcast ☁️' },
  ]);

  const [newCityName, setNewCityName] = useState('');
  const [newCategory, setNewCategory] = useState<'Home' | 'College' | 'Work' | 'Farm' | 'Travel' | 'Custom'>('Home');

  const [notifications, setNotifications] = useState({
    severeWeather: true,
    cyclones: true,
    heavyRain: true,
    floods: true,
    lightning: true,
    extremeHeat: false,
    dailyForecast: true,
  });

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    const newLoc: SavedLocation = {
      id: `loc-${Date.now()}`,
      name: newCityName,
      category: newCategory,
      lat: 28.6139,
      lon: 77.209,
      alertRadiusKm: 50,
      currentTempC: 28,
      conditionText: 'Partly Cloudy ⛅',
    };
    setLocations([...locations, newLoc]);
    setNewCityName('');
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter((l) => l.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Tab Switcher Header */}
      <div className="flex p-1.5 glass-panel rounded-2xl border border-white/10 w-fit gap-2">
        <button
          onClick={() => handleTabChange('locations')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            subTab === 'locations' || subTab === 'all'
              ? 'bg-saffron text-black shadow-lg shadow-saffron/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Monitored Locations 🔖</span>
        </button>

        <button
          onClick={() => handleTabChange('settings')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            subTab === 'settings'
              ? 'bg-saffron text-black shadow-lg shadow-saffron/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Alert Preferences & Geofencing ⚙️</span>
        </button>
      </div>

      {/* Saved Locations Section */}
      {(subTab === 'locations' || subTab === 'all') && (
        <div className="space-y-4">
          <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-saffron/20 text-saffron border border-saffron/40">
                <Bookmark className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  Saved Monitored Locations
                </h2>
                <p className="text-xs text-gray-400">
                  Manage home, farm, workplace, and college weather geofences
                </p>
              </div>
            </div>
          </div>

          {/* Add Location Form */}
          <form onSubmit={handleAddLocation} className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Enter city name (e.g., Chennai, Delhi)..."
              value={newCityName}
              onChange={(e) => setNewCityName(e.target.value)}
              className="glass-input flex-1 text-xs px-4 py-2.5 rounded-xl border border-white/15 focus:border-saffron"
            />

            <select
              value={newCategory}
              onChange={(e: any) => setNewCategory(e.target.value)}
              className="glass-input text-xs px-3 py-2.5 rounded-xl border border-white/15 bg-black/60"
            >
              <option value="Home">Home</option>
              <option value="College">College</option>
              <option value="Work">Work</option>
              <option value="Farm">Farm</option>
              <option value="Custom">Custom</option>
            </select>

            <button type="submit" className="saffron-gradient-btn px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
            </button>
          </form>

          {/* Locations List */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="glass-card p-5 space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-saffron/20 text-saffron border border-saffron/40">
                    {loc.category}
                  </span>
                  <button
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="text-gray-500 hover:text-red-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">{loc.name}</h3>
                  <p className="text-xs text-gray-400">{loc.conditionText} • {loc.currentTempC}°C</p>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Radius: {loc.alertRadiusKm} km</span>
                  <button
                    onClick={() => onSelectLocation(loc.name, loc.lat, loc.lon)}
                    className="text-saffron font-bold hover:underline"
                  >
                    View Intel →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settings & Alert Preferences */}
      {(subTab === 'settings' || subTab === 'all') && (
        <div className="glass-card p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <Settings className="w-6 h-6 text-saffron" />
            <h3 className="text-xl font-bold text-white font-heading">
              Emergency Notification & Geofence Settings
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {Object.entries(notifications).map(([key, val]) => (
              <label key={key} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-saffron/40">
                <span className="capitalize font-medium text-gray-200">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <input
                  type="checkbox"
                  checked={val}
                  onChange={() => setNotifications({ ...notifications, [key]: !val })}
                  className="w-4 h-4 accent-saffron"
                />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
