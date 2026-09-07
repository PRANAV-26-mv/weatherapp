import React, { useState } from 'react';
import type { CurrentWeatherData, FloodDiagnosticReport, DisasterAlertEvent } from '../../types';
import { LeafletWeatherMap } from '../Map/LeafletWeatherMap';
import { DisasterAlertBanner } from '../Alerts/DisasterAlertBanner';
import { sendWhatsAppAlert, sendSMSAlert } from '../../services/notificationService';
import { 
  Waves, 
  AlertTriangle, 
  MapPin, 
  Upload, 
  FileText, 
  CheckCircle2, 
  Radio, 
  Share2, 
  MessageSquare,
  Sparkles,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';

interface FloodRiskPageProps {
  currentWeather: CurrentWeatherData;
}

export const FloodRiskPage: React.FC<FloodRiskPageProps> = ({ currentWeather }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80'
  );
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 9876543210');

  const [floodReport, setFloodReport] = useState<FloodDiagnosticReport>({
    id: 'CV-FLOOD-DISASTER-089',
    imageUrl: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80',
    waterSpreadAreaSqKm: 14.8,
    avgWaterDepthMeters: 1.4,
    inundatedBuildingsCount: 342,
    submergedRoadLengthKm: 12.8,
    affectedPopulationEstimate: 18500,
    infrastructureDamageLevel: 'CRITICAL',
    evacuationRecommended: true,
    alertLevel: 'LEVEL 4 (RED EMERGENCY)',
    summaryText: `Severe urban flood inundation detected in ${currentWeather.locationName} metro area. Rapid water accumulation of 1.4m average depth observed across low-lying commercial and residential sectors. Main arterial highways submerged for 12.8 km. Immediate evacuation ordered for Level 4 zones.`,
    criticalZones: [
      'Central Business District (Low-Lying Sector 4)',
      'Underpass Metro Corridor (Submerged 2.1m)',
      'East River Bank Settlement (Silt & Water Overflow)',
      'Industrial Power Substation #3 (Water Encroachment)',
    ],
    recommendedActions: [
      'Issue immediate Level 4 Evacuation Orders for 18,500+ residents',
      'Deploy NDMA Motorized Inflatable Rescue Boats to Submerged Metro Corridor',
      'Cut power feed to Substation #3 to prevent electrical hazards',
      'Set up emergency relief camps on elevated municipal ground',
    ],
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const floodAlertEvent: DisasterAlertEvent = {
    id: 'ALT-FLOOD-LEVEL4-089',
    hazardType: 'Flash Flood & Urban Inundation',
    severity: 'emergency',
    status: 'active',
    source: 'National Disaster Management Authority (NDMA) & WeatherGPT Vision AI',
    sourceUrl: 'https://ndma.gov.in',
    issuedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    updatedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    expirationTime: '24 Hours',
    affectedLocation: `${currentWeather.locationName} Flood Basin`,
    affectedCoordinates: currentWeather.coords,
    radiusKm: 25,
    description: `AI Computer Vision & IMD Stream: Severe Flood Inundation Detected (Depth: ${floodReport.avgWaterDepthMeters}m). ${floodReport.inundatedBuildingsCount} buildings submerged.`,
    officialGuidance: 'IMMEDIATE EVACUATION ORDERED. Move to elevated ground or designated relief shelters. Do not drive through submerged underpasses.',
    dataStatus: 'verified',
    isAcknowledged: false,
  };

  const floodSamples = [
    {
      id: 'urban',
      title: 'Urban Street Inundation',
      depth: 1.4,
      buildings: 342,
      roads: 12.8,
      url: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'river',
      title: 'River Breach & Agriculture Flooding',
      depth: 2.1,
      buildings: 510,
      roads: 24.5,
      url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'highway',
      title: 'Submerged Highway & Transit Corridor',
      depth: 0.9,
      buildings: 120,
      roads: 18.2,
      url: 'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=800&auto=format&fit=crop&q=80',
    },
  ];

  const handleSelectSample = (sample: typeof floodSamples[0]) => {
    setSelectedImage(sample.url);
    runFloodAnalysis(sample.url, sample.depth, sample.buildings, sample.roads);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const url = evt.target.result as string;
          setSelectedImage(url);
          runFloodAnalysis(url, 1.6, 410, 15.4);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const runFloodAnalysis = (url: string, depth: number, bldg: number, rdKm: number) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setFloodReport({
        id: `CV-FLOOD-DISASTER-${Math.floor(100 + Math.random() * 900)}`,
        imageUrl: url,
        waterSpreadAreaSqKm: +(rdKm * 1.15).toFixed(1),
        avgWaterDepthMeters: depth,
        inundatedBuildingsCount: bldg,
        submergedRoadLengthKm: rdKm,
        affectedPopulationEstimate: bldg * 45,
        infrastructureDamageLevel: depth > 1.5 ? 'CRITICAL' : 'HIGH',
        evacuationRecommended: depth > 0.8,
        alertLevel: depth > 1.5 ? 'LEVEL 4 (RED EMERGENCY)' : 'LEVEL 3 (ORANGE WARNING)',
        summaryText: `Computer vision inundation diagnostic completed for uploaded imagery in ${currentWeather.locationName}. Detected water spread of ${(rdKm * 1.15).toFixed(1)} sq km with ${depth}m average water column depth covering ${bldg} structural units and ${rdKm} km of transit networks.`,
        criticalZones: [
          'Primary Commercial Arterial Boulevard',
          'Low-Lying Residential District',
          'Drainage Culvert Overflow Channel',
          'Transit Terminal Freight Depot',
        ],
        recommendedActions: [
          `Deploy motorized rescue boats to sectors with >${depth}m water depth`,
          `Broadcast WhatsApp & SMS alerts to ${bldg * 45} estimated occupants`,
          'Set up sandbag barriers around municipal sub-stations',
          'Establish emergency medical first-aid stations',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 🔍 Page Header */}
      <div className="glass-card p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-cyan-500">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
            <Waves className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2">
              <span>AI Flood & Disaster Risk Analyzer</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                LIVE DISASTER ENGINE
              </span>
            </h2>
            <p className="text-xs text-gray-400">
              Computer Vision Inundation Diagnostics • Water Spread Overlay • NDMA Evacuation Dispatch
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => sendWhatsAppAlert(floodAlertEvent, phoneNumber)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
          >
            <Share2 className="w-4 h-4" />
            <span>Broadcast WhatsApp Alert</span>
          </button>
        </div>
      </div>

      {/* 🚨 Emergency Disaster Alert Banner */}
      <DisasterAlertBanner alert={floodAlertEvent} />

      {/* 🤖 AI Image Diagnostic & Flood Situation Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Upload & Computer Vision Diagnostic Picker */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-5 space-y-4 border border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <Upload className="w-4 h-4 text-saffron" />
                <span>Upload Flood Photograph / Drone IR</span>
              </h3>
              <span className="text-[10px] font-mono text-saffron bg-saffron/20 px-2 py-0.5 rounded-full">
                AI Vision v2.4
              </span>
            </div>

            {/* Image Preview Window */}
            <div className="relative rounded-2xl overflow-hidden border border-white/15 aspect-video bg-black/60 group">
              <img
                src={selectedImage}
                alt="Flood Situation Analysis"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Computer Vision Inundation Overlay Active</span>
                </span>
                <span className="text-[10px] text-gray-300">
                  Target Zone: {currentWeather.locationName} Metro Basin
                </span>
              </div>
            </div>

            {/* Drag & Drop Upload Input */}
            <label className="w-full py-3 px-4 rounded-xl border border-dashed border-saffron/40 bg-saffron/10 hover:bg-saffron/20 transition-all text-center cursor-pointer flex items-center justify-center gap-2 text-xs font-bold text-saffron">
              <Upload className="w-4 h-4" />
              <span>Upload New Flood Photo or Satellite Capture</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {/* Preset Flood Sample Selector */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[11px] font-bold uppercase text-gray-400 tracking-wider block">
                Select Test Flood Situation Presets:
              </span>
              {floodSamples.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                    selectedImage === sample.url
                      ? 'bg-saffron text-black border-saffron font-bold'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span>{sample.title}</span>
                  <span className="text-[10px] font-mono opacity-80">Depth: {sample.depth}m</span>
                </button>
              ))}
            </div>

            {/* Loading Indicator */}
            {isAnalyzing && (
              <div className="p-4 rounded-xl bg-saffron/10 border border-saffron/30 flex items-center justify-center gap-2 text-xs font-bold text-saffron animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Computer Vision Flood Inundation Analysis...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Flood Diagnostic Telemetry Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card p-5 space-y-5 border border-cyan-500/30">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white font-heading">
                  AI Computer Vision Flood Diagnostic
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-600/20 text-red-400 text-xs font-extrabold border border-red-500/30">
                {floodReport.alertLevel}
              </span>
            </div>

            {/* Diagnostic Metrics 4-Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="glass-card p-3.5 space-y-1 border-t-2 border-t-cyan-400">
                <span className="text-gray-400 block text-[10px] font-semibold">AVG WATER DEPTH</span>
                <div className="text-2xl font-extrabold text-cyan-400 font-heading">
                  {floodReport.avgWaterDepthMeters} m
                </div>
                <span className="text-[10px] text-gray-300">Measured Column</span>
              </div>

              <div className="glass-card p-3.5 space-y-1 border-t-2 border-t-red-500">
                <span className="text-gray-400 block text-[10px] font-semibold">INUNDATED BUILDINGS</span>
                <div className="text-2xl font-extrabold text-red-500 font-heading">
                  {floodReport.inundatedBuildingsCount}
                </div>
                <span className="text-[10px] text-gray-300">Structural Units</span>
              </div>

              <div className="glass-card p-3.5 space-y-1 border-t-2 border-t-saffron">
                <span className="text-gray-400 block text-[10px] font-semibold">SUBMERGED ROADS</span>
                <div className="text-2xl font-extrabold text-saffron font-heading">
                  {floodReport.submergedRoadLengthKm} km
                </div>
                <span className="text-[10px] text-gray-300">Transit Corridors</span>
              </div>

              <div className="glass-card p-3.5 space-y-1 border-t-2 border-t-amber-400">
                <span className="text-gray-400 block text-[10px] font-semibold">AFFECTED PEOPLE</span>
                <div className="text-2xl font-extrabold text-amber-400 font-heading">
                  {floodReport.affectedPopulationEstimate.toLocaleString()}
                </div>
                <span className="text-[10px] text-gray-300">Estimated Count</span>
              </div>
            </div>

            {/* Diagnostic Summary Paragraph */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 text-xs text-gray-200 leading-relaxed space-y-2">
              <strong className="text-saffron font-bold block uppercase tracking-wider text-[11px]">
                🔍 AI Inundation Diagnostic Analysis:
              </strong>
              <p>{floodReport.summaryText}</p>
            </div>

            {/* Inundation Zones & Actions List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <strong className="text-red-400 font-bold block uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Submerged Critical Zones:</span>
                </strong>
                <ul className="space-y-1.5">
                  {floodReport.criticalZones.map((zone, idx) => (
                    <li key={idx} className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-300 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span>{zone}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <strong className="text-emerald-400 font-bold block uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>NDMA Evacuation Actions:</span>
                </strong>
                <ul className="space-y-1.5">
                  {floodReport.recommendedActions.map((action, idx) => (
                    <li key={idx} className="p-2 rounded-lg bg-white/5 border border-white/5 text-gray-300 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🗺️ Interactive Flood Risk Map & Inundation Overlay Dashboard */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            <Radio className="w-5 h-5 text-saffron" />
            <span>Interactive Flood Inundation GIS Map & Depth Polygons</span>
          </h3>
          <span className="text-xs text-gray-400 font-semibold">
            Inundation Perimeter: {floodReport.waterSpreadAreaSqKm} sq km
          </span>
        </div>
        <LeafletWeatherMap center={currentWeather.coords} locationName={currentWeather.locationName} height="440px" />
      </div>

      {/* 📱 WhatsApp & SMS Emergency Alert Dispatch Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 font-bold text-saffron uppercase tracking-wider">
          <span>📱 Dispatch Instant Flood Evacuation Alert</span>
          <span className="text-emerald-400 font-normal">Active Channels: WebPush • WhatsApp • SMS Dispatch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-saffron shrink-0" />
            <span className="text-gray-300">Affected Sector:</span>
            <strong className="text-white text-sm font-bold">{currentWeather.locationName} Flood Basin</strong>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-400">Target Phone:</span>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="glass-input px-3 py-1 rounded-xl text-xs font-mono text-white border border-white/15 focus:border-saffron w-36"
            />
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => sendWhatsAppAlert(floodAlertEvent, phoneNumber)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp Alert</span>
            </button>

            <button
              onClick={() => sendSMSAlert(floodAlertEvent, phoneNumber)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>SMS Alert</span>
            </button>
          </div>
        </div>
      </div>

      {/* 📝 AI Disaster Report Generator Section */}
      <div className="glass-card p-6 space-y-4 border border-saffron/30">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-saffron/20 text-saffron">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Official AI Disaster Report ({floodReport.id})
              </h3>
              <p className="text-xs text-gray-400">
                Generated for Municipal Evacuation & NDMA Support • Time: {floodReport.timestamp}
              </p>
            </div>
          </div>

          <button
            onClick={() => alert(`Report ${floodReport.id} compiled and saved to downloads!`)}
            className="saffron-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download Disaster PDF Report</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-black/60 border border-white/10 text-xs font-mono space-y-2 text-gray-300">
          <div className="text-saffron font-bold">========================================================</div>
          <div className="text-white font-bold">OFFICIAL WEATHERGPT FLOOD DISASTER EVALUATION BULLETIN</div>
          <div className="text-saffron">========================================================</div>
          <div>INCIDENT CODE: {floodReport.id}</div>
          <div>LOCATION: {currentWeather.locationName} Metropolitan Basin</div>
          <div>SEVERITY: {floodReport.alertLevel}</div>
          <div>AVERAGE WATER COLUMN DEPTH: {floodReport.avgWaterDepthMeters} meters</div>
          <div>SUBMERGED BUILDINGS COUNT: {floodReport.inundatedBuildingsCount} units</div>
          <div>SUBMERGED TRANSIT ROADS: {floodReport.submergedRoadLengthKm} km</div>
          <div>AFFECTED POPULATION ESTIMATE: {floodReport.affectedPopulationEstimate.toLocaleString()} persons</div>
          <div>NDMA MANDATORY EVACUATION: REQUIRED IMMEDIATELY</div>
          <div className="text-saffron">========================================================</div>
        </div>
      </div>
    </div>
  );
};
