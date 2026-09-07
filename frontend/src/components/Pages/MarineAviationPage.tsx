import React from 'react';
import type { CurrentWeatherData, MarineWeatherData, AviationWeatherData } from '../../types';
import { getMarineWeather } from '../../services/weatherApi';
import { Anchor, Plane } from 'lucide-react';

interface MarineAviationPageProps {
  currentWeather: CurrentWeatherData;
  activeSubTab?: 'marine' | 'aviation';
  onSelectTab?: (tabId: string) => void;
}

export const MarineAviationPage: React.FC<MarineAviationPageProps> = ({
  currentWeather,
  activeSubTab = 'marine',
  onSelectTab,
}) => {
  const [subTab, setSubTab] = React.useState<'marine' | 'aviation'>(activeSubTab);
  const [marine, setMarine] = React.useState<MarineWeatherData | null>(null);

  React.useEffect(() => {
    setSubTab(activeSubTab);
  }, [activeSubTab]);

  React.useEffect(() => {
    getMarineWeather(currentWeather.coords.lat, currentWeather.coords.lon).then(setMarine);
  }, [currentWeather]);

  const handleTabChange = (newTab: 'marine' | 'aviation') => {
    setSubTab(newTab);
    if (onSelectTab) {
      onSelectTab(newTab);
    }
  };

  const aviationSample: AviationWeatherData = {
    icaoCode: 'VABB',
    airportName: 'Chhatrapati Shivaji Maharaj International Airport (Mumbai)',
    flightCategory: 'VFR',
    metarRaw: 'VABB 070730Z 24008KT 9999 FEW020 29/24 Q1012 NOSIG',
    tafRaw: 'TAF VABB 070500Z 0706/0812 24010KT 8000 SCT025 TEMPO 0712/0716 4000 SHRA FEW015CB',
    visibilityMiles: 6,
    windKnots: 8,
    cloudCeilingFt: 2000,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Interactive Sub-Tab Selector Header */}
      <div className="flex p-1.5 glass-panel rounded-2xl border border-white/10 w-fit gap-2">
        <button
          onClick={() => handleTabChange('marine')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            subTab === 'marine'
              ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Anchor className="w-4 h-4" />
          <span>Marine Weather & Swell 🌊</span>
        </button>

        <button
          onClick={() => handleTabChange('aviation')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            subTab === 'aviation'
              ? 'bg-saffron text-black shadow-lg shadow-saffron/20'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Plane className="w-4 h-4" />
          <span>Aviation Weather (METAR & TAF) ✈️</span>
        </button>
      </div>

      {/* Marine Weather Section */}
      {subTab === 'marine' && (
        <div className="space-y-4">
          <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-cyan-500">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <Anchor className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  Marine & Coastal Meteorological Intelligence
                </h2>
                <p className="text-xs text-gray-400">
                  Ocean Swell, Waves, Sea Temperature & Coastal Warnings for Fishermen
                </p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
              INCOIS & Open-Meteo Marine Stream
            </div>
          </div>

          {marine ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="glass-card p-4 space-y-1">
                <span className="text-gray-400 font-medium">Significant Wave Height</span>
                <div className="text-2xl font-extrabold text-white font-heading">{marine.waveHeightM} meters</div>
                <span className="text-[10px] text-emerald-400">Moderate Sea Condition</span>
              </div>

              <div className="glass-card p-4 space-y-1">
                <span className="text-gray-400 font-medium">Swell Direction & Period</span>
                <div className="text-2xl font-extrabold text-white font-heading">{marine.swellDirection} ({marine.swellPeriodSec}s)</div>
                <span className="text-[10px] text-gray-300">South-West Swell Train</span>
              </div>

              <div className="glass-card p-4 space-y-1">
                <span className="text-gray-400 font-medium">Sea Surface Temp</span>
                <div className="text-2xl font-extrabold text-white font-heading">{marine.seaTemperatureC}°C</div>
                <span className="text-[10px] text-amber-400">Warm Coastal Shelf</span>
              </div>

              <div className="glass-card p-4 space-y-1">
                <span className="text-gray-400 font-medium">Tide Phase</span>
                <div className="text-2xl font-extrabold text-white font-heading">{marine.tideState}</div>
                <span className="text-[10px] text-cyan-400">Next Low Tide: 14:20 IST</span>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-cyan-400 font-bold text-xs animate-pulse">
              Loading ocean swell and marine telemetry...
            </div>
          )}
        </div>
      )}

      {/* Aviation Weather Section */}
      {subTab === 'aviation' && (
        <div className="space-y-4">
          <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-saffron">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-saffron/20 text-saffron border border-saffron/40">
                <Plane className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white font-heading">
                  Aviation Weather (METAR & TAF Reports)
                </h2>
                <p className="text-xs text-gray-400">
                  Operational Airport Telemetry for {aviationSample.airportName}
                </p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
              Category: {aviationSample.flightCategory} (Visual Flight Rules)
            </div>
          </div>

          <div className="glass-card p-6 space-y-4 text-xs">
            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">
                Raw METAR Stream ({aviationSample.icaoCode}):
              </span>
              <div className="p-3 rounded-xl bg-black/60 font-mono text-saffron border border-white/10 text-xs">
                {aviationSample.metarRaw}
              </div>
            </div>

            <div>
              <span className="text-gray-400 font-bold uppercase tracking-wider block mb-1">
                Terminal Aerodrome Forecast (TAF):
              </span>
              <div className="p-3 rounded-xl bg-black/60 font-mono text-emerald-400 border border-white/10 text-xs">
                {aviationSample.tafRaw}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
