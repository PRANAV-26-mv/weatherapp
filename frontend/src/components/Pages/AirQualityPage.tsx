import React, { useEffect, useState } from 'react';
import type { CurrentWeatherData, AirQualityData } from '../../types';
import { getAirQuality } from '../../services/weatherApi';
import { Wind, HeartPulse } from 'lucide-react';

interface AirQualityPageProps {
  currentWeather: CurrentWeatherData;
}

export const AirQualityPage: React.FC<AirQualityPageProps> = ({ currentWeather }) => {
  const [aqiData, setAqiData] = useState<AirQualityData | null>(null);

  useEffect(() => {
    getAirQuality(currentWeather.coords.lat, currentWeather.coords.lon).then(setAqiData);
  }, [currentWeather]);

  if (!aqiData) {
    return (
      <div className="p-12 text-center text-saffron font-bold animate-pulse">
        Fetching live Copernicus & CPCB Air Quality telemetry...
      </div>
    );
  }

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return '#10B981'; // Good Green
    if (aqi <= 100) return '#F59E0B'; // Moderate Yellow
    if (aqi <= 150) return '#FF9933'; // Sensitive Saffron
    if (aqi <= 200) return '#EF4444'; // Unhealthy Red
    return '#8B5CF6'; // Hazardous Purple
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Wind className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white font-heading">
              Air Quality & Atmospheric Pollution
            </h2>
            <p className="text-xs text-gray-400">
              Live Air Quality Index (AQI) Telemetry for {currentWeather.locationName}
            </p>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 text-xs font-bold border border-cyan-500/30">
          CPCB & Copernicus Sensor Stream
        </div>
      </div>

      {/* Main AQI Meter Dial Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div
            className="w-36 h-36 rounded-full flex flex-col items-center justify-center border-8 shadow-2xl transition-all"
            style={{ borderColor: getAqiColor(aqiData.aqi) }}
          >
            <span className="text-4xl font-extrabold text-white font-heading">{aqiData.aqi}</span>
            <span className="text-[10px] uppercase font-bold text-gray-400">US AQI</span>
          </div>

          <div
            className="mt-4 px-4 py-1 rounded-full text-xs font-extrabold text-black uppercase"
            style={{ backgroundColor: getAqiColor(aqiData.aqi) }}
          >
            {aqiData.statusText}
          </div>
        </div>

        <div className="md:col-span-2 glass-card p-6 flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-2 text-saffron font-bold text-sm">
            <HeartPulse className="w-5 h-5 text-saffron" />
            <span>Health Advisory & Precautions</span>
          </div>

          <p className="text-sm text-gray-200 leading-relaxed font-medium">
            {aqiData.healthAdvice}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-gray-400 block text-[10px]">PM2.5</span>
              <strong className="text-white text-base">{aqiData.pm25} µg/m³</strong>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-gray-400 block text-[10px]">PM10</span>
              <strong className="text-white text-base">{aqiData.pm10} µg/m³</strong>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-gray-400 block text-[10px]">Ozone (O₃)</span>
              <strong className="text-white text-base">{aqiData.ozone} µg/m³</strong>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <span className="text-gray-400 block text-[10px]">NO₂</span>
              <strong className="text-white text-base">{aqiData.no2} µg/m³</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
