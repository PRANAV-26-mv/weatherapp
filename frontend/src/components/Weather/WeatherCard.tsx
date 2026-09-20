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
import { translate, translateWeatherCondition, getLocalizedWeatherSpeechText } from '../../services/i18n';

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
  const speechText = getLocalizedWeatherSpeechText(weather, langCode);
  const conditionDisplay = translateWeatherCondition(weather.conditionText, langCode);

  return (
    <div className="glass-card p-4 sm:p-5 relative overflow-hidden group">
      {/* Dynamic Background Glow Based on Temperature */}
      <div 
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none transition-colors duration-700"
        style={{
          background: weather.tempC > 32 ? '#FF9933' : weather.tempC < 18 ? '#000080' : '#138808'
        }}
      />

      {/* Card Header: Location & Timestamp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-saffron" />
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {weather.locationName}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-md glass-pill text-slate-700 dark:text-gray-300 font-medium">
              {weather.country}
            </span>

            {/* Permanent Location Badge / Pin Button */}
            {isPermanentHome ? (
              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-saffron text-black shadow-md animate-pulse">
                <span>🏠 {translate('permanent_home_location', langCode)}</span>
              </span>
            ) : onSetPermanentHome ? (
              <button
                type="button"
                onClick={() => onSetPermanentHome(weather.locationName, weather.coords.lat, weather.coords.lon)}
                className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-saffron/20 hover:bg-saffron text-saffron hover:text-black border border-saffron/40 transition-all cursor-pointer"
                title={translate('set_permanent_home', langCode)}
              >
                <span>📌 {translate('set_permanent_home', langCode)}</span>
              </button>
            ) : null}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-gray-400 mt-1 flex flex-wrap items-center gap-1.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-saffron" />
              <span>Updated: {weather.lastUpdated}</span>
            </span>
            <span className="text-saffron font-semibold">• Live Open-Meteo Sensor</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <VoiceButton mode="output" textToSpeak={speechText} langCode={langCode} />
          <div className="px-2.5 py-1 rounded-full bg-saffron/10 border border-saffron/30 text-saffron text-[10px] font-semibold flex items-center gap-1 shadow-xs">
            <ShieldAlert className="w-3 h-3" />
            <span>{translate('grounded_weather_ai', langCode)}</span>
          </div>
        </div>
      </div>

      {/* Main Temp & Condition Hero Block */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center mb-3.5">
        <div className="flex items-center gap-3">
          <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tighter font-heading text-slate-900 dark:text-white">
            {weather.tempC}°<span className="text-2xl font-light text-saffron">C</span>
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-slate-600 dark:text-gray-400 font-medium">
              {translate('feels_like', langCode)} <strong className="text-slate-900 dark:text-white">{weather.feelsLikeC}°C</strong>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-gray-500">
              ({weather.tempF}°F)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-sm">
          <div className="text-3xl animate-float">
            {weather.conditionText.includes('Sun') || weather.conditionText.includes('Clear') ? '☀️' :
             weather.conditionText.includes('Rain') ? '🌧️' :
             weather.conditionText.includes('Thunder') ? '⚡' : '⛅'}
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {conditionDisplay}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-gray-400">
              {translate('cloud_cover', langCode)}: {weather.cloudCoverPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Weather Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5">
        <div className="bg-slate-100/80 dark:bg-white/5 p-2 sm:p-2.5 rounded-xl border border-slate-200/70 dark:border-white/5 flex flex-col items-center text-center shadow-xs">
          <Droplets className="w-3.5 h-3.5 text-blue-500 mb-0.5" />
          <span className="text-[10px] text-slate-500 dark:text-gray-400 font-medium">{translate('humidity', langCode)}</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">{weather.humidity}%</span>
        </div>

        <div className="bg-slate-100/80 dark:bg-white/5 p-2 sm:p-2.5 rounded-xl border border-slate-200/70 dark:border-white/5 flex flex-col items-center text-center shadow-xs">
          <Wind className="w-3.5 h-3.5 text-emerald-500 mb-0.5" />
          <span className="text-[10px] text-slate-500 dark:text-gray-400 font-medium">{translate('wind_speed', langCode)}</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">{weather.windSpeedKmh} <span className="text-[9px] font-normal text-slate-500 dark:text-gray-400">km/h</span></span>
        </div>

        <div className="bg-slate-100/80 dark:bg-white/5 p-2 sm:p-2.5 rounded-xl border border-slate-200/70 dark:border-white/5 flex flex-col items-center text-center shadow-xs">
          <Compass className="w-3.5 h-3.5 text-saffron mb-0.5" />
          <span className="text-[10px] text-slate-500 dark:text-gray-400 font-medium">{translate('direction', langCode)}</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">{weather.windDirectionText}</span>
        </div>

        <div className="bg-slate-100/80 dark:bg-white/5 p-2 sm:p-2.5 rounded-xl border border-slate-200/70 dark:border-white/5 flex flex-col items-center text-center shadow-xs">
          <Gauge className="w-3.5 h-3.5 text-purple-500 mb-0.5" />
          <span className="text-[10px] text-slate-500 dark:text-gray-400 font-medium">{translate('pressure', langCode)}</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">{weather.pressureHpa} <span className="text-[9px] font-normal text-slate-500 dark:text-gray-400">hPa</span></span>
        </div>

        <div className="bg-slate-100/80 dark:bg-white/5 p-2 sm:p-2.5 rounded-xl border border-slate-200/70 dark:border-white/5 flex flex-col items-center text-center shadow-xs">
          <Sun className="w-3.5 h-3.5 text-yellow-500 mb-0.5" />
          <span className="text-[10px] text-slate-500 dark:text-gray-400 font-medium">{translate('uv_index', langCode)}</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">{weather.uvIndex}</span>
        </div>

        <div className="bg-slate-100/80 dark:bg-white/5 p-2 sm:p-2.5 rounded-xl border border-slate-200/70 dark:border-white/5 flex flex-col items-center text-center shadow-xs">
          <Eye className="w-3.5 h-3.5 text-cyan-500 mb-0.5" />
          <span className="text-[10px] text-slate-500 dark:text-gray-400 font-medium">{translate('visibility', langCode)}</span>
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-0.5">{weather.visibilityKm} <span className="text-[9px] font-normal text-slate-500 dark:text-gray-400">km</span></span>
        </div>
      </div>

      {/* Easy Plain-Language Daily Practical Tips */}
      <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-white/10">
        <div className="text-[10px] font-bold text-saffron uppercase tracking-wider mb-2">
          {translate('easy_daily_advice', langCode)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {weather.tempC > 32 ? (
            <span className="px-2.5 py-1 rounded-lg bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-500/30 text-xs font-semibold flex items-center gap-1">
              {translate('high_heat_tip', langCode)}
            </span>
          ) : weather.tempC < 20 ? (
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1">
              {translate('cool_weather_tip', langCode)}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1">
              {translate('pleasant_weather_tip', langCode)}
            </span>
          )}

          {weather.humidity > 70 && (
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1">
              {translate('high_humidity_tip', langCode)}
            </span>
          )}

          {weather.windSpeedKmh > 20 && (
            <span className="px-2.5 py-1 rounded-lg bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border border-yellow-500/30 text-xs font-semibold flex items-center gap-1">
              {translate('gusty_winds_tip', langCode)}
            </span>
          )}
        </div>
      </div>

      {/* Sun Schedule */}
      <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <Sunrise className="w-4 h-4 text-amber-500" />
          <span>{translate('sunrise', langCode)}: <strong className="text-slate-900 dark:text-white">{weather.sunrise} AM</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Sunset className="w-4 h-4 text-orange-500" />
          <span>{translate('sunset', langCode)}: <strong className="text-slate-900 dark:text-white">{weather.sunset} PM</strong></span>
        </div>
      </div>
    </div>
  );
};
