import { useState, useEffect } from 'react';
import type { CurrentWeatherData, HourlyForecastItem, DailyForecastItem } from './types';
import { getCurrentWeather, getHourlyForecast, getDailyForecast, INITIAL_DISASTER_ALERTS } from './services/weatherApi';
import { translate, getLocalizedWeatherSpeechText } from './services/i18n';
import { Navbar } from './components/UI/Navbar';
import { Footer } from './components/UI/Footer';
import { WeatherCard } from './components/Weather/WeatherCard';
import { ForecastCard } from './components/Weather/ForecastCard';
import { DisasterAlertBanner } from './components/Alerts/DisasterAlertBanner';
import { WeatherChart } from './components/Charts/WeatherChart';
import { LeafletWeatherMap } from './components/Map/LeafletWeatherMap';
import { ImageUploader } from './components/Vision/ImageUploader';
import { LanguageWelcomeModal } from './components/UI/LanguageWelcomeModal';
import { UserGuideModal } from './components/UI/UserGuideModal';
import { FloatingAccessibilityWidget } from './components/UI/FloatingAccessibilityWidget';

// Page Components
import { ChatPage } from './components/Pages/ChatPage';
import { DisasterIntelPage } from './components/Pages/DisasterIntelPage';
import { ClimatePage } from './components/Pages/ClimatePage';
import { AgriculturePage } from './components/Pages/AgriculturePage';
import { AirQualityPage } from './components/Pages/AirQualityPage';
import { MarineAviationPage } from './components/Pages/MarineAviationPage';
import { LocationsSettingsPage } from './components/Pages/LocationsSettingsPage';
import { AdminDashboardPage } from './components/Pages/AdminDashboardPage';
import { FloodRiskPage } from './components/Pages/FloodRiskPage';

import { Sparkles, ArrowRight, MessageSquare, Map, ShieldAlert, Sprout, Wind, Camera, Navigation, Home, Bell } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [currentLang, setCurrentLang] = useState<string>(() => {
    return localStorage.getItem('weathergpt_user_lang') || 'en';
  });
  const [isLangModalOpen, setIsLangModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem('weathergpt_has_chosen_lang');
  });
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('weathergpt_theme') as 'dark' | 'light') || 'dark';
  });

  // Sync Light/Dark theme class to root html element
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('weathergpt_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Permanent Location State
  const [permanentLocation, setPermanentLocation] = useState<{ name: string; lat: number; lon: number } | null>(() => {
    const saved = localStorage.getItem('weathergpt_permanent_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Location State (Defaults to permanent saved location if available)
  const [locationName, setLocationName] = useState<string>(() => {
    const saved = localStorage.getItem('weathergpt_permanent_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name) return parsed.name;
      } catch (e) {}
    }
    return 'Sathyamangalam';
  });

  const [coords, setCoords] = useState<{ lat: number; lon: number }>(() => {
    const saved = localStorage.getItem('weathergpt_permanent_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.lat && parsed.lon) return { lat: parsed.lat, lon: parsed.lon };
      } catch (e) {}
    }
    return { lat: 11.5042, lon: 77.2403 }; // Sathyamangalam default
  });

  // Weather Data States
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherData | null>(null);
  const [hourlyForecast, setHourlyForecast] = useState<HourlyForecastItem[]>([]);
  const [dailyForecast, setDailyForecast] = useState<DailyForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [geoNotice, setGeoNotice] = useState<string | null>(null);

  // Auto scroll to top when tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab]);

  // Load weather whenever location changes
  useEffect(() => {
    async function loadWeatherData() {
      setIsLoading(true);
      const [curr, hr, dy] = await Promise.all([
        getCurrentWeather(coords.lat, coords.lon, locationName),
        getHourlyForecast(coords.lat, coords.lon),
        getDailyForecast(coords.lat, coords.lon),
      ]);
      setCurrentWeather(curr);
      setHourlyForecast(hr);
      setDailyForecast(dy);
      setIsLoading(false);
    }
    loadWeatherData();
  }, [coords, locationName]);

  const handleSelectLocation = (name: string, lat: number, lon: number, isPermanent: boolean = true) => {
    setLocationName(name);
    setCoords({ lat, lon });

    if (isPermanent) {
      const permObj = { name, lat, lon };
      setPermanentLocation(permObj);
      localStorage.setItem('weathergpt_permanent_location', JSON.stringify(permObj));
      setGeoNotice(`📌 Permanent Location saved as "${name}"! Will automatically load on all future visits.`);
      setTimeout(() => setGeoNotice(null), 4000);
    }
  };

  const handleSetPermanentHome = (name: string, lat: number, lon: number) => {
    const permObj = { name, lat, lon };
    setPermanentLocation(permObj);
    localStorage.setItem('weathergpt_permanent_location', JSON.stringify(permObj));
    setGeoNotice(`📌 Pinned "${name}" as your Permanent Home Location!`);
    setTimeout(() => setGeoNotice(null), 4000);
  };

  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your mobile browser settings.');
      return;
    }

    setGeoNotice('📡 Requesting Phone GPS Location Permission...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const locName = 'Your Current Mobile Location';
        handleSelectLocation(locName, lat, lon, true);
        setGeoNotice(`📍 Phone GPS Acquired (${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E)! Saved as permanent location.`);
        setTimeout(() => setGeoNotice(null), 4000);
      },
      (error) => {
        console.warn('Geolocation permission error:', error);
        setGeoNotice('⚠️ Location Access Denied on Phone. Please enable GPS Location Services in your phone settings.');
        setTimeout(() => setGeoNotice(null), 5000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'light' ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#080B11] text-gray-100'} selection:bg-saffron selection:text-black pb-16 md:pb-0 transition-colors duration-300`}>
      {/* Initial Language Prompt Modal ("Ask before starting") */}
      <LanguageWelcomeModal
        isOpen={isLangModalOpen}
        onClose={() => setIsLangModalOpen(false)}
        currentLang={currentLang}
        onSelectLanguage={(code) => {
          setCurrentLang(code);
          localStorage.setItem('weathergpt_user_lang', code);
        }}
      />

      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentLang={currentLang}
        onSelectLanguage={(code) => {
          setCurrentLang(code);
          localStorage.setItem('weathergpt_user_lang', code);
        }}
        onOpenLanguageModal={() => setIsLangModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onSelectLocation={handleSelectLocation}
        onDetectCurrentLocation={handleDetectCurrentLocation}
        permanentLocation={permanentLocation}
        activeAlertCount={INITIAL_DISASTER_ALERTS.length}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Interactive User Guide & Help Modal */}
      <UserGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onOpenLanguageModal={() => setIsLangModalOpen(true)}
      />

      {/* Geolocation Feedback Banner */}
      {geoNotice && (
        <div className="bg-saffron text-black text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 shadow-lg animate-bounce sticky top-14 z-40">
          <Navigation className="w-4 h-4 animate-spin" />
          <span>{geoNotice}</span>
        </div>
      )}

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        {isLoading || !currentWeather ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
            <div className="w-16 h-16 rounded-full border-4 border-saffron border-t-transparent animate-spin" />
            <span className="text-sm font-bold text-saffron tracking-wider uppercase animate-pulse">
              Connecting to Open-Meteo & IMD Live Weather Telemetry...
            </span>
          </div>
        ) : (
          <>
            {/* ROUTE 1: HOMEPAGE */}
            {currentTab === 'home' && (
              <div className="space-y-6">
                {/* Hero Section */}
                <section className="relative glass-card p-6 md:p-8 overflow-hidden border border-white/10">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-saffron/20 via-indiagreen/10 to-transparent blur-3xl pointer-events-none" />

                  <div className="max-w-3xl space-y-4 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill border border-saffron/30 text-saffron text-[11px] font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>WeatherGPT AI Intelligence Platform</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-heading">
                      {translate('hero_headline', currentLang)}
                    </h1>

                    <p className="text-sm md:text-base text-gray-300 leading-relaxed font-normal">
                      {translate('hero_supporting', currentLang)}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        onClick={handleDetectCurrentLocation}
                        className="saffron-gradient-btn px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-saffron/30"
                      >
                        <Navigation className="w-4 h-4 animate-pulse" />
                        <span>Detect Phone Live Location 📍</span>
                      </button>

                      <button
                        onClick={() => setCurrentTab('chat')}
                        className="px-5 py-2.5 rounded-xl glass-pill text-xs font-extrabold text-white hover:border-saffron/60 transition-all flex items-center gap-2"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-saffron" />
                        <span>{translate('btn_ask_ai', currentLang)}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Severe Weather Warning Banner */}
                {INITIAL_DISASTER_ALERTS.length > 0 && (
                  <DisasterAlertBanner alert={INITIAL_DISASTER_ALERTS[0]} />
                )}

                {/* Current Live Weather Dashboard Card */}
                <WeatherCard
                  weather={currentWeather}
                  langCode={currentLang}
                  isPermanentHome={permanentLocation?.name === currentWeather.locationName}
                  onSetPermanentHome={handleSetPermanentHome}
                />

                {/* Hourly & 7-Day Forecast */}
                <ForecastCard hourly={hourlyForecast} daily={dailyForecast} />

                {/* Meteorological Analytics Chart */}
                <WeatherChart hourly={hourlyForecast} />

                {/* Interactive GIS Weather & Emergency Map */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                      <Map className="w-5 h-5 text-saffron" />
                      <span>Interactive GIS Weather Map</span>
                    </h3>
                    <button
                      onClick={() => setCurrentTab('map')}
                      className="text-xs font-bold text-saffron hover:underline"
                    >
                      Open Full Screen Map →
                    </button>
                  </div>
                  <LeafletWeatherMap center={currentWeather.coords} locationName={currentWeather.locationName} height="360px" />
                </div>

                {/* Quick Feature Portals Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div
                    onClick={() => setCurrentTab('vision')}
                    className="glass-card p-5 cursor-pointer hover:border-saffron/50 transition-all group space-y-2"
                  >
                    <div className="p-2.5 rounded-xl bg-saffron/20 text-saffron w-fit">
                      <Camera className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-saffron transition-colors">Weather Vision AI</h4>
                    <p className="text-xs text-gray-400">Analyze satellite photos, cloud formations, and radar maps.</p>
                  </div>

                  <div
                    onClick={() => setCurrentTab('agri')}
                    className="glass-card p-5 cursor-pointer hover:border-indiagreen/50 transition-all group space-y-2"
                  >
                    <div className="p-2.5 rounded-xl bg-indiagreen/20 text-indiagreen w-fit">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-indiagreen transition-colors">Farm Weather Advisor</h4>
                    <p className="text-xs text-gray-400">Crop-specific irrigation, pest risk, and harvest advice.</p>
                  </div>

                  <div
                    onClick={() => setCurrentTab('aqi')}
                    className="glass-card p-5 cursor-pointer hover:border-cyan-500/50 transition-all group space-y-2"
                  >
                    <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 w-fit">
                      <Wind className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">Air Quality Index</h4>
                    <p className="text-xs text-gray-400">Live AQI meter, PM2.5, PM10, and health advisories.</p>
                  </div>

                  <div
                    onClick={() => setCurrentTab('disaster')}
                    className="glass-card p-5 cursor-pointer hover:border-red-500/50 transition-all group space-y-2"
                  >
                    <div className="p-2.5 rounded-xl bg-red-500/20 text-red-500 w-fit">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white group-hover:text-red-500 transition-colors">Disaster Intelligence</h4>
                    <p className="text-xs text-gray-400">Verified IMD warnings, geofencing, and emergency broadcasts.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ROUTE 2: AI CHAT */}
            {currentTab === 'chat' && <ChatPage currentWeather={currentWeather} langCode={currentLang} />}

            {/* ROUTE 3: FORECAST */}
            {currentTab === 'forecast' && (
              <div className="space-y-6">
                <ForecastCard hourly={hourlyForecast} daily={dailyForecast} />
                <WeatherChart hourly={hourlyForecast} />
              </div>
            )}

            {/* ROUTE 4: MAP */}
            {currentTab === 'map' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-extrabold text-white font-heading flex items-center gap-2">
                  <Map className="w-6 h-6 text-saffron" />
                  <span>Weather & Emergency GIS Map</span>
                </h2>
                <LeafletWeatherMap center={currentWeather.coords} locationName={currentWeather.locationName} height="500px" />
              </div>
            )}

            {/* ROUTE 5 & 6: ALERTS & DISASTER INTEL */}
            {(currentTab === 'alerts' || currentTab === 'disaster') && (
              <DisasterIntelPage
                currentWeather={currentWeather}
                activeSubTab={currentTab as 'alerts' | 'disaster'}
                onSelectTab={setCurrentTab}
              />
            )}

            {/* ROUTE 6: FLOOD RISK AI ANALYZER */}
            {currentTab === 'flood' && <FloodRiskPage currentWeather={currentWeather} />}

            {/* ROUTE 7: VISION AI */}
            {currentTab === 'vision' && <ImageUploader currentWeather={currentWeather} />}

            {/* ROUTE 8: CLIMATE */}
            {currentTab === 'climate' && <ClimatePage currentWeather={currentWeather} />}

            {/* ROUTE 9: AGRICULTURE */}
            {currentTab === 'agri' && <AgriculturePage currentWeather={currentWeather} />}

            {/* ROUTE 10: AIR QUALITY */}
            {currentTab === 'aqi' && <AirQualityPage currentWeather={currentWeather} />}

            {/* ROUTE 11 & 12: MARINE & AVIATION */}
            {(currentTab === 'marine' || currentTab === 'aviation') && (
              <MarineAviationPage
                currentWeather={currentWeather}
                activeSubTab={currentTab as 'marine' | 'aviation'}
                onSelectTab={setCurrentTab}
              />
            )}

            {/* ROUTE 13 & 14: SAVED LOCATIONS & SETTINGS */}
            {(currentTab === 'locations' || currentTab === 'settings') && (
              <LocationsSettingsPage
                onSelectLocation={handleSelectLocation}
                activeSubTab={currentTab as 'locations' | 'settings'}
                onSelectTab={setCurrentTab}
              />
            )}

            {/* ROUTE 15: ADMIN DASHBOARD */}
            {currentTab === 'admin' && <AdminDashboardPage />}
          </>
        )}
      </main>

      {/* Dedicated Mobile Touch Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 z-50 flex items-center justify-around py-2 px-1">
        <button
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            currentTab === 'home' ? 'text-saffron' : 'text-gray-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={handleDetectCurrentLocation}
          className="flex flex-col items-center gap-0.5 text-[10px] font-extrabold text-saffron bg-saffron/20 px-3 py-1 rounded-xl border border-saffron/40 animate-pulse"
        >
          <Navigation className="w-5 h-5 text-saffron" />
          <span>📍 GPS</span>
        </button>

        <button
          onClick={() => setCurrentTab('chat')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            currentTab === 'chat' ? 'text-saffron' : 'text-gray-400'
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span>AI Chat</span>
        </button>

        <button
          onClick={() => setCurrentTab('map')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            currentTab === 'map' ? 'text-saffron' : 'text-gray-400'
          }`}
        >
          <Map className="w-5 h-5" />
          <span>Map</span>
        </button>

        <button
          onClick={() => setCurrentTab('alerts')}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold ${
            currentTab === 'alerts' || currentTab === 'disaster' ? 'text-saffron' : 'text-gray-400'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span>Alerts</span>
        </button>
      </div>

      {/* Global Easy Floating Accessibility Widget */}
      {currentWeather && (
        <FloatingAccessibilityWidget
          currentLang={currentLang}
          onOpenLanguageModal={() => setIsLangModalOpen(true)}
          onOpenGuideModal={() => setIsGuideModalOpen(true)}
          weatherSpeechText={getLocalizedWeatherSpeechText(currentWeather, currentLang)}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
