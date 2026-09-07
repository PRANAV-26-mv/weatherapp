import React, { useState } from 'react';
import type { VisionAnalysisResult, CurrentWeatherData } from '../../types';
import { analyzeImageWithGoogleGemini } from '../../services/aiAssistant';
import { Camera, Upload, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  currentWeather: CurrentWeatherData;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ currentWeather }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sampleImages = [
    {
      id: 'storm',
      name: 'Cumulonimbus Convective Storm',
      url: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'satellite',
      name: 'INSAT-3D Infra-Red Satellite',
      url: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'radar',
      name: 'IMD Doppler Radar Reflectivity',
      url: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'fair',
      name: 'Fair Weather Cumulus Sky',
      url: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const [result, setResult] = useState<VisionAnalysisResult | null>({
    imageUrl: sampleImages[0].url,
    cloudType: 'Cumulonimbus incus & Convective Anvil Deck',
    precipitationLikelihoodPct: 88,
    stormIndicators: [
      'Convective vertical updraft column detected in cloud core',
      'Heavy moisture condensation with anvil cloud top',
      'Imminent localized thunderstorm and lightning threat',
    ],
    weatherPatternSummary: 'Monsoonal convective storm formation producing intense localized rain and wind gusts.',
    confidenceScore: 96,
    liveComparison: {
      observedInPhoto: 'Cumulonimbus incus (88% Rain Risk)',
      actualLiveSensor: `${currentWeather.tempC}°C, ${currentWeather.humidity}% Humidity, ${currentWeather.conditionText}`,
      agreementRating: 'High Alignment',
    },
  });

  const handleSelectSample = (sample: { id: string; name: string; url: string }) => {
    runVisionAnalysis(sample.url, sample.id);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const url = event.target.result as string;
          runVisionAnalysis(url, file.name.toLowerCase());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const runVisionAnalysis = async (imageUrl: string, typeHint: string = '') => {
    setIsAnalyzing(true);
    setResult(null);

    const visionRes = await analyzeImageWithGoogleGemini(imageUrl, currentWeather, typeHint);
    setResult(visionRes);
    setIsAnalyzing(false);
  };

  return (
    <div className="glass-card p-6 md:p-8 relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-saffron/20 text-saffron border border-saffron/40">
          <Camera className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-extrabold text-white font-heading">
            WeatherGPT Vision Analysis
          </h3>
          <p className="text-xs text-gray-400">
            Upload satellite imagery, radar captures, or cloud photos for AI meteorological analysis
          </p>
        </div>
      </div>

      {/* Upload Zone & Sample Picker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border-2 border-dashed border-white/20 hover:border-saffron/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all bg-white/5 group relative">
          <Upload className="w-8 h-8 text-saffron mb-2 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-white mb-1">
            Drag & Drop Weather Image
          </span>
          <span className="text-xs text-gray-400 mb-4">
            Supports Satellite IR, Doppler Radar, or Cloud Photographs (JPG/PNG)
          </span>
          <label className="saffron-gradient-btn px-4 py-2 rounded-xl text-xs font-bold cursor-pointer">
            Browse Image File
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {/* Sample Image Presets */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Or Test With Sample Meteorological Imagery:
          </span>
          {sampleImages.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSample(sample)}
              className="w-full p-2.5 rounded-xl bg-white/5 hover:bg-saffron/15 border border-white/10 flex items-center justify-between transition-all group text-left"
            >
              <span className="text-xs font-medium text-gray-200 group-hover:text-saffron">
                {sample.name}
              </span>
              <span className="text-[10px] text-saffron border border-saffron/30 px-2 py-0.5 rounded-full font-bold">
                Analyze
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading Spinner */}
      {isAnalyzing && (
        <div className="p-8 rounded-2xl bg-white/5 border border-saffron/30 flex flex-col items-center justify-center text-center animate-pulse">
          <RefreshCw className="w-8 h-8 text-saffron animate-spin mb-3" />
          <span className="text-sm font-bold text-white">Running WeatherGPT Vision Engine...</span>
          <span className="text-xs text-gray-400 mt-1">Extracting cloud morphology, convective updrafts, and radar reflectivity</span>
        </div>
      )}

      {/* Result Display */}
      {result && !isAnalyzing && (
        <div className="glass-panel p-6 rounded-2xl border border-saffron/30 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-saffron" />
              <h4 className="text-lg font-bold text-white font-heading">
                AI Vision Diagnostic Report
              </h4>
            </div>
            <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
              Confidence Score: {result.confidenceScore}%
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image Preview */}
            <div className="rounded-xl overflow-hidden border border-white/10 h-48 relative">
              <img src={result.imageUrl} alt="Weather Analysis Target" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-[10px] text-white font-mono">
                Source Image Target
              </div>
            </div>

            {/* Findings Breakdown */}
            <div className="md:col-span-2 space-y-3 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">Detected Cloud Classification:</span>
                <strong className="text-saffron text-sm font-bold">{result.cloudType}</strong>
              </div>

              <div>
                <span className="text-gray-400 block font-medium">Precipitation & Storm Indicators:</span>
                <ul className="mt-1 space-y-1">
                  {result.stormIndicators.map((ind, i) => (
                    <li key={i} className="flex items-center gap-1.5 text-gray-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-saffron shrink-0" />
                      <span>{ind}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detailed Explanation of What is Happening */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-saffron block font-bold text-[11px] flex items-center gap-1">
                  🔍 What Is Happening in This Image:
                </span>
                <p className="text-gray-200 leading-relaxed">
                  {result.detailedAnalysis || result.weatherPatternSummary}
                </p>
              </div>

              {/* Recommended Safety Precautions */}
              {result.safetyPrecautions && result.safetyPrecautions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                  <span className="text-amber-400 block font-bold text-[11px] flex items-center gap-1">
                    🚨 Recommended Safety Precautions:
                  </span>
                  <ul className="space-y-1 text-gray-200">
                    {result.safetyPrecautions.map((prec, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{prec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Image vs Live Weather Sensor Comparison */}
          <div className="p-4 rounded-xl bg-saffron/10 border border-saffron/30 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-saffron">
              <span>Image Photo Observation vs. Live Open-Meteo Sensor:</span>
              <span className="px-2 py-0.5 rounded bg-saffron text-black text-[10px]">
                {result.liveComparison.agreementRating}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-200 mt-2">
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-gray-400 block text-[10px]">Inferred From Photo:</span>
                <div>{result.liveComparison.observedInPhoto}</div>
              </div>
              <div className="p-2 rounded bg-black/40 border border-white/5">
                <span className="text-gray-400 block text-[10px]">Live Sensor Data ({currentWeather.locationName}):</span>
                <div>{result.liveComparison.actualLiveSensor}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
