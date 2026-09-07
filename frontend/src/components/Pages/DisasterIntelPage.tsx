import React, { useState } from 'react';
import type { CurrentWeatherData, DisasterAlertEvent } from '../../types';
import { INITIAL_DISASTER_ALERTS } from '../../services/weatherApi';
import { sendWhatsAppAlert, sendSMSAlert } from '../../services/notificationService';
import { DisasterAlertBanner } from '../Alerts/DisasterAlertBanner';
import { LeafletWeatherMap } from '../Map/LeafletWeatherMap';
import { ShieldAlert, Radio, AlertOctagon, MapPin, CheckCircle, ShieldCheck, Share2, MessageSquare } from 'lucide-react';

interface DisasterIntelPageProps {
  currentWeather: CurrentWeatherData;
  activeSubTab?: 'alerts' | 'disaster';
  onSelectTab?: (tabId: string) => void;
}

export const DisasterIntelPage: React.FC<DisasterIntelPageProps> = ({
  currentWeather,
  activeSubTab = 'disaster',
  onSelectTab,
}) => {
  const [subTab, setSubTab] = useState<'all' | 'warnings' | 'broadcast' | 'map'>(
    activeSubTab === 'alerts' ? 'warnings' : 'all'
  );

  React.useEffect(() => {
    if (activeSubTab === 'alerts') {
      setSubTab('warnings');
    }
  }, [activeSubTab]);

  const handleTabChange = (newSubTab: 'all' | 'warnings' | 'broadcast' | 'map') => {
    setSubTab(newSubTab);
    if (onSelectTab) {
      if (newSubTab === 'warnings') onSelectTab('alerts');
      else if (newSubTab === 'broadcast') onSelectTab('disaster');
    }
  };

  const [alerts, setAlerts] = useState<DisasterAlertEvent[]>(INITIAL_DISASTER_ALERTS);
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [phoneNumber, setPhoneNumber] = useState<string>('+91 9876543210');
  const [simulatedNoticeSent, setSimulatedNoticeSent] = useState<string | null>(null);

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isAcknowledged: true } : a))
    );
  };

  const handleSimulateEmergencyPush = () => {
    setSimulatedNoticeSent(`🚨 Emergency Alert Broadcasted via Push, WebSockets, WhatsApp & SMS to 4,820 monitored users within ${radiusKm}km radius of ${currentWeather.locationName}`);
    setTimeout(() => setSimulatedNoticeSent(null), 5000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Sub-Tab Filter Header */}
      <div className="flex flex-wrap p-1.5 glass-panel rounded-2xl border border-white/10 w-fit gap-2">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
            subTab === 'all' ? 'bg-saffron text-black shadow-lg shadow-saffron/20' : 'text-gray-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>All Disaster Operations</span>
        </button>

        <button
          onClick={() => handleTabChange('warnings')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
            subTab === 'warnings' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-gray-400 hover:text-white'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>Active Warnings ({alerts.length})</span>
        </button>

        <button
          onClick={() => handleTabChange('broadcast')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
            subTab === 'broadcast' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>WhatsApp & SMS Dispatcher</span>
        </button>
      </div>
      {/* Header Banner */}
      <div className="glass-card p-6 md:p-8 relative overflow-hidden border border-red-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-600/20 text-red-500 border border-red-500/40">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white font-heading">
                Disaster Intelligence & Emergency Operations
              </h2>
              <p className="text-xs text-gray-300">
                Verified Hazard Geofencing • WhatsApp, SMS & Push Broadcast Integration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateEmergencyPush}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
            >
              <Radio className="w-4 h-4 animate-ping" />
              <span>Broadcast WhatsApp & SMS Warning</span>
            </button>
          </div>
        </div>

        {/* Simulation Feedback Alert */}
        {simulatedNoticeSent && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{simulatedNoticeSent}</span>
          </div>
        )}
      </div>

      {/* WhatsApp & SMS Subscription Config Bar */}
      {(subTab === 'all' || subTab === 'broadcast') && (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 text-xs">
          <div className="flex items-center justify-between font-bold text-saffron uppercase tracking-wider">
            <span>WhatsApp & SMS Emergency Alert Dispatcher</span>
            <span className="text-emerald-400 font-normal">Active Delivery Channels: WebPush • WhatsApp API • SMS Gateway</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-saffron shrink-0" />
              <span className="text-gray-300">Monitored Zone:</span>
              <strong className="text-white text-sm font-bold">{currentWeather.locationName}</strong>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-gray-400">Fence Radius:</span>
              {[25, 50, 100].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusKm(r)}
                  className={`px-2.5 py-1 rounded-lg font-bold ${
                    radiusKm === r ? 'bg-saffron text-black' : 'bg-white/5 text-gray-300'
                  }`}
                >
                  {r}km
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 justify-end">
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="glass-input px-3 py-1 rounded-xl text-xs font-mono text-white border border-white/15 focus:border-saffron w-36"
              />
              <button
                onClick={() => sendWhatsAppAlert(alerts[0], phoneNumber)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => sendSMSAlert(alerts[0], phoneNumber)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>SMS</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Warnings Section */}
      {(subTab === 'all' || subTab === 'warnings') && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-red-500" />
            <span>Active Verified Emergency Warnings ({alerts.length})</span>
          </h3>

          {alerts.map((alert) => (
            <DisasterAlertBanner key={alert.id} alert={alert} onAcknowledge={handleAcknowledgeAlert} />
          ))}
        </div>
      )}

      {/* Disaster GIS Map */}
      {(subTab === 'all' || subTab === 'map') && (
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
            <Radio className="w-5 h-5 text-saffron" />
            <span>Live Emergency Map & Warning Polygons</span>
          </h3>
          <LeafletWeatherMap center={currentWeather.coords} locationName={currentWeather.locationName} alerts={alerts} height="400px" />
        </div>
      )}

      {/* Safety Policy & Disclosure Box */}
      <div className="p-6 rounded-2xl glass-card border border-white/10 text-xs space-y-3 text-gray-300">
        <div className="flex items-center gap-2 text-saffron font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Disaster Safety Standard</span>
        </div>
        <p className="leading-relaxed">
          WeatherGPT strictly separates <strong>Verified Official Warnings</strong> (from IMD, NDMA, CWC, INCOIS) from general AI weather model projections. Earthquake and tsunami warnings are sourced exclusively from authorized early-warning seismological centers.
        </p>
      </div>
    </div>
  );
};
