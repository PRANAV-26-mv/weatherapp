import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import type { HourlyForecastItem } from '../../types';
import { TrendingUp, CloudRain, Wind } from 'lucide-react';

interface WeatherChartProps {
  hourly: HourlyForecastItem[];
}

export const WeatherChart: React.FC<WeatherChartProps> = ({ hourly }) => {
  const [metric, setMetric] = useState<'temp' | 'rain' | 'wind'>('temp');

  const chartData = hourly.map((h) => ({
    time: h.time,
    temp: h.tempC,
    rainProb: h.rainProbabilityPct,
    wind: h.windSpeedKmh,
  }));

  return (
    <div className="glass-card p-6 relative">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-saffron" />
          <h3 className="text-xl font-bold text-white font-heading">
            Meteorological Trends & Analytics
          </h3>
        </div>

        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setMetric('temp')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              metric === 'temp' ? 'bg-saffron text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Temperature (°C)</span>
          </button>

          <button
            onClick={() => setMetric('rain')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              metric === 'rain' ? 'bg-saffron text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain Probability (%)</span>
          </button>

          <button
            onClick={() => setMetric('wind')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
              metric === 'wind' ? 'bg-saffron text-black shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Wind Speed (km/h)</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {metric === 'temp' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF9933" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF9933" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(255, 153, 51, 0.4)',
                  borderRadius: '12px',
                  color: '#FFF',
                }}
              />
              <Area type="monotone" dataKey="temp" stroke="#FF9933" strokeWidth={3} fillOpacity={1} fill="url(#tempGradient)" />
            </AreaChart>
          ) : metric === 'rain' ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(59, 130, 246, 0.4)',
                  borderRadius: '12px',
                  color: '#FFF',
                }}
              />
              <Bar dataKey="rainProb" fill="#3B82F6" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  color: '#FFF',
                }}
              />
              <Area type="monotone" dataKey="wind" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#windGradient)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
