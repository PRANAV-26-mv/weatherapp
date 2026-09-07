import React, { useState } from 'react';
import type { CurrentWeatherData, AgricultureAdvisory } from '../../types';
import { Sprout, Droplets, Sun, Bug, Calendar, CheckCircle2 } from 'lucide-react';

interface AgriculturePageProps {
  currentWeather: CurrentWeatherData;
}

export const AgriculturePage: React.FC<AgriculturePageProps> = ({ currentWeather }) => {
  const [selectedCrop, setSelectedCrop] = useState('Rice (Paddy)');

  const cropOptions = ['Rice (Paddy)', 'Wheat', 'Cotton', 'Sugarcane', 'Vegetables', 'Spices & Chilli'];

  const advisoryData: AgricultureAdvisory = {
    location: currentWeather.locationName,
    crop: selectedCrop,
    growthStage: 'Vegetative Tillering Stage',
    soilMoisturePct: Math.round(currentWeather.humidity - 8),
    irrigationRecommendation: 'Soil moisture is optimal due to recent precipitation. Postpone irrigation for 48 hours to conserve water.',
    pestDiseaseRisk: 'Moderate Risk of Blast / Sheath Blight due to high night-time humidity (>75%).',
    weatherWindow: 'Favorable 3-day dry window starting Thursday for pesticide/fertilizer application.',
    heatStressLevel: currentWeather.tempC > 34 ? 'High' : 'Low',
    harvestOutlook: 'Expected yield outlook remains strong. Avoid field drainage until grain filling stage.',
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indiagreen/20 text-indiagreen border border-indiagreen/40">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white font-heading">
              Farm Weather Advisor (Kisan Mitra)
            </h2>
            <p className="text-xs text-gray-400">
              Crop-Specific Agromet Advisory & Soil Moisture Intelligence for {currentWeather.locationName}
            </p>
          </div>
        </div>

        {/* Crop Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300 font-medium">Selected Crop:</span>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="glass-input px-3 py-1.5 rounded-xl text-xs font-bold border border-indiagreen/40 bg-black/60 focus:border-indiagreen"
          >
            {cropOptions.map((c) => (
              <option key={c} value={c} className="bg-gray-900 text-white">{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advisory Output Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-5 space-y-2 border-t-4 border-t-blue-500">
          <div className="flex items-center gap-2 text-xs text-blue-400 font-bold">
            <Droplets className="w-4 h-4" />
            <span>Soil Moisture & Irrigation</span>
          </div>
          <div className="text-2xl font-bold text-white">{advisoryData.soilMoisturePct}% Moisture</div>
          <p className="text-xs text-gray-300 leading-relaxed">{advisoryData.irrigationRecommendation}</p>
        </div>

        <div className="glass-card p-5 space-y-2 border-t-4 border-t-amber-500">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-bold">
            <Bug className="w-4 h-4" />
            <span>Pest & Disease Advisory</span>
          </div>
          <div className="text-2xl font-bold text-white">Moderate Threat</div>
          <p className="text-xs text-gray-300 leading-relaxed">{advisoryData.pestDiseaseRisk}</p>
        </div>

        <div className="glass-card p-5 space-y-2 border-t-4 border-t-emerald-500">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
            <Calendar className="w-4 h-4" />
            <span>Favorable Weather Window</span>
          </div>
          <div className="text-2xl font-bold text-white">3-Day Dry Window</div>
          <p className="text-xs text-gray-300 leading-relaxed">{advisoryData.weatherWindow}</p>
        </div>

        <div className="glass-card p-5 space-y-2 border-t-4 border-t-saffron">
          <div className="flex items-center gap-2 text-xs text-saffron font-bold">
            <Sun className="w-4 h-4" />
            <span>Heat Stress Index</span>
          </div>
          <div className="text-2xl font-bold text-white">{advisoryData.heatStressLevel} Heat Stress</div>
          <p className="text-xs text-gray-300 leading-relaxed">{advisoryData.harvestOutlook}</p>
        </div>
      </div>

      {/* Recommended Agricultural Actions List */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-lg font-bold text-white font-heading">
          Recommended Field Actions for {selectedCrop}
        </h3>
        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-indiagreen shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold">Fertilizer Application:</strong>
              <span className="text-gray-300">Apply secondary top dressing of Urea (25 kg/acre) during morning calm hours when wind speed is &lt; 10 km/h.</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-indiagreen shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold">Drainage Management:</strong>
              <span className="text-gray-300">Ensure field drainage channels remain clear to prevent water stagnation if rainfall exceeds 25mm.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
