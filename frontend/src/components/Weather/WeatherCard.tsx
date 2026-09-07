import React from 'react';
import type { CurrentWeatherData } from '../../types';
import { 
  Wind, 
  Droplets, 
  Gauge, 
  Sun, 
  Eye, 
  Compass, 
  Sunrise, 
  Sunset, 
  MapPin, 
  ShieldAlert,
  Clock
} from 'lucide-react';
import { VoiceButton } from '../UI/VoiceButton';

interface WeatherCardProps {
  weather: CurrentWeatherData;
  langCode?: string;
  isPermanentHome?: boolean;
  onSetPermanentHome?: (name: string, lat: number, lon: number) => void;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  weather,
  langCode = 'en',
  isPermanentHome = false,
  onSetPermanentHome,
}) => {
  const speechText = `Current weather in ${weather.locationName} is ${weather.tempC} degrees Celsius, ${weather.conditionText}. Humidity is ${weather.humidity} percent with wind speed of ${weather.windSpeedKmh} kilometers per hour.`;

  return (
    <div className="glass-card p-5 md:p-6 relative overflow-hidden group">
      {/* Dynamic Background Glow Based on Temperature */}
      <div 
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none transition-colors duration-700"
        style={{
          background: weather.tempC > 32 ? '#FF9933' : weather.tempC < 18 ? '#000080' : '#138808'
        }}
      />

      {/* Card Header: Location & Timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <MapPin className="w-4 h-4 text-saffron" />
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {weather.locationName}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-md glass-pill text-gray-300 font-medium">
              {weather.country}
            </span>

            {/* Permanent Location Badge / Pin Button */}
            {isPermanentHome ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-saffron text-black shadow-md animate-pulse">
                <span>🏠 Permanent Home Location</span>
              </span>
            ) : onSetPermanentHome ? (
              <button
                type="button"
                onClick={() => onSetPermanentHome(weather.locationName, weather.coords.lat, weather.coords.lon)}
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-saffron/20 hover:bg-saffron text-saffron hover:text-black border border-saffron/40 transition-all cursor-pointer"
                title="Save as Permanent Home Location"
              >
                <span>📌 Set as Permanent Home</span>
              </button>
            ) : null}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3 text-saffron" />
            <span>Updated: {weather.lastUpdated}</span>
            <span className="text-saffron font-semibold ml-2">Live Open-Meteo Sensor</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <VoiceButton mode="output" textToSpeak={speechText} langCode={langCode} />
          <div className="px-2.5 py-1 rounded-full bg-saffron/10 border border-saffron/30 text-saffron text-[11px] font-semibold flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Grounded Weather AI</span>
          </div>
        </div>
      </div>

      {/* Main Temp & Condition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center mb-5">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl md:text-6xl font-extrabold text-white tracking-tighter font-heading">
            {weather.tempC}°<span className="text-2xl font-light text-saffron">C</span>
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">
              Feels like <strong className="text-white">{weather.feelsLikeC}°C</strong>
            </span>
            <span className="text-[10px] text-gray-500">
              ({weather.tempF}°F)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
          <div className="text-3xl animate-float">
            {weather.conditionText.includes('Sun') || weather.conditionText.includes('Clear') ? '☀️' :
             weather.conditionText.includes('Rain') ? '🌧️' :
             weather.conditionText.includes('Thunder') ? '⚡' : '⛅'}
          </div>
          <div>
            <div className="text-lg font-bold text-white">
              {weather.conditionText}
            </div>
            <div className="text-[11px] text-gray-400">
              Cloud cover: {weather.cloudCoverPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
          <Droplets className="w-4 h-4 text-blue-400 mb-1" />
          <span className="text-[10px] text-gray-400 font-medium">Humidity</span>
          <span className="text-sm font-bold text-white mt-0.5">{weather.humidity}%</span>
        </div>

        <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
          <Wind className="w-4 h-4 text-emerald-400 mb-1" />
          <span className="text-[10px] text-gray-400 font-medium">Wind</span>
          <span className="text-sm font-bold text-white mt-0.5">{weather.windSpeedKmh} <span className="text-[10px] font-normal text-gray-400">km/h</span></span>
        </div>

        <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
          <Compass className="w-4 h-4 text-saffron mb-1" />
          <span className="text-[10px] text-gray-400 font-medium">Direction</span>
          <span className="text-sm font-bold text-white mt-0.5">{weather.windDirectionText}</span>
        </div>

        <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
          <Gauge className="w-4 h-4 text-purple-400 mb-1" />
          <span className="text-[10px] text-gray-400 font-medium">Pressure</span>
          <span className="text-sm font-bold text-white mt-0.5">{weather.pressureHpa} <span className="text-[10px] font-normal text-gray-400">hPa</span></span>
        </div>

        <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
          <Sun className="w-4 h-4 text-yellow-400 mb-1" />
          <span className="text-[10px] text-gray-400 font-medium">UV Index</span>
          <span className="text-sm font-bold text-white mt-0.5">{weather.uvIndex}</span>
        </div>

        <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center text-center">
          <Eye className="w-4 h-4 text-cyan-400 mb-1" />
          <span className="text-[10px] text-gray-400 font-medium">Visibility</span>
          <span className="text-sm font-bold text-white mt-0.5">{weather.visibilityKm} <span className="text-[10px] font-normal text-gray-400">km</span></span>
        </div>
      </div>

      {/* Sun Schedule */}
      <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <Sunrise className="w-4 h-4 text-amber-400" />
          <span>Sunrise: <strong className="text-white">{weather.sunrise} AM</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Sunset className="w-4 h-4 text-orange-400" />
          <span>Sunset: <strong className="text-white">{weather.sunset} PM</strong></span>
        </div>
      </div>
    </div>
  );
};
