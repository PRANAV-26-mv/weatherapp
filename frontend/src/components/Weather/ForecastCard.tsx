import React, { useState } from 'react';
import type { HourlyForecastItem, DailyForecastItem } from '../../types';
import { Calendar, Clock, Umbrella, Wind, Sun } from 'lucide-react';

interface ForecastCardProps {
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}

export const ForecastCard: React.FC<ForecastCardProps> = ({ hourly, daily }) => {
  const [activeTab, setActiveTab] = useState<'hourly' | 'daily'>('hourly');

  return (
    <div className="glass-card p-5 md:p-6 relative">
      {/* Card Header & Tab Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-saffron" />
          <h3 className="text-lg font-bold text-white font-heading">
            Meteorological Forecast
          </h3>
        </div>

        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('hourly')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'hourly' ? 'bg-saffron text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            Hourly (24h)
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'daily' ? 'bg-saffron text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            7-Day Forecast
          </button>
        </div>
      </div>

      {/* Hourly View */}
      {activeTab === 'hourly' && (
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Clock className="w-3.5 h-3.5 text-saffron" />
            <span>Scroll horizontally to view 24-hour meteorological trends</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 pt-1 scrollbar-thin">
            {hourly.map((item, idx) => (
              <div
                key={idx}
                className="flex-none w-24 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-saffron/40 flex flex-col items-center text-center transition-all group hover:-translate-y-1"
              >
                <span className="text-xs font-semibold text-gray-300">{item.time}</span>
                <div className="my-2 text-2xl group-hover:scale-110 transition-transform">
                  {item.conditionText.includes('Sun') || item.conditionText.includes('Clear') ? '☀️' :
                   item.conditionText.includes('Rain') ? '🌧️' :
                   item.conditionText.includes('Thunder') ? '⚡' : '⛅'}
                </div>
                <span className="text-base font-extrabold text-white">{item.tempC}°C</span>

                {/* Rain Probability Pill */}
                <div className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] text-blue-300 bg-blue-500/10 py-0.5 px-1.5 rounded-full">
                  <Umbrella className="w-2.5 h-2.5" />
                  <span>{item.rainProbabilityPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily View Table */}
      {activeTab === 'daily' && (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase text-[10px] tracking-wider bg-white/5">
                <th className="py-3 px-4 w-4/12 rounded-tl-xl">Day & Condition</th>
                <th className="py-3 px-4 w-2/12">Precipitation</th>
                <th className="py-3 px-4 w-2/12">Wind Speed</th>
                <th className="py-3 px-4 w-2/12">UV Index</th>
                <th className="py-3 px-4 w-2/12 rounded-tr-xl text-right">Temp Range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {daily.map((item, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {item.conditionText.includes('Sun') || item.conditionText.includes('Clear') ? '☀️' :
                         item.conditionText.includes('Rain') ? '🌧️' :
                         item.conditionText.includes('Thunder') ? '⚡' : '⛅'}
                      </span>
                      <div>
                        <div className="font-bold text-white text-sm">{item.dayName}</div>
                        <div className="text-[11px] text-gray-400">{item.conditionText}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-blue-300 font-medium">
                      <Umbrella className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{item.rainProbabilityPct}% ({item.precipitationMm} mm)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-emerald-300 font-medium">
                      <Wind className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item.windSpeedKmh} km/h</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 text-amber-300 font-medium">
                      <Sun className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                      <span>UV {item.uvIndex}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <span className="text-gray-400 font-medium">{item.minTempC}°</span>
                      <div className="w-16 h-2 rounded-full bg-white/10 overflow-hidden relative">
                        <div 
                          className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-400 via-saffron to-red-500 rounded-full"
                          style={{ left: '15%', right: '15%' }}
                        />
                      </div>
                      <span className="font-bold text-white">{item.maxTempC}°</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
