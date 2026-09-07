export type SeverityLevel = 'normal' | 'advisory' | 'watch' | 'warning' | 'emergency';

export interface WeatherCoordinates {
  lat: number;
  lon: number;
}

export interface CurrentWeatherData {
  locationName: string;
  country: string;
  tempC: number;
  tempF: number;
  feelsLikeC: number;
  conditionText: string;
  conditionCode: number;
  humidity: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  windDirectionText: string;
  pressureHpa: number;
  visibilityKm: number;
  uvIndex: number;
  cloudCoverPct: number;
  sunrise: string;
  sunset: string;
  coords: WeatherCoordinates;
  lastUpdated: string;
}

export interface HourlyForecastItem {
  time: string;
  tempC: number;
  rainProbabilityPct: number;
  precipitationMm: number;
  conditionText: string;
  windSpeedKmh: number;
  humidity: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  maxTempC: number;
  minTempC: number;
  rainProbabilityPct: number;
  precipitationMm: number;
  conditionText: string;
  windSpeedKmh: number;
  uvIndex: number;
}

export interface DisasterAlertEvent {
  id: string;
  hazardType: string;
  severity: SeverityLevel;
  status: 'active' | 'updated' | 'expired';
  source: string;
  sourceUrl: string;
  issuedTime: string;
  updatedTime: string;
  expirationTime: string;
  affectedLocation: string;
  affectedCoordinates: WeatherCoordinates;
  radiusKm: number;
  description: string;
  officialGuidance: string;
  dataStatus: 'verified' | 'advisory' | 'model_prediction';
  isAcknowledged?: boolean;
}

export interface AirQualityData {
  aqi: number;
  statusText: string;
  pm25: number;
  pm10: number;
  ozone: number;
  no2: number;
  so2: number;
  co: number;
  healthAdvice: string;
}

export interface AgricultureAdvisory {
  location: string;
  crop: string;
  growthStage: string;
  soilMoisturePct: number;
  irrigationRecommendation: string;
  pestDiseaseRisk: string;
  weatherWindow: string;
  heatStressLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  harvestOutlook: string;
}

export interface MarineWeatherData {
  location: string;
  waveHeightM: number;
  swellDirection: string;
  swellPeriodSec: number;
  seaTemperatureC: number;
  tideState: 'High Tide' | 'Low Tide' | 'Rising' | 'Falling';
  coastalWarning: string | null;
}

export interface AviationWeatherData {
  icaoCode: string;
  airportName: string;
  flightCategory: 'VFR' | 'MVFR' | 'IFR' | 'LIFR';
  metarRaw: string;
  tafRaw: string;
  visibilityMiles: number;
  windKnots: number;
  cloudCeilingFt: number;
}

export interface FloodDiagnosticReport {
  id: string;
  imageUrl: string;
  waterSpreadAreaSqKm: number;
  avgWaterDepthMeters: number;
  inundatedBuildingsCount: number;
  submergedRoadLengthKm: number;
  affectedPopulationEstimate: number;
  infrastructureDamageLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  evacuationRecommended: boolean;
  alertLevel: string;
  summaryText: string;
  criticalZones: string[];
  recommendedActions: string[];
  timestamp: string;
}

export interface VisionAnalysisResult {
  imageUrl: string;
  cloudType: string;
  precipitationLikelihoodPct: number;
  stormIndicators: string[];
  weatherPatternSummary: string;
  detailedAnalysis?: string;
  safetyPrecautions?: string[];
  confidenceScore: number;
  liveComparison: {
    observedInPhoto: string;
    actualLiveSensor: string;
    agreementRating: 'High Alignment' | 'Partial Match' | 'Sensor Discrepancy';
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  weatherCard?: CurrentWeatherData;
  forecastData?: DailyForecastItem[];
  alertData?: DisasterAlertEvent;
  imageAnalysis?: VisionAnalysisResult;
  sources?: string[];
  toolCalled?: string;
  isVoice?: boolean;
}

export interface SavedLocation {
  id: string;
  name: string;
  category: 'Home' | 'College' | 'Work' | 'Farm' | 'Travel' | 'Custom';
  lat: number;
  lon: number;
  alertRadiusKm: number;
  currentTempC?: number;
  conditionText?: string;
}

export interface IndianLanguage {
  code: string;
  name: string;
  nativeName: string;
  script: string;
}
