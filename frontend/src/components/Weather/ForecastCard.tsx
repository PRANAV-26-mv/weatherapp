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
    <div className="glass-card p-4 sm:p-5 md:p-6 relative">
      {/* Card Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-saffron" />
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
            Meteorological Forecast
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 text-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('hourly')}
            className={`py-1.5 px-3 rounded-lg font-semibold transition-all text-center ${
              activeTab === 'hourly'
                ? 'bg-saffron text-black font-bold shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hourly (24h)
          </button>
          <button
            onClick={() => setActiveTab('daily')}
            className={`py-1.5 px-3 rounded-lg font-semibold transition-all text-center ${
              activeTab === 'daily'
                ? 'bg-saffron text-black font-bold shadow-sm'
                : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            7-Day Forecast
          </button>
        </div>
      </div>

      {/* Hourly View */}
      {activeTab === 'hourly' && (
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-gray-400 mb-3">
            <Clock className="w-3.5 h-3.5 text-saffron" />
            <span>Scroll horizontally to view 24-hour meteorological trends</span>
          </div>

          <div className="flex gap-2.5 sm:gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
            {hourly.map((item, idx) => (
              <div
                key={idx}
                className="flex-none w-24 p-3 rounded-2xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 hover:border-saffron/40 flex flex-col items-center text-center transition-all group hover:-translate-y-1 shadow-xs"
              >
                <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">{item.time}</span>
                <div className="my-2 text-2xl group-hover:scale-110 transition-transform">
                  {item.conditionText.includes('Sun') || item.conditionText.includes('Clear') ? '☀️' :
                   item.conditionText.includes('Rain') ? '🌧️' :
                   item.conditionText.includes('Thunder') ? '⚡' : '⛅'}
                </div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white">{item.tempC}°C</span>

                {/* Rain Probability Pill */}
                <div className="mt-2 w-full flex items-center justify-center gap-1 text-[10px] text-blue-700 dark:text-blue-300 bg-blue-500/10 py-0.5 px-1.5 rounded-full font-medium">
                  <Umbrella className="w-2.5 h-2.5" />
                  <span>{item.rainProbabilityPct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily View */}
      {activeTab === 'daily' && (
        <div>
          {/* Mobile Day-by-Day Card View (< md) */}
          <div className="md:hidden space-y-2">
            {daily.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-100/80 dark:bg-white/5 border border-slate-200/70 dark:border-white/5 flex items-center justify-between gap-2 shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-[110px]">
                  <span className="text-2xl">
                    {item.conditionText.includes('Sun') || item.conditionText.includes('Clear') ? '☀️' :
                     item.conditionText.includes('Rain') ? '🌧️' :
                     item.conditionText.includes('Thunder') ? '⚡' : '⛅'}
                  </span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{item.dayName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-gray-400 truncate max-w-[90px]">{item.conditionText}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-300 font-semibold">
                  <Umbrella className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{item.rainProbabilityPct}%</span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-right">
                  <span className="text-slate-500 dark:text-gray-400 font-medium">{item.minTempC}°</span>
                  <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden relative">
                    <div 
                      className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-400 via-saffron to-red-500 rounded-full"
                      style={{ left: '15%', right: '15%' }}
                    />
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{item.maxTempC}°</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Full Meteorological Table (md+) */}
          <div className="hidden md:block overflow-x-auto scrollbar-thin">
            <table className="w-full text-left text-xs min-w-[640px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 uppercase text-[10px] tracking-wider bg-slate-50 dark:bg-white/5">
                  <th className="py-3 px-4 w-4/12 rounded-tl-xl">Day & Condition</th>
                  <th className="py-3 px-4 w-2/12">Precipitation</th>
                  <th className="py-3 px-4 w-2/12">Wind Speed</th>
                  <th className="py-3 px-4 w-2/12">UV Index</th>
                  <th className="py-3 px-4 w-2/12 rounded-tr-xl text-right">Temp Range</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {daily.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {item.conditionText.includes('Sun') || item.conditionText.includes('Clear') ? '☀️' :
                           item.conditionText.includes('Rain') ? '🌧️' :
                           item.conditionText.includes('Thunder') ? '⚡' : '⛅'}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{item.dayName}</div>
                          <div className="text-[11px] text-slate-500 dark:text-gray-400">{item.conditionText}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-300 font-medium">
                        <Umbrella className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{item.rainProbabilityPct}% ({item.precipitationMm} mm)</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-300 font-medium">
                        <Wind className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{item.windSpeedKmh} km/h</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-amber-600 dark:text-amber-300 font-medium">
                        <Sun className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                        <span>UV {item.uvIndex}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <span className="text-slate-500 dark:text-gray-400 font-medium">{item.minTempC}°</span>
                        <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden relative">
                          <div 
                            className="absolute top-0 bottom-0 bg-gradient-to-r from-blue-400 via-saffron to-red-500 rounded-full"
                            style={{ left: '15%', right: '15%' }}
                          />
                        </div>
                        <span className="font-bold text-slate-900 dark:text-white">{item.maxTempC}°</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
