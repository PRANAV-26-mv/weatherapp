import React, { useState } from 'react';
import { ChakraLogo } from './ChakraLogo';
import { LanguageSelector } from './LanguageSelector';
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Map, 
  Bell, 
  ShieldAlert, 
  Camera, 
  TrendingUp, 
  Sprout, 
  Wind, 
  Anchor, 
  Plane, 
  Bookmark, 
  User, 
  Menu, 
  X,
  Search,
  Navigation,
  Zap,
  ChevronDown,
  Settings,
  Waves,
  Sun,
  Moon,
  Cpu,
  Brain,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { searchLocation } from '../../services/weatherApi';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  currentLang: string;
  onSelectLanguage: (code: string) => void;
  onOpenLanguageModal?: () => void;
  onOpenGuideModal?: () => void;
  onSelectLocation: (name: string, lat: number, lon: number) => void;
  onDetectCurrentLocation: () => void;
  permanentLocation?: { name: string; lat: number; lon: number } | null;
  activeAlertCount?: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentLang,
  onSelectLanguage,
  onOpenLanguageModal,
  onOpenGuideModal,
  onSelectLocation,
  onDetectCurrentLocation,
  permanentLocation,
  activeAlertCount = 1,
  theme,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; country: string; lat: number; lon: number }>>([]);
  const [isLowDataMode, setIsLowDataMode] = useState(false);
  const [isNlpModalOpen, setIsNlpModalOpen] = useState(false);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const results = await searchLocation(searchQuery);
    setSearchResults(results);
  };

  const primaryNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'chat', label: 'AI Weather', icon: MessageSquare },
    { id: 'forecast', label: 'Forecast', icon: Calendar },
    { id: 'map', label: 'Map', icon: Map },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: activeAlertCount },
  ];

  const secondaryNavItems = [
    { id: 'flood', label: 'Flood Risk Analyzer', icon: Waves },
    { id: 'disaster', label: 'Disaster Operations', icon: ShieldAlert },
    { id: 'vision', label: 'Weather Vision AI', icon: Camera },
    { id: 'climate', label: 'Climate Intelligence', icon: TrendingUp },
    { id: 'agri', label: 'Farm Weather Advisor', icon: Sprout },
    { id: 'aqi', label: 'Air Quality (AQI)', icon: Wind },
    { id: 'marine', label: 'Marine Weather', icon: Anchor },
    { id: 'aviation', label: 'Aviation Weather', icon: Plane },
    { id: 'locations', label: 'Saved Locations', icon: Bookmark },
    { id: 'settings', label: 'Alert Preferences', icon: Settings },
    { id: 'admin', label: 'Admin Dashboard', icon: User },
  ];

  const allNavItems = [...primaryNavItems, ...secondaryNavItems];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 px-3 lg:px-6 py-1.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 xl:gap-4">
        {/* Brand Logo */}
        <div onClick={() => onSelectTab('home')} className="cursor-pointer shrink-0">
          <ChakraLogo size="sm" />
        </div>

        {/* Location Autocomplete Search & Current Location Button */}
        <div className="relative hidden md:flex items-center gap-1.5 w-44 lg:w-56 xl:w-64">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <input
              type="text"
              placeholder="Search city (e.g. Annur, Delhi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input text-[11px] pl-7 pr-6 py-1 rounded-full border border-white/15 focus:border-saffron"
            />
            <Search className="w-3 h-3 text-gray-400 absolute left-2.5 top-2" />
          </form>

          {/* Detect Current Location GPS Button */}
          <button
            type="button"
            onClick={onDetectCurrentLocation}
            className="p-1.5 rounded-full bg-saffron/20 hover:bg-saffron text-saffron hover:text-black border border-saffron/40 transition-all shrink-0"
            title="Detect My Current GPS Location"
          >
            <Navigation className="w-3.5 h-3.5" />
          </button>

          {/* Jump to Permanent Home Location Button */}
          {permanentLocation && (
            <button
              type="button"
              onClick={() => onSelectLocation(permanentLocation.name, permanentLocation.lat, permanentLocation.lon)}
              className="px-2.5 py-1 rounded-full bg-saffron/20 hover:bg-saffron text-saffron hover:text-black border border-saffron/40 font-bold text-[10px] flex items-center gap-1 transition-all shrink-0 shadow-md"
              title={`Jump to Saved Permanent Home: ${permanentLocation.name}`}
            >
              <span>🏠</span>
              <span className="hidden xl:inline max-w-[85px] truncate">{permanentLocation.name}</span>
            </button>
          )}

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-9 left-0 right-0 glass-panel rounded-xl border border-white/15 shadow-2xl p-1.5 z-50">
              <div className="text-[9px] text-saffron uppercase font-bold px-2 py-0.5">Select Location</div>
              {searchResults.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectLocation(loc.name, loc.lat, loc.lon);
                    setSearchResults([]);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-2.5 py-1 text-[11px] text-gray-200 hover:text-white hover:bg-saffron/20 rounded-lg flex items-center justify-between"
                >
                  <span className="font-semibold">{loc.name}</span>
                  <span className="text-[9px] text-gray-400">{loc.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Navigation Links - Compact & Aligned */}
        <nav className="hidden lg:flex items-center gap-1 shrink-0">
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all relative ${
                  isActive
                    ? 'bg-saffron text-black shadow-md shadow-saffron/20 font-bold'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-0.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-extrabold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* More ▾ Dropdown Menu for Specialized Portals */}
          <div className="relative">
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all ${
                secondaryNavItems.some((s) => s.id === currentTab)
                  ? 'bg-saffron text-black font-bold'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>More Portals</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {moreDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-52 glass-panel rounded-xl border border-white/15 shadow-2xl p-1.5 z-50">
                <div className="text-[9px] text-saffron uppercase font-bold px-2.5 py-0.5 border-b border-white/10 mb-1">
                  Specialized Portals
                </div>
                {secondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setMoreDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-[11px] rounded-lg flex items-center gap-2 transition-all ${
                        isActive
                          ? 'bg-saffron text-black font-bold'
                          : 'text-gray-200 hover:bg-saffron/20 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-saffron shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        {/* Header Right Actions - Sleek & Compact */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick User Guide Button */}
          {onOpenGuideModal && (
            <button
              onClick={onOpenGuideModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-saffron/20 hover:bg-saffron text-saffron hover:text-black border border-saffron/40 text-[10px] font-bold transition-all shadow-sm"
              title="Open WeatherGPT User Guide & Instructions"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>User Guide</span>
            </button>
          )}

          {/* Light / Dark Mode Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-full glass-pill text-gray-300 hover:text-saffron hover:border-saffron/50 transition-all flex items-center justify-center"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-saffron" /> : <Moon className="w-3.5 h-3.5 text-indigo-600" />}
          </button>

          {/* NLP Language Processing Info Button */}
          <button
            onClick={() => setIsNlpModalOpen(true)}
            className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full glass-pill text-[10px] font-bold text-gray-300 hover:text-saffron transition-all"
            title="View Active Natural Language Processing (NLP) Tech Stack"
          >
            <Brain className="w-3 h-3 text-saffron shrink-0" />
            <span>NLP</span>
          </button>

          <button
            onClick={() => setIsLowDataMode(!isLowDataMode)}
            className={`px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition-all ${
              isLowDataMode
                ? 'bg-amber-500 text-black shadow-md'
                : 'glass-pill text-gray-400 hover:text-white'
            }`}
            title="Slow Network / 2G Low Data Mode"
          >
            <Zap className="w-3 h-3" />
            <span className="hidden xl:inline">{isLowDataMode ? '2G ON' : '2G'}</span>
          </button>

          <LanguageSelector
            currentLang={currentLang}
            onSelectLanguage={onSelectLanguage}
            onOpenLanguageModal={onOpenLanguageModal}
          />

          <button
            onClick={() => onSelectTab('alerts')}
            className="relative p-1.5 rounded-full glass-pill text-gray-300 hover:text-white hover:border-saffron/50 transition-all"
            title="Active Weather Warnings"
          >
            <Bell className="w-3.5 h-3.5 text-saffron" />
            {activeAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-extrabold rounded-full flex items-center justify-center animate-ping" />
            )}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg glass-pill text-gray-200"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Language Processing (NLP) Tech Stack Modal */}
      {isNlpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-saffron/40 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-saffron font-bold text-base font-heading">
                <Brain className="w-5 h-5" />
                <span>WeatherGPT Natural Language Processing (NLP)</span>
              </div>
              <button
                onClick={() => setIsNlpModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              WeatherGPT utilizes an advanced hybrid Natural Language Processing (NLP) and Speech Intelligence stack to process prompts, analyze weather queries, and perform multimodal vision diagnostics:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-saffron">
                  <Cpu className="w-4 h-4" />
                  <span>Core Generative LLM & NLU Engine:</span>
                </div>
                <div className="text-gray-200 pl-6">
                  <strong>Google Cloud Gemini 1.5 Flash</strong> (Generative Intent Parsing, Entity Extraction & Tool Calling)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-saffron">
                  <Brain className="w-4 h-4" />
                  <span>Multimodal Vision NLP:</span>
                </div>
                <div className="text-gray-200 pl-6">
                  <strong>Google Cloud Gemini 1.5 Flash Vision</strong> (Base64 Multimodal Cloud & Radar Feature Extraction)
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-saffron">
                  <MessageSquare className="w-4 h-4" />
                  <span>Speech-to-Text (STT) & Speech Synthesis (TTS):</span>
                </div>
                <div className="text-gray-200 pl-6">
                  <strong>Browser WebSpeech API + Neural Voice Synthesis</strong> (Native voice input & output in {currentLang.toUpperCase()})
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-saffron">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Supported Multilingual NLP Locales:</span>
                </div>
                <div className="text-gray-300 text-[11px] pl-6">
                  English (en), हिंदी (hi), தமிழ் (ta), తెలుగు (te), ಕನ್ನಡ (kn), മലയാളം (ml), मराठी (mr), বাংলা (bn)
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsNlpModalOpen(false)}
                className="saffron-gradient-btn px-4 py-2 rounded-xl text-xs font-bold"
              >
                Close Pipeline Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 pt-3 border-t border-white/10 space-y-3 text-xs max-h-[75vh] overflow-y-auto pr-1">
          {/* Mobile Search City Input */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search city (e.g. Sathyamangalam, Annur, Delhi)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full glass-input text-xs pl-8 pr-4 py-2 rounded-xl border border-white/15 focus:border-saffron"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
            </form>

            {/* Mobile Autocomplete Results */}
            {searchResults.length > 0 && (
              <div className="mt-1 glass-panel rounded-xl border border-white/15 shadow-2xl p-1.5 z-50 space-y-1">
                <div className="text-[9px] text-saffron uppercase font-bold px-2 py-0.5">Select Location</div>
                {searchResults.map((loc, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onSelectLocation(loc.name, loc.lat, loc.lon);
                      setSearchResults([]);
                      setSearchQuery('');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-gray-200 hover:text-white hover:bg-saffron/20 rounded-lg flex items-center justify-between"
                  >
                    <span className="font-semibold">{loc.name}</span>
                    <span className="text-[10px] text-gray-400">{loc.country}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GPS Location Button */}
          <button
            onClick={() => {
              onDetectCurrentLocation();
              setMobileMenuOpen(false);
            }}
            className="w-full p-2.5 rounded-xl bg-saffron text-black font-extrabold flex items-center justify-center gap-2 shadow-lg"
          >
            <Navigation className="w-4 h-4" />
            <span>Detect My Current GPS Location</span>
          </button>

          {/* Portals Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-saffron text-black font-bold shadow-md'
                      : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
